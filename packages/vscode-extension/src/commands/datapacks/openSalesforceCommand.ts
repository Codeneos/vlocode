import * as vscode from 'vscode';
import * as open from 'open';

import { evalExpr } from '@vlocode/util';
import { ObjectEntry } from '../../lib/vlocity/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';

@vscodeCommand(VlocodeCommand.openInSalesforce)
export default class OpenSalesforceCommand extends DatapackCommand {

    private readonly namespaceResolver = {
        'vlocity': () => this.datapackService.vlocityNamespace
    };

    public execute(...args: any[]): void | Promise<void> {
        return this.openInSalesforce(args[0] || this.currentOpenDocument);
    }

    protected openInSalesforce(input: vscode.Uri | ObjectEntry) {
        if (input instanceof vscode.Uri){
            return this.openFileInSalesforce(input);
        }
        return this.openObjectInSalesforce(input);
    }

    protected async openFileInSalesforce(selectedFile: vscode.Uri) {
        // Resolve datapack
        const datapack = (await this.loadDatapacks([ selectedFile ])).pop();
        if (!datapack) {
            throw new Error(`${selectedFile.fsPath} not part of datapack`);
        }

        const matchingRecords = await this.datapackService.getDatapackRecords(datapack);
        if (!matchingRecords.length) {
            void vscode.window.showErrorMessage('Unable to resolve Salesforce id for the selected item; it might not be deployed on the connected org.');
            return;
        }

        const selectedMatch = matchingRecords.length > 1 ? await this.showRecordSelection(matchingRecords, datapack.datapackType) : matchingRecords.pop();
        if (selectedMatch) {
            return this.openIdInSalesforce(selectedMatch.Id, datapack.datapackType);
        }
    }

    protected async openObjectInSalesforce(obj: ObjectEntry) {
        const salesforceId = obj.id || (await this.datapackService.getDatapackRecords(obj)).pop()?.Id;
        return this.openIdInSalesforce(salesforceId, obj.datapackType);
    }

    protected async openIdInSalesforce(objectId: string | undefined, datapackType: string, extraFields?: any) {
        if (!objectId) {
            void vscode.window.showErrorMessage('Unable to resolve Salesforce id for the selected item; it might not be deployed on the connected org.');
            return;
        }

        // Build URL
        const queryDefinition = await this.datapackService.getQueryDefinition(datapackType);
        let salesforceUrl = queryDefinition?.salesforceUrl || await this.getObjectNativeUrl(objectId);
        salesforceUrl = typeof salesforceUrl === 'string' ? { path: salesforceUrl } : salesforceUrl;

        const namespace = this.resolveNamespace(salesforceUrl.namespace);
        const salesforcePath = evalExpr(salesforceUrl.path, {...extraFields, id: objectId, type: datapackType, namespace });

        const url = await this.vlocode.salesforceService.getPageUrl(salesforcePath, { useFrontdoor: true });
        this.logger.info(`Opening URL: ${salesforcePath}`);
        // Do not use vscode.env.openExternal as it encodes params of the URI creating an invalid URI
        void open(url);
    }

    protected async getObjectNativeUrl(objectId: string) {
        const objectInfo = await this.salesforce.schema.describeSObjectById(objectId);

        if (objectInfo.customSetting) {
            const apexPage = `/setup/ui/viewCustomSettingsData.apexp?appLayout=setup&id=${objectId}`;
            return `'lightning/setup/CustomSettings/page?address=${encodeURIComponent(apexPage)}'`;
        }

        return `'lightning/r/${objectId}/view'`;
    }

    protected resolveNamespace(namespace: string | undefined) : string | undefined {
        if (namespace && this.namespaceResolver[namespace.toLowerCase()]) {
            return this.namespaceResolver[namespace.toLowerCase()]();
        } else if(namespace) {
            return namespace;
        }
    }
}