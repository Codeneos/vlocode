/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as http from 'http';
import * as https from 'https';
import * as zlib from 'zlib';
import * as csv from 'csv-parse/sync';
import { URL } from 'url';
import { CookieJar } from 'tough-cookie';
import { CustomError, DeferredPromise, encodeQueryString, Timer, withDefaults, XML } from '@vlocode/util';
import { ILogger, LogManager } from '@vlocode/core';
import { randomUUID } from 'crypto';

export type HttpMethod = 'POST' | 'GET' | 'PATCH' | 'DELETE' | 'PUT';

export interface HttpResponse {
    statusCode?: number;
    statusMessage?: string;
    headers?: http.IncomingHttpHeaders;
    body?: any;
}

/**
 * Represents the information required to make an HTTP request.
 */
export interface HttpRequestInfo {
    /**
     * URL to make the request to
     */
    url: string;
    /**
     * HTTP method to use for the request (GET, POST, PATCH, DELETE, PUT)
     */
    method: HttpMethod;
    /**
     * Extra headers to include in the request on top of the standard headers
     */
    headers?: http.OutgoingHttpHeaders;
    /**
     * Body of the request in case of a POST, PATCH or PUT request
     */
    body?: string | undefined;
    /**
     * Parts of the request in case of a multipart request
     */
    parts?: HttpRequestPart[] | undefined;
    /**
     * Timeout in milliseconds for the request
     */
    timeout?: number;
}

export interface HttpRequestPart {
    body: string | Buffer;
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

interface HttpTransportOptions {
    /**
     * Threshold value when to apply Gzip encoding when posting data to Salesforce.
     * @default 128
     */
    gzipThreshold: number;

    /**
     * When true and the length of the body exceeds {@link gzipThreshold} the request will be encoded using gzip compression. This also
     * sets the accept-encoding: gzip header on the request to tell Salesforce it can send back responses with gzip compression.
     *
     * When disabled neither requests or responses will be encoded with gzip.
     * @default true
     */
    useGzipEncoding: boolean;

    /**
     * Parse set-cookies header and store cookies to be included in the request header on subsequent requests.
     *
     * Note: handling of cookies is not required but avoids Salesforce from sending the full set-cookie header on each request
     * @default true
     */
    handleCookies: boolean;

    /**
     * Custom content decoders that overwrite the standard content decoding from the HTTP transport
     * to a custom one implementation.
     */
    responseDecoders?: {
        [type: string]: (buffer: Buffer, encoding: BufferEncoding) => any;
    }

    /**
     * Optional recorder on which for each request the `record` method is called.
     * @default undefined
     */
    recorder?: { record<T extends HttpResponse>(info: HttpRequestInfo, responsePromise: Promise<T>): Promise<T> };

    /**
     * Optional HTTP agent used by the transport for connection pooling
     * @default HttpTransport.httpAgent
     */
    agent?: https.Agent;
}

export interface Transport {
    httpRequest(request: HttpRequestInfo): Promise<HttpResponse>;
}

export class HttpTransport implements Transport {
    private cookies = new CookieJar();
    private multiPartBoundary = `--${randomUUID()}`

    /**
     * Default shared HTTP agent used by this {@link HttpTransport} used for connection pooling
     */
    public static httpAgent = new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 2 * 60 * 1000,
        maxSockets: 5,
        scheduling: 'fifo',
        timeout: 5 * 60 * 1000 // Time out connections after 5 minutes
    });

    /**
     * Encoding used for encoding and decoding response and request bodies
     */
    public bodyEncoding: BufferEncoding = 'utf8';

    /**
     * Options applied to to this HTTP transport
     */
    public options: HttpTransportOptions & { baseUrl?: string, instanceUrl?: string };

    /**
     * Default configuration for the transport options. When no specific value is set for an individual transport the
     * defaults are used instead.
     */
    static options: HttpTransportOptions = {
        gzipThreshold: 128,
        useGzipEncoding: true,
        handleCookies: true,
        responseDecoders: {
            json: (buffer, encoding) => JSON.parse(buffer.toString(encoding)),
            xml: (buffer, encoding) => XML.parse(buffer.toString(encoding)),
            csv: (buffer, encoding) => csv.parse(buffer, { encoding })
        }
    };

    /**
     * Even when debug logging is enable request and response bodies are not logged for performance and security reason.
     * Enabling this flag enables logging of both the request and response bodies including headers
     */
    static enableResponseLogging = false;

    constructor(
        options: Partial<HttpTransportOptions & { baseUrl?: string, instanceUrl?: string }>,
        private readonly logger: ILogger = LogManager.get(HttpTransport)
    ) {
        this.options = withDefaults(options, HttpTransport.options);
        this.logger.verbose(`Transport options: ${this.getFeatureList().map(v => v.toUpperCase()).join(' ') || 'NONE'}`);
    }

    private getFeatureList() {
        const features = new Array<string>();
        this.options.useGzipEncoding && features.push('gzip');
        this.options.handleCookies && features.push('cookies');
        return features;
    }

    /**
     * Make a HTTP request to the specified URL
     * @param info Request information
     * @param options deprecated
     * @returns Promise with the response
     */    
    public httpRequest(info: HttpRequestInfo): Promise<HttpResponse>;       
    public httpRequest(info: HttpRequestInfo, options?: object): Promise<HttpResponse>;
    public httpRequest(info: HttpRequestInfo): Promise<HttpResponse> {
        const url = this.parseUrl(info.url);
        this.logger.debug('%s %s', info.method, url.pathname);
        const timer = new Timer();
        const request = this.prepareRequest(info);        
        const requestPromise = new DeferredPromise<HttpResponse>();

        // Handle error and response
        request.once('error', (err) => {
            if (requestPromise.isResolved) { 
                // Prevent race condition when the request is already resolved
                return;
            }

            const errorCode = 'code' in err && err.code as string;
            const syscall = 'syscall' in err && err.syscall as string;

            if (errorCode === 'ECONNRESET' || (errorCode === 'ETIMEDOUT' && syscall === 'connect')) {
                requestPromise.reject(new CustomError(`Connection reset by peer when requesting ${url.pathname} (${request.method})`, { code: 'ECONNRESET' }));
            } else if (errorCode === 'ECONNREFUSED') { 
                requestPromise.reject(new CustomError(`Connection refused when requesting ${url.pathname} (${request.method})`, { code: 'ECONNREFUSED' }));
            } else if (errorCode === 'ENOTFOUND') {
                requestPromise.reject(new CustomError(`Host not found when requesting ${url.pathname} (${request.method})`, { code: 'ENOTFOUND' }));
            } else if (errorCode === 'ETIMEDOUT') {
                requestPromise.reject(new CustomError(`Socket timeout when connecting ${url.pathname} (${request.method}) after ${timer.elapsed}ms`, { code: 'ETIMEDOUT' }));
            } else {
                requestPromise.reject(err);
            }
        });

        request.once('timeout', () => {
            request.destroy(new CustomError(
                `Client timeout (${request.socket?.timeout ?? 'default'}) expired when requesting ${url.pathname} (${request.method}) after ${timer.elapsed}ms`,
                { code: 'CLIENT_TIMEDOUT' }
            ));
        });

        request.on('response', (response) => {
            requestPromise.bind(this.handleResponse(info, response).then(response => {
                this.logger.debug('%s %s (%ims)', info.method, url.pathname, timer.elapsed);
                return response;
            }));
        });

        // Send body
        const body = this.prepareRequestBody(info);
        if (body) {
            this.sendRequestBody(request, body)
                .then((req) => new Promise((resolve) => req.end(() => resolve(req))))
                .catch((err) => requestPromise.reject(err));
        } else {
            request.end();
        }

        if (this.options.recorder) {
            return this.options.recorder.record(info, requestPromise);
        }

        return requestPromise;
    }

    private prepareRequest(info: HttpRequestInfo) {
        const url = this.parseUrl(info.url);

        if (url.protocol === 'http') {
            url.protocol = 'https';
        }

        const httpAgent = this.options.agent || HttpTransport.httpAgent;
        const request = https.request({
            agent: httpAgent,
            host: url.host,
            path: url.pathname + url.search,
            port: url.port,
            headers: info.headers,
            protocol: url.protocol,
            method: info.method,
            timeout: httpAgent.options.timeout,
        });

        if (info.timeout) {
            request.setTimeout(info.timeout);
        }

        if (httpAgent.options.keepAlive) {
            request.setSocketKeepAlive(true);
        }

        if (this.options.useGzipEncoding) {
            request.setHeader('accept-encoding', 'gzip, deflate');
        }

        if (this.options.handleCookies) {
            request.setHeader('cookie', this.cookies.getCookieStringSync(url.href));
        }

        if (info.parts) {
            request.setHeader('content-type', `multipart/form-data; boundary=${this.multiPartBoundary}`);
        }

        return request;
    }

    private prepareRequestBody(info: HttpRequestInfo) {
        if (info.parts) {
            return this.encodeMultipartBody(info.parts);
        }
        const contentType = info.headers
            ? Object.entries(info.headers).find(([key]) => key.toLowerCase() === 'content-type')?.[0]
            : undefined;
        return this.encodeBody(info.body, contentType);
    }

    private encodeBody(body: unknown, contentType: string | undefined) : string | Buffer | undefined {
        if (body === undefined || body === null) {
            return undefined;
        }

        if (Buffer.isBuffer(body)) {
            return body;
        }

        if (typeof body !== 'object') {
            return typeof body === 'string' ? body : String(body);
        }

        if (contentType?.endsWith('/x-www-form-urlencoded')) {
            return encodeQueryString(body);
        }

        return JSON.stringify(body);
    }

    private encodeMultipartBody(parts: Array<HttpRequestPart>) : Buffer {
        const bodyParts = parts.flatMap(part => {
             // write part headers
             const headers = Object.entries(part.headers ?? {})
                 .map(([key, value]) => `${key.toLowerCase()}: ${value}`).join('\r\n');
             return [
                 `--${this.multiPartBoundary}\r\n${headers}\r\n\r\n`,
                 part.body,
                 `\r\n`
             ];
        });
 
        return Buffer.concat([
            ...bodyParts.map(item => typeof item === 'string' ? Buffer.from(item) : item),
            Buffer.from(`--${this.multiPartBoundary}--`, 'ascii')
        ]);
    }

    private sendRequestBody(request: http.ClientRequest, body: string | Buffer) : Promise<http.ClientRequest> {
        if (HttpTransport.enableResponseLogging) {
            this.logger.debug('<request>', typeof body === 'string' ? body : body.toString(this.bodyEncoding));
        }

        if (body.length > this.options.gzipThreshold && this.options.useGzipEncoding) {
            const activeEncoding = request.getHeader('content-encoding');
            return new Promise((resolve, reject) => {
                zlib.gzip(body, (err, value) => {
                    err ? reject(err) : request
                        .setHeader('content-encoding', activeEncoding ? `${activeEncoding}, gzip` : 'gzip')
                        .write(value, 'binary', err =>
                            err ? reject(err) : resolve(request)
                        );
                });
            });
        }

        return new Promise((resolve, reject) =>
            request.write(body, this.bodyEncoding, err =>
                err ? reject(err) : resolve(request)
            )
        );
    }

    private handleResponse(request: HttpRequestInfo, response: http.IncomingMessage): Promise<HttpResponse> {
        const url = this.parseUrl(request.url);
        const setCookiesHeader = response.headers['set-cookie'];

        if (this.options.handleCookies && setCookiesHeader?.length) {
            setCookiesHeader.forEach(cookie => this.cookies.setCookieSync(cookie, url.href));
        }

        if (this.isRedirect(response)) {
            const redirectRequestInfo = this.getRedirectRequest(response, request);
            return this.httpRequest(redirectRequestInfo);
        }

        const responsePromise = new DeferredPromise<HttpResponse>();
        const responseData = new Array<Buffer>();
        let isComplete = false;

        response.on('data', (chunk) => responseData.push(chunk));
        response.once('end', () => {
            if (responsePromise.isResolved) {
                // Prevent race condition when the response is already resolved 
                return;
            }
            isComplete = true;
            responsePromise.bind(this.decodeResponseBody(response, Buffer.concat(responseData))
                .then(body => {
                    if (HttpTransport.enableResponseLogging) {
                        this.logger.debug(`<headers>`, response.headers);
                        this.logger.debug(`<response>`, body.toString(this.bodyEncoding));
                    }
                    const parsed = this.parseResponseBody(response, body);
                    if (typeof parsed !== 'string') {
                        response.headers['content-type'] = 'no-parse';
                    }
                    return Object.assign(response, { body: parsed });
                }));
        });
        response.once('close', () => {
            if (!isComplete) {
                responsePromise.reject(new CustomError(`Connection closed before response was complete`, { code: 'CLIENT_CLOSED' }));
            }
        });

        return responsePromise;
    }

    private decodeResponseBody(response: http.IncomingMessage, responseBuffer: Buffer): Promise<Buffer> {
        // TODO: support chained encoding
        const encoding = response.headers['content-encoding'];

        if (encoding === 'gzip') {
            return new Promise((resolve, reject) => {
                zlib.gunzip(responseBuffer, { finishFlush: zlib.constants.Z_SYNC_FLUSH }, (err, body) => {
                    err ? reject(err) : resolve(body);
                });
            });
        }

        if (encoding === 'deflate') {
            return new Promise((resolve, reject) => {
                zlib.inflate(responseBuffer, (err, body) => {
                    err ? reject(err) : resolve(body);
                });
            });
        }

        if (encoding === 'identity' || !encoding) {
            return Promise.resolve(responseBuffer);
        }

        throw new Error(`Received unsupported 'content-encoding' header value: ${encoding}`);
    }

    private parseResponseBody(response: http.IncomingMessage, responseBuffer: Buffer): object | string {
        const contentType = this.parseContentType(response.headers['content-type']);
        const contentCharset = contentType?.parameters['charset'];
        const encoding = contentCharset && Buffer.isEncoding(contentCharset) ? contentCharset : this.bodyEncoding;

        try {
            if (contentType) {
                const decoder = this.options.responseDecoders?.[contentType.subtype]
                    ?? (contentType.suffix ? this.options.responseDecoders?.[contentType.suffix] : undefined);

                if (decoder) {
                    return decoder(responseBuffer, encoding);
                }
            }
        } catch (err: any) {
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
                return new URL(this.options.instanceUrl + url);
            }
            return new URL(this.options.baseUrl + url);
        }
        return new URL(url);
    }
}
