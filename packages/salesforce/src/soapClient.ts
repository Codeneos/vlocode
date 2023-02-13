import { HttpTransport, SalesforceConnection } from './connection';
import { CustomError, setObjectProperty, wait, XML } from '@vlocode/util';

export type SoapDebuggingLevel = 'NONE' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'FINE' | 'FINER' | 'FINEST';

export interface SoapDebuggingHeader {
    Db?: SoapDebuggingLevel;
    Workflow?: SoapDebuggingLevel;
    Validation?: SoapDebuggingLevel;
    Callout?: SoapDebuggingLevel;
    Apex_code?: SoapDebuggingLevel;
    Apex_profiling?: SoapDebuggingLevel;
    Visualforce?: SoapDebuggingLevel;
    System?: SoapDebuggingLevel;
    NBA?: SoapDebuggingLevel;
    Wave?: SoapDebuggingLevel;
    All?: SoapDebuggingLevel;
}

/**
 * Simple SOAP response
 */
export interface SoapResponse {
    Envelope: {
        Header?: any;
        Body?: {
            Fault?: SoapResponseFault;
            [key: string]: any;
        };
    };
}

export interface SoapResponseFault {
    faultcode: string;
    faultstring: string;
}

interface SoapClientRequest {
    soapMethod: string; 
    message: object;
    debuggingHeader?: SoapDebuggingHeader;
    clientName?: string;
    defaultNamespace?: string;
    allOrNone?: boolean;
    locale?: string;
    updateMru?: boolean;
    disableFeedTracking?: boolean;
    batchSize?: number;
}

interface SoapClientResponse<T = object> {
    body: T; 
    debugLog?: string;
}

const SoapRequestHeaderMapping = {
    clientName: 'CallOptions.clientName',
    allOrNone: 'AllOrNoneHeader.allOrNone',
    locale: 'LocaleOptions.language',
    updateMru: 'MruHeader.updateMru',
    batchSize: 'QueryOptions.batchSize',
    disableFeedTracking: 'DisableFeedTrackingHeader.disableFeedTracking',
}

/**
 * Simple Salesforce SOAP request client
 */
export class SoapClient {

    /**
     * Retry delay in MS after which a retryable SOAP fault is retried.
     */
    public retryDelay = 3000;

    /**
     * Number of retries to attempt after which a request is failed.
     */
    public retryLimit = 3;

    /**
     * API client name used in the SOAP request to identify the client making the request.
     * Defaults to {@link SoapClient.defaultClientName}
     */
    public clientName: string = SoapClient.defaultClientName;

    /**
     * Default API client name used for new SOAP clients.
     */
    public static defaultClientName = 'Vlocode SOAP client';

    private transport: HttpTransport;

    constructor(
        public readonly connection: SalesforceConnection,
        public readonly endpoint: string,
        public readonly xmlNs: string = 'http://soap.sforce.com/2006/08/apex') {
            
        // Create SOAP transport
        this.transport = new HttpTransport({
            baseUrl: connection._baseUrl(),
            instanceUrl: connection.instanceUrl,
            handleCookies: false,
            responseDecoders: {
                xml: (buffer, encoding) => {
                    return XML.parse(buffer.toString(encoding), { ignoreNameSpace: true });
                }
            }
        });
    }

    /**
     * Make SOAP request.
     * @param method method name
     * @param request request body as JSON object
     * @param debuggingHeader debugging header
     * @returns
     */
    public request<T = object>(method: string, request: object, debuggingHeader?: SoapDebuggingHeader) : Promise<SoapClientResponse<T>> {
        return this.invoke<T>({ soapMethod: method, message: request, debuggingHeader });
    }

    public async invoke<T = object>(request: SoapClientRequest, attempt?: number) : Promise<SoapClientResponse<T>>  {
        const result = await this.transport.httpRequest({
            method: 'POST',
            url: this.endpoint,
            headers: {
                'SOAPAction': '""',
                'Content-Type': 'text/xml;charset=UTF-8'
            },
            body: this.buildRequestBody(request)
        });

        if (!result.body) {
            throw new CustomError('Malformed response; response is empty or undefined expected valid XML structure', { name: 'SOAP_ERROR' })
        }

        if (typeof result.body === 'string') {
            throw new CustomError(result.body, { name: 'SOAP_ERROR' })
        }

        const soapResponse = result.body as SoapResponse;

        if (this.isSessionExpired(soapResponse)) {
            return this.connection.refreshAccessToken()
                .then(() => this.invoke(request, attempt));
        }

        if (this.isRetryable(soapResponse) && (attempt ?? 0) < this.retryLimit) {
            return wait(this.retryDelay)
                .then(() => this.invoke(request, (attempt ?? 0) + 1));
        }

        if (soapResponse.Envelope.Body?.Fault) {
            throw new CustomError(soapResponse.Envelope.Body?.Fault.faultstring, { 
                name: 'SOAP_ERROR', 
                code: soapResponse.Envelope.Body?.Fault.faultcode 
            });
        }

        return {
            body: Object.values(soapResponse.Envelope.Body ?? {})[0],
            debugLog: soapResponse.Envelope.Header?.DebuggingInfo.debugLog,
        };
    }

    /**
     * Converts the contents of the package to XML that can be saved into a package.xml file
     */
    private buildRequestBody(request: SoapClientRequest): string {
        const soapHeader: any = {
            CallOptions: {
                client: this.clientName
            },
            DebuggingHeader: {
                categories: Object.entries(request.debuggingHeader ?? {}).map(([category, level]) => ({ category, level }))
            },
            SessionHeader: {
                sessionId: this.connection.accessToken
            }
        };

        for(const [header, value] of Object.entries(request)) {
            if (SoapRequestHeaderMapping[header]) {
                setObjectProperty(soapHeader, SoapRequestHeaderMapping[header], value);
            }
        }

        return XML.stringify({
            'soap:Envelope': {
                $: {
                    'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
                    'xmlns': this.xmlNs
                },
                'soap:Header': soapHeader,
                'soap:Body': {
                    [request.soapMethod]: request.message,
                }
            }
        });
    }

    private isSessionExpired(soapResponse: SoapResponse) {
        if (soapResponse.Envelope.Body?.Fault?.faultcode === 'INVALID_SESSION_ID') {
            return true;
        }
        return false;
    }

    private isRetryable(soapResponse: SoapResponse) {
        if (this.retryDelay < 0 || this.retryLimit < 0) {
            return false;
        }

        if (soapResponse.Envelope.Body?.Fault?.faultcode === 'UNABLE_TO_LOCK_ROW' || 
            soapResponse.Envelope.Body?.Fault?.faultcode === 'TOO_MANY_APEX_REQUESTS' || 
            soapResponse.Envelope.Body?.Fault?.faultcode === 'TERRITORY_REALIGN_IN_PROGRESS' || 
            soapResponse.Envelope.Body?.Fault?.faultcode === 'RECORD_IN_USE_BY_WORKFLOW' || 
            soapResponse.Envelope.Body?.Fault?.faultcode === 'PROCESSING_HALTED' || 
            soapResponse.Envelope.Body?.Fault?.faultcode === 'PLATFORM_EVENT_PUBLISHING_UNAVAILABLE' || 
            soapResponse.Envelope.Body?.Fault?.faultcode === 'PLATFORM_EVENT_PUBLISH_FAILED') {
            return true;
        }
        
        return false;
    }
}