import * as vscode from 'vscode';
import * as sfdx from 'sfdx-node';
import { CommandBase } from './commandBase';

export default class SelectOrgCommand extends CommandBase {

    private readonly newOrgOption : (vscode.QuickPickItem & sfdx.SalesforceOrgDetails) = { 
        label: 'Authorize new org',
        description: 'You will be prompted for the login url'
    };

    private readonly salesforceOrgTypes : (vscode.QuickPickItem & { instanceUrl?: string })[] = [{ 
        label: 'Sandbox',
        description: 'https://test.salesforce.com',
        instanceUrl: 'https://test.salesforce.com'
    }, { 
        label: 'Production',
        description: 'https://login.salesforce.com',
        instanceUrl: 'https://login.salesforce.com'
    }, { 
        label: 'Other',
        description: 'Provide a custom instance URL'
    }];

    private readonly salesforceUrlValidator = (url?: string) : string => {
        const urlRegex = /(^http(s){0,1}:\/\/[^/]+\.[a-z]+(:[0-9]+|)$)|(^\s*$)/i;
        if (!urlRegex.test(url)) {
            return 'Please specify a valid domain URL starting with https or http';
        }
    }

    constructor(name : string) {
        super(name, args => this.selectOrg());
    }

    protected async getAuthorizedOrgs() : Promise<(vscode.QuickPickItem & sfdx.SalesforceOrgDetails)[]> {
        const sfdxOrgs = await sfdx.org.list({ all: true});
        return sfdxOrgs.nonScratchOrgs.map(org => 
            Object.assign({}, org, <vscode.QuickPickItem>{ label: org.username, description: org.instanceUrl }));
    }

    protected async selectOrg() : Promise<void> {
        const knownOrgs = await this.showProgress('Loading SFDX org details...', this.getAuthorizedOrgs());
        let selectedOrg : sfdx.SalesforceOrgDetails = await vscode.window.showQuickPick([this.newOrgOption].concat(knownOrgs),
            { placeHolder: 'Select an existing Salesforce org -or- authorize a new one' });

        if (!selectedOrg) {
            return;
        }

        if (selectedOrg.connectedStatus != 'Connected') {
            selectedOrg = await this.authorizeNewOrg();
        }

        if (selectedOrg) {
            this.logger.log(`Set ${selectedOrg.username} as target org for Vlocity deploy/refresh operations`);
            this.vloService.config.sfdxUsername = selectedOrg.username;
            this.vloService.config.password = undefined;
            this.vloService.config.username = undefined;
            this.vloService.config.instanceUrl = undefined;
            this.vloService.config.loginUrl = undefined;
        }
    }

    protected async authorizeNewOrg() : Promise<sfdx.SalesforceOrgDetails> {        
        let newOrgType = await vscode.window.showQuickPick(this.salesforceOrgTypes,
            { placeHolder: 'Select the type of org you want to authorize' });
        
        if (!newOrgType) {
            return;
        }

        var instanceUrl = newOrgType.instanceUrl;
        if (!instanceUrl) {
            instanceUrl = await vscode.window.showInputBox({ 
                placeHolder: 'Enter the login URL of the instance the org lives on',
                validateInput: this.salesforceUrlValidator
            });
        } 

        if (!instanceUrl) {
            return;
        }

        this.logger.log(`Opening '${instanceUrl}' in a new browser window`);
        let loginTask =  () => sfdx.auth.webLogin({ instanceurl: instanceUrl });
        let loginResult = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Authorizing new org...', 
            cancellable: true
        }, loginTask);

        if (loginResult && loginResult.accessToken) {
            let successMessage = `Successfully authorized ${loginResult.username}, you can now close the browser`;
            this.logger.log(successMessage);
            vscode.window.showInformationMessage(successMessage);
            return loginResult;
        }

        this.logger.error(`Unable to authorize at '${instanceUrl}': `, loginResult);
        vscode.window.showErrorMessage('Failed to authorize with Salesforce, please verrify you are connected to the internet');
        return null;
    }
}


