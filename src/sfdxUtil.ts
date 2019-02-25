import * as vscode from 'vscode';
import * as sfdx from 'sfdx-node';
import { LogManager, Logger } from 'loggers';

export default class SfdxUtil {

    public static async getDefaultUsername(includeScratchOrgs = true) : Promise<String> {
        return (await SfdxUtil.getDefaultOrg(includeScratchOrgs)).username;
    }

    public static async getDefaultOrg(includeScratchOrgs = true) : Promise<sfdx.SalesforceOrgDetails> {
        let result = await sfdx.org.list();
        let orgList : sfdx.SalesforceOrgDetails[] = [].concat(...result.nonScratchOrgs, ...(includeScratchOrgs ? result.scratchOrgs : []));
        let defaultOrg = orgList.find(org => !!org.isDefaultUsername);
        SfdxUtil.logger.verbose(`Found ${orgList.length} orgs; default username ${defaultOrg ? defaultOrg.username : 'none'}`);
        return defaultOrg;
    }

    public static async getConnectedOrgDetails(username: string, includeScratchOrgs = true) : Promise<sfdx.SalesforceOrgDetails> {
        let result = await sfdx.org.list();
        let orgList : sfdx.SalesforceOrgDetails[] = [].concat(...result.nonScratchOrgs, ...(includeScratchOrgs ? result.scratchOrgs : []));
        let orgDetails = orgList.find(org => org.username == username || (org.alias && org.alias == username));
        return orgDetails;
    }
    
    protected static get logger() : Logger {
        return LogManager.get(SfdxUtil);
    }
}

