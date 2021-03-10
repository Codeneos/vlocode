import cache from 'lib/util/cache';
import JsForceConnectionProvider from './connection/jsForceConnectionProvider';

/**
 * Developer log data entry
 */
export interface DeveloperLogRecord {
    id: string;
    application: string;
    durationMilliseconds: number;
    location: string;
    LogLength: number;
    logUser: {
        name: string;
    };
    operation: string;
    request: string;
    startTime: string;
    status: string;
}

/**
 * Represents a developer log entry
 */
export class DeveloperLog {

    public get id() : string { return this.entry.id; }
    public get application() : string { return this.entry.application; }
    public get startTime() : Date { return new Date(this.entry.startTime); }
    public get durationMilliseconds() : number { return this.entry.durationMilliseconds; }
    public get location() : string { return this.entry.application; }
    public get size() : number { return this.entry.LogLength; }
    public get user() : string { return this.entry.logUser.name; }
    public get operation() : string { return this.entry.operation; }
    public get request() : string { return this.entry.request; }
    public get status() : string { return this.entry.status; }

    constructor(
        private readonly entry: DeveloperLogRecord,
        private readonly connectionProvider: JsForceConnectionProvider) {
    }

    /**
     * Request the body of this log file from the server
     */
    @cache()
    public async getBody(): Promise<string> {
        const connection = await this.connectionProvider.getJsForceConnection();
        const body = await connection.request<string>(`/sobjects/ApexLog/${this.entry.id}/Body`);
        return body;
    }
}