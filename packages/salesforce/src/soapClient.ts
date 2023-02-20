import { HttpTransport, SalesforceConnection } from './connection';
import { CustomError, formatString, setObjectProperty, wait, XML } from '@vlocode/util';
import { Schema } from './types/schema';

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

interface SoapRequestOptions {
    requestSchema?: Schema; 
    responseSchema?: Schema; 
    debuggingHeader?: SoapDebuggingHeader;
}

interface SoapClientRequest extends SoapRequestOptions {
    soapMethod: string; 
    message: object;
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
    public request<T = object>(method: string, request: object, options?: SoapRequestOptions) : Promise<SoapClientResponse<T>> {
        return this.invoke<T>({ soapMethod: method, message: request, ...options });
    }

    public async invoke<T = object>(request: SoapClientRequest, attempt?: number) : Promise<SoapClientResponse<T>>  {
        const result = await this.transport.httpRequest({
            method: 'POST',
            url: formatString(this.endpoint, { apiVersion: this.connection.version }),
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

        const responseBody = Object.values(soapResponse.Envelope.Body ?? [])[0];
        if (responseBody && request.responseSchema) {
            SoapClient.normalizeRequestResponse(request.responseSchema, responseBody);
        }

        return {
            body: responseBody,
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
                    'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
                    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                    'xmlns': this.xmlNs
                },
                'soap:Header': soapHeader,
                'soap:Body': {
                    [request.soapMethod]: request.message,
                }
            }
        });
    }

    /**
     * Normalize a request or response object that was converted from XML into JSON using a Schema definition
     * that defines which properties are of which type and converts the properties where required so that they are compatible
     * with the schema.
     * 
     * Modifies the object passed as argument instead of creating a new object.
     * 
     * @param schema Schema definition
     * @param obj request or response object
     * @returns Schema normalized object
     */
    public static normalizeRequestResponse<T extends object>(schema: Schema, obj: T): T {
        if (!obj) {
            return obj;
        }

        for (const [field, fieldDef] of Object.entries(schema.fields)) {
            const fieldValue = obj[field];
            const fieldValueNull = fieldValue === undefined || fieldValue === null;

            if (fieldDef.optional && fieldValueNull) {
                // Delete optional fields that are null or undefined
                delete obj[field];
            } else if (!fieldDef.nullable && fieldValueNull) {
                // Init values for fields that are not nullable
                if (fieldDef.type === 'boolean') {
                    obj[field] = false;
                } else if (fieldDef.type === 'number') {
                    obj[field] = 0;
                } else if (fieldDef.type === 'string') {
                    obj[field] = '';
                } else if (typeof fieldDef.type === 'object') {
                    obj[field] = {};
                }
            }
            
            if (fieldDef.array && !Array.isArray(fieldValue)) {
                obj[field] = [ fieldValue ];
            } else if (typeof fieldDef.type === 'object' && fieldValue !== null && typeof fieldValue === 'object') {
                this.normalizeRequestResponse(fieldDef.type, fieldValue);
            }
        }

        return obj;
    }

    private getFaultCode(soapResponse: SoapResponse) {
        return /^[^:]+:(.*)$/.exec(soapResponse.Envelope.Body?.Fault?.faultcode ?? '')?.[1];
    }

    private isSessionExpired(soapResponse: SoapResponse) {
        if (this.getFaultCode(soapResponse) === 'INVALID_SESSION_ID') {
            return true;
        }
        return false;
    }

    private isRetryable(soapResponse: SoapResponse) {
        if (this.retryDelay < 0 || this.retryLimit < 0) {
            return false;
        }

        const soapFault = this.getFaultCode(soapResponse);
        
        if (soapFault === 'UNABLE_TO_LOCK_ROW' || 
            soapFault === 'TOO_MANY_APEX_REQUESTS' || 
            soapFault === 'TERRITORY_REALIGN_IN_PROGRESS' || 
            soapFault === 'RECORD_IN_USE_BY_WORKFLOW' || 
            soapFault === 'PROCESSING_HALTED' || 
            soapFault === 'PLATFORM_EVENT_PUBLISHING_UNAVAILABLE' || 
            soapFault === 'PLATFORM_EVENT_PUBLISH_FAILED') {
            return true;
        }
        
        return false;
    }
}