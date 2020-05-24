import * as path from 'path';
import * as jsforce from 'jsforce';
import * as salesforce from '@salesforce/core';
import AuthCommand = require('salesforce-alm/dist/lib/auth/authCommand');
import { LogManager, Logger } from 'lib/logging';

export interface SalesforceAuthResult {
    orgId: string;
    accessToken?: string;
    instanceUrl?: string;
    loginUrl?: string;
    username: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
}

export interface FullSalesforceOrgDetails extends SalesforceAuthResult {
    connectedStatus?: string;
    lastUsed?: string;
    alias?: string;
    isDefaultDevHubUsername? : boolean;
    isDefaultUsername?: boolean;
}

export interface SalesforceOrgInfo extends SalesforceAuthResult {
    alias?: string;
}

/**
 * A shim for accessing SFDX functionality
 */
export default class SfdxUtil {

    public static async webLogin(options: { instanceUrl: string; alias?: string }) : Promise<SalesforceAuthResult> {
        const command = new AuthCommand();
        const result = await command.execute({
            instanceurl: options.instanceUrl,
            setalias: options.alias
        });

        return result;
    }

    public static async getAllKnownOrgDetails() : Promise<SalesforceOrgInfo[]> {
        const configs: SalesforceOrgInfo[] = [];
        for await (const config of this.getAllValidatedConfigs()) {
            configs.push(config);
        }
        return configs;
    }

    public static async* getAllValidatedConfigs() : AsyncGenerator<SalesforceOrgInfo> {
        try {
            const authFiles = await salesforce.AuthInfo.listAllAuthFiles();
            const aliases = await salesforce.Aliases.create(salesforce.Aliases.getDefaultOptions());
            for (const authFile of authFiles) {
                const authInfo = await salesforce.AuthInfo.create( { username: path.parse(authFile).name });
                const authFields = authInfo.getFields();

                if (!authFields.orgId || !authFields.username) {
                    this.logger.warn(`Skip authfile '${authFile}'; required fields missing`);
                    continue;
                }

                yield {
                    orgId: authFields.orgId,
                    accessToken: authFields.accessToken,
                    instanceUrl: authFields.instanceUrl,
                    loginUrl: authFields.loginUrl,
                    username: authFields.username,
                    clientId: authFields.clientId,
                    refreshToken: authFields.refreshToken,
                    alias: aliases?.getKeysByValue(authFields.username)[0]
                };
            }
        } catch(err) {
            this.logger.warn(`Error while parsing SFDX authinfo: ${err.message || err}`);
        }
    }

    public static async getOrg(usernameOrAlias?: string) : Promise<salesforce.Org> {
        const username = await this.resolveAlias(usernameOrAlias) || usernameOrAlias;
        const org = await salesforce.Org.create({
            connection: await salesforce.Connection.create({
                authInfo: await salesforce.AuthInfo.create({ username })
            })
        });
        await org.refreshAuth();
        return org;
    }

    public static async resolveAlias(alias?: string) : Promise<string | undefined> {
        return alias ? salesforce.Aliases.fetch(alias) : undefined;
    }

    public static async getJsForceConnection(username?: string) : Promise<jsforce.Connection> {
        const org = await SfdxUtil.getOrg(username);
        const connection = org.getConnection() as unknown;
        return connection as jsforce.Connection;
    }

    protected static get logger() : Logger {
        return LogManager.get(SfdxUtil);
    }
}
