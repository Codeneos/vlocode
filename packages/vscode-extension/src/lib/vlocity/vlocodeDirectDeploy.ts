import * as vscode from 'vscode';
import chalk from 'chalk';

import {  injectable, Logger } from '@vlocode/core';
import { DatapackDeployer } from '@vlocode/vlocity-deploy';
import { VlocityDeploy } from './vlocityDeploy';
import VlocityDatapackService from './vlocityDatapackService';

@injectable()
export class VlocodeDirectDeployment implements VlocityDeploy {

    constructor(
        private readonly datapackService: VlocityDatapackService,
        private readonly datapackDeployer: DatapackDeployer,
        private readonly logger: Logger) {
    }

    async deploy(
        datapackHeaders: vscode.Uri[], 
        progress: vscode.Progress<{ progress?: number; total?: number }>, 
        cancellationToken: vscode.CancellationToken
    ) {
        const datapacks = await this.datapackService.loadAllDatapacks(datapackHeaders, cancellationToken);
        const deployment = await this.datapackDeployer.createDeployment(datapacks, {
            // TODO: allow user to override these from options
            strictOrder: true,
            purgeMatchingDependencies: false,
            lookupFailedDependencies: false,
            continueOnError: true,
            maxRetries: 1,
        }, cancellationToken);
        deployment.on('progress', result => {
            progress.report({ progress: result.progress, total: result.total });
        });
        await deployment?.start(cancellationToken);

        if (cancellationToken.isCancellationRequested) {
            return;
        }

        if (deployment.hasErrors) {
            for (const [datapackKey, messages] of Object.entries(deployment.getMessagesByDatapack())) {
                const failedRecords = deployment.getFailedRecords(datapackKey).length;
                this.logger.error(`Datapack ${chalk.bold(datapackKey)} -- Failed Records ${failedRecords}`);
                for (let i = 0; i < messages.length; i++) {
                    this.logger.error(` ${i + 1}. ${chalk.underline(messages[i].record.sourceKey)} -- ${this.formatError(messages[i].message)}`);
                }
            }
            void vscode.window.showWarningMessage(`Deployed ${datapacks.length} datapacks with ${deployment.failedRecordCount} errors`);
        } else {
            void vscode.window.showInformationMessage(`Deployed ${datapacks.length} datapacks`);
        }
    }

    private formatError(message?: string) {
        if (!message) {
            return 'Salesforce provided no error message';
        }

        if (message.includes('Script-thrown exception')) {
            const triggerTypeMatch = message.match(/execution of ([\w\d_-]+)/);
            const causedByMatch = message.match(/caused by: ([\w\d_.-]+)/);
            if (triggerTypeMatch) {
                const triggerType = triggerTypeMatch[1];
                return `APEX ${triggerType} trigger caused exception; try inserting this datapack with triggers disabled`;
            } else if (causedByMatch) {
                return `APEX exception caused by (${causedByMatch[1]}); try inserting this datapack with triggers disabled`;
            }
        }

        return message.split(/\n|\r/g).filter(line => line.trim().length > 0).join('\n');
    }
}