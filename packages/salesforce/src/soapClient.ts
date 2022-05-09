import * as xml2js from 'xml2js';
import axios from 'axios';
import { Connection } from 'connection';

const API_CLIENT_NAME = 'Vlocode SOAP client';
const SOAP_XML_OPTIONS = {
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    renderOpts: { pretty: true, indent: '    ', newline: '\n', normalizeTags: false, normalize: false }
};

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

    constructor(
        public readonly connection: Connection,
        public readonly xmlNs: string = 'http://soap.sforce.com/2006/08/apex') {
    }

    /**
     * Make SOAP request.
     * @param method method name
     * @param request request body as JSON object
     * @param debuggingHeader debugging header
     * @returns
     */
    public async request(method: string, request: object, debuggingHeader?: SoapDebuggingHeader) : Promise<{ body?: any; debugLog?: any }> {
        const endpoint = `${this.connection.instanceUrl}/services/Soap/s/${this.connection.version}`;
        const result = await axios({
            method: 'POST',
            url: endpoint,
            headers: {
                'SOAPAction': '""',
                'Content-Type':  'text/xml;charset=UTF-8'
            },
            transformResponse: (data: any) => {
                return xml2js.parseStringPromise(data, {
                    tagNameProcessors: [ xml2js.processors.stripPrefix ],
                    attrNameProcessors: [ xml2js.processors.stripPrefix ],
                    valueProcessors: [
                        value => {
                            if (/^[0-9]+(\.[0-9]+){0,1}$/i.test(value)) {
                                return parseFloat(value);
                            } else if (/^true|false$/i.test(value)) {
                                return value.localeCompare('true', undefined, { sensitivity: 'base' }) === 0;
                            }
                            return value;
                        }
                    ],
                    explicitArray: false
                });
            },
            data: this.getRequestBody(method, request, debuggingHeader)
        });
        const response = (await result.data) as SoapResponse;

        if (response.Envelope.Body?.Fault) {
            throw new Error(`SOAP API Fault: ${response.Envelope.Body.Fault?.faultstring}`);
        }

        return {
            body: response.Envelope.Body,
            debugLog: response.Envelope?.Header?.DebuggingInfo.debugLog,
        };
    }

    /**
     * Converts the contents of the package to XML that can be saved into a package.xml file
     */
    private getRequestBody(method: string, body?: Object, debuggingHeader: SoapDebuggingHeader = {}) : string {
        const soapRequestObject = {
            'soap:Envelope': {
                $: {
                    'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
                    'xmlns': this.xmlNs
                },
                'soap:Header': {
                    CallOptions: {
                        client: API_CLIENT_NAME
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
        return new xml2js.Builder(SOAP_XML_OPTIONS).buildObject(soapRequestObject);
    }
}