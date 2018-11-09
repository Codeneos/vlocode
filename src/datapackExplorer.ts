import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as s from './singleton';
import VlocodeService from './services/vlocodeService';
import VlocityDatapackService, { ObjectEntry } from './services/vlocityDatapackService';
import SObjectRecord from './models/sobjectRecord';
import ExportDatapackCommand from './commands/exportDatapackCommand';
import CommandRouter from './services/commandRouter';

export class DatapackExplorer implements vscode.TreeDataProvider<DatapackNode> {

	private _onDidChangeTreeData: vscode.EventEmitter<DatapackNode | undefined> = new vscode.EventEmitter<DatapackNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatapackNode | undefined> = this._onDidChangeTreeData.event;

	constructor() {
		this.commands.registerAll({
			'vlocity.datapackExplorer.export': ExportDatapackCommand,
			'vlocity.datapackExplorer.refresh': () => this.refresh()
		});
	}

	protected get datapackService() : VlocityDatapackService {
        return this.vlocode.datapackService;
	}
	
	protected get vlocode() : VlocodeService {
        return s.get(VlocodeService);
	}
	
	protected get commands() : CommandRouter {
        return s.get(CommandRouter);
    }

	public refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	public getTreeItem(node: DatapackNode): vscode.TreeItem {
		return node.getTreeItem();
	}

	public async getChildren(node?: DatapackNode): Promise<DatapackNode[]> {
		if (!node) {
			return Object.keys(this.datapackService.queryDefinitions).map(
				option => {
					const queryDef = this.datapackService.queryDefinitions[option];
					return new DatapackCategoryNode(queryDef.VlocityDataPackType, queryDef.query);
				}
			);
		} else if (node instanceof DatapackCategoryNode) {			
			const connection = await this.datapackService.getJsForceConnection();
            const query = node.query.replace(/(%|)vlocity_namespace(%|)/gi, this.datapackService.vlocityNamespace);
			const results = await connection.queryAll<SObjectRecord>(query);
			return results.records.map(record => new DatapackObjectNode(record, node.datapackType));
		}
		return [];
	}
}

enum DatapackNodeType {
	Category = 'category',
	Object = 'object'
}

abstract class DatapackNode {	
	constructor(
		public readonly nodeType: DatapackNodeType,
		public expanable: Boolean = false,
		public icon: { light: string, dark: string } | string = undefined
	) { }

	protected abstract getItemLabel() : string;
	protected abstract getItemTooltip() : string;

	private getItemIconPath() : { light: string, dark: string } | string | undefined {
		if(!this.icon) {
			return undefined;
		}
		if (typeof this.icon === 'string') {
			return s.get(VlocodeService).getContext().asAbsolutePath(this.icon)
		}
		if (typeof this.icon === 'object') {
			return {
				light: s.get(VlocodeService).getContext().asAbsolutePath(this.icon.light),
				dark: s.get(VlocodeService).getContext().asAbsolutePath(this.icon.dark)
			};
		}
	}

	public getTreeItem(): vscode.TreeItem {
		return {
			label: this.getItemLabel(),
			tooltip: this.getItemTooltip(),
			iconPath: this.getItemIconPath(),
			contextValue: `vlocity:datapack:${this.nodeType}`,
			collapsibleState: this.expanable ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
		};
	}	
}

class DatapackCategoryNode extends DatapackNode {
	constructor(
		public datapackType: string,
		public query: string
	) {
		super(DatapackNodeType.Category, true);
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
		public record: SObjectRecord,
		public datapackType: string,
		public icon = {
			light: 'resources/light/datapack.svg',
			dark: 'resources/dark/datapack.svg'
		}
	) {
		super(DatapackNodeType.Object, false);
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