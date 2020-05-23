import { EventHandlerBase } from 'events/eventHandlerBase';
import * as vscode from 'vscode';
import CommandRouter from 'lib/commandRouter';
import { VlocodeCommand } from '@constants';
import { isPartOfDatapack } from 'lib/vlocity/datapackUtil';
import { isSalesforceMetadataFile } from 'lib/util/salesforce';

export default class OnSavedEventHandler extends EventHandlerBase<vscode.TextDocument> {
    private readonly ignoredPaths = [
        '\.vscode',
        '\.sfdx',
        '\.git'
    ];

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
        return this.vloService.commands.execute(VlocodeCommand.deployDatapack, document.uri, null, false);
    }

    protected deployAsMetadata(document: vscode.TextDocument) : Promise<any> {
        if (!this.vloService.config.salesforce.enabled) {
            this.logger.warn('Skip deployment; enable Salesforce support in Vlocode configuration to deploy Salesforce metadata');
            return;
        }
        if (!this.vloService.config.salesforce.deployOnSave) {
            return;
        }
        this.logger.verbose(`Requesting metadata deploy for: ${document.uri.fsPath}`);
        return this.vloService.commands.execute(VlocodeCommand.deployMetadata, document.uri, null, false);
    }
}
