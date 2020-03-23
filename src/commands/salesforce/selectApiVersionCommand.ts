import * as vscode from 'vscode';
import { AuthInfo } from '@salesforce/core';
import { CommandBase } from '../commandBase';
import SfdxUtil from 'sfdxUtil';
import { version } from 'punycode';

type ApiVersionQuickPickItem = vscode.QuickPickItem & { version?: string };

export default class SelectApiVersion extends CommandBase {

    public async validate() : Promise<void> {
        const validationMessage = await this.vloService.validateSalesforceConnectivity();
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
        vscode.window.showInformationMessage(`Using Salesforce API version ${newApiVersion}`);
        this.vloService.config.salesforce.apiVersion = newApiVersion;
    }

    private async getApiVersions() {
        const currentApiVersion = this.vloService.config.salesforce.apiVersion;
        const versions = (await this.vloService.salesforceService.getApiVersions(7)).map(version => ({ 
            label: (currentApiVersion == version ? `$(primitive-dot) ` : '') + `Salesforce API Version ${version}`, 
            version 
        }));
        return versions.concat({ label: `Enter version manually`, version: null });
    } 
}


