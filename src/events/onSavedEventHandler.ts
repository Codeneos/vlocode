import * as vscode from 'vscode';
import ServiceContainer from 'serviceContainer';
import CommandRouter from 'services/commandRouter';
import { VlocodeCommand } from '@constants';
import { EventHandlerBase } from 'events/eventHandlerBase';
import { isPartOfDatapack } from 'datapackUtil';
import { isSalesforceMetadataFile } from 'salesforceUtil';

export default class OnSavedEventHandler extends EventHandlerBase<vscode.TextDocument> {
    private readonly ignoredPaths = [
        '\.vscode',
        '\.sfdx',
        '\.git'
    ];

    constructor(event: vscode.Event<vscode.TextDocument>, container: ServiceContainer) {
        super(event, container);
    }
   
    protected async handleEvent(document: vscode.TextDocument): Promise<void> {   
        if (!this.vloService.config.deployOnSave && 
            !this.vloService.config.salesforce.deployOnSave) { 
            return;
        }

        if (!vscode.workspace.getWorkspaceFolder(document.uri) || 
            this.ignoredPaths.some(path => new RegExp(path).test(document.fileName))) {
            this.logger.verbose(`File not in workspace or in ignored directory: ${document.uri.fsPath}`);
            return; // ignore these
        }

        if (this.vloService.salesforceService && await this.vloService.salesforceService.isProductionOrg()) {
            // Never auto deploy to production orgs
            return;
        }

        if (await isPartOfDatapack(document.fileName)) {
            return this.deployAsDatapack(document);
        } else if(isSalesforceMetadataFile(document.fileName)) {
            return this.deployAsMetadata(document);
        }
    }

    protected deployAsDatapack(document: vscode.TextDocument) : Promise<any> {
        this.logger.verbose(`Requesting datapack deploy for: ${document.uri.fsPath}`);
        return this.container.get(CommandRouter).execute(VlocodeCommand.deployDatapack, document.uri, null, false);
    }

    protected deployAsMetadata(document: vscode.TextDocument) : Promise<any> {
        if (!this.vloService.config.salesforce.enabled) {
            this.logger.warn(`Skip deployment; enable Salesforce support in Vlocode configuration to deploy Salesforce metadata`);
            return;
        }
        if (!this.vloService.config.salesforce.deployOnSave) {
            return;
        }
        this.logger.verbose(`Requesting metadata deploy for: ${document.uri.fsPath}`);
        return this.container.get(CommandRouter).execute(VlocodeCommand.deployMetadata, document.uri, null, false);
    }
}
