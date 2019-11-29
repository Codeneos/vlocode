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

    public static async getAllKnownOrgDetails(includeScratchOrgs = true) : Promise<salesforce.AuthInfo[]> {
        const configs = await SfdxUtil.getAllValidatedConfigs();
        return configs;
    }

    public static async getAllValidatedConfigs() : Promise<salesforce.AuthInfo[]> {
        try {
            const authFiles = await salesforce.AuthInfo.listAllAuthFiles();
            return Promise.all(authFiles.map(authFile => salesforce.AuthInfo.create( { username: path.parse(authFile).name } )));
        } catch(err) {
            return [];
        }
    }

    public static async getOrg(username?: string) : Promise<salesforce.Org> {
        const org = await salesforce.Org.create({
            connection: await salesforce.Connection.create({
                authInfo: await salesforce.AuthInfo.create({ username })
            })
        });
        await org.refreshAuth();
        return org;
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
