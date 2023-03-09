import { Connection, ConnectionOptions, Metadata } from 'jsforce';

import { Logger, LogLevel, LogManager } from '@vlocode/core';
import { resumeOnce, CustomError, wait, asArray, formatString, DeferredPromise } from '@vlocode/util';
import { HttpMethod, HttpRequestInfo, HttpResponse, HttpTransport, Transport } from './httpTransport';
import { EventEmitter } from 'events';
import { SalesforceOAuth2 } from './oath2';
import { MetadataApi } from './metadata';
import { RestClient } from '../restClient';
import { AsyncQueryIterator } from './asyncQueryIterator';

type RefreshTokenCallback = (err: Error | undefined, accessToken?: string, response?: any) => void;

interface RefreshDelegate extends EventEmitter {
    refresh(requestTime: number): string;
    refresh(requestTime: number, callback: RefreshTokenCallback): void;

    _refreshFn: (connection: SalesforceConnection, callback: RefreshTokenCallback) => void;
    _refreshing: boolean;
}

export interface RequestOptions {
    responseType?: string;
    transport?: Transport;
    noContentResponse?: boolean;
}

interface Subrequest {
    /**
     * The method to use with the requested resource.
     * For a list of valid methods, refer to the documentation for the requested resource.
     */
    method: HttpMethod;
    /**
     * The resource to request.
     * - The URL can include any query string parameters that the {@link Subrequest} supports. The query string must be URL-encoded.
     * - You can use parameters to filter response bodies.
     * - You __cannot__ apply headers at the {@link Subrequest} level.
     */
    url: string;
    /**
     * The name of the binary part in the multipart request.
     * When multiple binary parts are uploaded in one batch request, this value is used to map a request to its binary part.
     * To prevent name collisions, use a unique value for each `binaryPartName` property in a batch request.
     *
     * If this value exists, a `binaryPartNameAlias` value must also exist.
     */
    binaryPartName?: string;
    /**
     * The `name` parameter in the `Content-Disposition` header of the binary body part.
     * Different resources expect different values. See Insert or Update Blob Data.
     * If this value exists, a `binaryPartName` value must also exist.
     */
    binaryPartNameAlias?: string;
    /**
     * The input body for the request.
     * The type depends on the request specified in the url property.
     */
    richInput?: any;
}

interface SubrequestResult {
    /**
     * The type depends on the response type of the subrequest.
     * __If the result is an error, the type is a collection containing the error message and error code.__
     */
    result?: any;
    /**
     * An HTTP status code indicating the status of this subrequest.
     */
    statusCode: number;
}

/**
 * APIs that are supported `composite/batch` requests
 */
const compositeSupportedApis: ReadonlyArray<string> = Object.freeze([
    'limits',
    'query',
    'queryAll',
    'search',
    'connect',
    'chatter',
    'actions',
    'sobjects'
]);

/**
 * Salesforce connection decorator that extends the base JSForce connection
 */
export class SalesforceConnection extends Connection {

    /**
     * When `true` feed tracking is enabled improving decreasing overall performance by generating feed notifications on changes.
     * @default false
     */
    public enableFeedTracking: boolean;

    /**
     * The client ID used in the request headers
     */
    public static clientConnectionId = `sfdx toolbelt:${process.env.VLOCODE_SET_CLIENT_ID ?? 'vlocode'}`;

    /**
     * Max number of times a request is retried before throwing an error to the caller.
     */
    public static maxRetries = 5;

    /**
     * The retry interval after which a failed http request is retried.
     * The retry interval is multiplied by the retry number to gradually increase the interval between each retry up until the {@link maxRetries} is reached.
     */
    public static retryInterval = 1000;

    /**
     * Internal logger for the connection, is adapted into a JSforce logger as well
     */
    private logger!: Logger;

    public metadata!: MetadataApi & Metadata;
    public oauth2!: SalesforceOAuth2;

    private _transport: HttpTransport;
    private _refreshDelegate!: RefreshDelegate;

    constructor(params: ConnectionOptions) {
        super(params);
        this.initializeLocalVariables();
    }

    /**
     * Create instance of a {@link SalesforceConnection} from any existing JS Force type connection; replacing the connection prototype and initializing local variables.
     *
     * If the {@link connection} is already of type SalesforceConnection does not reinitialize the variables and returns the connection as is.
     *
     * @param connection JS Force Connection to use as base
     * @returns Instance of a {@link SalesforceConnection}
     */
    static create(connection: Connection): SalesforceConnection {
        if (connection instanceof SalesforceConnection) {
            return connection;
        }
        const sfConnection: SalesforceConnection = Object.setPrototypeOf(connection, SalesforceConnection.prototype);
        sfConnection.initializeLocalVariables();
        return sfConnection;
    }

    /**
     * WHen the prototype is changed of connection local variables aren't re-initialized; this method sets the defaults for all private and public variables.
     */
    private initializeLocalVariables() {
        // Setup transport
        this._transport = new HttpTransport({ instanceUrl: this.instanceUrl, baseUrl: this._baseUrl() }, LogManager.get('HttpTransport'));
        if (this.oauth2) {
            this.oauth2 = new SalesforceOAuth2(this.oauth2, this);
        }

        // Replace metadata API
        this.metadata = new MetadataApi(this) as any;

        // Configure logger
        this.logger = LogManager.get(SalesforceConnection)
        this['_logger'] = new JsForceLogAdapter(this.logger);
        this.tooling['_logger'] = new JsForceLogAdapter(this.logger);

        // Overwrite refresh function on refresh delegate
        if (this._refreshDelegate) {
            this._refreshDelegate._refreshFn = (connection, callback) =>
                connection.refreshAccessToken().then(token => !callback ? token : callback(undefined, token, undefined), callback);
        }
    }

    /**
     * Executes up to 25 subrequests in a single request. The response bodies and HTTP statuses of
     * the subrequests in the batch are returned in a single response body.
     * Each subrequest counts against rate limits.
     *
     * __Note__ all requests are executed against the connections API {@link version}. URLs that do contain
     * a version number such as `/services/data/v33.0/sobjects/Account/describe` are normalized to a format
     * without a concrete API version such as, i.e: `{apiVersion}/sobjects/Account/describe`.
     *
     * __Note__ only the following APIs are supported:
     * - `limits`
     * - `query`
     * - `queryAll`
     * - `search`
     * - `connect`
     * - `chatter`
     * - `actions`
     * - `sobjects`
     *
     * Format of requests:
     * ```js
     * const requests = [{
     *    method: 'GET',
     *    url: 'sobjects/Account/describe'
     * }, {
     *    method: 'POST',
     *    url: 'sobjects/Account',
     *    richInput: { Name: 'CB Corp.' }
     * }]
     * ```
     *
     * @param batchRequests Collection of subrequests to execute.
     * @param haltOnError Controls whether a batch continues to process after a subrequest fails. The default is false.
     * If the value is false and a subrequest in the batch doesn’t complete, Salesforce attempts to execute the subsequent subrequests in the batch.
     * If the value is true and a subrequest in the batch doesn’t complete due to an HTTP response in the 400 or 500 range, Salesforce halts execution. It returns an HTTP 412 status code and a BATCH_PROCESSING_HALTED error message for each subsequent subrequest. The top-level request to /composite/batch returns HTTP 200, and the hasErrors property in the response is set to true.
     * This setting is only applied during subrequest processing, and not during initial request deserialization. If an error is detected during deserialization, such as a syntax error in the Subrequest request data, Salesforce returns an HTTP 400 Bad Request error without processing any subrequests, regardless of the value of haltOnError. An example where this could occur is if a subrequest has an invalid method or url field.
     * @returns Array of promises that reflect the batch requests; each promise can be rejected or resolved individually
     */
    public batchRequest<T = any>(requests: ReadonlyArray<Subrequest>, haltOnError?: boolean): Promise<T>[] {
        if (requests.length > 25) {
            throw new Error('Batch requests supports at most 25 requests in a single composite');
        }

        const responses = new Array<DeferredPromise<T>>();
        const batchRequests = requests.map(req => ({
            ...req,
            url: this.normalizeBatchRequestUrl(req.url)
        }));

        this.request<{ hasErrors: boolean; results: Array<SubrequestResult> }>({
            method: 'POST',
            url: `/services/data/v{apiVersion}/composite/batch`,
            body: JSON.stringify({ batchRequests, haltOnError })
        }).then(resp => resp.results.map((res, i) => {
            if (resp.hasErrors && this.isErrorResponse(res)) {
                return responses[i].reject(this.getResponseError({
                    body: res.result,
                    statusCode: res.statusCode
                }));
            }
            return responses[i].resolve(res.result);
        })).catch(err => responses.forEach(req => req.reject(err)));

        return responses;
    }

    private normalizeBatchRequestUrl(url: string) {
        if (!url.startsWith(`/`)) {
            url = `/${url}`;
        }
        if (url.startsWith(`/services/data/`)) {
            url = url.slice(15);
        }
        if (url.startsWith(`v`)) {
            url = `{apiVersion}/${url.split('/').slice(1).join('/')}`;
        }

        const apiName = url.split('/')[0]!;
        if (!compositeSupportedApis.includes(apiName)) {
            throw new Error(`Composite Batch request does not support API "${apiName}": ${url}`);
        }

        return this.replaceTokens(url);
    }

    /**
     * Send a request to Salesforce and returns the parsed response based on the content type set in the response.
     * @param request Request details; when passed as string a GET is performed
     * @param options Additional request options
     * @returns Request promise
     */
    public request<T = any>(
        request: string | HttpRequestInfo,
        options?: RequestOptions | any): Promise<T>;

    public request(
        request: HttpRequestInfo, 
        options: RequestOptions & { responseType: 'raw' }): Promise<HttpResponse>;

    public async request<T = any>(
        info: string | HttpRequestInfo,
        options?: RequestOptions | any,
        callback?: any): Promise<T> {

        if (callback || typeof options === 'function') {
            throw new Error('Use promises instead of using a callback parameter');
        }

        const request = this.prepareRequest(info);
        let attempts = 0;

        // eslint-disable-next-line no-constant-condition -- retry loop breaks when retry limit is reached
        while(true) {
            try {
                // Await response so errors can be handled
                return await this.executeRequest<T>(request, { ...options });
            } catch(err) {
                const canRetry = attempts++ < SalesforceConnection.maxRetries || SalesforceConnection.maxRetries < 0

                if (!canRetry || !this.isRetryableError(err)) {
                    //callback?.(err, undefined as any);
                    this.logger.error(err);
                    throw err;
                }

                this.logger.info(
                    `Request failed with retryable error (${err.errorCode ?? err.code}) ` +
                    `at attempt ${attempts}/${SalesforceConnection.maxRetries > 0 ? SalesforceConnection.maxRetries : 'infinite'}`
                )

                await wait(Math.min(SalesforceConnection.retryInterval * attempts, 5000));
            }
        }
    }

    private prepareRequest(info: string | HttpRequestInfo) : HttpRequestInfo {
        const request: HttpRequestInfo = typeof info === 'string' ? { method: 'GET', url: info } : { ...info };

        // replace placeholders
        request.url = this.replaceTokens(request.url);

        // Normalize the headers
        request.headers = Object.fromEntries(
            Object.entries(request.headers ?? {}).map(([key, value]) => ([ key.toLowerCase(), value ]))
        );

        // Assign default headers for requests
        Object.assign(request.headers, {
            'disableFeedTracking': !this.enableFeedTracking,
            'content-type': request.headers['content-type'] ?? 'application/json; charset=utf-8',
            'user-agent': SalesforceConnection.clientConnectionId
        });

        return request;
    }

    private replaceTokens(url: string): string {
        // Replace tokens in the URL with concrete values; currently limited to API version
        return formatString(url, {
            apiVersion: this.version
        });
    }

    private async executeRequest<T>(
        request: HttpRequestInfo,
        options?: RequestOptions): Promise<T>
    {
        if (this._refreshDelegate?._refreshing) {
            const refreshError = await resumeOnce<Error | undefined>('resume', this._refreshDelegate);
            if (refreshError) {
                throw refreshError;
            }
        }

        if (this.accessToken) {
            request.headers = Object.assign(request.headers ?? {}, {
                authorization: `Bearer ${this.accessToken}`
            });
        }

        const requestTime = Date.now();
        const response = await (options?.transport ?? this._transport).httpRequest(request);

        if (this.isSessionExpired(response)) {
            return new Promise((resolve, reject) => {
                this._refreshDelegate.refresh(requestTime, (refreshError?: Error) => {
                    if (refreshError) {
                        return reject(refreshError);
                    }
                    resolve(this.executeRequest(request, options))
                });
            });
        }

        if (this.isErrorResponse(response)) {
            throw this.getResponseError(response);
        }

        if (options?.responseType === 'raw') {
            return response as any;
        }

        return response.body as T;
    }

    private isSessionExpired(response: HttpResponse) {
        if (response.statusCode === 403) {
            return response.body === 'Bad_OAuth_Token' || response.body === 'Missing_OAuth_Token';
        }
        return response.statusCode === 401;
    }

    private isErrorResponse(response: HttpResponse | SubrequestResult) {
        return response.statusCode && response.statusCode >= 400;
    }

    /**
     * When {@link isErrorResponse} returns true this method is used to extract the error from the response body and return it.
     * @param response The response object as returned by the transport layer
     * @returns
     */
    private getResponseError(response: HttpResponse) {
        if (typeof response.body === 'object') {
            const error = asArray<any>(asArray(response.body)[0])[0];
            return new CustomError(error.message, { ...error, name: error.code });
        }

        return new CustomError(String(response.body), {
            statusCode: response.statusCode,
            errorCode: `ERROR_HTTP_${response.statusCode}`,
            name: `ERROR_HTTP_${response.statusCode}`
        });
    }

    /**
     * Determine if an error can be retried; if returns true the error is retried before being thrown to the caller.
     * The number of retries is limited by the {@link SalesforceConnection.maxRetries} configured.
     * @param err Error thrown by the connection
     * @returns `true` if the error is retryable otherwise `false`
     */
    private isRetryableError(err: unknown) : err is (Error & { code: string | undefined, errorCode: string | undefined }) {
        return err instanceof Error && (
            err['code'] == 'ECONNRESET' ||
            err['code'] == 'ENOTFOUND' ||  (
                (
                    err['code'] == 'REQUEST_LIMIT_EXCEEDED' ||
                    err['errorCode'] == 'REQUEST_LIMIT_EXCEEDED'
                )
                &&
                err.message.indexOf('ConcurrentPerOrgLongTxn') != -1
            )
        );
    }

    /**
     * Refreshes the current access token and returns the refreshed token.
     * @returns Refreshed token
     */
    public async refreshAccessToken(): Promise<string> {
        if (!this.refreshToken) {
            throw new Error('Unable to refresh token due to missing access token');
        }

        const tokens = await this.oauth2.refreshToken(this.refreshToken);
        this.accessToken = tokens.access_token;
        this.instanceUrl = tokens.instance_url;

        const [userId, organizationId] = tokens.id.split("/");
        this.userInfo = { id: userId, organizationId, url: tokens.id };

        this.logger.debug(`token refresh complete`);
        this.emit('refresh', this.accessToken);

        return tokens.access_token;        
    }

    /**
     * Execute a query on Salesforce Tooling or Data (default) APIs and return the records.
     * 
     * By default fetches all records using the query locator when required; set {@link Query2Options.queryMore} 
     * to `false` to only fetch the the first batch
     * 
     * @param soql SOQL Query to execute
     * @param options Additional query options
     * @returns Async iterable and awaitable results from the query
     */
    public query2<T extends object = Record<string, unknown>>(soql: string, options?: Query2Options): AsyncQueryIterator<T> {
        return new AsyncQueryIterator<T>(
            new RestClient(this, options?.queryType === 'tooling' ? `/services/data/v{apiVersion}/tooling` : `/services/data/v{apiVersion}`),
            `${options?.includeDeleted ? 'queryAll' : 'query'}?q=${this.encodeRFC3986URI(soql)}`,
            options?.queryMore
        );
    }

    /**
     * Encode URL parameters according to RFC3986 using %-encoding. 
     * Encodes spaces as `+`.
     * @remarks differs from {@link encodeURIComponent} in also encoding `!`, `'`, `(`, `)`, and `*`
     * @param str String value to encode 
     * @returns encoded string 
     */
    private encodeRFC3986URI(str: string) {
        return str.replace(
            /[:/?#[\]@!$'()*+,;=% ]/g,
            c => c === ' ' ? '+' : `%${c.charCodeAt(0).toString(16).toUpperCase()}`
          );
      }
}

export interface Query2Options {
    /**
     * Defines the query backend type API to call. Some objects are available on both tooling and data API.
     * When not set defaults to `data`
     */
    queryType?: 'tooling' | 'data';
    /**
     * A numeric value that specifies the number of records returned for a query request.
     * Child objects count toward the number of records for the batch size. For example,
     * in relationship queries, multiple child objects are returned per parent row returned.
     *
     * The default is `2000`; the minimum is `200`, and the maximum is `2000`.
     *
     * There is no guarantee that the requested batch size is the actual batch size.
     * Changes are made as necessary to maximize performance.
     *
     * @default 2000
     */
    batchSize?: number;
    /**
     * Boolean value that specifies if deleted records should be included in the results.
     * @default false
     */
    includeDeleted?: boolean;
    /**
     * Boolean value that if true will fetch additional `records` that did not fit in the responses batch until all
     * result records are retrieved from the server.
     * @default true
     */
    queryMore?: boolean;
}

class JsForceLogAdapter {

    private readonly logSeverityMapping = {
        1: LogLevel.debug, // "DEBUG" : 1,
        2: LogLevel.info,  // "INFO"  : 2,
        3: LogLevel.warn,  // "WARN"  : 3,
        4: LogLevel.error, // "ERROR" : 4,
        5: LogLevel.fatal  // "FATAL" : 5
    };

    constructor(public readonly logger: Logger) {
    }

    public log(level: number, ...args: any[]) {
        this.logger.write(this.logSeverityMapping[level], ...args);
    }

    public info(...args: any[]): void { this.logger.write(LogLevel.info, ...args); }
    public verbose(...args: any[]): void { this.logger.write(LogLevel.verbose, ...args); }
    public warn(...args: any[]): void { this.logger.write(LogLevel.warn, ...args); }
    public error(...args: any[]): void { this.logger.write(LogLevel.error, ...args); }
    public debug(...args: any[]): void { this.logger.write(LogLevel.debug, ...args); }
}