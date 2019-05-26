import * as jsforce from 'jsforce';
import * as sfdx from '@salesforce/core';
import { LogManager, Logger } from 'loggers';
import Org from 'salesforce-alm/dist/lib/core/scratchOrgApi';

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

export default class SfdxUtil {

    public static async getDefaultUsername(includeScratchOrgs = true) : Promise<string> {
        return (await SfdxUtil.getDefaultOrg(includeScratchOrgs)).username;
    }

    public static async getDefaultOrg(includeScratchOrgs = true) : Promise<FullSalesforceOrgDetails> {
        const orgList = await SfdxUtil.getAllKnownOrgDetails(includeScratchOrgs);
        const defaultOrg = orgList.find(org => !!org.isDefaultUsername);
        SfdxUtil.logger.verbose(`Found ${orgList.length} orgs; default username ${defaultOrg ? defaultOrg.username : 'none'}`);
        return defaultOrg;
    }

    public static async getConnectedOrgDetails(username: string, includeScratchOrgs = true) : Promise<FullSalesforceOrgDetails> {
        let orgList = await SfdxUtil.getAllKnownOrgDetails(includeScratchOrgs);
        let orgDetails = orgList.find(org => org.username == username || (org.alias && org.alias == username));
        return orgDetails;
    }

    // public static async authorizeNewOrg(instanceUrl: string, alias?: string) {
    // }

    public static async getAllKnownOrgDetails(includeScratchOrgs = true) : Promise<Array<FullSalesforceOrgDetails>> {
        const configs = await SfdxUtil.getAllValidatedConfigs();
        return [ ...configs.scratchOrgs.values(), ...includeScratchOrgs ? configs.nonScratchOrgs.values() : []];
    }

    public static async getAllValidatedConfigs() : Promise<{
        scratchOrgs: Map<string, FullSalesforceOrgDetails>,
        nonScratchOrgs: Map<string, FullSalesforceOrgDetails>,
        devHubs: Map<string, FullSalesforceOrgDetails>
    }> {
        const userDataFiles = await Org.readAllUserFilenames();
        const locallyValidatedConfigs = await Org.readLocallyValidatedMetaConfigsGroupedByOrgType(userDataFiles, 10, null);
        return locallyValidatedConfigs;
    }

    public static async getOrg(username?: string) : Promise<sfdx.Org> {
        const org = await sfdx.Org.create({
            connection: await sfdx.Connection.create({
                authInfo: await sfdx.AuthInfo.create({ username })
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
