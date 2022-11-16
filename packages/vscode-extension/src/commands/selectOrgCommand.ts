import * as vscode from 'vscode';
import { SalesforceOrgInfo, sfdx } from '@vlocode/util';
import { CommandBase } from '../lib/commandBase';
import { vscodeCommand } from '@root/lib/commandRouter';
import { VlocodeCommand } from '@root/constants';
import chalk = require('chalk');

type SelectOrgQuickPickItem = vscode.QuickPickItem & { orgInfo?: SalesforceOrgInfo; instanceUrl?: string };

@vscodeCommand(VlocodeCommand.selectOrg)
export default class SelectOrgCommand extends CommandBase {

    private readonly newOrgOption : SelectOrgQuickPickItem = {
        label: '$(key) Authorize new org',
        description: 'You will be prompted for the login url'
    };

    private readonly refreshTokensOption : SelectOrgQuickPickItem = {
        label: '$(refresh) Refresh OAuth tokens',
        description: 'Refresh the Access and Refresh tokens if expired'
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

    private readonly salesforceUrlValidator = (url?: string) : string | undefined => {
        const urlRegex = /(^http(s){0,1}:\/\/[^/]+\.[a-z]+(:[0-9]+|)$)|(^\s*$)/i;
        if (url && !urlRegex.test(url)) {
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
        const orgList = await sfdx.getAllKnownOrgDetails();
        return orgList.map(orgInfo => ({ label: orgInfo.alias ? `${orgInfo.alias} - ${orgInfo.username}` : orgInfo.username, description: orgInfo.instanceUrl, orgInfo }));
    }

    public async execute() : Promise<void> {
        const knownOrgs = await this.vlocode.withStatusBarProgress('Loading SFDX org details...', this.getAuthorizedOrgs());
        const selectedOrg = await vscode.window.showQuickPick([this.newOrgOption, this.refreshTokensOption].concat(knownOrgs),
            { placeHolder: 'Select an existing Salesforce org -or- authorize a new one' });

        if (!selectedOrg) {
            return;
        }

        if (selectedOrg === this.refreshTokensOption) {
            await this.vlocode.refreshOAuthTokens();
        } else {
            const selectedOrgInfo = selectedOrg.orgInfo || await this.authorizeNewOrg();
            chalk
            if (selectedOrgInfo) {
                this.logger.log(`Connecting to: ${selectedOrgInfo.username}...`);
                if (this.vlocode.config.sfdxUsername != selectedOrgInfo.username) {
                    this.vlocode.config.sfdxUsername = selectedOrgInfo.username;
                } else {
                    await this.vlocode.initialize();
                }
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

        const alias = await vscode.window.showInputBox({
            placeHolder: 'Enter an org alias or use the default alias (Press \'Enter\' to confirm or \'Escape\' to cancel)'
        });

        this.logger.log(`Opening '${instanceUrl}' in a new browser window`);
        const authInfo = await this.vlocode.withActivity({
            location: vscode.ProgressLocation.Notification,
            progressTitle: 'Opening browser to authorize new org...',
            cancellable: true
        }, async (_, token) => {
            const loginResult = await sfdx.webLogin({ instanceUrl }, token);
            if (loginResult && loginResult.accessToken) {
                return loginResult;
            }
        });

        if (authInfo) {
            if (alias) {
                await sfdx.updateAlias(alias, authInfo.username);
            }
            const successMessage = `Successfully authorized ${authInfo.username}, you can now close the browser`;
            this.logger.log(successMessage);
            void vscode.window.showInformationMessage(successMessage);
            return authInfo;
        }

        this.logger.error(`Unable to authorize at '${instanceUrl}'`);
        void vscode.window.showErrorMessage('Failed to authorize new org, see the log for more details');
        return;
    }
}


