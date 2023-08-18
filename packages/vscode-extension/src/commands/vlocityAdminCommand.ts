import * as vscode from 'vscode';

import { VlocodeCommand, NAMESPACE_PLACEHOLDER_PATTERN } from '../constants';
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
            title: 'Refresh Pricebook',
            icon: 'mirror',
            detail: 'Runs the refresh pricebook entries command on the currently connected Salesforce org',
            method: 'refreshPriceBook',
            name: VlocodeCommand.refreshPriceBook
        },
        {
            title: 'Refresh Product Hierarchy',
            icon: 'tag',
            detail: 'Refresh the product hierarchy cache for the Vlocity CPQ',
            method: 'startProductHierarchyJob',
            name: VlocodeCommand.refreshProductHierarchy
        },
        {
            title: 'Clear Managed Platform Cache',
            icon: 'trashcan',
            detail: 'Clear the Vlocity platform cache partition',
            method: 'clearPlatformCache',
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
            if (selectedCommand.method) {
                await this.executeAdminMethod([ selectedCommand.method ], progress, token);
            }
        });
    }

    private executeBatch(batchClass: string, progress: ActivityProgress, token?: CancellationToken) : Promise<void> {
        const apex = `Database.executeBatch(new ${batchClass}());`;
        return this.executeAnonymous(apex, progress, token);
    }

    private executeAdminMethod(methodNames: string[], progress: ActivityProgress, token?: CancellationToken) : Promise<void> {
        let apex = '%vlocity_namespace%.TelcoAdminConsoleController ctrl = new %vlocity_namespace%.TelcoAdminConsoleController();\n';
        apex += methodNames.map(method => `ctrl.setParameters('{"methodName":"${method}"}'); ctrl.invokeMethod();`).join('\n');
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