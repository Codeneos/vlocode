import * as vscode from 'vscode';
import chalk from 'chalk';

import {  injectable, Logger } from '@vlocode/core';
import { DatapackDeployer, DatapackDeployment, DatapackDeploymentOptions, DatapackkDeploymentState } from '@vlocode/vlocity-deploy';
import { VlocityDeploy, VlocityDeployResult } from './vlocityDeploy';
import VlocityDatapackService from './vlocityDatapackService';
import { count, Iterable } from '@vlocode/util';
import VlocodeConfiguration from '../vlocodeConfiguration';

@injectable()
export class VlocodeDirectDeployment implements VlocityDeploy {

    constructor(
        private readonly datapackService: VlocityDatapackService,
        private readonly datapackDeployer: DatapackDeployer,        
        private readonly config: VlocodeConfiguration,
        private readonly logger: Logger) {
    }

    async deploy(
        datapackHeaders: vscode.Uri[], 
        progress: vscode.Progress<{ message: string, progress: number; total: number }>, 
        cancellationToken: vscode.CancellationToken
    ) {
        const options: DatapackDeploymentOptions = {
            strictOrder: true,
            purgeMatchingDependencies: false,
            lookupFailedDependencies: false,
            continueOnError: true,
            maxRetries: 1,
            skipLwcActivation: this.config.deploy.lwcActivation === false,
            useMetadataApi: this.config.deploy.lwcDeploymentType === 'metadata',
            standardRuntime: !!this.config.deploy.standardRuntime,
            disableTriggers: !!this.config.deploy.disableTriggers,
            allowUnresolvedDependencies: !!this.config.deploy.allowUnresolvedDependencies,
        };

        const datapacks = await this.datapackService.loadAllDatapacks(datapackHeaders, cancellationToken);
        const deployment = await this.datapackDeployer.createDeployment(datapacks, options, cancellationToken);
        deployment.on('progress', result => {
            progress.report({ message: `${result.progress}/${result.total}`, progress: result.progress, total: result.total });
        });
        await deployment.start(cancellationToken);

        // if (!deployment.hasErrors) {
        //     void vscode.window.showInformationMessage(`Successfully deployed ${datapacks.length} datapacks`);
        // } else {
        //     this.showDatapackErrors(deployment);
        // }

        return this.prepareResults(deployment);
    }

    private prepareResults(deployment: DatapackDeployment): VlocityDeployResult[] {
        const status = deployment.getStatus();
        const results: VlocityDeployResult[] = [];
        const mapping: Record<DatapackkDeploymentState, VlocityDeployResult['status']> = {
            [DatapackkDeploymentState.Pending]: 'pending',
            [DatapackkDeploymentState.InProgress]: 'inProgress',
            [DatapackkDeploymentState.Error]: 'error',
            [DatapackkDeploymentState.PartialSuccess]: 'partial',
            [DatapackkDeploymentState.Success]: 'success',
        } as const;

        for (const datapack of status.datapacks) {
            results.push({
                datapack: datapack.datapack,
                type: datapack.type,
                status: mapping[datapack.status],
                totalRecords: datapack.recordCount,
                failedRecords: datapack.failedCount,
                messages: datapack.messages.map(message => ({
                    type: message.type,
                    message: message.message,
                    code: message.type === 'error' ? message.code : undefined
                }))
            });
        }

        return results;
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