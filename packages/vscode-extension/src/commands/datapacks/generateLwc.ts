import * as vscode from 'vscode';
import { join } from 'path';

import { OmniScriptDefinitionGenerator, OmniScriptLwcCompiler } from '@vlocode/vlocity-deploy';
import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';
import { DatapackCommand } from './datapackCommand';
import { container, FileSystem, FindOptions } from '@vlocode/core';
import { spreadAsync } from '@vlocode/util';

@vscodeCommand(VlocodeCommand.generateLwc, { focusLog: true  })
export default class GenerateLwcCommand extends DatapackCommand {

    public execute(...args: any[]) : Promise<void> {
        return this.generateLwc(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async generateLwc(selectedFiles: vscode.Uri[]) : Promise<void> {
        const datapacks = await this.loadDatapacks(selectedFiles);

        for (const datapack of datapacks) {
            const definition = await container.create(OmniScriptDefinitionGenerator).getScriptDefinitionFromDatapack(datapack);
            const sfPackage = await container.create(OmniScriptLwcCompiler).compileToPackage(definition);
            const outputFolder = await this.showOutputPathSelection();
            if (!outputFolder) {
                 throw new Error('No output folder selected');
            }
            for (const comp of sfPackage.components()) {
                for (const file of comp.files) {
                    await container.get(FileSystem).outputFile(join(outputFolder, file.packagePath), file.data!);
                }
            }
        }
    }

    protected async showOutputPathSelection() : Promise<string | undefined> {
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