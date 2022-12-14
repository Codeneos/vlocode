import * as http from 'http';
import * as https from 'https';
import * as zlib from 'zlib';
import * as csv from 'csv-parse/sync';
import { URL } from 'url';
import { CookieJar } from 'tough-cookie';
import { HttpApiOptions } from 'jsforce/http-api';
import { DeferredPromise, XML } from '@vlocode/util';
import { SalesforceConnection } from './salesforceConnection';
import { ILogger } from '@vlocode/core';

export interface HttpResponse {
    statusCode?: number;
    statusMessage?: string;
    headers: http.IncomingHttpHeaders; 
    body?: string | object;
}

export interface HttpRequestInfo {
    url: string;
    method: string;
    body?: string | undefined;
    headers?: http.OutgoingHttpHeaders | undefined;
}

interface HttpContentType {
    /**
     * Type of content after the first slash: **type**\/subtype+suffix; param=value
     */
    type: string; 
    /**
     * Sub type of content after the first slash: type/**subtype**+suffix; param=value
     */
    subtype: string; 
    /**
     * Type of content after the first slash: type/subtype+**suffix**; param=value
     */
    suffix?: string;
    /**
     * Object with all key value parameters in the content-type: type/subtype+suffix; **param=value**
     */
    parameters: Record<string, string | undefined>;
}

export class HttpTransport {
    private cookies = new CookieJar();   

    /**
     * Shared HTTP agent used by this {@link HttpTransport} used for connection pooling
     */
    public httpAgent = new https.Agent({ 
        defaultPort: 443,
        keepAlive: true,
        keepAliveMsecs: 60000,
        maxSockets: 10,
        scheduling: 'lifo',
        timeout: 120000 // Time out connections after 120 seconds
    });

    /**
     * Encoding used for encoding and decoding response and request bodies
     */
    public bodyEncoding: BufferEncoding = 'utf8';

    /**
     * Threshold value when to apply Gzip encoding when posting data to Salesforce.
     */
    public static gzipThreshold = 128;

    /**
     * When true and the length of the body exceeds {@link gzipThreshold} the request will be encoded using gzip compression. This also 
     * sets the accept-encoding: gzip header on the request to tell Salesforce it can send back responses with gzip compression.
     * 
     * When disabled neither requests or responses will be encoded with gzip.
     */
    public static useGzipEncoding = 128;

    /**
     * Include a keep-alive header in all requests to re-use the HTTP connection and socket.
     */
    public static shouldKeepAlive = true;

    /**
     * Parse set-cookies header and store cookies to be included in the request header on subsequent requests.
     * 
     * Note: handling of cookies is not required but avoids Salesforce from sending the full set-cookie header on each request
     */
    public static handleCookies = true;

    constructor(
        private connection: SalesforceConnection, 
        private logger: ILogger) {
    }

    public httpRequest(info: HttpRequestInfo, options?: HttpApiOptions): Promise<HttpResponse> {
        const url = this.parseUrl(info.url);
        const requestPromise = new DeferredPromise<HttpResponse>()

        if (url.protocol === 'http') {
            url.protocol = 'https';
        }

        const startTime = Date.now();
        const request = https.request({
            agent: this.httpAgent,
            host: url.host,
            path: url.pathname + url.search,
            port: url.port,
            headers: info.headers,
            protocol: url.protocol,
            method: info.method
        });

        if (HttpTransport.shouldKeepAlive) {
            request.shouldKeepAlive = true;
        }

        if (HttpTransport.useGzipEncoding) {
            request.setHeader('accept-encoding', 'gzip');
        }

        if (HttpTransport.handleCookies) {
            request.setHeader('cookie', this.cookies.getCookieStringSync(url.href));
        }
        
        request.once('error', (err) => requestPromise.reject(err));

        request.on('response', (response) => {
            this.logger.debug(`http ${response.statusCode} -- ${response.statusMessage}`);

            const setCookiesHeader = response.headers['set-cookie'];
            if (HttpTransport.handleCookies && setCookiesHeader?.length) {
                setCookiesHeader.forEach(cookie => this.cookies.setCookieSync(cookie, url.href));
            }
            
            if (this.isRedirect(response)) {
                const redirectRequestInfo = this.getRedirectRequest(response, info);
                response.destroy();
                return requestPromise.resolve(this.httpRequest(redirectRequestInfo, options));
            }

            const responseData = new Array<Buffer>();
            response.on('data', (chunk) => responseData.push(chunk));
            response.once('end', () => {        
                this.decodeResponseBody(response, Buffer.concat(responseData))
                    .then(body => { 
                        const parsed = this.parseResponseBody(response, body);
                        if (typeof parsed !== 'string') {
                            response.headers['content-type'] = 'no-parse';
                        }
                        return parsed;
                    })
                    .then(body => requestPromise.resolve(Object.assign(response, { 
                        time: Date.now() - startTime, body
                    })))
                    .catch(err => requestPromise.reject(err));
            });
        });  

        if (info.body) {
            this.sendRequestBody(request, info.body)
                .catch((err) => requestPromise.reject(err));
        } else {
            request.end();
        }

        return requestPromise;
    }

    private sendRequestBody(request: http.ClientRequest, body: string) : Promise<http.ClientRequest> {
        if (body.length > HttpTransport.gzipThreshold && HttpTransport.useGzipEncoding) {
            return new Promise((resolve, reject) => {
                zlib.gzip(body, (err, value) => {
                    err ? reject(err) : resolve(request
                        .setHeader('Content-Encoding', 'gzip')
                        .end(value, 'binary'));
                });
            }); 
        }
        return Promise.resolve(request.end(body, this.bodyEncoding));
    }

    private decodeResponseBody(response: http.IncomingMessage, responseBuffer: Buffer): Promise<Buffer> {
        if (response.headers['content-encoding'] === 'gzip') {
            return new Promise((resolve, reject) => {
                zlib.gunzip(responseBuffer, (err, body) => {
                    err ? reject(err) : resolve(body);
                });
            });            
        } 
        
        if (response.headers['content-encoding'] === 'deflate') {
            return new Promise((resolve, reject) => {
                zlib.deflate(responseBuffer, (err, body) => {
                    err ? reject(err) : resolve(body);
                });
            });            
        }
        
        return Promise.resolve(responseBuffer);
    }

    private parseResponseBody(response: http.IncomingMessage, responseBuffer: Buffer): object | string {
        const contentType = this.parseContentType(response.headers['content-type']);
        const contentCharset = contentType?.parameters['charset'];
        const encoding = contentCharset && Buffer.isEncoding(contentCharset) ? contentCharset : this.bodyEncoding;

        try {
            if (contentType) {
                if (contentType.subtype === 'json' || contentType.suffix === 'json') {
                    return JSON.parse(responseBuffer.toString(encoding));
                } else if (contentType.subtype === 'xml' || contentType.suffix === 'xml') {
                    return XML.parse(responseBuffer.toString(encoding));
                } else if (contentType.subtype === 'csv' || contentType.suffix === 'csv') {
                    return csv.parse(responseBuffer, { encoding });
                }
            }            
        } catch (err) {
            this.logger.warn(`Failed to parse response of type ${contentType}: ${err?.message ?? err}`);
        }

        // Fallback to string decoding
        return responseBuffer.toString(encoding);
    }

    private parseContentType(contentTypeHeader: string | undefined): HttpContentType | undefined {
        if (!contentTypeHeader) {
            return;
        }
        
        const contentHeaderParts = contentTypeHeader.split(';');
        const [type, subtypeWithSuffix] = contentHeaderParts.shift()!.split('/').map(v => v.trim().toLowerCase());
        const [subtype, suffix] = subtypeWithSuffix.split('+').map(v => v.trim().toLowerCase());
        const parameters = Object.fromEntries(contentHeaderParts.map(param => param.split('=') as [string, string | undefined]));

        return { type, subtype, suffix, parameters };
    }

    private getRedirectRequest(response: http.IncomingMessage, info: HttpRequestInfo): HttpRequestInfo {
        const redirectLocation = response.headers.location;
        if (!redirectLocation) {
            throw new Error(`Redirected (${response.statusCode}) without location header`);
        }

        this.logger.debug(`http redirect ${info.url} -> ${redirectLocation}`);

        const redirectRequestInfo = { ...info, url: redirectLocation };
        if (response.statusCode === 303) {
            // incorrect method; change to GET
            this.logger.debug(`http ${response.statusCode} change http method ${info.method} -> GET`);
            redirectRequestInfo.method = 'GET';
        }

        return redirectRequestInfo;
    }

    private isRedirect(response: http.IncomingMessage) {
        return response.statusCode && [300, 301, 302, 303, 307, 308].includes(response.statusCode);
    }

    private parseUrl(url: string) {
        if (url.startsWith('/')) {
            if (url.startsWith('/services/')) {
                return  new URL(this.connection.instanceUrl + url);
            } 
            return new URL(this.connection._baseUrl() + url);
        } 
        return new URL(url);
    }
}