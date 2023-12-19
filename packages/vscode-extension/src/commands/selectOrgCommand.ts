import * as vscode from 'vscode';
import { SalesforceAuthResult, SalesforceOrgInfo, sfdx } from '@vlocode/util';
import { CommandBase } from '../lib/commandBase';
import { vscodeCommand } from '../lib/commandRouter';
import { VlocodeCommand } from '../constants';

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

    private readonly authFlows = [{
        label: '$(key) Web Login Flow',
        description: 'default',
        type: 'web',
        detail: 'You will be redirected to Salesforce to login and authorize the org.'
    }, {
        label: '$(shield) Device Login Flow',
        type: 'device',
        detail: 'A device code will be generated that can be used to authorize the org manually from the browser.'
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

    private async getAuthorizedOrgs() : Promise<SelectOrgQuickPickItem[]> {
        const orgList = await sfdx.getAllKnownOrgDetails();
        return orgList.map(orgInfo => ({
            label: this.getOrgLabel(orgInfo),
            description: this.getOrgDescription(orgInfo),
            orgInfo
        }));
    }

    private getOrgDescription(org: SalesforceOrgInfo) {
        return `${org.orgName} (${org.orgId})`;
    }

    private getOrgLabel(org: SalesforceOrgInfo) {
        const prefix = !org.refreshToken ? '$(warning) ' : '';
        if (org.aliases?.length) {
            const aliases = [...org.aliases].sort().join(', ');
            return `${prefix}${aliases} - ${org.username}`;
        }
        return `${prefix}${org.username}`;
    }

    public async execute() : Promise<void> {
        const selectionOptions = [
            this.newOrgOption,
            this.refreshTokensOption
        ];

        const knownOrgs = await this.vlocode.withStatusBarProgress('Loading SFDX org details...', this.getAuthorizedOrgs());
        if (knownOrgs.length) {
            selectionOptions.push({ label: '', kind: -1 }, ...knownOrgs)
        }

        const selectedOrg = await vscode.window.showQuickPick(selectionOptions,
            { placeHolder: 'Select an existing Salesforce org -or- authorize a new one' });

        if (!selectedOrg) {
            return;
        }

        if (selectedOrg === this.refreshTokensOption) {
            await this.vlocode.refreshOAuthTokens();
        } else {
            const selectedOrgInfo = selectedOrg.orgInfo || await this.authorizeNewOrg();    
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

    protected async authorizeNewOrg() : Promise<SalesforceAuthResult | undefined> {
        const flowType = await vscode.window.showQuickPick(this.authFlows,
            { placeHolder: 'Select the authorization flows you want use' });

        if (!flowType) {
            return;
        }

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

        if (flowType.type === 'web') {
            return this.authorizeWebLogin({ instanceUrl, alias });
        } else {
            return this.authorizeDeviceLogin({ instanceUrl, alias });
        }
    }

    protected async authorizeDeviceLogin(options: { instanceUrl: string, alias?: string }) : Promise<SalesforceAuthResult | undefined> {
        const authInfo = await this.vlocode.withActivity({
            location: vscode.ProgressLocation.Notification,
            progressTitle: 'Salesforce Device Login',
            cancellable: true
        }, async (progress, token) => {
            // Request Code and URL 
            progress.report({ message: 'Requesting device login...' });
            const deviceLogin = await sfdx.deviceLogin(options);
            if (token?.isCancellationRequested) {
                return;
            }

            // Show user code and verification URL adn ask
            // the user to open the verification URL or just copy the code
            this.logger.log(`Enter user code [${deviceLogin.userCode}] (without brackets) to confirm login at: ${deviceLogin.verificationUrl}`);
            progress.report({ message: `Waiting for approval of user code: ${deviceLogin.userCode}` });

            const action = await vscode.window.showInformationMessage(
                `Open verrification URL?`,
                {
                    modal: true,
                    detail: `Click 'Open in Browser' to open the verification URL in your browser or 'Copy Code' ` +
                        `to copy the code to your clipboard and open the URL manually.\n\nVerification URL: ${
                            deviceLogin.verificationUrl}\nUser Code: ${deviceLogin.userCode}`
                },
                { title: 'Open in Browser', code: 'open' },
                { title: 'Copy Code', code: 'copy' },
                { title: 'Copy URL', code: 'copy_url' },
                { title: 'Cancel', code: 'cancel', isCloseAffordance: true }
            );

            if (token?.isCancellationRequested || !action || action?.code === 'cancel') {
                return;
            }

            if (action?.code === 'copy') {
                vscode.env.clipboard.writeText(deviceLogin.userCode);
            } else if (action?.code === 'copy_url') {
                vscode.env.clipboard.writeText(deviceLogin.verificationUrlWithCode || deviceLogin.verificationUrl);
            }

            progress.report({ message: 'Waiting for device approval...' });
            return await deviceLogin.awaitDeviceApproval({
                openVerificationUrl: action.code === 'open'
            }, token);
        });

        return this.processAuthinfo(authInfo, options);
    }

    protected async authorizeWebLogin(options: { instanceUrl: string, alias?: string }) : Promise<SalesforceAuthResult | undefined> {
        this.logger.log(`Opening '${options.instanceUrl}' in a new browser window`);
        const authInfo = await this.vlocode.withActivity({
            location: vscode.ProgressLocation.Notification,
            progressTitle: 'Opening browser to authorize new org...',
            cancellable: true
        }, async (_, token) => {
            return await sfdx.webLogin(options, token);
        });

        return this.processAuthinfo(authInfo, options);
    }

    private async processAuthinfo(authInfo: SalesforceAuthResult | undefined, options: { instanceUrl: string, alias?: string }): Promise<SalesforceAuthResult | undefined>{
        if (!authInfo || !authInfo.accessToken) {
            this.logger.error(`Unable to authorize at '${options.instanceUrl}'`);
            void vscode.window.showErrorMessage('Failed to authorize new org, see the log for more details');
            return;
        }
        const successMessage = `Successfully authorized ${authInfo.username}, you can now close the browser`;
        this.logger.log(successMessage);
        void vscode.window.showInformationMessage(successMessage);
        return authInfo;
    }
}


