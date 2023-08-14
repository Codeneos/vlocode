import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';

import { getDocumentBodyAsString , filterUndefined , substringAfterLast } from '@vlocode/util';
import { VlocityDatapack, VlocityDatapackReference, DatapackLoader } from '@vlocode/vlocity';
import { container } from '@vlocode/core';
import { DatapackCommand } from './datapackCommand';
import { getDatapackHeadersInWorkspace } from '../../lib/vlocity/datapackUtil';
import { vscodeCommand } from '../../lib/commandRouter';
import { VlocodeCommand } from '../../constants';

@vscodeCommand(VlocodeCommand.buildParentKeyFiles)
export default class BuildParentKeyFilesCommand extends DatapackCommand {

    private get diagnostics() : vscode.DiagnosticCollection {
        return this.vlocode.getDiagnostics('Datapack Dependencies');
    }

    constructor() {
        super();
    }

    public execute(...args: any[]) : Promise<void> {
        return this.buildParentKeyFiles();
    }

    protected async loadAllDatapacks(progressToken: vscode.Progress<{ message?: string; progress?: number, total?: number }>, cancelToken: vscode.CancellationToken) : Promise<VlocityDatapack[]> {
        const datapackLoader = container.get(DatapackLoader);
        const datapackHeaders = await getDatapackHeadersInWorkspace();
        const loadedDatapacks = new Array<VlocityDatapack>();

        let progress = 0;

        for (const header of datapackHeaders) {
            if (cancelToken.isCancellationRequested) {
                progressToken.report({ message: 'cancelled' });
                return [];
            }

            loadedDatapacks.push(await datapackLoader.loadDatapack(header.fsPath));

            progressToken.report({
                message: 'loading datapacks',
                progress: ++progress,
                total: datapackHeaders.length
            });
        }

        return loadedDatapacks;
    }

    protected async buildParentKeyFiles() : Promise<void> {

        await this.vlocode.withCancelableProgress('Repairing datapack dependencies', async (progress, token) => {
            // Clear current warnings
            this.diagnostics.clear();

            // load all datapacks in the workspace
            const datapacks = await this.loadAllDatapacks(progress, token);

            if (token.isCancellationRequested) {
                return;
            }

            // create parent key to datapack map
            progress.report({ message: 'resolving keys...' });
            const resolvedDatapacks = new Map<string, VlocityDatapack>();
            for (const datapack of datapacks) {
                for (const sourceKey of datapack.getSourceKeys()) {
                    resolvedDatapacks.set(sourceKey.VlocityRecordSourceKey, datapack);
                }
            }

            const allUnresolvedParents = new Array<string>();

            for (const datapack of datapacks) {

                // Map resolved and unresolved keys
                const missingRefs : VlocityDatapackReference[] = [];
                const resolvedRefs : VlocityDatapack[] = [];
                for (const ref of this.getExternalReferences(datapack)) {
                    const sourceKey = ref.VlocityLookupRecordSourceKey || ref.VlocityMatchingRecordSourceKey;
                    const resolvedRef = resolvedDatapacks.get(sourceKey);

                    if (this.datapackService.isGuaranteedParentKey(sourceKey)) {
                        // Some keys are guaranteed and should be ignored
                        continue;
                    }

                    if (resolvedRef) {
                        resolvedRefs.push(resolvedRef);
                    } else {
                        missingRefs.push(ref);
                    }
                }

                // collect parent key references
                const parentKeyReferences = resolvedRefs.map(dp => this.datapackService.getDatapackReferenceKey(dp));
                const missingParents = missingRefs.map(ref => ref.VlocityLookupRecordSourceKey || ref.VlocityMatchingRecordSourceKey);

                // Log any missing references as warnings
                const missingKeyLocations = await Promise.all(
                    missingParents.map(async parentKey =>
                        await this.findInFiles(path.dirname(datapack.headerFile), parentKey) ||
                              this.findInFiles(path.dirname(datapack.headerFile), substringAfterLast(parentKey, '/'))
                    )
                );
                for (const [i, [file, range]] of filterUndefined(missingKeyLocations).entries()) {
                    this.addWarning(file, range, `Unable to resolve dependency with key '${missingParents[i].replace(/^%vlocity_namespace%__/,'')}'`);
                }
                allUnresolvedParents.push(...missingParents);

                // write parent key file
                if (parentKeyReferences.length > 0) {
                    await this.updateParentKeysFile(datapack.headerFile, parentKeyReferences);
                }
            }

            if (allUnresolvedParents.length > 0) {
                void vscode.window.showWarningMessage(`Unable to resolve ${allUnresolvedParents.length} dependencies see problems tab for details.`);
            } else {
                void vscode.window.showInformationMessage('Successfully resolved all datapack dependencies and updated ParentKey files.');
            }

        });
    }

    private *getExternalReferences(datapack: VlocityDatapack) {
        if (datapack.datapackType === 'OmniScript') {
            yield* this.resolveOmniScriptReferences(datapack)[Symbol.iterator]();
        }
        yield* datapack.getExternalReferences();
    }

    private resolveOmniScriptReferences(omniScript: VlocityDatapack) : VlocityDatapackReference[] {
        // Find any custom templates
        let customTemplateReferences = [...new Set<string>(omniScript.element__c
            .filter(elem => elem.propertySet__c && elem.propertySet__c.HTMLTemplateId)
            .map(elem => elem.propertySet__c.HTMLTemplateId))];

        // exlcude templates defined in the TestHTMLTemplates__c
        if (omniScript.TestHTMLTemplates__c) {
            customTemplateReferences = customTemplateReferences.filter(
                templateId => !omniScript.TestHTMLTemplates__c.includes(templateId));
        }

        // add template parent references to datapack
        return customTemplateReferences.map(templateId => ({
            Name: templateId,
            VlocityRecordSObjectType: '%vlocity_namespace%__VlocityUITemplate__c',
            VlocityDataPackType: 'VlocityLookupMatchingKeyObject',
            VlocityLookupRecordSourceKey: `%vlocity_namespace%__VlocityUITemplate__c/${templateId}`
        }));
    }

    private async updateParentKeysFile(datapackHeader: string, parentKeys: string[]) : Promise<void> {
        const [datapackFilePrefix] = path.basename(datapackHeader).split(/_datapack/i);
        const parentKeyFile = path.join(path.dirname(datapackHeader), `${datapackFilePrefix  }_ParentKeys.json`);
        const currentParentKeys = await this.tryReadJson(parentKeyFile);

        const newParentKeys = [ ...parentKeys ];
        if (currentParentKeys && Array.isArray(currentParentKeys)) {
            newParentKeys.push(...currentParentKeys);
        }

        try {
            await fs.writeFile(parentKeyFile, JSON.stringify([ ...new Set(newParentKeys) ].sort(), undefined, 4));
        } catch(err) {
            this.logger.error('Error while writing file:', err);
            void vscode.window.showErrorMessage(`Error while updating parent keys file for ${datapackFilePrefix}`);
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

