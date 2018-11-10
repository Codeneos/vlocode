import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ServiceConatiner from 'serviceContainer';
import VlocodeService from './services/vlocodeService';
import VlocityDatapackService, { ObjectEntry } from './services/vlocityDatapackService';
import SObjectRecord from './models/sobjectRecord';
import ExportDatapackCommand from './commands/exportDatapackCommand';
import CommandRouter from './services/commandRouter';
import { LogProvider, Logger } from 'loggers';

export default class DatapackExplorer implements vscode.TreeDataProvider<DatapackNode> {

	private _onDidChangeTreeData: vscode.EventEmitter<DatapackNode | undefined> = new vscode.EventEmitter<DatapackNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatapackNode | undefined> = this._onDidChangeTreeData.event;

	constructor(private readonly container: ServiceConatiner) {
		this.commands.registerAll({
			'vlocity.datapackExplorer.export': ExportDatapackCommand,
			'vlocity.datapackExplorer.refresh': () => this.refresh()
		});
	}

	protected get datapackService() : VlocityDatapackService {
        return this.vlocode.datapackService;
	}
	
	protected get vlocode() : VlocodeService {
        return this.container.get(VlocodeService);
	}

	protected get logger() : Logger {
        return LogProvider.get(DatapackExplorer);
    }
	
	protected get commands() : CommandRouter {
        return this.container.get(CommandRouter);
    }

	public refresh(node?: DatapackNode): void {
		this._onDidChangeTreeData.fire(node);
	}

	public getTreeItem(node: DatapackNode): vscode.TreeItem {
		return node.getTreeItem();
	}

	public async getChildren(node?: DatapackNode): Promise<DatapackNode[]> {
		if (!node) {
			return Object.keys(this.datapackService.queryDefinitions).map(
				option => {
					const queryDef = this.datapackService.queryDefinitions[option];
					return new DatapackCategoryNode(this.vlocode, queryDef.VlocityDataPackType, queryDef.query);
				}
			);
		} else if (node instanceof DatapackCategoryNode) {			
			const connection = await this.datapackService.getJsForceConnection();
			const query = node.query.replace(/(%|)vlocity_namespace(%|)/gi, this.datapackService.vlocityNamespace);
			
			this.logger.verbose(`Query: ${query}`);
			const results = await connection.queryAll<SObjectRecord>(query);			
			this.logger.log(`Found ${results.totalSize} exportable datapacks form type ${node.datapackType}`);

			// set node to not expand in case there are no results
			if(results.totalSize == 0) {
				node.expandable = false;
				this.refresh(node);
				return [];
			}
			return results.records.map(record => new DatapackObjectNode(this.vlocode, record, node.datapackType));
		}
	}
}

enum DatapackNodeType {
	Category = 'category',
	Object = 'object'
}

abstract class DatapackNode {	
	constructor(
		private readonly vlocode: VlocodeService,
		public readonly nodeType: DatapackNodeType,
		public expandable: Boolean = false,
		public icon: { light: string, dark: string } | string = undefined
	) { }

	protected abstract getItemLabel() : string;
	protected abstract getItemTooltip() : string;

	private getItemIconPath() : { light: string, dark: string } | string | undefined {
		if(!this.icon) {
			return undefined;
		}
		if (typeof this.icon === 'string') {
			return this.vlocode.getContext().asAbsolutePath(this.icon)
		}
		if (typeof this.icon === 'object') {
			return {
				light: this.vlocode.getContext().asAbsolutePath(this.icon.light),
				dark: this.vlocode.getContext().asAbsolutePath(this.icon.dark)
			};
		}
	}

	public getTreeItem(): vscode.TreeItem {
		return {
			label: this.getItemLabel(),
			tooltip: this.getItemTooltip(),
			iconPath: this.getItemIconPath(),
			contextValue: `vlocity:datapack:${this.nodeType}`,
			collapsibleState: this.expandable ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
		};
	}	
}

class DatapackCategoryNode extends DatapackNode {
	constructor(
		vlocode: VlocodeService,
		public datapackType: string,
		public query: string
	) {
		super(vlocode, DatapackNodeType.Category, true);
	}

	protected getItemLabel() {
		return this.datapackType;
	}

	protected getItemTooltip() {
		return `View datapacks of type ${this.datapackType}`;
	}
}

class DatapackObjectNode extends DatapackNode implements ObjectEntry {
	constructor(
		vlocode: VlocodeService,
		public record: SObjectRecord,
		public datapackType: string,
		public icon = {
			light: 'resources/light/datapack.svg',
			dark: 'resources/dark/datapack.svg'
		}
	) {
		super(vlocode, DatapackNodeType.Object, false);
	}

	protected getItemLabel() {
		return this.record.Name || this.record.Id;
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