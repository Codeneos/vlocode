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
   
    async deploy(datapackHeaders: vscode.Uri[], cancellationToken: vscode.CancellationToken) {
        const datapacks = await this.datapackService.loadAllDatapacks(datapackHeaders, cancellationToken);
        const deployment = await this.datapackDeployer.createDeployment(datapacks, {
            // TODO: allow user to override these from options
            strictDependencies: true,
            purgeMatchingDependencies: true,
            lookupFailedDependencies: true,
            continueOnError: true,
            maxRetries: 1,
        }, cancellationToken);
        await deployment?.start(cancellationToken);

        if (cancellationToken.isCancellationRequested) {
            return;
        }

        if (deployment.hasErrors) {
            for (const [datapackKey, messages] of Object.entries(deployment.getMessagesByDatapack())) {
                this.logger.error(`Datapack ${chalk.bold(datapackKey)} -- ${deployment.getFailedRecords(datapackKey).length} failed records (${messages.length} messages)`);
                for (let i = 0; i < messages.length; i++) {
                    this.logger.error(` ${i + 1}. ${chalk.underline(messages[i].record.sourceKey)} -- ${this.formaError(messages[i].message)} (${messages[i].type.toUpperCase()})`);
                }
            }
            void vscode.window.showWarningMessage(`Datapack deployment completed with errors: unable to update/insert ${deployment.failedRecordCount} records`);
        } else {
            void vscode.window.showInformationMessage(`Successfully deployed ${datapacks.length} datapacks`);
        }
    }

    private formaError(message?: string) {
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