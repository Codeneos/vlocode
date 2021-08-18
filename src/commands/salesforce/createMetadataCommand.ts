import * as path from 'path';
import * as vscode from 'vscode';
import { formatString } from '@vlocode/util';
import * as fs from 'fs-extra';
import MetadataCommand from './metadataCommand';

type NewItemInputType = {
    type: 'text';
    placeholder?: string;
    prompt?: string;
} | {
    type: 'select';
    placeholder?: string;
    prompt?: string;
    options: { label: string; value?: any }[];
};

type NewItemQuickPickItem = vscode.QuickPickItem & {
    successNotification?: string;
    files: {
        path: string;
        template: string;
    }[];
    input: {
        [key: string]: NewItemInputType;
    };
};

/**
 * Command for handling creation of Metadata components in Salesforce
 */
export default class CreateMetadataCommand extends MetadataCommand {

    private readonly itemTemplates : { [name: string] : NewItemQuickPickItem } = require('newItemTemplates.yaml');

    constructor(private readonly typeName?: string) {
        super();
    }

    public async execute() : Promise<void> {
        const newItemType = await this.getItemTemplate();

        if (!newItemType) {
            return;
        }

        const contextValues = {
            apiVersion: this.vlocode.config.salesforce?.apiVersion
        };

        for (const [key, input] of Object.entries(newItemType.input ?? {})) {
            const value = await this.getUserValue(input);
            if (value === undefined) {
                return; // cancelled by user
            }
            contextValues[key] = value;
        }

        // Todo: correctly detect the preferred workspace folder
        const primaryWorkspace = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '.';

        for (const [index, file] of Object.entries(newItemType.files)) {
            const filePath = formatString(file.path, contextValues).trim();
            const fileBody = formatString(file.template, contextValues).trim();
            const fileUri = vscode.Uri.file(path.join(primaryWorkspace, filePath));

            try {
                await fs.ensureDir(path.dirname(fileUri.fsPath));
                await fs.writeFile(fileUri.fsPath, fileBody, { flag: 'wx' });
            } catch(e) {
                void vscode.window.showErrorMessage(`Unable to create the specified item; a file with the same name already exists: ${fileUri.fsPath}`);
            }

            if (index == '0') {
                const document = await vscode.workspace.openTextDocument(fileUri);
                void vscode.window.showTextDocument(document);
            }
        }

        void vscode.window.showInformationMessage(newItemType.successNotification || 'Successfully created new item');
    }

    protected async getItemTemplate() : Promise<NewItemQuickPickItem | undefined> {
        if (this.typeName) {
            if (this.itemTemplates[this.typeName]) {
                return this.itemTemplates[this.typeName];
            }
            this.logger.warn(`The pre-specified template ${this.typeName} does not exist; defaulting to type selection`);
        }

        return vscode.window.showQuickPick(Object.values(this.itemTemplates),
            { placeHolder: 'Select the type of file you want to create' });
    }

    protected async getUserValue(input: NewItemInputType) : Promise<any> {
        if (input.type === 'text') {
            return vscode.window.showInputBox({
                prompt: input.prompt,
                placeHolder: input.placeholder
            });
        } else if (input.type === 'select') {
            const value = await vscode.window.showQuickPick(
                input.options,
                { placeHolder: input.placeholder }
            );

            if (!value) {
                return undefined;
            }

            return value.value || value.label;
        }

        // @ts-ignore inputs are loaded froma YAML file so a type could cause this to be hit yet TS insist
        // it can't happen based on it's view on the world
        throw new Error(`The specified input type is not supported: ${input.type}`);
    }
}