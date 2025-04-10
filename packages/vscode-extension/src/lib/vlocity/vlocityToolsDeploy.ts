import * as vscode from 'vscode';
import { injectable, Logger } from '@vlocode/core';

import VlocityDatapackService, { DatapackResultCollection } from './vlocityDatapackService';
import { VlocityDeploy, VlocityDeployResult } from './vlocityDeploy';
import { substringBefore } from '@vlocode/util';

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
        // if (!cancellationToken.isCancellationRequested) {
        //     this.printDatapackDeployResults(results);
        // }
        return this.prepareResults(results);
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

    private prepareResults(deployResults: DatapackResultCollection): VlocityDeployResult[] {
        const results = new Array<VlocityDeployResult>();
        for (const datapackResult of deployResults) {
            results.push({
                datapack: datapackResult.key,
                type: substringBefore(datapackResult.key, '/'),
                status: datapackResult.success ? 'success' : 'error',
                totalRecords: 1,
                failedRecords: datapackResult.success ? 1 : 0,
                messages: datapackResult.errorMessage ? [ {
                    type: 'error',
                    message: datapackResult.errorMessage
                } ] : []
            });
        }
        return results;
    }
}
