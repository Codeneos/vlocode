import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as constants from './constants';
import ServiceContainer from 'serviceContainer';
import VlocodeService from './services/vlocodeService';
import VlocityDatapackService, { ObjectEntry } from './services/vlocityDatapackService';
import SObjectRecord from './models/sobjectRecord';
import ExportDatapackCommand from './commands/exportDatapackCommand';
import CommandRouter from './services/commandRouter';
import { LogManager, Logger } from 'loggers';
import DatapackUtil from 'datapackUtil';
import { groupBy, evalExpr } from './util';

import * as exportQueryDefinitions from 'exportQueryDefinitions.yaml';
import { createRecordProxy } from 'salesforceUtil';

export default class DatapackExplorer implements vscode.TreeDataProvider<DatapackNode> {
	
	private _onDidChangeTreeData: vscode.EventEmitter<DatapackNode | undefined> = new vscode.EventEmitter<DatapackNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatapackNode | undefined> = this._onDidChangeTreeData.event;

	constructor(private readonly container: ServiceContainer) {
		this.commands.registerAll({
			'vlocity.datapackExplorer.export': ExportDatapackCommand,
			'vlocity.datapackExplorer.refresh': () => this.refresh()
		});
	}

	private get datapackService() : VlocityDatapackService {
        return this.vlocode.datapackService;
	}

	private get vlocityNamespace() : string { 		
		return this.datapackService.vlocityNamespace;
	}
	
	private get vlocode() : VlocodeService {
        return this.container.get(VlocodeService);
	}

	private get logger() : Logger {
        return LogManager.get(DatapackExplorer);
    }
	
	private get commands() : CommandRouter {
        return this.container.get(CommandRouter);
	}
	
	public getAbsolutePath(path: string) {
		return this.vlocode.getContext().asAbsolutePath(path);
	}

	public refresh(node?: DatapackNode): void {
		this._onDidChangeTreeData.fire(node);
	}

	public getTreeItem(node: DatapackNode): vscode.TreeItem {
		return node.getTreeItem();
	}

	public async getChildren(node?: DatapackNode): Promise<DatapackNode[]> {
		await this.vlocode.validateAll(true);
		
		if (!node) {
			return Object.keys(exportQueryDefinitions).map(
				dataPackType => new DatapackCategoryNode(this, dataPackType)
			);
		} else if (node instanceof DatapackCategoryNode) {			
			const records = await this.getExportableRecords(node.datapackType);

			// set node to not expand in case there are no results
			if (!records) {
				node.expandable = false;
				this.refresh(node);
				return [];
			}

			// group results?
			const nodeConfig = exportQueryDefinitions[node.datapackType];
			if (nodeConfig && nodeConfig.groupKey) {
				return this.createDatapackGroupNodes(records, node.datapackType, nodeConfig.groupKey);
			}
			return this.createDatapackObjectNodes(records, node.datapackType);

		} else if (node instanceof DatapackObjectGroupNode) {
			return this.createDatapackObjectNodes(node.records, node.datapackType);				
		}
	}

	private async getExportableRecords(datapackType: string) : Promise<SObjectRecord[]> {		
		const connection = await this.datapackService.getJsForceConnection();
		const query = this.getQuery(datapackType);

		this.logger.verbose(`Query: ${query}`);		
		const results = await connection.queryAll<SObjectRecord>(query);			
		this.logger.log(`Found ${results.totalSize} exportable datapacks form type ${datapackType}`);

		return results.totalSize == 0 ? null : results.records.map(createRecordProxy);
	}

	private getQuery(datapackType: string) {
		const queryString = this.datapackService.queryDefinitions[datapackType].query;
		return queryString.replace(constants.NAMESPACE_PLACEHOLDER, this.vlocityNamespace);
	}

	private createDatapackGroupNodes(records: SObjectRecord[], datapackType: string, groupByKey: string) : DatapackNode[] {
		const groupedRecords = groupBy(records, r => evalExpr(groupByKey, r));
		return Object.keys(groupedRecords).map(
			key => new DatapackObjectGroupNode(this, groupedRecords[key], datapackType)
		);
	}

	private createDatapackObjectNodes(records: SObjectRecord[], datapackType: string) : DatapackNode[] {
		return records.map(
			record => new DatapackObjectNode(this, record, datapackType)
		);
	}
}

enum DatapackNodeType {
	Category = 'category',
	Object = 'object',
	ObjectGroup = 'objectGroup'
}

abstract class DatapackNode {	
	constructor(
		private readonly explorer: DatapackExplorer,
		public readonly nodeType: DatapackNodeType,
		public expandable: Boolean = false,
		public icon: { light: string, dark: string } | string = undefined
	) { }

	protected abstract getItemLabel() : string;
	protected abstract getItemTooltip() : string;
	protected abstract getItemDescription() : string;

	private getItemIconPath() : { light: string, dark: string } | string | undefined {
		if(!this.icon) {
			return undefined;
		}
		if (typeof this.icon === 'string') {
			return this.explorer.getAbsolutePath(this.icon);
		}
		if (typeof this.icon === 'object') {
			return {
				light: this.explorer.getAbsolutePath(this.icon.light),
				dark: this.explorer.getAbsolutePath(this.icon.dark)
			};
		}
	}

	public getTreeItem(): vscode.TreeItem {
		return <vscode.TreeItem><any>{
			label: this.getItemLabel(),
			tooltip: this.getItemTooltip(),
			iconPath: this.getItemIconPath(),
			description: this.getItemDescription(),
			contextValue: `vlocity:datapack:${this.nodeType}`,
			collapsibleState: this.expandable ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
		};
	}	
}

class DatapackCategoryNode extends DatapackNode {
	constructor(
		explorer: DatapackExplorer,
		public datapackType: string
	) {
		super(explorer, DatapackNodeType.Category, true);
	}

	protected getItemLabel() {
		return this.datapackType;
	}

	protected getItemDescription() {
		return null;
	}

	protected getItemTooltip() {
		return `View datapacks of type ${this.datapackType}`;
	}
}

class DatapackObjectGroupNode extends DatapackNode  {
	constructor(
		explorer: DatapackExplorer,
		public records: SObjectRecord[],
		public datapackType: string,
		public icon = {
			light: 'resources/light/datapack.svg',
			dark: 'resources/dark/datapack.svg'
		}
	) {
		super(explorer, DatapackNodeType.ObjectGroup, true);
	}

	protected getItemLabel() {
		return evalExpr(this.getLabelFormat(), this.records[0]);
	}
	
	protected getItemDescription() {
		const nodeConfig = exportQueryDefinitions[this.datapackType];
		if (nodeConfig && nodeConfig.groupDescription) {
			return evalExpr(nodeConfig.groupDescription, { ...this.records[0], count: this.records.length });
		}
		return `${this.records.length} version(s)`;
	}

	private getLabelFormat() : string {
		const nodeConfig = exportQueryDefinitions[this.datapackType];
		if (nodeConfig && nodeConfig.groupName) {
			return nodeConfig.groupName;
		}
		return '\'<NO_GROUP_NAME>\' + Id';
	}

	protected getItemTooltip() {
		return `Found ${this.records.length} versions`;
	}
}

class DatapackObjectNode extends DatapackNode implements ObjectEntry {
	constructor(
		explorer: DatapackExplorer,
		public record: SObjectRecord,
		public datapackType: string,
		public icon = {
			light: 'resources/light/datapack.svg',
			dark: 'resources/dark/datapack.svg'
		}
	) {
		super(explorer, DatapackNodeType.Object, false);
	}

	protected getItemLabel() {
		const nodeConfig = exportQueryDefinitions[this.datapackType];		
		if (nodeConfig && nodeConfig.name) {
			return evalExpr(nodeConfig.name, this.record);
		}
		return  DatapackUtil.getLabel(this.record);
	}

	protected getItemDescription() {
		const nodeConfig = exportQueryDefinitions[this.datapackType];		
		if (nodeConfig && nodeConfig.description) {
			return evalExpr(nodeConfig.description, this.record);
		}
		return this.id;
	}

	protected getItemTooltip() {
		return this.record.attributes.url;
	}

	public get sobjectType(): string {
		return this.record.attributes.type;
	}

	public get id(): string {
		return this.record.Id;
	}

	public get name(): string {
		return this.record.Name;
	}
}