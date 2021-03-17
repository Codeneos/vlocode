import * as vscode from 'vscode';
import * as constants from '@constants';
import { LogManager, Logger } from 'lib/logging';
import DatapackUtil from 'lib/vlocity/datapackUtil';
import { evalExpr } from 'lib/util/string';
import { groupBy } from 'lib/util/collection';

import * as exportQueryDefinitions from 'exportQueryDefinitions.yaml';
import { addFieldsToQuery, normalizeSalesforceName } from 'lib/util/salesforce';
import { injectable } from 'lib/core/inject';
import { container } from 'lib/core/container';
import DatapackInfoService from 'lib/vlocity/datapackInfoService';
import { DescribeGlobalSObjectResult } from 'jsforce';
import { TreeItemCollapsibleState } from 'vscode';
import OpenSalesforceCommand from '../commands/openSalesforceCommand';
import SObjectRecord from '../lib/salesforce/sobjectRecord';
import VlocityDatapackService, { ObjectEntry } from '../lib/vlocity/vlocityDatapackService';
import BaseDataProvider from './baseDataProvider';

@injectable()
export default class DatapackDataProvider extends BaseDataProvider<DatapackNode> {

    private readonly supportSObjectExport = false;

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
        } else if (node.nodeType == DatapackNodeType.Object) {
            return this.executeCommand(constants.VlocodeCommand.exportDatapack, node);
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

    public toTreeItem(node: DatapackNode): vscode.TreeItem {
        return {
            id: node.getId(),
            label: node.getItemLabel(),
            tooltip: node.getItemTooltip(),
            iconPath: this.getItemIconPath(node.icon),
            description: node.getItemDescription(),
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
        } else if (node instanceof DatapackRootNode) {
            if (node.label === 'Datapacks') {
                const datapacks = await container.get(DatapackInfoService).getDatapacks();
                return datapacks.map(info => new DatapackCategoryNode(info.datapackType));
            } else if (node.label === 'SObjects') {
                return this.createSObjectNodes(await this.vlocode.salesforceService.schema.describeSObjects());
            }
        } else if (node instanceof DatapackCategoryNode) {
            return this.expandCategoryNode(node);
        } else if (node instanceof DatapackObjectGroupNode) {
            return this.createDatapackObjectNodes(node.records, node.datapackType);
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

    protected get logger() : Logger {
        return LogManager.get(DatapackDataProvider);
    }

    private async getQuery(datapackType: string) {
        const queryDefinition = await this.datapackService.getQueryDefinition(datapackType);
        if (queryDefinition && queryDefinition.query) {
            return addFieldsToQuery(queryDefinition.query, 'Name');
        }

        const sobjectType = await container.get(DatapackInfoService).getSObjectType(datapackType);
        return `Select Id, Name from ${sobjectType}`;
    }

    private async createSObjectNodes(records: DescribeGlobalSObjectResult[]) {
        const datapacks = (await container.get(DatapackInfoService).getDatapacks()).filter(dp => !!dp.sobjectType);
        const hasDatapack = (sobject: string) => datapacks.some(dp => normalizeSalesforceName(dp.sobjectType) === normalizeSalesforceName(sobject));
        const nonDatapackObjects = records.filter(record => !hasDatapack(record.name));
        return nonDatapackObjects.map(record => new DatapackTextNode(record.name));
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
    ObjectGroup = 'objectGroup'
}

abstract class DatapackNode {
    constructor(
        public readonly nodeType: DatapackNodeType,
        public collapsibleState: TreeItemCollapsibleState | boolean = false,
        public icon: { light: string; dark: string } | string | undefined = undefined,
    ) { }

    public abstract getId(): string;
    public abstract getItemLabel(): string;
    public abstract getItemTooltip(): string | undefined;
    public abstract getItemDescription(): string | undefined;
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

    public getItemDescription() {
        return undefined;
    }

    public getItemTooltip() {
        return undefined;
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

    public getId() {
        return `root:${this.getItemLabel()}`;
    }

    public getItemLabel() {
        return this.label;
    }

    public getItemDescription() {
        return this.desc;
    }

    public getItemTooltip() {
        return undefined;
    }
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

    public getId() {
        return `${this.nodeType}:${this.getItemLabel()}`;
    }

    public getItemLabel() {
        return this.datapackType;
    }

    public getItemDescription() {
        return undefined;
    }

    public getItemTooltip() {
        return `View datapacks of type ${this.datapackType}`;
    }
}

class DatapackObjectGroupNode extends DatapackNode {
    constructor(
        public records: SObjectRecord[],
        public datapackType: string,
        public icon = {
            light: 'resources/light/package.svg',
            dark: 'resources/dark/package.svg'
        }
    ) {
        super(DatapackNodeType.ObjectGroup, true);
    }

    public getId() {
        return `${this.datapackType}-${this.getItemLabel()}`;
    }

    public getItemLabel() {
        return evalExpr(this.getLabelFormat(), this.records[0]);
    }

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

    public getItemTooltip() {
        return `Found ${this.records.length} versions`;
    }
}

class DatapackObjectNode extends DatapackNode implements ObjectEntry {
    constructor(
        public record: SObjectRecord,
        public datapackType: string,
        public icon = {
            light: 'resources/light/package.svg',
            dark: 'resources/dark/package.svg'
        }
    ) {
        super(DatapackNodeType.Object, false);
    }

    public getId() {
        return this.id;
    }

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

    public getItemTooltip() {
        return this.record.attributes?.url;
    }

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