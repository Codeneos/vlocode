import * as vscode from 'vscode';
import chalk from 'chalk';

import {  injectable, Logger } from '@vlocode/core';
import { DatapackDeployer, DatapackDeployment } from '@vlocode/vlocity-deploy';
import { VlocityDeploy } from './vlocityDeploy';
import VlocityDatapackService from './vlocityDatapackService';
import { count, Iterable } from '@vlocode/util';

@injectable()
export class VlocodeDirectDeployment implements VlocityDeploy {

    constructor(
        private readonly datapackService: VlocityDatapackService,
        private readonly datapackDeployer: DatapackDeployer,
        private readonly logger: Logger) {
    }

    async deploy(
        datapackHeaders: vscode.Uri[], 
        progress: vscode.Progress<{ message: string, progress: number; total: number }>, 
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
            progress.report({ message: `${result.progress}/${result.total}`, progress: result.progress, total: result.total });
        });
        await deployment?.start(cancellationToken);

        if (cancellationToken.isCancellationRequested) {
            return;
        }

        if (!deployment.hasErrors) {
            void vscode.window.showInformationMessage(`Successfully deployed ${datapacks.length} datapacks`);
        } else {
            this.showDatapackErrors(deployment);
        }
    }

    private showDatapackErrors(deployment: DatapackDeployment) {
        const totalDatapacks = deployment.totalDatapackCount
        const failedDatapacks = new Array<string>();
        const uniqueWarnings = new Set<string>();
        const casecadeFailedDatapacks = new Array<string>();

        for (const [datapackKey, messages] of Object.entries(deployment.getMessagesByDatapack())) {
            const records = deployment.getRecords(datapackKey);
            const totalRecords = records.length;
            const failedRecords = count(records, record => record.isFailed);
            const deployedRecords = count(records, record => record.isDeployed);
            const hasErrors = messages.some(message => message.type === 'error');

            if (failedRecords === 0) {
                continue;
            }

            failedDatapacks.push(datapackKey);

            if (deployedRecords === 0) {
                this.logger.error(`${chalk.bold(datapackKey)} -- Failed`);
            } else if (hasErrors) {
                this.logger.error(`${chalk.bold(datapackKey)} -- Deployed Partially (${deployedRecords}/${totalRecords})`);
            } else {
                casecadeFailedDatapacks.push(datapackKey);
            }

            for (let i = 0; i < messages.length; i++) {
                if (messages[i].type === 'error') {
                    this.logger.error(` ${i + 1}. ${chalk.underline(messages[i].record.sourceKey)} -- ${this.formatError(messages[i].message)}`);
                } else {
                    uniqueWarnings.add(messages[i].message);
                }
            }
        }

        if (casecadeFailedDatapacks.length) {
            this.logger.warn(`Partially deployed due to depedency errors (${casecadeFailedDatapacks.length}):`);
            Iterable.forEach(casecadeFailedDatapacks, (key, i) => {
                this.logger.warn(` ${i + 1}. ${key}`);
            });
        }

        if (uniqueWarnings.size > 0) {
            this.logger.warn(`Deployment warnings (${uniqueWarnings.size}):`);
            Iterable.forEach(uniqueWarnings, (warning, i) => {
                this.logger.warn(` ${i + 1}. ${chalk.underline(warning)}`);
            });
        }

        if (deployment.deployedRecordCount === 0) {
            void vscode.window.showErrorMessage(`Failed to deploy all (${totalDatapacks}) datapacks`);
        } else {
            void vscode.window.showWarningMessage(`Partially deployed ${totalDatapacks - failedDatapacks.length}/${totalDatapacks} datapacks`);
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