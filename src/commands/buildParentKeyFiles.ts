import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';

import { DatapackCommand } from './datapackCommand';
import { getDocumentBodyAsString } from '../util';
import * as DatapackUtil from 'datapackUtil';
import { VlocityDatapack } from 'models/datapack';

export default class BuildParentKeyFilesCommand extends DatapackCommand {

    private get diagnostics() : vscode.DiagnosticCollection {
        return this.vloService.getDiagnostics('Datapack Dependencies');
    }

    constructor(name : string) {
        super(name);
    }

    public execute(...args: any[]) : Promise<void> {
       return this.buildParentKeyFiles();
    }

    protected async buildParentKeyFiles() : Promise<void> {

        const progressToken = await this.startProgress('Building parent keys');
        try {
            // Clear current warnings
            this.diagnostics.clear();

            // load all datapacks in the workspace
            progressToken.report('reading workspace...');
            const datapackHeaders = await DatapackUtil.getDatapackHeadersInWorkspace();
            const datapacks = await this.loadDatapacks(datapackHeaders, file => progressToken.report(`${path.basename(file.fsPath)}...`));

            // create parent key to datapack map
            progressToken.report('resolving keys...');
            const keyToDatapack : { [key: string] : VlocityDatapack } = datapacks.reduce((keyMap, dp) => {
                return dp.getProvidedRecordKeys().reduce((keyMap, key) => Object.assign(keyMap, { [key]: dp }), keyMap);
            }, {});

            const allUnresolvedParents = [];

            for (const dp of datapacks) {
                const parentKeys = dp.getParentRecordKeys();//.filter(key => !key.match('VlocityRecordSourceKey'));
                const resolvedParents = parentKeys.map(parentKey => keyToDatapack[parentKey]).filter(dp => !!dp);
                const missingParents = parentKeys
                    .filter(parentKey => !keyToDatapack[parentKey])
                    .filter(parentKey => parentKey.startsWith('RecordType/'))
                    .filter(parentKey => this.datapackService.isGuaranteedParentKey(parentKey));

                // Log any missing references as warnings
                const missingKeyLocations = await Promise.all(
                    missingParents.map(async parentKey => await this.findInFiles(path.dirname(dp.headerFile), parentKey))
                );

                for (const [i, [file, range]] of missingKeyLocations.filter(result => !!result).entries()) {
                    this.addWarning(file, range, `Unable to resolve dependency with key '${missingParents[i]}'`);
                }

                allUnresolvedParents.push(...missingParents);

                // write parent key file
                if (resolvedParents.length > 0) {
                    await this.updateParentKeysFile(dp.headerFile, resolvedParents.map(dp => this.datapackService.getDatapackReferenceKey(dp)));
                }
            }

            if(allUnresolvedParents.length > 0) {
                vscode.window.showWarningMessage(`Unable to resolve ${allUnresolvedParents.length} dependencies see problems tab for details.`);
            } else {
                vscode.window.showInformationMessage(`Successfully resolved all datapack dependencies and updated ParentKey files.`);
            }

        } finally {
            progressToken.complete();
        }
    }

    private async updateParentKeysFile(datapackHeader: string, parentKeys: string[]) : Promise<void> {
        const [datapackFilePrefix] = path.basename(datapackHeader).split(/_datapack/i);
        const parentKeyFile = path.join(path.dirname(datapackHeader), datapackFilePrefix + '_ParentKeys.json');
        const currentParentKeys = await this.tryReadJson(parentKeyFile);

        let newParentKeys = [ ...parentKeys ];        
        if (currentParentKeys && Array.isArray(currentParentKeys)) {
            newParentKeys.push(...currentParentKeys);
        }

        try {
            await fs.writeFile(parentKeyFile, JSON.stringify([ ...new Set(newParentKeys) ].sort(), undefined, 4));
        } catch(err) {
            this.logger.error('Error while writing file:', err);
            vscode.window.showErrorMessage(`Error while updating parent keys file for ${datapackFilePrefix}`);
        }
    }

    private async tryReadJson(file: string) : Promise<any> {
        try {
            const data = await fs.readFile(file);
            return JSON.parse(data.toString());
        } catch {
            return undefined;
        }
    }

    private addWarning(file: vscode.Uri, range: vscode.Range, message: string) {
        this.addMessage(vscode.DiagnosticSeverity.Warning, file, range, message);
    }

    private addMessage(severity: vscode.DiagnosticSeverity, file: vscode.Uri, range : vscode.Range, message : string) {
        const currentMessages = this.diagnostics.get(file) || [];
        this.diagnostics.set(file, [...currentMessages, new vscode.Diagnostic(range, message, severity)]);
    }

    private async findInFiles(folder: string, needle: string) : Promise<[vscode.Uri, vscode.Range] | undefined> {
        const files = await fs.readdir(folder);
        for (const file of files) {
            const fileData = await getDocumentBodyAsString(path.join(folder, file));
            const position = this.findSubstring(fileData, needle);
            if (position) {
                return [
                    vscode.Uri.file(path.join(folder, file)),
                    position
                ];
            }
        }
    }

    private findSubstring(content: string, needle: string) : vscode.Range | undefined {
        const index = content.indexOf(needle);
        if (index < 0) {
            return;
        } 

        let line = 0, column = 0;
        for (let i = 0; i < index; i++) {
            if (content[i] == '\n') {
                line++;
                column = 0;
            } else {
                column++;
            }
        }

        return new vscode.Range(
            new vscode.Position(line, column),
            new vscode.Position(line, column+needle.length)
        );
    }
}

