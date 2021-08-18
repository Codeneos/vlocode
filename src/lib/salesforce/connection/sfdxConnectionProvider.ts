import * as jsforce from 'jsforce';
import { sfdx } from '@vlocode/util';
import { LogManager, Logger, LogLevel } from '@vlocode/core';
import JsForceConnectionProvider from './jsForceConnectionProvider';

interface PooledJsforceConnection extends jsforce.Connection {
    _logger?: any;
    _lastTested: number;
}

export default class SfdxConnectionProvider implements JsForceConnectionProvider {

    private connection: PooledJsforceConnection;
    private readonly testInterval : number = 60 * 1000;

    constructor(private readonly username: string) {
    }

    public async getJsForceConnection() : Promise<jsforce.Connection> {
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
        connection._logger = this.createJsForceLogger(LogManager.get('jsforce.Connection'));
        connection.tooling._logger = this.createJsForceLogger(LogManager.get('jsforce.Tooling'));
        connection._lastTested = Date.now();
        return connection;
    }

    private async testConnection(connection: jsforce.Connection) {
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
}