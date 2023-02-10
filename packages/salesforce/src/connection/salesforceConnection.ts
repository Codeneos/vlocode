import { Connection, ConnectionOptions, Metadata } from 'jsforce';

import { Logger, LogLevel, LogManager } from '@vlocode/core';
import { resumeOnce, CustomError, wait, asArray } from '@vlocode/util';
import { HttpRequestInfo, HttpResponse, HttpTransport, Transport } from './httpTransport';
import { EventEmitter } from 'events';
import { SalesforceOAuth2 } from './oath2';
import { MetadataApi } from './metadata';

type RefreshTokenCallback = (err: Error | undefined, accessToken?: string, response?: any) => void;

interface RefreshDelegate extends EventEmitter {
    refresh(requestTime: number): string;
    refresh(requestTime: number, callback: RefreshTokenCallback): void;

    _refreshFn: (connection: SalesforceConnection, callback: RefreshTokenCallback) => void;
    _refreshing: boolean;
}

interface RequestOptions {
    responseType?: string;
    transport?: Transport;
    noContentResponse?: boolean;
}

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
        this.disableFeedTracking = true;

        // Setup transport
        this._transport = new HttpTransport({ instanceUrl: this.instanceUrl, baseUrl: this._baseUrl() }, LogManager.get('HttpTransport'));
        if (this.oauth2) {
            this.oauth2 = new SalesforceOAuth2(this.oauth2, this);
        }

        // @ts-ignore Decorate metadata API
        this.metadata = new MetadataApi(this);

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

        return tokens.access_token;
    }

    /**
     * Send a request to Salesforce and returns the parsed response based on the content type set in the response.
     * @param request Request details; when passed as string a GET is performed
     * @param options Additional request options
     * @returns Request promise
     */
    public async request<T = any>(
        request: string | HttpRequestInfo,
        options?: RequestOptions | any): Promise<T>;

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

        // Normalize the headers
        request.headers = Object.fromEntries(
            Object.entries(request.headers ?? {}).map(([key, value]) => ([ key.toLowerCase(), value ]))
        );

        // Assign default headers for requests
        Object.assign(request.headers, {
            'disableFeedTracking': this.disableFeedTracking == true,
            'content-type': request.headers['content-type'] ?? 'application/json; charset=utf-8',
            'user-agent': SalesforceConnection.clientConnectionId
        });

        return request;
    }

    private async executeRequest<T>(
        request: HttpRequestInfo,
        options?: RequestOptions): Promise<T>
    {
        if (this._refreshDelegate._refreshing) {
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

    private isErrorResponse(response: HttpResponse) {
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





// export class AsyncResultLocator<T extends AsyncResult | AsyncResult[]> extends EventEmitter implements Promise<T> {

//     public [Symbol.toStringTag] = 'AsyncResultLocator';
//     private isPolling = false;
//     private isCompleted = false;

//     constructor(
//         private metadataApi: MetadataApi,
//         private results: Promise<T>,
//         private isArray?: boolean) {
//         super();
//         results = results.then(result => this.normalizeResults(result));
//     }

//     public then<TResult1 = T, TResult2 = never>(
//         onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
//         onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2> {
//         return this.results.then(onfulfilled, onrejected);
//     }

//     public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<T | TResult> {
//         return this.results.catch(onrejected);
//     }

//     public finally(onfinally?: (() => void) | null | undefined): Promise<T> {
//         return this.results.finally(onfinally);
//     }

//     public thenCall(callback: Callback<T> | undefined) {
//         return thenCall(this, callback);
//     }

//     public async check(callback?: Callback<T>) {
//         return thenCall(this.metadataApi.checkStatus(this.extractIds(await this.results)) as unknown as PromiseLike<T>, callback);
//     }

//    /**
//     * Polling the async result object until the status is changed to completed.
//     * Events `'progress', 'complete' and 'error'` are emitted when the progress changes or completes.
//     *
//     * This method also returns a promise which is resolved when the
//     *
//     * @param interval Polling interval in milliseconds
//     * @param timeout Polling timeout in milliseconds
//     */
//     public async poll(interval: number, timeout: number) : Promise<T> {
//         if (this.isPolling) {
//             throw new Error('Already polling this async result locator');
//         }

//         this.isPolling = true;
//         return poll<T>(async () => {
//             const results = await this.check();
//             const pending = asArray(results).filter(result => !result?.done);

//             if (pending.length) {
//                 pending.forEach(result => this.emit('progress', result));
//             } else {
//                 this.isCompleted = true;
//                 this.results = Promise.resolve(results);
//                 this.emit('complete', results);
//                 return results;
//             }
//         }, timeout, interval).catch(err => {
//             this.emit('error', err);
//             throw err;
//         });
//     }

//     /**
//     * Polling the async result object until the status is changed to completed.
//     * Events `'progress', 'complete' and 'error'` are emitted when the progress changes
//     *
//     * @param interval Polling interval in milliseconds
//     * @param timeout Polling timeout in milliseconds
//     */
//     public async complete(callback: Callback<T>) {
//         if (this.isCompleted) {
//             return this.results;
//         }
//         if (this.isPolling) {
//             return thenCall(resumeOnce('complete', this), callback);
//         }
//         return thenCall(this.poll(this.metadataApi.pollInterval, this.metadataApi.pollTimeout), callback);
//     }

//     private extractIds(results: AsyncResult | AsyncResult[]) {
//         return (Array.isArray(results) ? results : [results]).map(result => result.id);
//     }

//     private normalizeResults(results: T): T {
//         if (Array.isArray(results)) {
//             // @ts-ignore
//             return this.isArray ? results : results[0];
//         }
//         // @ts-ignore
//         return this.isArray ? [ results ] : results;
//     }
// }


// /**
//  * The locator class for Metadata API asynchronous call result
//  *
//  * @protected
//  * @class Metadata~AsyncResultLocator
//  * @extends events.EventEmitter
//  * @implements Promise.<Metadata~AsyncResult|Array.<Metadata~AsyncResult>>
//  * @param {Metadata} meta - Metadata API object
//  * @param {Promise.<Metadata~AsyncResult|Array.<Metadata~AsyncResult>>} results - Promise object for async result info
//  * @param {Boolean} [isArray] - Indicates whether the async request is given in array or single object
//  */
// var AsyncResultLocator = function(meta, results, isArray) {
//     this._meta = meta;
//     this._results = results;
//     this._isArray = isArray;
//   };

//   inherits(AsyncResultLocator, events.EventEmitter);

//   /**
//    * Promise/A+ interface
//    * http://promises-aplus.github.io/promises-spec/
//    *
//    * Delegate to deferred promise, return promise instance for batch result
//    *
//    * @method Metadata~AsyncResultLocator#then
//    */
//   AsyncResultLocator.prototype.then = function(onResolve, onReject) {
//     var self = this;
//     return this._results.then(function(results) {
//       var convertType = function(res) {
//         if (res.$ && res.$["xsi:nil"] === 'true') {
//           return null;
//         }
//         res.done = res.done === 'true';
//         return res;
//       };
//       results = _.isArray(results) ? _.map(results, convertType) : convertType(results);
//       if (self._isArray && !_.isArray(results)) {
//         results = [ results ];
//       }
//       return onResolve(results);
//     }, onReject);
//   };

//   /**
//    * Promise/A+ extension
//    * Call "then" using given node-style callback function
//    *
//    * @method Metadata~AsyncResultLocator#thenCall
//    */
//   AsyncResultLocator.prototype.thenCall = function(callback) {
//     return _.isFunction(callback) ? this.then(function(res) {
//       process.nextTick(function() {
//         callback(null, res);
//       });
//     }, function(err) {
//       process.nextTick(function() {
//         callback(err);
//       });
//     }) : this;
//   };

//   /**
//    * Check the status of async request
//    *
//    * @method Metadata~AsyncResultLocator#check
//    * @param {Callback.<Metadata~AsyncResult|Array.<Metadata~AsyncResult>>} [callback] - Callback function
//    * @returns {Promise.<Metadata~AsyncResult|Array.<Metadata~AsyncResult>>}
//    */
//   AsyncResultLocator.prototype.check = function(callback) {
//     var self = this;
//     var meta = this._meta;
//     return this.then(function(results) {
//       var ids = _.isArray(results) ? _.map(results, function(res){ return res.id; }) : results.id;
//       self._ids = ids;
//       return meta.checkStatus(ids);
//     }).thenCall(callback);
//   };

//   /**
//    * Polling until async call status becomes complete or error
//    *
//    * @method Metadata~AsyncResultLocator#poll
//    * @param {Number} interval - Polling interval in milliseconds
//    * @param {Number} timeout - Polling timeout in milliseconds
//    */
//   AsyncResultLocator.prototype.poll = function(interval, timeout) {
//     var self = this;
//     var startTime = new Date().getTime();
//     var poll = function() {
//       var now = new Date().getTime();
//       if (startTime + timeout < now) {
//         var errMsg = "Polling time out.";
//         if (self._ids) {
//           errMsg += " Process Id = " + self._ids;
//         }
//         self.emit('error', new Error(errMsg));
//         return;
//       }
//       self.check().then(function(results) {
//         var done = true;
//         var resultArr = _.isArray(results) ? results : [ results ];
//         for (var i=0, len=resultArr.length; i<len; i++) {
//           var result = resultArr[i];
//           if (result && !result.done) {
//             self.emit('progress', result);
//             done = false;
//           }
//         }
//         if (done) {
//           self.emit('complete', results);
//         } else {
//           setTimeout(poll, interval);
//         }
//       }, function(err) {
//         self.emit('error', err);
//       });
//     };
//     setTimeout(poll, interval);
//   };

//   /**
//    * Check and wait until the async requests become in completed status
//    *
//    * @method Metadata~AsyncResultLocator#complete
//    * @param {Callback.<Metadata~AsyncResult|Array.<Metadata~AsyncResult>>} [callback] - Callback function
//    * @returns {Promise.<Metadata~AsyncResult|Array.<Metadata~AsyncResult>>}
//    */
//   AsyncResultLocator.prototype.complete = function(callback) {
//     var deferred = Promise.defer();
//     this.on('complete', function(results) {
//       deferred.resolve(results);
//     });
//     this.on('error', function(err) {
//       deferred.reject(err);
//     });
//     var meta = this._meta;
//     this.poll(meta.pollInterval, meta.pollTimeout);
//     return deferred.promise.thenCall(callback);
//   };