import { EventHandlerBase } from 'events/eventHandlerBase';
import * as vscode from 'vscode';
import { VlocodeCommand } from '@constants';
import { isPartOfDatapack } from 'lib/vlocity/datapackUtil';
import { container } from '@vlocode/core';
import { MetadataDetector } from 'lib/salesforce/metadataDetector';

export default class extends EventHandlerBase<vscode.TextDocument> {
    private readonly ignoredPaths = [
        '\\.vscode',
        '\\.sfdx',
        '\\.git'
    ];
    private readonly metadataDetector = container.get(MetadataDetector);

    public get enabled() : boolean {
        if (!this.vloService.config.sfdxUsername) {
            return false;
        }
        return this.vloService.config.deployOnSave ||
               this.vloService.config.salesforce?.deployOnSave;
    }

    protected async handleEvent(document: vscode.TextDocument): Promise<void> {
        if (!this.enabled) {
            return;
        }

        if (!vscode.workspace.getWorkspaceFolder(document.uri) ||
            this.ignoredPaths.some(path => new RegExp(path).test(document.fileName))) {
            this.logger.debug(`File not in workspace or in ignored directory: ${document.uri.fsPath}`);
            return; // ignore these
        }

        if (await this.vloService.salesforceService?.isProductionOrg()) {
            // Never auto deploy to production orgs
            return;
        }

        if (await isPartOfDatapack(document.fileName)) {
            return this.deployAsDatapack(document);
        } else if(this.isSalesforceMetadata(document.fileName)) {
            return this.deployAsMetadata(document);
        }
    }

    private isSalesforceMetadata(fileName: string) {
        if (this.metadataDetector.isMetadataFile(fileName)) {
            return true;
        }

        // check for Aura/LWC bundle
        const folderParts = fileName.split(/[\\/]+/g);
        if (folderParts.length > 3) {
            const bundleCollectionPath = folderParts.slice(-3).shift();
            if (bundleCollectionPath == 'lwc' || bundleCollectionPath == 'aura') {
                return true;
            }
        }
    }

    private deployAsDatapack(document: vscode.TextDocument) : Promise<any> {
        this.logger.verbose(`Requesting datapack deploy for: ${document.uri.fsPath}`);
        return this.vloService.commands.execute(VlocodeCommand.deployDatapack, document.uri, null, false);
    }

    private async deployAsMetadata(document: vscode.TextDocument) : Promise<void> {
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
