import * as vscode from 'vscode';
import SfdxUtil, { SalesforceOrgInfo } from 'lib/util/sfdx';
import { CommandBase } from './commandBase';

type SelectOrgQuickPickItem = vscode.QuickPickItem & { orgInfo?: SalesforceOrgInfo; instanceUrl?: string };

export default class SelectOrgCommand extends CommandBase {

    private readonly newOrgOption : SelectOrgQuickPickItem = {
        label: '$(key) Authorize new org',
        description: 'You will be prompted for the login url'
    };

    private readonly salesforceOrgTypes : SelectOrgQuickPickItem[] = [{
        label: '$(microscope) Sandbox',
        description: 'https://test.salesforce.com',
        instanceUrl: 'https://test.salesforce.com'
    }, {
        label: '$(device-desktop) Production',
        description: 'https://login.salesforce.com',
        instanceUrl: 'https://login.salesforce.com'
    }, {
        label: '$(settings) Other',
        description: 'Provide a custom instance URL'
    }];

    private readonly salesforceUrlValidator = (url?: string) : string => {
        const urlRegex = /(^http(s){0,1}:\/\/[^/]+\.[a-z]+(:[0-9]+|)$)|(^\s*$)/i;
        if (!urlRegex.test(url)) {
            return 'Please specify a valid domain URL starting with https or http';
        }
    };

    public validate() : void {
        const validationMessage = this.vlocode.validateWorkspaceFolder();
        if (validationMessage) {
            throw validationMessage;
        }
    }

    protected async getAuthorizedOrgs() : Promise<SelectOrgQuickPickItem[]> {
        const orgList = await SfdxUtil.getAllKnownOrgDetails();
        return orgList.map(orgInfo => ({ label: orgInfo.alias || orgInfo.username, description: orgInfo.instanceUrl, orgInfo }));
    }

    public async execute() : Promise<void> {
        const knownOrgs = await this.vlocode.withStatusBarProgress('Loading SFDX org details...', this.getAuthorizedOrgs());
        const selectedOrg = await vscode.window.showQuickPick([this.newOrgOption].concat(knownOrgs),
            { placeHolder: 'Select an existing Salesforce org -or- authorize a new one' });

        if (!selectedOrg) {
            return;
        }

        const selectedOrgInfo = selectedOrg.orgInfo || await this.authorizeNewOrg();

        if (selectedOrgInfo) {
            this.logger.log(`Set ${selectedOrgInfo.username} as target org for Vlocity deploy/refresh operations`);
            if (this.vlocode.config.sfdxUsername != selectedOrgInfo.username) {
                this.vlocode.config.sfdxUsername = selectedOrgInfo.username;
            } else {
                await this.vlocode.initialize();
            }
        }
    }

    protected async authorizeNewOrg() : Promise<SalesforceOrgInfo | undefined> {
        const newOrgType = await vscode.window.showQuickPick(this.salesforceOrgTypes,
            { placeHolder: 'Select the type of org you want to authorize' });

        if (!newOrgType) {
            return;
        }

        const instanceUrl = newOrgType.instanceUrl || await vscode.window.showInputBox({
            placeHolder: 'Enter the login URL of the instance the org lives on',
            validateInput: this.salesforceUrlValidator
        });

        if (!instanceUrl) {
            return;
        }

        this.logger.log(`Opening '${instanceUrl}' in a new browser window`);
        const authInfo = await this.vlocode.withActivity({
            location: vscode.ProgressLocation.Window,
            progressTitle: 'Authorizing new org...',
            cancellable: false
        }, async () => {
            const loginResult = await SfdxUtil.webLogin({ instanceUrl });
            if (loginResult && loginResult.accessToken) {
                return loginResult;
            }
        });

        if (authInfo) {
            const successMessage = `Successfully authorized ${authInfo.username}, you can now close the browser`;
            this.logger.log(successMessage);
            void vscode.window.showInformationMessage(successMessage);
            return authInfo;
        }

        this.logger.error(`Unable to authorize at '${instanceUrl}'`);
        void vscode.window.showErrorMessage('Failed to authorize with Salesforce, please verify you are connected to the internet');
        return;
    }
}


