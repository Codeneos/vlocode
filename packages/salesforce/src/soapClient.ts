import { HttpTransport, SalesforceConnection } from './connection';
import { CustomError, XML } from '@vlocode/util';

const API_CLIENT_NAME = 'Vlocode SOAP client';
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
            Fault?: {
                faultcode: string;
                faultstring: string;
            };
            [key: string]: any;
        };
    };
}

/**
 * Simple Salesforce SOAP request client
 */
export class SoapClient {

    private transport: HttpTransport;
    private clientName: string = API_CLIENT_NAME;

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
    public async request<T = object>(method: string, request: object, debuggingHeader?: SoapDebuggingHeader) : Promise<{ body?: T; debugLog?: string }> {
        const result = await this.transport.httpRequest({
            method: 'POST',
            url: this.endpoint, //`/services/Soap/s/${this.connection.version}`,
            headers: {
                'SOAPAction': '""',
                'Content-Type': 'text/xml;charset=UTF-8'
            },
            body: this.buildRequestBody(method, request, debuggingHeader)
        });

        if (typeof result.body === 'string') {
            throw new CustomError(result.body, { name: 'SOAP_ERROR' })
        }

        if (typeof result.body === 'undefined') {
            return { body: result.body };
        }

        const soapResponse  = result.body as SoapResponse;

        if (soapResponse.Envelope.Body?.Fault) {
            throw new CustomError(`SOAP API Fault: ${soapResponse.Envelope.Body.Fault?.faultstring}`, { 
                name: 'SOAP_ERROR', 
                code: soapResponse.Envelope.Body.Fault.faultcode 
            });
        }

        return {
            body: Object.values(soapResponse.Envelope.Body ?? {})[0],
            debugLog: soapResponse.Envelope?.Header?.DebuggingInfo.debugLog,
        };
    }

    /**
     * Converts the contents of the package to XML that can be saved into a package.xml file
     */
    private buildRequestBody(method: string, body?: Object, debuggingHeader: SoapDebuggingHeader = {}) : string {
        const soapRequestObject = {
            'soap:Envelope': {
                $: {
                    'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
                    'xmlns': this.xmlNs
                },
                'soap:Header': {
                    CallOptions: {
                        client: this.clientName
                    },
                    DebuggingHeader: {
                        categories: Object.entries(debuggingHeader).map(([category, level]) => ({ category, level }))
                    },
                    SessionHeader: {
                        sessionId: this.connection.accessToken
                    }
                },
                'soap:Body': {
                    [method]: body,
                }
            }
        };
        return XML.stringify(soapRequestObject);
    }
}