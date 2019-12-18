import * as jsforce from 'jsforce';
import * as vscode from 'vscode';
import { default as sfdxUtil, FullSalesforceOrgDetails } from 'sfdxUtil';
import JsForceConnectionProvider from './jsForceConnectionProvider';
import { LogManager, Logger, LogLevel } from 'logging';


export default class SfdxConnectionProvider implements JsForceConnectionProvider {

    private connection: jsforce.Connection & { _logger?: any };
    private lastConnectionTest : number = 0;
    private readonly testInterval : number = 60 * 1000;

    constructor(
        private readonly username: string,
        private readonly maxConnectionAttempts = 4) {
    }

    public async getJsForceConnection() : Promise<jsforce.Connection> {
        for(let i = 0; i < this.maxConnectionAttempts; i++) {
            if (this.connection) {    
                if (this.lastConnectionTest + this.testInterval > Date.now()) {
                    return this.connection;
                }
                // test
                try {
                    this.logger.verbose('Obtained SFDX org details; testing connection...');
                    const accountQuery = await this.connection.query<{Id: string}>(`SELECT Id FROM Account LIMIT 1`);
                    this.logger.verbose(`Success, you are connected! (${accountQuery.records[0].Id})`);   
                    this.lastConnectionTest = Date.now();
                    return this.connection;
                } catch(e) {
                    this.logger.error(`Unable to obtain connection (try: ${i+1}): ${e}`);
                    this.connection = null;
                    this.lastConnectionTest  = null;
                }  
            }

            // create connection
            this.connection = await sfdxUtil.getJsForceConnection(this.username);
            this.connection._logger = this.createJsForceLogger(LogManager.get('jsforce.Connection'));
            this.connection.tooling._logger = this.createJsForceLogger(LogManager.get('jsforce.Tooling'));
            return this.connection;
        }
        throw Error(`Unable to obtain salesforce connection after ${this.maxConnectionAttempts} tries`);
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