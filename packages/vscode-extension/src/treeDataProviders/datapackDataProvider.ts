import * as vscode from 'vscode';
import * as constants from '../constants';
import { LogManager, injectable, container } from '@vlocode/core';
import { DatapackTypeDefinition } from '@vlocode/vlocity';
import { groupBy, lazy, pluralize, getErrorMessage } from '@vlocode/util';

import { TreeItemCollapsibleState } from 'vscode';
import { ObjectEntry } from '../lib/vlocity/vlocityDatapackService';
import BaseDataProvider from './baseDataProvider';
import { QueryBuilder, SObjectRecord } from '@vlocode/salesforce';
import { randomUUID } from 'crypto';
import { DatapackDefinitionRegistry, DatapackDefinitionRoot } from '../lib/vlocity/datapackDefinitionRegistry';

@injectable()
export default class DatapackDataProvider extends BaseDataProvider<DatapackNode> {

    private logger = lazy(() => LogManager.get(DatapackDataProvider));

    private get definitionRegistry(): DatapackDefinitionRegistry {
        return container.get(DatapackDefinitionRegistry);
    }

    protected initialize() {
        this.vlocode.onUsernameChanged(() => this.onRefresh());
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
                        datapackType: node.datapackDefinition.exportDefinition ?? node.datapackDefinition.datapackType,
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

    private onRefresh(): void {
        this.definitionRegistry.clearCaches();
        super.refresh();
    }

    protected getCommands() {
        return {
            'vlocode.datapackExplorer.export': node => this.onExport(node),
            'vlocode.datapackExplorer.openSalesforce': node => this.executeCommand(constants.VlocodeCommand.openInSalesforce, node),
            'vlocode.datapackExplorer.refresh': () => this.onRefresh()
        };
    }

    public toTreeItem(node: DatapackNode & TreeNode): vscode.TreeItem {
        const description = node.getItemDescription?.();
        const tooltip = node.getItemTooltip?.();
        const label = node.getItemLabel?.();

        return {
            id: node.getId(),
            label: typeof label === 'string' ? label : '<LABEL MISSING>',
            tooltip: typeof description === 'string' ? tooltip : undefined,
            iconPath: this.getItemIconPath(node.icon),
            description: typeof description === 'string' ? description : undefined,
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
            return node ? nodes.sort(nodeSorter) : nodes;
        } catch (err) {
            return [ new DatapackErrorNode(getErrorMessage(err)) ];
        }
    }

    private async getNodes(node?: DatapackNode): Promise<DatapackNode[]> {
        if (!node) {
            return this.getDatapackRootNodes();
        } else if (node instanceof DatapackDefinitionRootNode) {
            return node.definitions.map(info => new DatapackCategoryNode(node.config.id, info));
        } else if (node instanceof DatapackCategoryNode) {
            return this.expandCategoryNode(node);
        } else if (node instanceof DatapackObjectGroupNode) {
            return this.createDatapackObjectNodes(node.records, node.datapackDefinition);
        }

        throw new Error(`Specified node type is neither a Category or Group node: ${node.getItemLabel()} (${node.nodeType})`);
    }

    private async getDatapackRootNodes(): Promise<DatapackNode[]> {
        const rootNodes = (await this.definitionRegistry.getExplorerRoots())
            .map(root => new DatapackDefinitionRootNode(root));
        return rootNodes.length ? rootNodes : [ new DatapackTextNode('No datapack definitions available') ];
    }

    private async expandCategoryNode(node: DatapackCategoryNode) {
        const records = await this.getExportableRecords(node.datapackDefinition);

        // set node to not expand in case there are no results
        if (!records || !records.length) {
            return [ new DatapackTextNode('No datapacks available') ];
        }

        // group results?
        if (node.datapackDefinition.grouping) {
            return this.createDatapackGroupNodes(records, node.datapackDefinition);
        }
        return this.createDatapackObjectNodes(records, node.datapackDefinition);
    }

    private async getExportableRecords(datapackDefinition: DatapackTypeDefinition) : Promise<SObjectRecord[]> {
        const query = new QueryBuilder(datapackDefinition.source);
        const results = await this.vlocode.salesforceService.query<SObjectRecord>(query.getQuery());
        this.logger.log(`Found ${results.length} exportable datapacks form type ${datapackDefinition.datapackType}`);
        return results;
    }

    // private async getQuery(datapackType: string) {
    //     const queryDefinition = await this.datapackService.getQueryDefinition(datapackType);
    //     const query = queryDefinition?.query 
    //         ? QueryBuilder.parse(queryDefinition.query) 
    //         : new QueryBuilder(await this.datapackInfoService.getSObjectType(datapackType));

    //     if (!query.sobjectType) {
    //         throw new Error(`Unable to determine SObject type for datapack: ${datapackType}`);
    //     }

    //     const fields = await this.salesforceService.schema.getSObjectFields(query.sobjectType);
    //     const nameFields = Iterable.transform(fields.entries(), { 
    //         filter: ([,field]) => field.type === 'string' && /(Name|Title)(__c)?$/i,
    //         map: ([name]) => name
    //     });

    //     query.select('Id', ...nameFields);
    //     await query.validateFields(this.salesforceService.schema);
    //     return query;
    // }


    private createDatapackGroupNodes(records: SObjectRecord[], datapackType: DatapackTypeDefinition) : DatapackNode[] {
        const grouping = datapackType.grouping;
        if (!grouping) {
            return this.createDatapackObjectNodes(records, datapackType);
        }
        const groupedRecords = groupBy(records, r => grouping.fields.map(field => r[field]).join('/'));
        return Object.keys(groupedRecords).map(
            key => new DatapackObjectGroupNode(key, groupedRecords[key], datapackType)
        );
    }

    private createDatapackObjectNodes(records: SObjectRecord[], datapackType: DatapackTypeDefinition) : DatapackNode[] {
        return records.map(
            record => new DatapackObjectNode(record, datapackType)
        );
    }
}

enum DatapackNodeType {
    Text = 'text',
    DefinitionRoot = 'definitionRoot',
    Category = 'category',
    Object = 'object',
    ObjectGroup = 'objectGroup',
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
    private readonly uniqueId = randomUUID()

    constructor(public readonly text: string, public icon: { light: string; dark: string } | string | undefined = undefined) {
        super(DatapackNodeType.Text, false, icon);
    }

    public getId() {
        return this.uniqueId;
    }

    public getItemLabel() {
        return this.text;
    }
}

class DatapackDefinitionRootNode extends DatapackNode {
    constructor(public readonly config: DatapackDefinitionRoot) {
        super(DatapackNodeType.DefinitionRoot, TreeItemCollapsibleState.Collapsed);
    }

    public get definitions() {
        return this.config.definitions;
    }

    public getId = () => `datapackRoot:${this.config.id}`;
    public getItemLabel = () => this.config.label;
    public getItemDescription = () => this.config.description;
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
    constructor(private readonly rootId: string, public datapackDefinition: DatapackTypeDefinition) {
        super(DatapackNodeType.Category, true);
    }

    public get sobjectType() {
        return this.datapackDefinition.source.sobjectType;
    }

    public get datapackType() {
        return this.datapackDefinition.datapackType;
    }

    public get exportDefinition() {
        return this.datapackDefinition.exportDefinition ?? this.datapackType;
    }

    public getId = () => `${this.nodeType}:${this.rootId}:${this.datapackType}:${this.sobjectType}`;
    public getItemLabel = () => this.datapackDefinition.typeLabel;
    public getItemDescription = () => this.exportDefinition !== this.getItemLabel() ? this.exportDefinition : this.sobjectType;
    public getItemTooltip = () => `View datapacks of type ${this.exportDefinition} (${this.sobjectType})`;
}

class DatapackObjectGroupNode extends DatapackNode {
    constructor(public groupKey: string, public records: SObjectRecord[], public datapackDefinition: DatapackTypeDefinition,) {
        super(DatapackNodeType.ObjectGroup, true, {
            light: 'resources/light/package.svg',
            dark: 'resources/dark/package.svg'
        });
    }

    public getId = () => `${this.nodeType}:${this.datapackDefinition.typeLabel}:${this.groupKey}`;
    public getItemLabel = () => this.getLabelFormat() ?? this.groupKey;
    public getItemTooltip = () => `Found ${pluralize('record', this.records)}`;

    public getItemDescription() {
        return pluralize('version', this.records);
    }

    public getLabelFormat() {
        if (typeof this.datapackDefinition.grouping?.displayName === 'string') {
            return this.records[0][this.datapackDefinition.grouping.displayName];
        }
        return this.datapackDefinition.grouping?.displayName(this.records[0]);
    }
}

class DatapackObjectNode extends DatapackNode implements ObjectEntry {

    constructor(public record: SObjectRecord, public datapackDefinition: DatapackTypeDefinition) {
        super(DatapackNodeType.Object, false, {
            light: 'resources/light/package.svg',
            dark: 'resources/dark/package.svg'
        });
    }

    public getId = () => this.id;

    public getItemLabel() {
        if (typeof this.datapackDefinition.displayName === 'function') {
            return this.datapackDefinition.displayName(this.record);
        } 
        return this.record[this.datapackDefinition.displayName ?? 'Name'] ?? this.id;
    }

    public getItemDescription() {
        if (typeof this.datapackDefinition.description === 'function') {
            return this.datapackDefinition.description(this.record);
        } 
        return this.record[this.datapackDefinition.description ?? ''];
    }

    public getItemTooltip() {
        return this.record.attributes?.url;
    }

    public get sobjectType(): string {
        return this.record.attributes?.type;
    }

    public get datapackType(): string {
        return this.datapackDefinition.exportDefinition ?? this.datapackDefinition.datapackType;
    }

    public get id(): string {
        return this.record.id;
    }

    public get name(): string {
        return this.record.name ?? this.record.title ?? '<NO_NAME>';
    }
}
