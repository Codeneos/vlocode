import * as vscode from 'vscode';
import * as constants from '@constants';
import { LogManager, Logger } from '@vlocode/core';
import DatapackUtil from 'lib/vlocity/datapackUtil';
import { evalExpr } from '@vlocode/util';
import { groupBy } from '@vlocode/util';

import * as exportQueryDefinitions from 'exportQueryDefinitions.yaml';
import { addFieldsToQuery, normalizeSalesforceName } from '@vlocode/util';
import { injectable } from '@vlocode/core';
import { container } from '@vlocode/core';
import DatapackInfoService from 'lib/vlocity/datapackInfoService';
import { DescribeGlobalSObjectResult } from 'jsforce';
import { TreeItemCollapsibleState } from 'vscode';
import OpenSalesforceCommand from '../commands/openSalesforceCommand';
import SObjectRecord from '../lib/salesforce/sobjectRecord';
import VlocityDatapackService, { ObjectEntry } from '../lib/vlocity/vlocityDatapackService';
import BaseDataProvider from './baseDataProvider';
import SalesforceService from 'lib/salesforce/salesforceService';

@injectable()
export default class DatapackDataProvider extends BaseDataProvider<DatapackNode> {

    private readonly supportSObjectExport = false;

    protected get logger() : Logger {
        return LogManager.get(DatapackDataProvider);
    }

    private async onExport(node: DatapackNode) {
        if (node.nodeType == DatapackNodeType.Category) {
            // Collect all exportable nodes
            const children = await this.vlocode.withStatusBarProgress('Loading exportable datapacks...', () => this.getChildren(node));

            const exportableNodes = children.map(node => {
                if (node instanceof DatapackObjectGroupNode) {
                    const record = node.records.slice(-1)[0];
                    return record && {
                        id: record.Id,
                        datapackType: node.datapackType,
                        sobjectType: record.attributes.type
                    } as ObjectEntry;
                }
                return node;
            }).filter(node => node !== undefined);

            return this.executeCommand(constants.VlocodeCommand.exportDatapack, ...exportableNodes);
        } else if (node.nodeType == DatapackNodeType.Object || node.nodeType == DatapackNodeType.SObjectRecord) {
            return this.executeCommand(constants.VlocodeCommand.exportDatapack, node);
        } else if (node.nodeType == DatapackNodeType.SObjectType && node instanceof DatapackSObjectTypeNode) {
            const children = await this.vlocode.withStatusBarProgress('Loading exportable SObjects...', () => this.getExportableSObjectRecords(node.sobjectType));
            return this.executeCommand(constants.VlocodeCommand.exportDatapack, ...children);
        }
    }

    protected getCommands() {
        return {
            'vlocode.datapackExplorer.export': async node => this.onExport(node),
            'vlocode.datapackExplorer.openSalesforce': OpenSalesforceCommand,
            'vlocode.datapackExplorer.refresh': () => this.refresh()
        };
    }

    private get datapackService() : VlocityDatapackService {
        return this.vlocode.datapackService;
    }

    private get salesforceService() : SalesforceService {
        return this.vlocode.salesforceService;
    }

    public toTreeItem(node: DatapackNode & TreeNode): vscode.TreeItem {
        return {
            id: node.getId(),
            label: node.getItemLabel(),
            tooltip: node.getItemTooltip?.(),
            iconPath: this.getItemIconPath(node.icon),
            description: node.getItemDescription?.(),
            contextValue: `vlocode:datapack:${node.nodeType}`,
            collapsibleState: typeof node.collapsibleState === 'boolean'
                ? (node.collapsibleState ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None)
                : node.collapsibleState
        };
    }

    public async getChildren(node?: DatapackNode): Promise<DatapackNode[]> {
        await this.vlocode.validateAll(true);
        const nodeSorter = (a: DatapackNode, b: DatapackNode) => a.getItemLabel().localeCompare(b.getItemLabel());
        try {
            const nodes = await this.getNodes(node);
            return nodes.sort(nodeSorter);
        } catch (err) {
            return [ new DatapackErrorNode(err.message) ];
        }
    }

    private async getNodes(node?: DatapackNode): Promise<DatapackNode[]> {
        if (!node) {
            return [
                new DatapackRootNode('Datapacks', 'Vlocity datapacks', TreeItemCollapsibleState.Expanded),
                new DatapackRootNode('SObjects', 'Generic SObjects', TreeItemCollapsibleState.Collapsed)
            ];
        }

        if (node instanceof DatapackRootNode) {
            if (node.label === 'Datapacks') {
                const datapacks = await container.get(DatapackInfoService).getDatapacks();
                return datapacks.map(info => new DatapackCategoryNode(info.datapackType));
            } else if (node.label === 'SObjects') {
                return this.getExportableSObjectTypes(await this.vlocode.salesforceService.schema.describeSObjects());
            }
        } else if (node instanceof DatapackCategoryNode) {
            return this.expandCategoryNode(node);
        } else if (node instanceof DatapackObjectGroupNode) {
            return this.createDatapackObjectNodes(node.records, node.datapackType);
        } else if (node instanceof DatapackSObjectTypeNode) {
            return this.getExportableSObjectRecords(node.sobjectType);
        }

        throw new Error(`Specified node type is neither a Category or Group node: ${node.getItemLabel()} (${node.nodeType})`);
    }

    private async expandCategoryNode(node: DatapackCategoryNode) {
        const records = await this.getExportableRecords(node.datapackType);

        // set node to not expand in case there are no results
        if (!records || !records.length) {
            return [ new DatapackTextNode('No datapacks available') ];
        }

        // group results?
        const queryDefinition = await this.datapackService.getQueryDefinition(node.datapackType);
        if (queryDefinition && queryDefinition.groupKey) {
            return this.createDatapackGroupNodes(records, node.datapackType, queryDefinition.groupKey);
        }
        return this.createDatapackObjectNodes(records, node.datapackType);
    }

    private async getExportableRecords(datapackType: string) : Promise<SObjectRecord[]> {
        const query = await this.getQuery(datapackType);
        const results = await this.vlocode.salesforceService.query<SObjectRecord>(query);
        this.logger.log(`Found ${results.length} exportable datapacks form type ${datapackType}`);
        return results;
    }

    private async getQuery(datapackType: string) {
        const queryDefinition = await this.datapackService.getQueryDefinition(datapackType);
        if (queryDefinition && queryDefinition.query) {
            return addFieldsToQuery(queryDefinition.query, 'Name');
        }

        const sobjectType = await container.get(DatapackInfoService).getSObjectType(datapackType);
        return `Select Id, Name from ${sobjectType}`;
    }

    private async getExportableSObjectTypes(records: DescribeGlobalSObjectResult[]) {
        const datapacks = (await container.get(DatapackInfoService).getDatapacks()).filter(dp => !!dp.sobjectType);
        const hasDatapack = (sobject: string) => datapacks.some(dp => normalizeSalesforceName(dp.sobjectType) === normalizeSalesforceName(sobject));
        const isExportable = (sobject: DescribeGlobalSObjectResult) => sobject.retrieveable && sobject.updateable && sobject.createable && !sobject.deprecatedAndHidden;
        const nonDatapackObjects = records.filter(record => isExportable(record) && !hasDatapack(record.name));
        return nonDatapackObjects.map(record => new DatapackSObjectTypeNode(record.name));
    }

    private async getExportableSObjectRecords(sobjectType: string) {
        // const nameFields = [ 'Name', 'FullName', 'DeveloperName' ];
        const { fields } = await this.salesforceService.schema.describeSObject(sobjectType);
        const nameField = fields.find(field => field.nameField)?.name || 'Id';
        const records = await this.salesforceService.lookup<SObjectRecord>(sobjectType, undefined, [ nameField ], 2000);
        return this.createDatapackObjectNodes(records, 'SObject');
    }

    private createDatapackGroupNodes(records: SObjectRecord[], datapackType: string, groupByKey: string) : DatapackNode[] {
        const groupedRecords = groupBy(records, r => evalExpr(groupByKey, r));
        return Object.keys(groupedRecords).map(
            key => new DatapackObjectGroupNode(groupedRecords[key], datapackType)
        );
    }

    private createDatapackObjectNodes(records: SObjectRecord[], datapackType: string) : DatapackNode[] {
        return records.map(
            record => new DatapackObjectNode(record, datapackType)
        );
    }
}

enum DatapackNodeType {
    Text = 'text',
    Root = 'root',
    Category = 'category',
    Object = 'object',
    ObjectGroup = 'objectGroup',
    SObjectType = 'sobjectType',
    SObjectRecord = 'sobject'
}

interface TreeNode {
    getId(): string;
    getItemLabel(): string;
    getItemTooltip?(): string | undefined;
    getItemDescription?(): string | undefined;
}

abstract class DatapackNode implements TreeNode {
    constructor(
        public readonly nodeType: DatapackNodeType,
        public collapsibleState: TreeItemCollapsibleState | boolean = false,
        public icon: { light: string; dark: string } | string | undefined = undefined,
    ) { }

    public abstract getId(): string;
    public abstract getItemLabel(): string;
}

class DatapackTextNode extends DatapackNode {
    constructor(public readonly text: string, public icon: { light: string; dark: string } | string | undefined = undefined) {
        super(DatapackNodeType.Text, false, icon);
    }

    public getId() {
        return this.getItemLabel();
    }

    public getItemLabel() {
        return this.text;
    }
}

class DatapackRootNode extends DatapackNode {
    constructor(
        public readonly label: string,
        private readonly desc: string,
        collapsibleState: TreeItemCollapsibleState,
        icon: { light: string; dark: string } | string | undefined = undefined) {
        super(DatapackNodeType.Root, collapsibleState, icon);
    }

    public getId = () => `root:${this.getItemLabel()}`;
    public getItemLabel = () => this.label;
    public getItemDescription = () => this.desc;
}

class DatapackErrorNode extends DatapackTextNode {
    constructor(text: string) {
        super(text, {
            light: 'resources/light/error.svg',
            dark: 'resources/dark/error.svg'
        });
    }
}

class DatapackCategoryNode extends DatapackNode {
    constructor(public datapackType: string) {
        super(DatapackNodeType.Category, true);
    }

    public getId = () => `${this.nodeType}:${this.getItemLabel()}`;
    public getItemLabel = () => this.datapackType;
    public getItemTooltip = () => `View datapacks of type ${this.datapackType}`;
}

class DatapackObjectGroupNode extends DatapackNode {
    constructor(public records: SObjectRecord[], public datapackType: string) {
        super(DatapackNodeType.ObjectGroup, true, {
            light: 'resources/light/package.svg',
            dark: 'resources/dark/package.svg'
        });
    }

    public getId = () => `${this.datapackType}-${this.getItemLabel()}`;

    public getItemLabel = () => evalExpr(this.getLabelFormat(), this.records[0]);

    public getItemTooltip = () => `Found ${this.records.length} versions`;

    public getItemDescription() {
        const nodeConfig = exportQueryDefinitions[this.datapackType];
        if (nodeConfig && nodeConfig.groupDescription) {
            return evalExpr(nodeConfig.groupDescription, { ...this.records[0], count: this.records.length });
        }
        return `${this.records.length} version(s)`;
    }

    public getLabelFormat() : string {
        const nodeConfig = exportQueryDefinitions[this.datapackType];
        if (nodeConfig && nodeConfig.groupName) {
            return nodeConfig.groupName;
        }
        return '\'<NO_GROUP_NAME>\' + Id';
    }
}

class DatapackSObjectTypeNode extends DatapackNode {
    constructor(public sobjectType: string) {
        super(DatapackNodeType.SObjectType, true);
    }

    public getId = () => `SObject_${this.sobjectType}`;
    public getItemLabel = () => this.sobjectType;
}

class DatapackObjectNode extends DatapackNode implements ObjectEntry {
    constructor(public record: SObjectRecord, public datapackType: string) {
        super(DatapackNodeType.Object, false, {
            light: 'resources/light/package.svg',
            dark: 'resources/dark/package.svg'
        });
    }

    public getId = () => this.id;

    public getItemLabel() {
        const nodeConfig = exportQueryDefinitions[this.datapackType];
        if (nodeConfig && nodeConfig.name) {
            return evalExpr(nodeConfig.name, this.record);
        }
        return  DatapackUtil.getLabel(this.record);
    }

    public getItemDescription() {
        const nodeConfig = exportQueryDefinitions[this.datapackType];
        if (nodeConfig && nodeConfig.description) {
            return evalExpr(nodeConfig.description, this.record);
        }
        return this.id;
    }

    public getItemTooltip = () => this.record.attributes?.url;

    public get sobjectType(): string {
        return this.record.attributes?.type;
    }

    public get id(): string {
        return this.record.Id;
    }

    public get name(): string {
        return this.record.Name ?? '<NO_NAME>';
    }
}