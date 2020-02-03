import * as jsforce from 'jsforce';
import * as path from 'path';
import * as salesforce from '@salesforce/core';
import AuthCommand = require('salesforce-alm/dist/lib/auth/authCommand');
import { LogManager, Logger } from 'logging';

export type FullSalesforceOrgDetails = {
    orgId?: string,
    accessToken?: string,
    instanceUrl?: string,
    loginUrl?: string,
    username?: string,
    clientId?: string, 
    connectedStatus?: string,
    lastUsed?: string,
    alias?: string,
    isDefaultDevHubUsername? : boolean,
    isDefaultUsername?: boolean
} & { refreshToken?: string, clientSecret?: string };

export type SalesforceAuthResult = {
    orgId: string,
    accessToken?: string,
    instanceUrl?: string,
    loginUrl?: string,
    username: string,
    clientId?: string,
    refreshToken?: string,
};

export type SalesforceOrgInfo = {
    orgId: string,
    accessToken?: string,
    instanceUrl?: string,
    loginUrl?: string,
    username: string,
    alias?: string,
    clientId?: string,
    refreshToken?: string,
};

export default class SfdxUtil {

    // public static async getDefaultUsername(includeScratchOrgs = true) : Promise<string> {
    //     return (await SfdxUtil.getDefaultOrg(includeScratchOrgs)).username;
    // }

    // public static async getDefaultOrg(includeScratchOrgs = true) : Promise<FullSalesforceOrgDetails> {
    //     const orgList = await SfdxUtil.getAllKnownOrgDetails(includeScratchOrgs);
    //     orgList.some(a => a)
    //     // const defaultOrg = orgList.find(org => !!org.isDefaultUsername);
    //     // SfdxUtil.logger.verbose(`Found ${orgList.length} orgs; default username ${defaultOrg ? defaultOrg.username : 'none'}`);
    //     // return defaultOrg;
    // }

    // public static async getConnectedOrgDetails(username: string, includeScratchOrgs = true) : Promise<sfdx.AuthInfo> {
    //     //let orgList = await SfdxUtil.getAllKnownOrgDetails(includeScratchOrgs);
    //     //let orgDetails = orgList.find(org => org.username == username || (org.alias && org.alias == username));
    //     return sfdx.AuthInfo.create( { username: username } );
    // }

    // public static async authorizeNewOrg(instanceUrl: string, alias?: string) {
    // }

    public static async webLogin(options: { instanceUrl: string, alias?: string }) : Promise<SalesforceAuthResult> {
        const command = new AuthCommand();
        const result = await command.execute({
            instanceurl: options.instanceUrl, 
            setalias: options.alias 
        });
        
        return result;
    }

    public static async getAllKnownOrgDetails(includeScratchOrgs = true) : Promise<SalesforceOrgInfo[]> {
        const configs = [];
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

    public static resolveAlias(alias?: string) : Promise<string | undefined> {
        return salesforce.Aliases.fetch(alias);
    }

    public static async getJsForceConnection(username?: string) : Promise<jsforce.Connection> {
        const org = await SfdxUtil.getOrg(username);
        const connection = org.getConnection();
        return <jsforce.Connection><any>connection;
    }
    
    protected static get logger() : Logger {
        return LogManager.get(SfdxUtil);
    }
}
