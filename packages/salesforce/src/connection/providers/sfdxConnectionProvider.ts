import { cache, sfdx } from '@vlocode/util';
import { SalesforceConnectionProvider } from './salesforceConnectionProvider';
import { JsForceConnectionProvider } from './jsForceConnectionProvider';
import { LogManager } from '@vlocode/core';
import { SalesforceConnection } from '../salesforceConnection';

const refreshListenerSymbol = Symbol('tokenRefreshListenerAttached');
export class SfdxConnectionProvider extends SalesforceConnectionProvider {

    private jsforceProvider: JsForceConnectionProvider;
    private version?: string;
    private logger = LogManager.get(SfdxConnectionProvider);

    constructor(private readonly usernameOrAlias: string, version: string | undefined) {
        super();
        this.version = version && this.normalizeVersion(version);
    }

    public async getJsForceConnection(): Promise<SalesforceConnection> {
        if (!this.jsforceProvider) {
            await this.initConnectionProvider();
        }

        const conn = await this.jsforceProvider.getJsForceConnection();
        if (conn[refreshListenerSymbol] !== true) {
            conn[refreshListenerSymbol] = true;
            conn.on('refresh', (accessToken) => {
                sfdx.updateAccessToken(this.usernameOrAlias, accessToken)
                    .then(() => this.logger.verbose(`Updated SFDX access token for user ${this.usernameOrAlias}`))
                    .catch((err) => this.logger.warn(`Unable store updated SFDX access token ${this.usernameOrAlias}`, err));
            });
        }
        return conn;
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