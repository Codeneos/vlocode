import { Connection, ConnectionOptions, RequestInfo, OAuth2, Metadata, Callback, DeployResult, DescribeMetadataResult } from 'jsforce';
import { HttpApiOptions } from 'jsforce/http-api';

import { Logger, LogLevel, LogManager } from '@vlocode/core';
import { CustomError, decorate, wait } from '@vlocode/util';
import { HttpTransport } from './httpTransport';

/**
 * Promise with a `thenCall` callback method compatible with JSforce promises
 */
type CallbackPromise<T> = Promise<T> & { thenCall(callback: Callback<T> | undefined): CallbackPromise<T> };

/**
 * Salesforce connection decorator that extends the base JSForce connection
 */
export class SalesforceConnection extends Connection {

    /**
     * When `true` feed tracking is disabled improving overall performance by not generating feed notifications on changes.
     * @default true
     */
    public disableFeedTracking!: boolean;

    /**
     * The client ID used in the request headers
     */
    public static clientConnectionId = `sfdx toolbelt:${process.env.VLOCODE_SET_CLIENT_IDS ?? 'vlocode'}`;

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
        this.disableFeedTracking = true;        

        // Setup transport
        this['_transport'] = new HttpTransport({ instanceUrl: this.instanceUrl, baseUrl: this._baseUrl() }, LogManager.get('HttpTransport'));
        if (this.oauth2) {
            this.oauth2 = new SalesforceOAuth2(this.oauth2, this);
        }

        // Decorate metadata API
        this.metadata = new SalesforceMetadata(this.metadata);

        // Configure logger
        this.logger = LogManager.get(SalesforceConnection)
        this['_logger'] = new JsForceLogAdapter(this.logger);
        this.tooling['_logger'] = new JsForceLogAdapter(this.logger);

        // Overwrite refresh function on refresh delegate
        if (this['_refreshDelegate']) {
            this['_refreshDelegate']['_refreshFn'] = SalesforceConnection.refreshAccessToken;
        }

        this.patchAsyncResultLocator();
    }

    private static refreshAccessToken(_this: SalesforceConnection, callback: (err: any, accessToken?: string, response?: any) => void) : Promise<string> {
        if (!_this.refreshToken) {
            throw new Error('Unable to refresh token due to missing access token');
        }

        return _this.oauth2.refreshToken(_this.refreshToken)
            .then((res: any) => {
                _this.accessToken = res.access_token;
                _this.instanceUrl = res.instance_url;
                
                const [ userId, organizationId ] = res['id'].split("/");
                _this.userInfo = { id: userId, organizationId, url: res.id };

                callback?.(undefined, res.access_token, res);
                return res.access_token;
            })
            .catch(err => callback?.(err));
    }

    /**
     * Generic request sink
     * @param info Request info
     * @param options Requesting options
     * @param callback Completed callback
     * @returns Request promise
     */
    public request<T = object>(
        info: string | RequestInfo,
        options?: HttpApiOptions | undefined,
        callback?: ((err: Error, object: T) => void) | undefined): Promise<T> {

        if (typeof info === 'string') {
            info = { method: 'GET', url: info };
        }

        info.headers = Object.entries(info.headers ?? {}).reduce((headers, [key, value]) => 
            Object.assign(headers, { [key.toLowerCase()]: value })
        , {});

        // Assign default headers for requests
        Object.assign(info.headers, {
            'disableFeedTracking': this.disableFeedTracking == true,
            'content-type': info.headers['content-type'] ?? 'application/json; charset=utf-8',
            'user-agent': SalesforceConnection.clientConnectionId
        });

        let retries = 0;

        const errorHandler = (err: any) => {
            // Retry error handler
            const canRetry = retries++ < SalesforceConnection.maxRetries || SalesforceConnection.maxRetries < 0;

            if (canRetry && this.isRetryableError(err)) {
                this.logger.info(
                    `Request failed with retryable error (${err.errorCode ?? err.code}) ` + 
                    `at attempt ${retries}/${SalesforceConnection.maxRetries > 0 ? SalesforceConnection.maxRetries : 'infinite'}`
                );                
                return wait(
                    Math.min(SalesforceConnection.retryInterval * retries, 5000)
                ).then(() => super.request<T>(info, options)).catch(errorHandler);
            }

            throw err;
        }

        const requestPromise = super.request<T>(info, { ...options }).catch(errorHandler);
        if (callback) {
            // @ts-ignore
            return requestPromise.then(v => callback(undefined, v), err => callback(err, undefined));
        }
        return requestPromise;
    }

    /**
     * Determine if an error can be retried; if returns true the error is retried before being thrown to the caller. 
     * The number of retries is limited by the {@link SalesforceConnection.maxRetries} configured.
     * @param err Error thrown by the connection
     * @returns `true` if the error is retryable otherwise `false`
     */
    private isRetryableError(err: unknown) : err is (Error & { code?: string, errorCode?: string }) {
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
     * Monkey-patch jsforce async AsyncResultLocator to support `res.done` as boolean type
     */
    private patchAsyncResultLocator() {
        const asyncResultLocatorPrototype = Object.getPrototypeOf(this.metadata.checkStatus(''));
        if (typeof asyncResultLocatorPrototype.then === 'function') {
            const convertType = function(res: any) {
                if (res?.$["xsi:nil"] === 'true' || res?.$["xsi:nil"] === true) {
                    return null;
                }
                return res;
            };
            asyncResultLocatorPrototype.then = function(onResolve, onReject) {
                return this._results.then(results => {
                    results = Array.isArray(results) ? results.map(convertType) : convertType(results);
                    if (this._isArray && !Array.isArray(results)) {
                        results = [ results ];
                    }
                    return onResolve?.(results);
                }, onReject);
            };
        }
    }
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

//Metadata.prototype.checkDeployStatus

class SalesforceOAuth2 extends decorate(OAuth2) {

    private transport: HttpTransport;

    constructor(oauth: OAuth2, connection: SalesforceConnection) {
        super(oauth);

        this.transport = new HttpTransport({ 
            handleCookies: false,
            // OAuth endpoints do not support gzip encoding
            useGzipEncoding: false, 
            shouldKeepAlive: false,
            instanceUrl: connection.instanceUrl, 
            baseUrl: connection._baseUrl() 
        });
    }

    /**
     * Post a request to token service
     * @param params Params as object send as URL encoded data
     * @returns Response body as JSON object
     */
    private async _postParams(params: Record<string, string>) {
        const response = await this.transport.httpRequest({
            method: 'POST',
            url: this.tokenServiceUrl,
            headers: { 
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: Object.entries(params).map(([v,k]) => `${v}=${encodeURIComponent(k)}`).join('&'),
        });

        if (response.statusCode && response.statusCode >= 400) {
            if (typeof response.body === 'object') {
                throw new CustomError(response.body['error_description'], { name: response.body['error'] });
            }

            throw new CustomError(response.body ?? '(SalesforceOAuth2) No response from server', { 
                name: `ERROR_HTTP_${response.statusCode}` 
            });
        }

        if (typeof response.body !== 'object') {
            throw new Error('(SalesforceOAuth2) No response from server');
        }

        return response.body;
    }
}

/**
 * Patches Metadata access container that which fixes issues with `checkDeployStatus` and `describe` results
 */
class SalesforceMetadata extends decorate(Metadata) {

    private get apiVersion(): string {
        return this.connection.version;
    }

    private get connection(): SalesforceConnection {
        return this['_conn'];
    }

    public checkDeployStatus(id: string, includeDetails?: boolean, callback?: Callback<DeployResult>): Promise<DeployResult> {
        if (typeof includeDetails === 'function') {
            callback = includeDetails;
        }
        return this['_invoke']('checkDeployStatus', {
            asyncProcessId: id,
            includeDetails: includeDetails === true
        }).thenCall(callback);
    }

    public describe(version?: string, callback?: Callback<DescribeMetadataResult>): Promise<DescribeMetadataResult> {
        if (typeof version !== 'string') {
            callback = version;
            version = this.apiVersion;
        }
        return this['_invoke']("describeMetadata", { 
            asOfVersion: version
        }).thenCall(callback);
    }
}
