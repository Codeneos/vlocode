import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import ServiceContainer from 'serviceContainer';
import VlocodeService from './services/vlocodeService';
import CommandRouter from './services/commandRouter';
import { LogManager, Logger } from 'logging';
import * as yaml from 'js-yaml';
import VlocodeActivity, { VlocodeActivityStatus } from 'models/vlocodeActivity';
import * as observer from 'observer';

/**
 * Provides a list of recently executed or executing activities 
 */
export default class ActivityExplorer implements vscode.TreeDataProvider<VlocodeActivity> {
    
    private readonly dataChangedEmitter = new vscode.EventEmitter<VlocodeActivity | undefined>();

	get onDidChangeTreeData(): vscode.Event<VlocodeActivity | undefined> {
		return this.dataChangedEmitter.event;
    }
    
    constructor(private readonly container: ServiceContainer) {
        this.vlocode.activities.onArrayChanged(e => { 
            e.newValues?.map(v => v.onPropertyChanged(e => this.dataChangedEmitter.fire(v)));
            this.dataChangedEmitter.fire();
        });
    }    

    private get vlocode() : VlocodeService {
        return this.container.get(VlocodeService);
    }
    
    public getAbsolutePath(path: string) {
        return this.vlocode.asAbsolutePath(path);
    }

    public refresh(node?: VlocodeActivity): void {
        this.dataChangedEmitter.fire(node);
    }

    public getTreeItem(node: VlocodeActivity): vscode.TreeItem {
        return {
            label: this.getActivityLabel(node),
            contextValue: 'vlocity:activity',
            tooltip: node.title,
            //iconPath: null,
            description: this.getStatusLabel(node),
            collapsibleState: vscode.TreeItemCollapsibleState.None
        };
    }

    public getStatusLabel(node: VlocodeActivity): string {
        switch (node.status) {
            case VlocodeActivityStatus.InProgress: return 'In progress';
            default: return VlocodeActivityStatus[node.status];
        }
    }

    public getActivityLabel(node: VlocodeActivity): string {
        const labelValue = node.title.replace(/[\.]+$/ig, '');
        return labelValue;
    }

    public getChildren(node?: VlocodeActivity): VlocodeActivity[] | undefined {
        if (!node) {
            return [...this.vlocode.activities].reverse();
        }
    }

    private getItemIconPath(icon: { light: string, dark: string } | string) : { light: string, dark: string } | string | undefined {
        if(!icon) {
            return undefined;
        }
        if (typeof icon === 'string') {
            return this.getAbsolutePath(icon);
        }
        if (typeof icon === 'object') {
            return {
                light: this.getAbsolutePath(icon.light),
                dark: this.getAbsolutePath(icon.dark)
            };
        }
    }
}