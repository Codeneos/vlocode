import * as vscode from 'vscode';

import { VlocodeCommand, NAMESPACE_PLACEHOLDER } from '../constants';
import { CommandBase } from './commandBase';
import JsForceConnectionProvider from 'connection/jsForceConnectionProvider';

class VlocityAdminCommand extends CommandBase {

    private adminCommands = [
        { 
            title: 'Refresh Pricebook',  
            icon: 'mirror',
            detail: 'Runs refreshed the pricebook entries on the currently connected Salesforce org',
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

    constructor(name : string) {
        super(name);        
    }

    protected get connectionProvider() : JsForceConnectionProvider {
        return this.vloService.datapackService;
    }

    public async validate() : Promise<void> {
        const validationMessage = await this.vloService.validateSalesforceConnectivity();
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

        let progress = await this.startProgress(`Running ${selectedCommand.title}...`);
        try {
            if (selectedCommand.batchJob) {
                await this.executeBatch(selectedCommand.batchJob);
            }
            if (selectedCommand.method) {
                await this.executeAdminMethod(selectedCommand.method);
            }
        } finally {
            progress.complete();
        }
    }

    private executeBatch(batchClass: string) : Promise<void> {   
        const apex = `Database.executeBatch(new ${batchClass}());`  
        return this.executeAnonymous(apex);
    }

    private executeAdminMethod(...methodNames: string[]) : Promise<void> {   
        let apex = '%vlocity_namespace%.TelcoAdminConsoleController ctrl = new %vlocity_namespace%.TelcoAdminConsoleController();\n';
        apex += methodNames.map(method => `ctrl.setParameters('{"methodName":"${method}"}'); ctrl.invokeMethod();`).join(`\n`);
        return this.executeAnonymous(apex);
    }

    private async executeAnonymous(apex: string) : Promise<void> {   
        this.logger.verbose('Execute Anonymous:', apex);
        const connection = await this.connectionProvider.getJsForceConnection();
        const result = await connection.tooling.executeAnonymous(apex.replace(NAMESPACE_PLACEHOLDER, this.vloService.datapackService.vlocityNamespace));
        if (!result.compiled) {
            throw new Error(`${result.compileProblem} at ${result.line}:${result.column}`);
        }
        if (!result.success) {
            throw new Error(`${result.exceptionMessage}\n${result.exceptionStackTrace}`);
        }
    }
};

export default [ 
    VlocodeCommand.refreshPriceBook, 
    VlocodeCommand.refreshProductHierarchy, 
    VlocodeCommand.clearPlatformCache, 
    VlocodeCommand.clearPlatformCache ].reduce( 
        (map, command) => Object.assign(map, { [command]: _ => vscode.commands.executeCommand(VlocodeCommand.adminCommands, command) }), 
    { [VlocodeCommand.adminCommands]: VlocityAdminCommand });