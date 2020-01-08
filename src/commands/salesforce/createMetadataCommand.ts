import * as vscode from 'vscode';
import * as path from 'path';
import MetadataCommand from './metadataCommand';
import { formatString } from '@util';
import * as fs from 'fs-extra';

type NewItemInputType = {
     type: string;
} & ({
    type: 'text';
    placeholder?: string;
    prompt?: string;
} | {
    type: 'select';
    placeholder?: string;
    prompt?: string;
    options: { label: string, value?: any }[];
});

type NewItemQuickPickItem = vscode.QuickPickItem & { 
    successNotification?: string;
    files: {
        path: string,
        template: string
    }[];
    input: { 
        [key: string]: NewItemInputType 
    };
};

/**
 * Command for handling deletion of Metadata components in Salesforce
 */
export default class CreateMetadataCommand extends MetadataCommand {

    private readonly itemTemplates : NewItemQuickPickItem[] = require('newItemTemplates.yaml');

    constructor(name : string) {
        super(name, _ => this.createMetadata());
    }

    protected async createMetadata() : Promise<any> {
        const newItemType = await vscode.window.showQuickPick(this.itemTemplates,
            { placeHolder: 'Select the type of file you want to create' });

        if (!newItemType) {
            return;
        }

        const contextValues = { 
            apiVersion: this.vloService.config.salesforce?.apiVersion
        };

        for (const [key, input] of Object.entries(newItemType.input ?? {})) {
            const value = await this.getUserValue(input);
            if (value === undefined) {
                return; // cancelled by user
            }
            contextValues[key] = value;
        }

        const workspaceEdit = new vscode.WorkspaceEdit();
        // Todo: correctly detect the preferred workspace folder
        const primaryWorkspace = vscode.workspace.workspaceFolders[0]?.uri.fsPath;

        for (const [index, file] of Object.entries(newItemType.files)) {
            const filePath = formatString(file.path, contextValues).trim();
            const fileBody = formatString(file.template, contextValues).trim();
            const fileUri = vscode.Uri.file(path.join(primaryWorkspace, filePath));
            
            try {
                await fs.writeFile(fileUri.fsPath, fileBody, { flag: 'wx' });
            } catch(e) {
                return vscode.window.showErrorMessage(`Unable to create the specified item; a file with the same name already exists: ${fileUri.fsPath}`);
            }

            if (index == '0') {
                const document = await vscode.workspace.openTextDocument(fileUri);
                vscode.window.showTextDocument(document);
            }
        }

        vscode.window.showInformationMessage(newItemType.successNotification || `Successfully created new item`);
    }

    protected async getUserValue(input: NewItemInputType) : Promise<any> {
        if (input.type === 'text') {
            return vscode.window.showInputBox({
                prompt: input.prompt,
                placeHolder: input.placeholder 
            });
        } 
        
        if (input.type === 'select') {
            const value = await vscode.window.showQuickPick(
                input.options,
                { placeHolder: input.placeholder }
            );

            if (!value) {
                return undefined;
            }

            return value.value || value.label;
        }

        throw new Error(`The specified input type is not supported: ${(<any>input).type}`);
    }
}