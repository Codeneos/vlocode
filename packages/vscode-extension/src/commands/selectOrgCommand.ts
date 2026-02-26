import * as vscode from 'vscode';
import { SalesforceAuthResult, SalesforceOrgInfo, sfdx } from '@vlocode/util';
import { CommandBase } from '../lib/commandBase';
import { vscodeCommand } from '../lib/commandRouter';
import { VlocodeCommand } from '../constants';
import { QuickPick } from '../lib/ui/quickPick';

type SelectOrgQuickPickItem = vscode.QuickPickItem & { orgInfo?: SalesforceOrgInfo; instanceUrl?: string };

@vscodeCommand(VlocodeCommand.selectOrg)
export default class SelectOrgCommand extends CommandBase {

    private readonly setAliasIcon = new vscode.ThemeIcon('account');
    private readonly deleteOrg = new vscode.ThemeIcon('trash');

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
        detail: 'A device code will be generated that can be used to authorize the org manually from the browser (ECA/CA required).'
    }, {
        label: '$(server-process) OAuth2 Client Credentials Flow',
        type: 'client_credentials',
        detail: 'Authenticate using OAuth2 Client Credentials flow (ECA/CA required)'
    }];

    private readonly salesforceUrlValidator = (url?: string) : string | undefined => {
        const urlRegex = /^(https?:\/\/)?(.+)\.salesforce\.com$/i;
        if (url && !urlRegex.test(url)) {
            return 'Please specify a valid domain URL, ommit the trailing slash (e.g. https://vlocode--sandbox.salesforce.com or vlocode--sandbox.salesforce.com)';
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
            orgInfo,
            buttons: [
                { iconPath: this.deleteOrg, tooltip: 'Remove Org' },
                { iconPath: this.setAliasIcon, tooltip: 'Add Alias' }
            ]
        }));
    }

    private getOrgDescription(org: SalesforceOrgInfo) {
        return `${org.orgName} (${org.orgId})`;
    }

    private getOrgLabel(org: SalesforceOrgInfo) {
        const prefix = !org.refreshToken ? '$(warning) ' : '';
        if (org.aliases?.length) {
            const aliases = [...org.aliases].sort((a, b) => a.localeCompare(b)).join(', ');
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

        const selectedOrg = await this.showOrgSelection(selectionOptions);

        if (!selectedOrg) {
            return;
        }

        if (selectedOrg === this.refreshTokensOption) {
            await this.vlocode.refreshOAuthTokens();
        } else {
            const selectedOrgInfo = selectedOrg.orgInfo || await this.authorizeNewOrg();    
            if (selectedOrgInfo) {
                await this.vlocode.setUsername(selectedOrgInfo.username);
            }
        }
    }

    protected showOrgSelection(orgs: SelectOrgQuickPickItem[]) {
        const quickPickMenu = QuickPick.create(orgs, {
            placeHolder: 'Select an existing Salesforce org -or- authorize a new one'
        });

        quickPickMenu.onTriggerItemButtom(async ({ item, button }) => {
            if (item.orgInfo && button?.iconPath == this.setAliasIcon) {
                const alias = await vscode.window.showInputBox({
                    placeHolder: `Enter an alias for ${item.orgInfo.username}`
                });
                if (alias) {
                    await sfdx.setAlias(item.orgInfo.username, alias);
                }
            } else if (item.orgInfo && button?.iconPath == this.deleteOrg) {
                const confirmation = await vscode.window.showWarningMessage(
                    `Are you sure you want to permanently delete the org configuration for ${item.orgInfo.username}?\n\n` + 
                    'You will lose the ability to connect to this org as well as any stored Access and Refresh tokens.',
                    { modal: true }, 'Yes'
                );
                if (confirmation === 'Yes') {
                    await sfdx.removeOrg(item.orgInfo.username);
                    vscode.window.showInformationMessage(`Org configuration for '${item.orgInfo.username}' removed.`); 
                }
            }
        });

        return quickPickMenu.onAccept();
    }

    protected async authorizeNewOrg() : Promise<SalesforceAuthResult | undefined> {
        const flowType = await vscode.window.showQuickPick(this.authFlows,
            { placeHolder: 'Select the authorization flows you want use' }
        );

        if (!flowType) {
            return;
        }

        const newOrgType = flowType.type === 'client_credentials' || await vscode.window.showQuickPick(this.salesforceOrgTypes,
            { placeHolder: 'Select the type of org you want to authorize' }
        );

        if (!newOrgType) {
            return;
        }

        const instanceUrl = newOrgType !== true ? newOrgType.instanceUrl : await this.promptInstanceUrl();
        if (!instanceUrl) {
            return;
        }

        const alias = await vscode.window.showInputBox({
            placeHolder: 'Enter an org alias or use the default alias',
            ignoreFocusOut: true
        });

        if (flowType.type === 'web') {
            return this.authorizeWebLogin({ instanceUrl, alias });
        } else if (flowType.type === 'client_credentials') {
            return this.authorizeClientCredentialsLogin({ instanceUrl, alias });
        } else {
            return this.authorizeDeviceLogin({ instanceUrl, alias });
        }
    }

    private async promptInstanceUrl() : Promise<string | undefined> {
        const instanceUrl = await vscode.window.showInputBox({
            placeHolder: 'Enter the Salesforce instance URL (e.g. vlocode--sandbox.salesforce.com or vlcode.my.salesforce.com)',
            validateInput: this.salesforceUrlValidator,
            ignoreFocusOut: true
        });

        if (!instanceUrl) {
            return;
        }

        return instanceUrl.startsWith('http') ? instanceUrl : `https://${instanceUrl}`;
    }

    protected async authorizeClientCredentialsLogin(options: { instanceUrl: string, alias?: string }) : Promise<SalesforceAuthResult | undefined> {
        const clientId = await vscode.window.showInputBox({
            placeHolder: 'Enter the Client Id (Consumer Key) of the  External Client/Connected App',
            ignoreFocusOut: true
        });
        if (!clientId) {
            return;
        }

        const clientSecret = await vscode.window.showInputBox({
            placeHolder: 'Enter the Client Secret (Consumer Secret) of the External Client/Connected App',
            ignoreFocusOut: true
        });
        if (!clientSecret) {
            return;
        }

        // Request Access token and refresh token using the client credentials flow
        const authInfo = await this.vlocode.withActivity({
            location: vscode.ProgressLocation.Notification,
            progressTitle: 'Authorizing org using OAuth2 Client Credentials flow',
            cancellable: false
        }, sfdx.clientCredentialsLogin({ ...options, clientId, clientSecret }));

        return this.processAuthinfo(authInfo, options);
    }

    protected async authorizeDeviceLogin(options: { instanceUrl: string, alias?: string }) : Promise<SalesforceAuthResult | undefined> {
        const clientId = await vscode.window.showInputBox({
            placeHolder: 'Enter the ClientId (Consumer Key) of the ECA/CA to use for authorization (Press \'Enter\' to confirm or \'Escape\' to cancel)',
            ignoreFocusOut: true
        });

        if (!clientId) {
            return;
        }

        const authInfo = await this.vlocode.withActivity({
            location: vscode.ProgressLocation.Notification,
            progressTitle: 'Salesforce Device Login',
            cancellable: true
        }, async (progress, token) => {
            // Request Code and URL 
            progress.report({ message: 'Requesting device login...' });
            const deviceLogin = await sfdx.deviceLogin({ ...options, clientId });
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
            return deviceLogin.awaitDeviceApproval({
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
        }, (_, token) => sfdx.webLogin(options, token));
        return this.processAuthinfo(authInfo, options);
    }

    private async processAuthinfo(authInfo: SalesforceAuthResult | undefined, options: { instanceUrl: string, alias?: string }): Promise<SalesforceAuthResult | undefined>{
        if (!authInfo || !authInfo.accessToken) {
            this.logger.error(`Unable to authorize at '${options.instanceUrl}'`);
            void vscode.window.showErrorMessage('Failed to authorize new org, see the log for more details');
            return;
        }
        if (options.alias) {
            await sfdx.setAlias(authInfo.username, options.alias);
        }
        const successMessage = `Successfully authorized ${authInfo.username}, you can now close the browser`;
        this.logger.log(successMessage);
        void vscode.window.showInformationMessage(successMessage);
        return authInfo;
    }
}


