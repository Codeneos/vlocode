import { Connection } from 'jsforce';
import { cache, sfdx } from '@vlocode/util';
import { SalesforceConnectionProvider } from './salesforceConnectionProvider';
import { JsForceConnectionProvider } from './jsFroceConnectionProvider';

export { Connection };

export class SfdxConnectionProvider extends SalesforceConnectionProvider {

    private jsforceProvider: JsForceConnectionProvider;
    private version?: string;

    constructor(private readonly usernameOrAlias: string, version: string | undefined) {
        super();
        this.version = version && this.normalizeVersion(version);
    }

    public async getJsForceConnection(): Promise<Connection> {
        if (!this.jsforceProvider) {
            await this.initConnectionProvider();
        }
        return this.jsforceProvider.getJsForceConnection();
    }

    private async initConnectionProvider() {
        const orgDetails = await sfdx.getOrgDetails(this.usernameOrAlias);
        if (!orgDetails) {
            throw new Error(`No SFDX credentials found for alias or user: ${this.usernameOrAlias}`)
        }

        this.jsforceProvider = new JsForceConnectionProvider(orgDetails);
        if (this.version) {
            this.jsforceProvider.setApiVersion(this.version);
        }        
    }

    @cache({ unwrapPromise: true })
    public async isProductionOrg() : Promise<boolean> {
        if (!this.jsforceProvider) {
            await this.initConnectionProvider();
        }
        return this.jsforceProvider.isProductionOrg();
    }

    public getApiVersion() : string {
        return this.jsforceProvider?.getApiVersion() ?? this.version;
    }

    public setApiVersion(version: string) {
        this.version = this.normalizeVersion(version);
        if (this.jsforceProvider) {
            this.jsforceProvider.setApiVersion(this.version);
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
        return `${version}.0`;
    }
}