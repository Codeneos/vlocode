import * as jsforce from 'jsforce';
import * as sfdx from 'sfdx-node';
import * as vscode from 'vscode';
import sfdxUtil from 'sfdxUtil';
import JsForceConnectionProvider from './jsForceConnectionProvider';
import { LogManager, Logger } from 'loggers';

export default class SfdxConnectionProvider implements JsForceConnectionProvider {

    constructor(
        private username: string, 
        private orgDetails? : sfdx.SalesforceOrgDetails,
        private connectionTryLimit = 10) {   
    }

    public async getJsForceConnection(connectionAttemptCounter: number = 0) : Promise<jsforce.Connection> {
        // create connection
        let details = await this.getOrgDetails(!!connectionAttemptCounter);
        let conn = new jsforce.Connection({
            instanceUrl: details.instanceUrl,
            accessToken: details.accessToken
        });

        // test
        try {     
            this.logger.info('Obtained SFDX org details; testing connection for limits...');
            let limits = await conn.limits(); 
            this.logger.info(`Successfully got limits from Salesforce; daily API limit ${limits.DailyApiRequests}`);       
        } catch(e) {
            this.logger.error(`Unable to obtain connection (try: ${connectionAttemptCounter}): ${e}`);
            if (connectionAttemptCounter > this.connectionTryLimit) {
                throw Error(`Unable to obtain salesforce connection after ${this.connectionTryLimit} tries`);
            }
            return this.getJsForceConnection(++connectionAttemptCounter);
        }
        return conn;
    }

    private async getOrgDetails(refreshCache = false) : Promise<sfdx.SalesforceOrgDetails> {
        if (!this.orgDetails || refreshCache) {
            this.orgDetails = await sfdxUtil.getConnectedOrgDetails(this.username);
        }
        return Promise.resolve(this.orgDetails);
    }

    protected get logger() : Logger {
        return LogManager.get(SfdxConnectionProvider);
    }
}