import * as vscode from 'vscode';

import { VlocodeCommand } from '../constants';
import { CommandBase } from '../lib/commandBase';
import { SalesforceConnectionProvider } from '@vlocode/salesforce';
import { vscodeCommand } from '../lib/commandRouter';
import { CancellationToken } from '@vlocode/util';
import { ActivityProgress } from '../lib/vlocodeActivity';

@vscodeCommand(VlocodeCommand.adminCommands)
@vscodeCommand(VlocodeCommand.refreshPriceBook, { focusLog: true, executeParams: [ VlocodeCommand.refreshPriceBook ] })
@vscodeCommand(VlocodeCommand.refreshProductHierarchy, { focusLog: true, executeParams: [ VlocodeCommand.refreshProductHierarchy ] })
@vscodeCommand(VlocodeCommand.clearPlatformCache, { focusLog: true, executeParams: [ VlocodeCommand.clearPlatformCache ] })
@vscodeCommand(VlocodeCommand.updateAllProdAttribCommand, { focusLog: true, executeParams: [ VlocodeCommand.updateAllProdAttribCommand ] })
@vscodeCommand(VlocodeCommand.refreshPriceBookAndProductHierarchy, { focusLog: true, executeParams: [ VlocodeCommand.refreshPriceBook, VlocodeCommand.refreshProductHierarchy ] })
export class VlocityAdminCommand extends CommandBase {

    private readonly adminCommands = [
        {
            title: 'Refresh Platform Cache (full)',
            icon: 'mirror',
            detail: 'Refresh the product hierarchy and attribute data in the platform cache',
            command: { methodName: 'refreshPriceBook' },
            name: VlocodeCommand.refreshPriceBook
        },
        {
            title: 'Refresh Product Hierarchy (delete\'s old data)',
            icon: 'tag',
            detail: 'This Job will resolve each product\'s hierarchy into the data store',
            command: { methodName: 'startProductHierarchyJob', deleteOldData: 'true' },
            name: VlocodeCommand.refreshProductHierarchy
        },        
        {
            title: 'Product catagory data maintenance',
            icon: 'group-by-ref-type',
            detail: 'This job will populate product category data for all products.',
            command: { batchSize: 200, methodName: 'startProductCategoryDataBatchJobs' }
        },      
        {
            title: 'Clear Managed Platform Cache',
            icon: 'trashcan',
            detail: 'This will clear platform cache partion',
            command: { methodName: 'clearPlatformCache' },
            name: VlocodeCommand.clearPlatformCache
        },
        {
            title: 'Update Product Attributes (JSON)',
            icon: 'repo-sync',
            detail: 'Refresh the product attribute JSON definitions based on the attribute assignments',
            batchJob: '%vlocity_namespace%.UpdateAllProdAttribJSONBatchJob',
            name: VlocodeCommand.updateAllProdAttribCommand
        }
    ];

    protected get connectionProvider(): SalesforceConnectionProvider {
        return this.vlocode.salesforceService;
    }

    public async validate() : Promise<void> {
        const validationMessage = await this.vlocode.validateSalesforceConnectivity();
        if (validationMessage) {
            throw validationMessage;
        }
    }

    public async execute(...commands: string[]) : Promise<void> {
        for (const command of commands.length ? commands : [ undefined ]) {
            await this.executeCommand(command);
        }
    }

    private async executeCommand(commandName?: string) : Promise<void> {
        const selectedCommand = commandName
            ? this.adminCommands.find(command => command.name == commandName)
            : await vscode.window.showQuickPick(this.adminCommands.map(cmd => Object.assign(cmd, { label: `$(${cmd.icon}) ${cmd.title}` })));

        if (!selectedCommand) {
            return;
        }

        await this.vlocode.withActivity({ progressTitle: selectedCommand.title, cancellable: true }, async (progress, token) => {
            if (selectedCommand.batchJob) {
                await this.executeBatch(selectedCommand.batchJob, progress, token);
            }
            if (selectedCommand.command) {
                await this.executeAdminMethod([ selectedCommand.command ], progress, token);
            }
        });
    }

    private executeBatch(batchClass: string, progress: ActivityProgress, token?: CancellationToken) : Promise<void> {
        const apex = `Database.executeBatch(new ${batchClass}());`;
        return this.executeAnonymous(apex, progress, token);
    }

    private executeAdminMethod(commands: { methodName: string }[], progress: ActivityProgress, token?: CancellationToken) : Promise<void> {
        let apex = '%vlocity_namespace%.TelcoAdminConsoleController ctrl = new %vlocity_namespace%.TelcoAdminConsoleController();\n';
        apex += commands.map(cmd => `ctrl.setParameters('${JSON.stringify(cmd)}'); ctrl.invokeMethod();`).join('\n');
        return this.executeAnonymous(apex, progress, token);
    }

    private async executeAnonymous(apex: string, progress: ActivityProgress, cancelToken?: CancellationToken) : Promise<void> {
        const batchTracker = await this.vlocode.salesforceService.batch.createBatchTracker();
        await this.vlocode.salesforceService.executeAnonymous(apex, { updateNamespace: true });
        return batchTracker.awaitScheduledBatches({
            cancelToken,
            progressReport: status => {
                progress.report({
                    message: `${status.status} (${status.progress}/${status.total})`,
                    progress: status.progress,
                    total: status.total
                });
                this.logger.info(`Awaiting ${status}`);
            }
        });
    }
}