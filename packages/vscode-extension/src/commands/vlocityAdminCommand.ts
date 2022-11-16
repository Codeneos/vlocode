import * as vscode from 'vscode';

import { VlocodeCommand, NAMESPACE_PLACEHOLDER_PATTERN } from '@constants';
import { CommandBase } from '../lib/commandBase';
import { SalesforceConnectionProvider } from '@vlocode/salesforce';
import { vscodeCommand } from '@root/lib/commandRouter';

@vscodeCommand(VlocodeCommand.adminCommands)
@vscodeCommand(VlocodeCommand.refreshPriceBook, { focusLog: true, executeParams: [ VlocodeCommand.refreshPriceBook ] })
@vscodeCommand(VlocodeCommand.refreshProductHierarchy, { focusLog: true, executeParams: [ VlocodeCommand.refreshProductHierarchy ] })
@vscodeCommand(VlocodeCommand.clearPlatformCache, { focusLog: true, executeParams: [ VlocodeCommand.clearPlatformCache ] })
@vscodeCommand(VlocodeCommand.updateAllProdAttribCommand, { focusLog: true,  executeParams: [ VlocodeCommand.updateAllProdAttribCommand ] })
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

    public async execute(commandName?: string) : Promise<void> {
        const selectedCommand = commandName
            ? this.adminCommands.find(command => command.name == commandName)
            : await vscode.window.showQuickPick(this.adminCommands.map(cmd => Object.assign(cmd, { label: `$(${cmd.icon}) ${cmd.title}` })));

        if (!selectedCommand) {
            return;
        }

        await this.vlocode.withActivity(`Running ${selectedCommand.title}...`, async () => {
            if (selectedCommand.batchJob) {
                await this.executeBatch(selectedCommand.batchJob);
            }
            if (selectedCommand.method) {
                await this.executeAdminMethod(selectedCommand.method);
            }
        });
    }

    private executeBatch(batchClass: string) : Promise<void> {
        const apex = `Database.executeBatch(new ${batchClass}());`;
        return this.executeAnonymous(apex);
    }

    private executeAdminMethod(...methodNames: string[]) : Promise<void> {
        let apex = '%vlocity_namespace%.TelcoAdminConsoleController ctrl = new %vlocity_namespace%.TelcoAdminConsoleController();\n';
        apex += methodNames.map(method => `ctrl.setParameters('{"methodName":"${method}"}'); ctrl.invokeMethod();`).join('\n');
        return this.executeAnonymous(apex);
    }

    private async executeAnonymous(apex: string) : Promise<void> {
        this.logger.verbose('Execute Anonymous:', apex);
        const connection = await this.connectionProvider.getJsForceConnection();
        const result = await connection.tooling.executeAnonymous(apex.replace(NAMESPACE_PLACEHOLDER_PATTERN, this.vlocode.datapackService.vlocityNamespace));
        if (!result.compiled) {
            throw new Error(`${result.compileProblem} at ${result.line}:${result.column}`);
        }
        if (!result.success) {
            throw new Error(`${result.exceptionMessage}\n${result.exceptionStackTrace}`);
        }
    }
}

// export default {
//     [VlocodeCommand.adminCommands]: VlocityAdminCommand,
//     [VlocodeCommand.refreshPriceBookAndProductHierarchy]: async () => {
//         await vscode.commands.executeCommand(VlocodeCommand.adminCommands, VlocodeCommand.refreshPriceBook);
//         await vscode.commands.executeCommand(VlocodeCommand.adminCommands, VlocodeCommand.refreshProductHierarchy);
//     },
//     ...[VlocodeCommand.refreshPriceBook,
//         VlocodeCommand.refreshProductHierarchy,
//         VlocodeCommand.clearPlatformCache,
//         VlocodeCommand.clearPlatformCache].reduce(
//         (map, command) => Object.assign(map, { [command]: () => vscode.commands.executeCommand(VlocodeCommand.adminCommands, command) }), {}
//     )
// };
