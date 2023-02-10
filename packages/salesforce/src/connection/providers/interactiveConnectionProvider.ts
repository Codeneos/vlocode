import { sfdx } from '@vlocode/util';
import { SalesforceConnectionProvider } from './salesforceConnectionProvider';
import { SfdxConnectionProvider } from './sfdxConnectionProvider';
import { injectable, Logger } from '@vlocode/core';
import { SalesforceConnection } from '../salesforceConnection';

@injectable()
export class InteractiveConnectionProvider implements SalesforceConnectionProvider {

    private sfdxProvider: SalesforceConnectionProvider;
    private userName: string;
    @injectable.property private logger!: Logger;

    constructor(private instanceUrl: string) {        
    }

    public async getJsForceConnection() : Promise<SalesforceConnection> {
        if (this.sfdxProvider === undefined) {
            await this.initialize();
        }        
        return this.sfdxProvider.getJsForceConnection();           
    }

    public async initialize(apiVersion?: string) {
        this.logger.log('Prompt for Salesforce login through OAuth...');

        const loginResult = await sfdx.webLogin({ instanceUrl: this.instanceUrl });
        if (!loginResult?.username) {
            throw new Error('Initialization of Salesforce connection failed!');
        }
        
        this.userName = loginResult.username;
        this.sfdxProvider = new SfdxConnectionProvider(this.userName, apiVersion);  
        this.logger.log(`Connected as ${this.userName}`);

        return this;
    }

    public isProductionOrg() {
        return this.sfdxProvider?.isProductionOrg();
    }

    public getApiVersion() {
        return this.sfdxProvider?.getApiVersion();
    }
}