import * as vscode from 'vscode';
import open from 'open';

import { deepClone } from '@vlocode/util';
import { ObjectEntry } from '../../lib/vlocity/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';
import { QueryBuilder } from '@vlocode/salesforce';
import { DatapackTypeDefinition, getDatapackTypeDefinition } from '@vlocode/vlocity';

@vscodeCommand(VlocodeCommand.openInSalesforce)
export default class OpenSalesforceCommand extends DatapackCommand {

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
            void vscode.window.showErrorMessage('Unable to resolve Salesforce id for the selected item; datapack might not be deployed on target org.');
            return;
        }
        
        const typeDefinition = getDatapackTypeDefinition(datapack);
        const selectedMatch = matchingRecords.length > 1 ? await this.showRecordSelection(matchingRecords, typeDefinition) : matchingRecords.pop();
        if (selectedMatch) {
            return this.openIdInSalesforce(selectedMatch.Id, datapack.datapackType, selectedMatch);
        }
    }

    protected async openObjectInSalesforce(obj: ObjectEntry) {
        const [ record ] = await this.datapackService.getDatapackRecords(obj);
        return this.openIdInSalesforce(obj.id ?? record.Id, obj.datapackType, record);
    }

    protected async openIdInSalesforce(objectId: string | undefined, datapackType: string, record?: any) {
        if (!objectId) {
            void vscode.window.showErrorMessage('Unable to resolve Salesforce id for the selected item; it might not be deployed on the connected org.');
            return;
        }

        // Build URL
        const sobjectInfo = await this.salesforce.schema.describeSObjectById(objectId);
        const typeDefinition = getDatapackTypeDefinition({ sobjectType: sobjectInfo.name, datapackType });
        let salesforceUrl: string;

        if (typeDefinition && typeDefinition.salesforceUrl) {
            const objectQuery = new QueryBuilder(deepClone(typeDefinition.source)).limit(1).where.equals('Id', objectId);
            const objectData = record ?? (await this.salesforce.query(objectQuery.toString()))[0];
            salesforceUrl = await this.getObjectUrl(objectData, typeDefinition);
        } else {
            salesforceUrl = await this.getObjectNativeUrl(objectId)
        }

        const url = await this.vlocode.salesforceService.getPageUrl(salesforceUrl, { useFrontdoor: true });
        this.logger.info(`Opening URL: ${salesforceUrl}`);
        void open(url);
    }

    protected async getObjectNativeUrl(objectId: string) {
        const objectInfo = await this.salesforce.schema.describeSObjectById(objectId);

        if (objectInfo.customSetting) {
            const apexPage = `/setup/ui/viewCustomSettingsData.apexp?appLayout=setup&id=${objectId}`;
            return `lightning/setup/CustomSettings/page?address=${encodeURIComponent(apexPage)}`;
        }

        return `lightning/r/${objectInfo.name}/${objectId}/view`;
    }

    private async getObjectUrl(record: object, typeDef: DatapackTypeDefinition) {
        if (!typeDef.salesforceUrl) {
            return this.getObjectNativeUrl(record['Id']);
        }
        if (typeof typeDef.salesforceUrl === 'object') {
            const options = Object.entries(typeDef.salesforceUrl)
                .map(([key, value]) => ({
                    label: key,
                    detail: value(record),
                }));
            const selected = await vscode.window.showQuickPick(options, { placeHolder: 'Select URL' });
            return selected?.detail ?? options[0].detail;
        }
        return typeDef.salesforceUrl(record);
    }
}