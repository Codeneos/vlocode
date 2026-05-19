import * as vscode from 'vscode';
import * as constants from '../../constants';
import * as path from 'path';
import { LogManager, injectable, container } from '@vlocode/core';
import { DatapackTypeDefinition } from '@vlocode/vlocity';
import { groupBy, lazy, pluralize, getErrorMessage } from '@vlocode/util';

import { TreeItemCollapsibleState } from 'vscode';
import { DatapackExportMode, ObjectEntry } from '../../lib/vlocity/vlocityDatapackService';
import { DescribeGlobalSObjectResult, QueryBuilder, SObjectRecord } from '@vlocode/salesforce';
import { randomUUID } from 'crypto';
import { DatapackDefinitionRegistry, DatapackDefinitionCollection } from '../../lib/vlocity/datapackDefinitionRegistry';
import { CustomExportDefinitionFiles } from '../../lib/vlocodeConfiguration';
import { TreeViewHost } from '../treeViewHost';
import { TreeDataProvider } from '../treeDataProvider';
import VlocodeService from '../../lib/vlocodeService';

@injectable()
export class DatapackDataProvider extends TreeDataProvider<DatapackNode> {

    private logger = lazy(() => LogManager.get(DatapackDataProvider));

    constructor(service: VlocodeService) {
        super(service);
    }

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
                        datapackType: node.datapackDefinition.datapackType,
                        sobjectType: record.attributes.type,
                        exportMode: node.exportMode,
                        exportDefinitionScope: node.exportDefinitionScope
                    } as ObjectEntry;
                }
                return node;
            }).filter(node => node !== undefined);

            return this.executeCommand(constants.VlocodeCommand.exportDatapack, ...exportableNodes);
        } else if (node.nodeType == DatapackNodeType.Object || node.nodeType == DatapackNodeType.SObjectRecord) {
            return this.executeCommand(constants.VlocodeCommand.exportDatapack, node);
        } else if (node instanceof DatapackSObjectTypeNode) {
            const children = await this.vlocode.withStatusBarProgress('Loading exportable SObjects...', () => this.getExportableSObjectRecords(node.sobjectType));
            return this.executeCommand(constants.VlocodeCommand.exportDatapack, ...children);
        }
    }

    private async onRefresh(): Promise<void> {
        try {
            await this.definitionRegistry.reload();
        } catch (err) {
            this.logger.error('Failed to refresh datapack definitions:', err);
        } finally {
            super.refresh();
        }
    }

    private async onAddCustomDefinitions(): Promise<void> {
        const firstWorkspace = vscode.workspace.workspaceFolders?.[0];
        const selectedFiles = await vscode.window.showOpenDialog({
            defaultUri: firstWorkspace?.uri,
            openLabel: 'Add custom export definitions',
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                'YAML files': [ 'yaml', 'yml' ],
                'All files': [ '*' ]
            }
        });

        if (!selectedFiles?.length) {
            return;
        }

        const selectedFile = this.toConfigPath(selectedFiles[0]);
        const defaultLabel = path.basename(selectedFiles[0].fsPath, path.extname(selectedFiles[0].fsPath));
        const rootLabel = await vscode.window.showInputBox({
            title: 'Custom datapack explorer node',
            prompt: 'Enter the Datapacks explorer root node label for this definition file',
            value: defaultLabel,
            validateInput: value => value.trim() ? undefined : 'A node label is required'
        });

        if (!rootLabel) {
            return;
        }

        const config = vscode.workspace.getConfiguration(constants.CONFIG_SECTION);
        const currentConfig = config.get<CustomExportDefinitionFiles>('customExportDefinitionFiles', {}) ?? {};
        const nodeLabel = rootLabel.trim();
        if (currentConfig[nodeLabel] === selectedFile) {
            void vscode.window.showInformationMessage('Selected custom export definition is already configured.');
            return;
        }

        await config.update(
            'customExportDefinitionFiles',
            {
                ...currentConfig,
                [nodeLabel]: selectedFile
            },
            vscode.workspace.workspaceFolders?.length ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global
        );
        this.onRefresh();

        void vscode.window.showInformationMessage(
            `Configured custom export definition node "${nodeLabel}".`
        );
    }

    private toConfigPath(file: vscode.Uri): string {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(file);
        if (!workspaceFolder) {
            return file.fsPath;
        }

        const relativePath = path.relative(workspaceFolder.uri.fsPath, file.fsPath);
        return relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)
            ? relativePath
            : file.fsPath;
    }

    protected getCommands() {
        return {
            'vlocode.datapackExplorer.export': node => this.onExport(node),
            'vlocode.datapackExplorer.openSalesforce': node => this.executeCommand(constants.VlocodeCommand.openInSalesforce, node),
            'vlocode.datapackExplorer.refresh': () => this.onRefresh(),
            'vlocode.datapackExplorer.addCustomDefinitions': () => this.onAddCustomDefinitions()
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
            iconPath: TreeViewHost.getItemIconPath(node.icon),
            description: typeof description === 'string' ? description : undefined,
            contextValue: `vlocode:datapack:${node.nodeType}`,
            collapsibleState: typeof node.collapsibleState === 'boolean'
                ? (node.collapsibleState ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None)
                : node.collapsibleState
        };
    }

    public async getChildren(node?: DatapackNode): Promise<DatapackNode[]> {
        if (!this.vlocode.sfdxUsername) {
            return [];
        }

        try {
            await this.vlocode.validateAll(true);
            const nodeSorter = (a: DatapackNode, b: DatapackNode) => a.getItemLabel().localeCompare(b.getItemLabel());
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
        } else if (node instanceof DatapackSObjectRootNode) {
            return this.getExportableSObjectTypes();
        } else if (node instanceof DatapackCategoryNode) {
            return this.expandCategoryNode(node);
        } else if (node instanceof DatapackObjectGroupNode) {
            return this.createDatapackObjectNodes(node.records, node.datapackDefinition);
        } else if (node instanceof DatapackSObjectTypeNode) {
            return this.getExportableSObjectRecords(node.sobjectType);
        }

        throw new Error(`Specified node type is neither a Category or Group node: ${node.getItemLabel()} (${node.nodeType})`);
    }

    private async getDatapackRootNodes(): Promise<DatapackNode[]> {
        const rootNodes = (await this.definitionRegistry.getDefinitionCollections())
            .map(root => new DatapackDefinitionRootNode(root));
        return [
            ...rootNodes,
            new DatapackSObjectRootNode()
        ];
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

    private async getExportableSObjectTypes() {
        const objects = await this.vlocode.salesforceService.schema.describeSObjects();
        const datapackObjects = await this.getDatapackSObjectTypes();
        const isExportable = (sobject: DescribeGlobalSObjectResult) =>
            sobject.retrieveable && sobject.updateable && sobject.createable && !sobject.deprecatedAndHidden;
        return objects
            .filter(object => isExportable(object) && !datapackObjects.has(object.name.toLowerCase()))
            .map(object => new DatapackSObjectTypeNode(object.name));
    }

    private async getDatapackSObjectTypes() {
        const collections = await this.definitionRegistry.getDefinitionCollections();
        return new Set(
            collections.flatMap(collection => collection.definitions)
                .map(definition => this.vlocode.salesforceService.updateNamespace(definition.source.sobjectType).toLowerCase())
        );
    }

    private async getExportableSObjectRecords(sobjectType: string) {
        const objectInfo = await this.vlocode.salesforceService.schema.describeSObject(sobjectType);
        const nameField = objectInfo.fields.find(field => field.nameField)?.name ?? 'Id';
        const records = await this.vlocode.salesforceService.lookup<SObjectRecord>(sobjectType, undefined, [ nameField ], 2000);
        return this.createDatapackObjectNodes(records, {
            typeLabel: objectInfo.label,
            datapackType: 'SObject',
            source: {
                sobjectType,
                fieldList: [ 'Id', nameField ]
            },
            displayName: nameField,
            exportMode: 'direct'
        }, DatapackNodeType.SObjectRecord);
    }


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

    private createDatapackObjectNodes(records: SObjectRecord[], datapackType: DatapackTypeDefinition, nodeType = DatapackNodeType.Object) : DatapackNode[] {
        return records.map(
            record => new DatapackObjectNode(record, datapackType, nodeType)
        );
    }
}

enum DatapackNodeType {
    Text = 'text',
    DefinitionRoot = 'definitionRoot',
    SObjectRoot = 'sobjectRoot',
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
    constructor(public readonly config: DatapackDefinitionCollection) {
        super(DatapackNodeType.DefinitionRoot, TreeItemCollapsibleState.Collapsed);
    }

    public get definitions() {
        return this.config.definitions;
    }

    public getId = () => `datapackRoot:${this.config.id}`;
    public getItemLabel = () => this.config.label;
    public getItemDescription = () => this.config.description;
}

class DatapackSObjectRootNode extends DatapackNode {
    constructor() {
        super(DatapackNodeType.SObjectRoot, TreeItemCollapsibleState.Collapsed);
    }

    public getId = () => 'datapackRoot:sobjects';
    public getItemLabel = () => 'SObjects';
    public getItemDescription = () => 'Generic SObjects';
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

    public getId = () => `${this.nodeType}:${this.rootId}:${this.datapackType}:${this.sobjectType}`;
    public getItemLabel = () => this.datapackDefinition.typeLabel;
    public getItemDescription = () => this.sobjectType.replace(constants.NAMESPACE_PLACEHOLDER_PATTERN, 'vlocity');
    public getItemTooltip = () => `View datapacks of type ${this.datapackDefinition.datapackType} (${this.sobjectType})`;
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

    public get exportMode(): DatapackExportMode | undefined {
        return this.datapackDefinition.exportMode;
    }

    public get exportDefinitionScope(): string | undefined {
        return this.datapackDefinition.scope;
    }

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

class DatapackSObjectTypeNode extends DatapackNode {
    constructor(public sobjectType: string) {
        super(DatapackNodeType.SObjectType, true);
    }

    public getId = () => `SObject:${this.sobjectType}`;
    public getItemLabel = () => this.sobjectType;
}

class DatapackObjectNode extends DatapackNode implements ObjectEntry {

    constructor(public record: SObjectRecord, public datapackDefinition: DatapackTypeDefinition, nodeType = DatapackNodeType.Object) {
        super(nodeType, false, {
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
        return this.datapackDefinition.datapackType;
    }

    public get exportMode(): DatapackExportMode | undefined {
        return this.datapackDefinition.exportMode;
    }

    public get exportDefinitionScope(): string | undefined {
        return this.datapackDefinition.scope;
    }

    public get id(): string {
        return this.record.Id ?? this.record.id;
    }

    public get name(): string {
        return this.record.name ?? this.record.title ?? '<NO_NAME>';
    }
}
