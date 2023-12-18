import * as vscode from 'vscode';
import { join, relative } from 'path';

import { OmniScriptDefinitionGenerator, OmniScriptLwcCompiler } from '@vlocode/omniscript';
import { VlocityDatapack } from '@vlocode/vlocity';
import { container, FileSystem, FindOptions } from '@vlocode/core';
import { spreadAsync } from '@vlocode/util';
import { SalesforcePackage } from '@vlocode/salesforce';

import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';
import { withProgress } from '../../lib/vlocodeService';
import { DatapackCommand } from './datapackCommand';

@vscodeCommand(VlocodeCommand.omniScriptGenerateLwc, { focusLog: true })
export default class GenerateLwcCommand extends DatapackCommand {

    public execute(...args: any[]) : Promise<void> {
        return this.executeWithSelection(args[1] || [args[0] || this.currentOpenDocument]);
    }

    private async executeWithSelection(selectedFiles: vscode.Uri[]) : Promise<void> {
        const datapacks = await this.loadDatapacks(selectedFiles);
        if (datapacks.length === 0) {
            throw new Error('Selected file is not a Vlocity OmniScript DataPack');
        }

        const notLwcEnabled = datapacks.some(datapack => !datapack.IsLwcEnabled__c);
        if (notLwcEnabled) {
            const notLwcWarningResult = await vscode.window.showWarningMessage(
                'Not all selected OmniScripts are LWC enabled. ' +
                'Generating an LWC form a non-LWC enabled OmniScript can cause the resulting component to be incomplete.',
                'Continue', 'Cancel'
            );
            if (notLwcWarningResult !== 'Continue') {
                return;
            }
        }

        const outputFolder = await this.promptOutputPathSelection();
        if (!outputFolder) {
            throw new Error('No output folder selected');
        }

        return this.generateLwc(datapacks, outputFolder);
    }

    @withProgress({ location: vscode.ProgressLocation.Notification, title: 'Generating LWC components...' })
    private async generateLwc(datapacks: VlocityDatapack[], outputFolder: string) : Promise<void> {
        const packageData = new SalesforcePackage(this.vlocode.apiVersion);

        for (const datapack of datapacks) {
            const definition = await container.create(OmniScriptDefinitionGenerator).getScriptDefinitionFromDatapack(datapack);
            const sfPackage = await container.create(OmniScriptLwcCompiler).compileToPackage(definition);
            if (sfPackage.isEmpty) {
                throw new Error('No LWC components generated');
            }

            for (const comp of sfPackage.components()) {
                this.logger.info(`Saving ${datapack.Type__c}/${datapack.SubType__c} LWC to: ${outputFolder}/lwc/${comp.componentName}`);
                for (const file of comp.files) {
                    const outputFilePath = join(outputFolder, file.packagePath);
                    this.logger.verbose(`Write LWC metadata ${relative(outputFolder, outputFilePath)} (${file.data!.length} bytes)`);
                    await container.get(FileSystem).outputFile(outputFilePath, file.data!);
                }
            }

            packageData.merge(sfPackage);
        }

        const components = packageData.components();
        if (components.length === 1) {
            const metaFile = components[0].files.find(file => file.packagePath.endsWith('.js-meta.xml'))!;
            const componentPath = join(outputFolder, metaFile.packagePath.slice(0, -'-meta.xml'.length));
            void vscode.window.showTextDocument(
                await vscode.workspace.openTextDocument(vscode.Uri.file(componentPath)),
                {
                    preview: true,
                    preserveFocus: true,
                    viewColumn: vscode.ViewColumn.Beside
                }
            );
        } else {
            void vscode.window.showInformationMessage(`Generated LWC components for ${components.length} components from ${datapacks.length} DataPacks`);
        }
    }

    private async promptOutputPathSelection() : Promise<string | undefined> {
        const cwd = vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath);
        const options: FindOptions = { cwd, findType: 'directory', exclude: ['**/node_modules/**', '.*'], limit: 10 };
        const results = (await spreadAsync(container.get(FileSystem).find('lwc', options)));

        let selectedFolder: string | undefined;
        if (results.length === 0) {
            selectedFolder = cwd?.shift() ?? '.';
        } else if (results.length === 1) {
            selectedFolder =  results[0];
        } else {
            selectedFolder = await vscode.window.showQuickPick(results, {
                placeHolder: 'Select the folder to save the generated LWC components to...'
            });
        }

        return selectedFolder ? selectedFolder.split('/').slice(0,-1).join('/') : undefined;
    }
}