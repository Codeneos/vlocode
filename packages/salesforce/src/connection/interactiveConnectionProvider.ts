import { Connection } from 'jsforce';
import { sfdx } from '@vlocode/util';
import { JsForceConnectionProvider } from './jsForceConnectionProvider';
import { SfdxConnectionProvider } from './sfdxConnectionProvider';
import { container, injectable, Logger } from '@vlocode/core';

@injectable()
export class InteractiveConnectionProvider implements JsForceConnectionProvider {

    private sfdxProvider: JsForceConnectionProvider;
    private userName: string;
    private logger = container.get(Logger);

    constructor(private instanceUrl: string) {        
    }

    public async getJsForceConnection() : Promise<Connection> {
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