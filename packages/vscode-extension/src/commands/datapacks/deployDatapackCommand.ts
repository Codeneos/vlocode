import * as path from 'path';
import * as vscode from 'vscode';

import { forEachAsyncParallel } from '@vlocode/util';
import { DatapackUtil } from '@vlocode/vlocity-deploy';
import { DatapackCommand } from './datapackCommand';
import { v4 } from 'uuid';
import { vscodeCommand } from '@root/lib/commandRouter';
import { VlocodeCommand } from '@root/constants';
import { container } from '@vlocode/core';
import { VlocityToolsDeployment } from '@root/lib/vlocity/vlocodeDirectDeploy';
import { VlocodeDirectDeployment } from '@root/lib/vlocity/vlocityToolsDeploy';
import { VlocityDeploy } from '@root/lib/vlocity/vlocityDeploy';
import { getContext } from '@root/lib/vlocodeContext';

const deployModeSuggestionKey: string = 'deploymodeSuggestion-0.17.0';
const suggestionInterval: number = 9 * 24 * 3600 * 1000;

@vscodeCommand(VlocodeCommand.deployDatapack, { focusLog: true })
export class DeployDatapackCommand extends DatapackCommand {

    /** 
     * In order to prevent double deployment keep a list of files recently saved by this command
     */
    private static readonly savingDocuments = new Map<string, Set<string>>();

    private get strategy(): VlocityDeploy {
        if (this.vlocode.config.deploymentMode === 'direct') {
            return container.get(VlocodeDirectDeployment);
        } 
        return container.get(VlocityToolsDeployment);        
    }

    public execute(...args: any[]): void | Promise<void> {
        const selectedFiles = args[1] ?? [ args[0] ?? this.currentOpenDocument ];
        const filesForDeployment = this.filterAutoSavedFiles(selectedFiles);
        
        if (!filesForDeployment.length) {
            return;
        }

        return this.run(filesForDeployment);
    }

    protected async run(selectedFiles: vscode.Uri[]) {
        // prepare input
        const datapackHeaders = await this.getDatapackHeaders(selectedFiles);
        if (!datapackHeaders.length) {
            // no datapack files found, lets pretend this didn't happen
            return;
        }

        // Prevent prod deployment if not intended
        if (await this.vlocode.salesforceService.isProductionOrg()) {
            if (!await this.showProductionWarning(false)) {
                return;
            }
        }

        // Suggest vlocode?
        if (datapackHeaders.length > 1) {
            await this.suggestDeploymentModeChange();
        }

        const progressText = await this.getProgressText(datapackHeaders);
        await this.vlocode.withCancelableProgress(progressText, async (progress, token) => {
            await this.saveUnsavedChangesInDatapacks(datapackHeaders);
            await this.strategy.deploy(datapackHeaders, token);
            if (token.isCancellationRequested) {
                void vscode.window.showWarningMessage('Datapack deployment cancelled');
            }
        });
    }

    /**
     * Create a progress text for the deployment activity
     * @param datapackHeaders headers in the current deployment
     * @returns Message as string to be used for the deployment acivity
     */
    private async getProgressText(datapackHeaders: vscode.Uri[]) {
        if (datapackHeaders.length < 4) {
            // Reading datapack takes a long time, only read datapacks if it is a reasonable count
            const datapacks = await this.datapackService.loadAllDatapacks(datapackHeaders);
            const datapackNames = datapacks.map(datapack => DatapackUtil.getLabel(datapack));
            return `Deploying: ${datapackNames.join(', ')} ...`;
        }        
        return `Deploying: ${datapackHeaders.length} datapacks ...`;
    }

    /**
     * Saved all unsaved changes in the files related to each of the selected datapack files.
     * @param datapackHeaders The datapack header files.
     */
    private async saveUnsavedChangesInDatapacks(datapackHeaders: vscode.Uri[]) {
        const datapackFolders = datapackHeaders.map(header => path.dirname(header.fsPath));
        const openDocuments = vscode.workspace.textDocuments.filter(d => d.isDirty && datapackFolders.includes(path.dirname(d.fileName)));

        if (!openDocuments.length) {
            return;
        }

        // keep track of all documents that we intend to save in a set to prevent
        // a second deployment from being triggered by the onDidSaveHandler.
        const currentOperationId = v4();
        const openDocumentPaths = new Set(openDocuments.map(d => d.fileName));
        DeployDatapackCommand.savingDocuments.set(currentOperationId, openDocumentPaths);

        // backup to delete saving documents list
        setTimeout(() => DeployDatapackCommand.savingDocuments.delete(currentOperationId), 1000);

        // Save each document and delete if tom the pending save list
        await forEachAsyncParallel(openDocuments, async doc => {
            this.logger.verbose(`Saving ${doc.fileName} before deployment`);
            await doc.save();
        });        
        this.logger.info(`Saved ${openDocuments.length} datapack files before deployment`);
    }

    private filterAutoSavedFiles(selectedFiles: vscode.Uri[]) {
        return selectedFiles.filter(file => {
            if (this.removeDocumentBeingSaved(file)) {
                // Deployment was triggered through on save handler; skipping it
                this.logger.verbose(`Deployment loop detected; skipping deployment requested for: ${file.fsPath}`);
                return false;
            }
            return true;
        });
    }

    private removeDocumentBeingSaved(selectedFile: vscode.Uri) {
        for (const documents of DeployDatapackCommand.savingDocuments.values()) {
            for (const document of [...documents]) {
                if (selectedFile.fsPath === document) {
                    documents.delete(document);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Suggest a deployment mode change from compatibility to Direct deployment mode. This suggestion is only shown
     * if it wasn't shown recently and the user choice is remebered in the global state with the last suggested time stamp.
     * 
     * If the users closes the question without anwsering it it will re-popup on the next deployment.
     */
    private async suggestDeploymentModeChange() {
        const suggestionState = getContext().globalState;
        const usingDirectMode = this.vlocode.config.deploymentMode === 'direct';
        const currentSuggestionState = suggestionState.get<number>(deployModeSuggestionKey);
        const allowSuggest = !currentSuggestionState || (currentSuggestionState + suggestionInterval < Date.now());
        
        if (allowSuggest && !usingDirectMode) {
            const result = await vscode.window.showInformationMessage(
                `Do you want faster DataPack deployments? Try the updated Direct deployment mode`, ...[
                { mode: 'direct',  title: 'Yes, make it so'}, 
                { mode: 'compatibility',  title: 'No, I prefer the wait'}
            ]);

            if (result) {
                if (result?.mode === 'direct') {
                    await vscode.window.showInformationMessage(
                        `Good call! Deployment mode is updated to "direct". ` + 
                        `In case of issues you can always switch back to "compatibility" mode from extension settings.`, 
                        'Ok'
                    );
                    this.vlocode.config.deploymentMode = result?.mode;
                } else if (result?.mode === 'compatibility') {
                    void vscode.window.showWarningMessage(
                        `If you do change your mind you can always switch to "direct" deployment mode from extension settings.`,
                        'Ok'
                    );
                }
                void suggestionState.update(deployModeSuggestionKey, Date.now());
            }           
        }
    }
}