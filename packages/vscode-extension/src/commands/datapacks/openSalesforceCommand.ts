import * as vscode from 'vscode';
import open from 'open';

import { deepClone } from '@vlocode/util';
import { container } from '@vlocode/core';
import { ObjectEntry } from '../../lib/vlocity/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';
import { QueryBuilder } from '@vlocode/salesforce';
import { DatapackTypeDefinition, getDatapackTypeDefinition, SalesforceUrlOption, SalesforceUrlResolver, SalesforceUrlType, SalesforceUrlTypeLabels } from '@vlocode/vlocity';
import { OmniStudioDesignerService } from '../../lib/omnistudio/omniStudioDesignerService';

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
            const objectData = await this.getObjectData(objectId, typeDefinition, record);
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

    private async getObjectData(objectId: string, typeDefinition: DatapackTypeDefinition, record?: any) {
        let queriedRecord: any | undefined;

        try {
            const objectQuery = new QueryBuilder(await this.getObjectQuerySource(typeDefinition)).limit(1).where.equals('Id', objectId);
            queriedRecord = (await this.salesforce.data.query(objectQuery.toString()))[0];
        } catch (error) {
            this.logger.debug(`Unable to query datapack record ${objectId} before opening Salesforce URL`, error);
        }

        return { ...(record ?? {}), ...(queriedRecord ?? {}), Id: objectId };
    }

    private async getObjectQuerySource(typeDefinition: DatapackTypeDefinition) {
        const source = deepClone(typeDefinition.source);
        const standardDesignerField = 'IsManagedUsingStdDesigner';

        if (await this.salesforce.schema.describeSObjectField(source.sobjectType, standardDesignerField, false)) {
            source.fieldList = [...new Set([...(source.fieldList ?? []), standardDesignerField])];
        }

        return source;
    }

    private async getObjectUrl(record: object, typeDef: DatapackTypeDefinition) {
        if (!typeDef.salesforceUrl) {
            return this.getObjectNativeUrl(record['Id']);
        }
        if (typeof typeDef.salesforceUrl === 'object') {
            const options = (Object.entries(typeDef.salesforceUrl) as [SalesforceUrlType, SalesforceUrlResolver][])
                .map(([type, value]) => ({
                    type,
                    label: SalesforceUrlTypeLabels[type],
                    detail: value(record),
                }));
            if (options.length === 1) {
                return options[0].detail;
            }
            const preferred = await this.getPreferredOmniStudioDesignerUrl(record, typeDef, options);
            if (preferred) {
                return preferred.detail;
            }
            const selected = await vscode.window.showQuickPick(options, { placeHolder: 'Select URL' });
            return selected?.detail ?? options[0].detail;
        }
        return typeDef.salesforceUrl(record);
    }

    private async getPreferredOmniStudioDesignerUrl(record: object, typeDef: DatapackTypeDefinition, options: SalesforceUrlOption[]) {
        const designerService = container.get(OmniStudioDesignerService);
        if (!designerService.isOmniStudioDesignerDatapack(typeDef)) {
            return undefined;
        }

        const designerKind = await designerService.getPreferredDesigner(record, typeDef);
        const preferred = this.getDesignerUrlOption(designerKind, options);
        if (preferred) {
            this.logger.debug(`Selected ${preferred.label} for ${typeDef.datapackType}`);
        }
        return preferred;
    }

    private getDesignerUrlOption(designerKind: SalesforceUrlType, options: SalesforceUrlOption[]) {
        return options.find(option => option.type === designerKind);
    }
}
