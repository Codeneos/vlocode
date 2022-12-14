import { Connection, ConnectionOptions, RequestInfo } from 'jsforce';
import { HttpApiOptions } from 'jsforce/http-api';

import { Logger, LogLevel } from '@vlocode/core';
import { lazy, wait } from '@vlocode/util';
import { HttpTransport } from './httpTransport';

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
     * Internal HTTP transport used by this connection.
     */
    private _transport: HttpTransport;

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
     * Get the logger
     */
    public get logger(): JsForceLogAdapter {
        return this['_logger'];
    }

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
        this._transport = new HttpTransport(this, lazy(() => this.logger));
    }

    /**
     * Change the default logger of the connection.
     * @param logger Logger
     */
    public setLogger(logger: Logger) {
        this['_logger'] = new JsForceLogAdapter(logger);
        this.tooling['_logger'] = new JsForceLogAdapter(logger);
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

        return super.request<T>(info, { ...options, transport: this._transport }).catch(errorHandler);
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
