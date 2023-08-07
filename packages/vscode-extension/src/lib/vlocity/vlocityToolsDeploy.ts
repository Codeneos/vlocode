import * as vscode from 'vscode';
import { injectable, Logger } from '@vlocode/core';

import VlocityDatapackService, { DatapackResultCollection } from './vlocityDatapackService';
import { VlocityDeploy } from './vlocityDeploy';

@injectable()
export class VlocityToolsDeployment implements VlocityDeploy {

    constructor(
        private readonly datapackService: VlocityDatapackService, 
        private readonly logger: Logger) {
    }

    async deploy(
        datapackHeaders: vscode.Uri[], 
        progress: vscode.Progress<{ progress?: number; total?: number }>, 
        cancellationToken: vscode.CancellationToken
    ) {
        const results = await this.datapackService.deploy(datapackHeaders.map(header => header.fsPath), cancellationToken);
        if (!cancellationToken.isCancellationRequested) {
            this.printDatapackDeployResults(results);
        }
    }

    private printDatapackDeployResults(results : DatapackResultCollection) {
        [...results].forEach((rec, i) => this.logger.verbose(`${i}: ${rec.key}: ${rec.success || rec.errorMessage || 'No error message'}`));
        const resultSummary = results.length == 1 ? [...results][0].label || [...results][0].key : `${results.length} datapacks`;
        if (results.hasErrors) {
            const errors = results.getErrors();
            const errorMessage = errors.find(e => e.errorMessage)?.errorMessage || 'Unknown error';
            errors.forEach(rec => this.logger.error(`${rec.key}: ${rec.errorMessage || 'No error message'}`));
            throw `Failed to deploy ${errors.length} out of ${results.length} datapack${results.length != 1 ? 's' : ''}: ${errorMessage}`;
        } else {
            void vscode.window.showInformationMessage(`Successfully deployed ${resultSummary}`);
        }
    }
}
