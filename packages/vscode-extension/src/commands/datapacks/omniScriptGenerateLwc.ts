import * as vscode from 'vscode';
import { join, relative } from 'path';

import { OmniScriptDefinitionGenerator, OmniScriptLwcCompiler } from '@vlocode/omniscript';
import { VlocityDatapack } from '@vlocode/vlocity';
import { container, FileSystem, FindOptions } from '@vlocode/core';
import { getErrorMessage, spreadAsync } from '@vlocode/util';
import { FlexCardDefinition, FlexCardLwcCompiler } from '@vlocode/vlocity-deploy';

import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';
import { withProgress } from '../../lib/vlocodeService';
import { DatapackCommand } from './datapackCommand';

@vscodeCommand(VlocodeCommand.omniScriptGenerateLwc, { focusLog: true })
@vscodeCommand(VlocodeCommand.cardGenerateLwc, { focusLog: true })
export default class GenerateLwcCommand extends DatapackCommand {

    public execute(...args: any[]) : Promise<void> {
        return this.executeWithSelection(args[1] || [args[0] || this.currentOpenDocument]);
    }

    private async executeWithSelection(selectedFiles: vscode.Uri[]) : Promise<void> {
        const datapacks = (await this.loadDatapacks(selectedFiles))
            .filter(datapack => datapack.datapackType === 'OmniScript' || datapack.datapackType === 'FlexCard');
        if (datapacks.length === 0) {
            throw new Error('Selected file is not a Vlocity OmniScript DataPack');
        }

        const outputFolder = await this.promptOutputPathSelection();
        if (!outputFolder) {
            throw new Error('No output folder selected');
        }

        const useStandardRuntime = await this.promptUseStandardRuntime();
        return this.generateLwc(datapacks, outputFolder, { useStandardRuntime });
    }

    private async compile(datapack: VlocityDatapack, options?: { useStandardRuntime?: boolean }) {      
        if (datapack.datapackType === 'OmniScript') {
            const definition = await container.create(OmniScriptDefinitionGenerator).getScriptDefinitionFromDatapack(datapack);
            return container.create(OmniScriptLwcCompiler).compile(definition, options);
        }
        if (datapack.datapackType === 'FlexCard') {
            const definition = FlexCardDefinition.fromDatapack(datapack);
            return container.create(FlexCardLwcCompiler).compile(definition, options);
        }
        throw new Error(`Unsupported datapack type: ${datapack.datapackType}`);
    }

    @withProgress({ location: vscode.ProgressLocation.Notification, title: 'Generating LWC components...' })
    private async generateLwc(datapacks: VlocityDatapack[], outputFolder: string, options?: { useStandardRuntime?: boolean }) : Promise<void> {
        const jsMetaFiles: string[] = [];
        const fs = container.get(FileSystem);
        const result: { datapack: string, file: string }[] = [];

        for (const datapack of datapacks) {
            try {
                this.logger.info(`Generating LWC: ${datapack.key}`);
                const components = await this.compile(datapack, options);
                for (const resource of components.resources) {
                    // write the file to disk
                    const outputFilePath = join(outputFolder, resource.name);                    
                    this.logger.debug(`Write ${relative(outputFolder, outputFilePath)}`);
                    await fs.outputFile(outputFilePath, resource.source);
                    
                    // Store the path to the js-meta.xml file for opening
                    if (resource.name.endsWith('.js-meta.xml')) {
                        jsMetaFiles.push(outputFilePath);
                    }
                    result.push({ datapack: datapack.key, file: outputFilePath });
                }
            } catch (error) {
                this.logger.error(`Datapack LWC generation failed:`, error.stack);                
                result.push({ datapack: datapack.key, file: `ERROR ${getErrorMessage(error)}` });
            }            
        }

        if (jsMetaFiles.length === 0) {
            throw new Error('No LWC components generated');
        }

        if (jsMetaFiles.length === 1) {
            void vscode.window.showTextDocument(
                await vscode.workspace.openTextDocument(vscode.Uri.file(jsMetaFiles[0])),
                {
                    preview: true,
                    preserveFocus: false,
                    viewColumn: vscode.ViewColumn.Active
                }
            );
        }

        this.outputTable(result, { focus: true });
    }

    private async promptOutputPathSelection() : Promise<string | undefined> {
        const cwd = vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath);
        const options: FindOptions = { cwd, findType: 'directory', exclude: ['**/node_modules/**', '.*'], limit: 10 };
        const results = (await spreadAsync(container.get(FileSystem).find('**/lwc/', options)));
        
        if (results.length === 0) {
            return cwd?.[0] ?? '.';
        } 

        let selectedFolder: string | undefined;        
        if (results.length === 1) {
            selectedFolder =  results[0];
        } else {
            selectedFolder = await vscode.window.showQuickPick(results, {
                placeHolder: 'Select the folder to save the generated LWC components to...'
            });
        }

        return selectedFolder && selectedFolder.split(/[/\\]+/ig).slice(0,-1).join('/');
    }
}