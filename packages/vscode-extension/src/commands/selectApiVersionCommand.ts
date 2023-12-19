import { VlocodeCommand } from '../constants';
import { CommandBase } from '../lib/commandBase';
import { vscodeCommand } from '../lib/commandRouter';
import * as vscode from 'vscode';

@vscodeCommand(VlocodeCommand.selectApiVersion)
export default class SelectApiVersionCommand extends CommandBase {

    public async validate() : Promise<void> {
        const validationMessage = await this.vlocode.validateSalesforceConnectivity();
        if (validationMessage) {
            throw validationMessage;
        }
    }

    public async execute() : Promise<void> {
        const versionOptions = await this.getApiVersions();
        const apiVersion = await vscode.window.showQuickPick(versionOptions,
            { placeHolder: 'Select the API version to use for Salesforce deployments' });

        if (!apiVersion) {
            return;
        }

        let newApiVersion = apiVersion.version;

        if (!newApiVersion) {
            newApiVersion = await vscode.window.showInputBox({
                placeHolder: 'Enter the API version number; for example: 35.0',
                validateInput: (input: string) => {
                    if (!/^\d{2,3}\.\d$/.test(input)) {
                        return 'Salesforce API versions should start wih a 2 digit number followed by a single digit minor version number which is usually 0';
                    }
                },
                ignoreFocusOut: true
            });

            if (!newApiVersion) {
                return;
            }
        }

        // Update the config and show a nice message to our user
        void vscode.window.showInformationMessage(`Using Salesforce API version ${newApiVersion}`);
        this.vlocode.updateApiVersion(newApiVersion);
    }

    private async getApiVersions() {
        const currentApiVersion = this.vlocode.config.salesforce.apiVersion;
        const versions = await this.vlocode.salesforceService.getApiVersions(7);
        if (!versions.includes(currentApiVersion)) {
            versions.push(currentApiVersion);
        }
        const mapVersion = (version: string) => ({
            label: `${currentApiVersion == version ? '$(primitive-dot) ' : ''  }Salesforce API Version ${version}`,
            version
        });
        return [ 
            ...versions.map(mapVersion), 
            { label: '', kind: -1, version: undefined },
            { label: 'Enter version manually', version: undefined } 
        ];
    }
}