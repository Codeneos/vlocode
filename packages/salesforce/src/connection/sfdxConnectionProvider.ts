import { Connection } from 'jsforce';
import { cache, sfdx } from '@vlocode/util';
import { LogManager, Logger, LogLevel } from '@vlocode/core';
import { JsForceConnectionProvider } from './jsForceConnectionProvider';

interface PooledJsforceConnection extends Connection {
    _logger?: any;
    _lastTested: number;
}

export { Connection };

export class SfdxConnectionProvider implements JsForceConnectionProvider {

    private connection: PooledJsforceConnection;
    private version: string;
    private readonly testInterval = 60 * 1000;

    constructor(private readonly username: string, version: string) {
        this.version = this.normalizeVersion(version);
    }

    public async getJsForceConnection() : Promise<Connection> {
        if (this.connection) {
            if (Date.now() < this.connection._lastTested + this.testInterval) {
                this.connection._lastTested = Date.now();
                return this.connection;
            }
            if (await this.testConnection(this.connection)) {
                return this.connection;
            }
        }

        // create new connection
        this.connection = await this.createConnection();
        return this.connection;
    }

    private async createConnection() {
        const connection = await sfdx.getJsForceConnection(this.username) as PooledJsforceConnection;
        connection._logger = this.createJsForceLogger(LogManager.get('Connection'));
        connection.tooling._logger = this.createJsForceLogger(LogManager.get('jsforce.Tooling'));
        connection._lastTested = Date.now();
        connection.version = this.version;
        return connection;
    }

    private async testConnection(connection: Connection) {
        try {
            this.logger.verbose('Testing stored connection...');
            const userQuery = await connection.query<{Id: string}>('SELECT Id FROM User LIMIT 1');
            this.connection._lastTested = Date.now();
            this.logger.verbose(`Success, you are connected! (${userQuery.records[0].Id})`);
            return true;
        } catch(e) {
            this.logger.error(`Connection test failed with error: ${e}`);
        }
        return false;
    }

    protected createJsForceLogger(regularLogger : Logger) : { log(level: number, ...args : any[]): void } {
        const redirectTable = { // base on JSForce Logger.LogLevel
            1: LogLevel.debug, // "DEBUG" : 1,
            2: LogLevel.info,  // "INFO"  : 2,
            3: LogLevel.warn,  // "WARN"  : 3,
            4: LogLevel.error, // "ERROR" : 4,
            5: LogLevel.fatal  // "FATAL" : 5
        };
        regularLogger.log = (level: number, ...args : any[]) => regularLogger.write(redirectTable[level], ...args);
        return regularLogger;
    }

    protected get logger() : Logger {
        return LogManager.get(SfdxConnectionProvider);
    }    

    @cache(-1)
    public async isProductionOrg() : Promise<boolean> {
        const connection = await this.getJsForceConnection();
        const results = await connection.query<{IsSandbox: boolean}>('SELECT IsSandbox FROM Organization');
        return results.records[0].IsSandbox as boolean;
    }

    public getApiVersion() : string {
        return this.version;
    }

    public setApiVersion(version: string) {        
        this.version = this.normalizeVersion(version);
        if (this.connection) {
            this.connection.version = this.version;
        }
    }

    private normalizeVersion(version: string | number) {
        if (!version) {
            throw new Error('API Version cannot be empty, null or undefined');
        }
        if (typeof version === 'string') {
            if (Number.isNaN(Number(version))) {
                throw new Error(`Invalid API version: ${version}`);
            }
            version = Number(version);
        }
        if (version < 10 || version > 100) {
            throw new Error(`Invalid API version: ${version}.0`);
        }
        return `${version}.0`
    }
}