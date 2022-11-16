import { Logger, LogLevel } from '@vlocode/core';
import { Connection, RequestInfo } from 'jsforce';
import { HttpApiOptions } from 'jsforce/http-api';

/**
 * Salesforce connection decorator that extends the base JSForce connection
 */
export class SalesforceConnection extends Connection {

    /**
     * When true feed tracking is disabled improving overall performance by not generating feed notifications on changes
     */
    public disableFeedTracking = true;

    /**
     * The client ID used in the request headers
     */
    public clientConnectionId = `sfdx toolbelt:${process.env.VLOCODE_SET_CLIENT_IDS ?? 'vlocode'}`;

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
        callback?: ((err: Error, Object: T) => void) | undefined): Promise<T> {

        if (typeof info === 'string') {
            info = { method: 'GET', url: info };
        }

        info.headers = Object.entries(info.headers ?? {}).reduce((headers, [key, value]) => 
            Object.assign(headers, { [key.toLowerCase()]: value })
        , {});

        // Assign default headers for requests
        Object.assign(info.headers, {
            'disableFeedTracking': this.disableFeedTracking,
            'content-type': info.headers['content-type'] ?? 'application/json',
            'user-agent': this.clientConnectionId,
        });

        return super.request(info, options, callback);
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

    constructor(private readonly logger: Logger) {
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