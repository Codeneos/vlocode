import * as vscode from 'vscode';
import { AuthInfo } from '@salesforce/core';
import { CommandBase } from '../commandBase';
import SfdxUtil from 'sfdxUtil';

type ApiVersionQuickPickItem = vscode.QuickPickItem & { version?: string };

export default class SelectApiVersion extends CommandBase {

    private readonly apiVersions : ApiVersionQuickPickItem[] = [
        { label: 'Salesforce API Version 47.0', version: '47.0' },
        { label: 'Salesforce API Version 46.0', version: '46.0' },
        { label: 'Salesforce API Version 45.0', version: '45.0' },
        { label: 'Salesforce API Version 44.0', version: '44.0' },
        { label: 'Salesforce API Version 43.0', version: '43.0' },
        { label: `Enter version manually` }
    ];

    constructor(name : string) {
        super(name, _ => this.selectVersion());
    }

    protected async selectVersion() : Promise<void> {
        const currentApiVersion = this.vloService.config.salesforce.apiVersion;
        const versionOptions = this.apiVersions.map(o => {
            if (o.version == currentApiVersion) {
                return {...o, label: `$(primitive-dot) ${o.label}` };
            }
            return o;
        });
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
}


