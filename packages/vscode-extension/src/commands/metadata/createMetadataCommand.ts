import * as path from 'path';
import * as vscode from 'vscode';
import { formatString, sanitizePath } from '@vlocode/util';
import * as fs from 'fs-extra';
import fg from 'fast-glob';
import itemTemplates, { NewItemTemplate } from '../../newItemTemplates.yaml';
import { container } from '@vlocode/core';
import { VlocityNamespaceService } from '@vlocode/vlocity';
import MetadataCommand from './metadataCommand';
import { vscodeCommand } from '../../lib/commandRouter';
import { VlocodeCommand } from '../../constants';

/**
 * Command for handling creation of Metadata components in Salesforce
 */
@vscodeCommand(VlocodeCommand.createApexClass, { params: [ 'apexClass' ] })
@vscodeCommand(VlocodeCommand.createLwc, { params: [ 'lwc' ] })
@vscodeCommand(VlocodeCommand.createOmniscriptLwc, { params: [ 'omniscriptLwc' ] })
export default class CreateMetadataCommand extends MetadataCommand {

    constructor(private readonly typeName?: string) {
        super();
    }

    public async execute() : Promise<void> {
        const newItemType = await this.getItemTemplate();

        if (!newItemType) {
            return;
        }

        const contextValues = {
            apiVersion: this.vlocode.config.salesforce?.apiVersion,
            vlocityNamespace: container.get(VlocityNamespaceService).getNamespace()
        };

        for (const [key, input] of Object.entries(newItemType.input ?? {})) {
            const value = await this.getUserValue(input);
            if (value === undefined) {
                return; // cancelled by user
            }
            contextValues[key] = value;
        }

        // Todo: correctly detect the preferred workspace folder
        const targetFolder = await this.getTargetFolder(newItemType);
        if (!targetFolder) {
            return;
        }

        for (const [index, file] of Object.entries(newItemType.files)) {
            const filePath = formatString(file.path, contextValues).trim();
            const fileBody = formatString(file.template, contextValues).trim();
            const fileUri = vscode.Uri.file(path.join(targetFolder, filePath));

            try {
                await fs.ensureDir(path.dirname(fileUri.fsPath));
                await fs.writeFile(fileUri.fsPath, fileBody, { flag: 'wx' });
            } catch {
                void vscode.window.showErrorMessage(`Unable to create the specified item; a file with the same name already exists: ${fileUri.fsPath}`);
            }

            if (index == '0') {
                const document = await vscode.workspace.openTextDocument(fileUri);
                void vscode.window.showTextDocument(document);
            }
        }

        void vscode.window.showInformationMessage(newItemType.successNotification || 'Successfully created new item');
    }

    protected async getItemTemplate() : Promise<NewItemTemplate | undefined> {
        if (this.typeName) {
            if (itemTemplates[this.typeName]) {
                return itemTemplates[this.typeName];
            }
            this.logger.warn(`The pre-specified template ${this.typeName} does not exist; defaulting to type selection`);
        }

        return vscode.window.showQuickPick(Object.values(itemTemplates),
            { placeHolder: 'Select the type of file you want to create' });
    }

    protected async getTargetFolder(newItemType: typeof itemTemplates[0]) : Promise<string| undefined> {
        if (!vscode.workspace.workspaceFolders) {
            const selectedFolder = await vscode.window.showOpenDialog({
                defaultUri: undefined,
                openLabel: 'Select folder',
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false
            });
            return selectedFolder?.[0]?.fsPath;
        }

        const workspaceFolders = vscode.workspace.workspaceFolders.map(ws => sanitizePath(ws.uri.fsPath, path.posix.sep));
        const patterns = workspaceFolders.map(ws => path.posix.join(ws, '**', newItemType.folderName));
        const targetFolders: string[] = await fg.glob(patterns, { onlyDirectories: true, absolute: true });

        if (targetFolders.length == 1) {
            return targetFolders[0];
        } else if (targetFolders.length) {
            const folderOptions = targetFolders.map(fullPath => ({
                label: workspaceFolders.reduce((p, ws) => p.replace(ws + path.posix.sep, ''), fullPath),
                fsPath: fullPath
            }));
            return (await vscode.window.showQuickPick(folderOptions, {
                placeHolder: `Select the folder in which to create ${newItemType.label}`,
                ignoreFocusOut: true
            }))?.fsPath;
        }
    }

    protected async getUserValue(input: typeof itemTemplates[0]['input'][0]) : Promise<any> {
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

        // @ts-ignore inputs are loaded format YAML file so a type could cause this to be hit yet TS insist
        // it can't happen based on it's view on the world
        throw new Error(`The specified input type is not supported: ${input.type}`);
    }
}