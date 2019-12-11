import * as vscode from 'vscode';
import ServiceContainer from 'serviceContainer';
import VlocodeActivity, { VlocodeActivityStatus } from 'models/vlocodeActivity';
import BaseDataProvider from './baseDataProvider';

/**
 * Provides a list of recently executed or executing activities 
 */
export default class ActivityDataProvider extends BaseDataProvider<VlocodeActivity> {
    
    constructor(container: ServiceContainer) {
        super(container);
        this.vlocode.activities.onArrayChanged(e => { 
            e.newValues?.map(v => v.onPropertyChanged(e => this.dataChangedEmitter.fire(v)));
            this.dataChangedEmitter.fire();
        });
    }

    public getTreeItem(node: VlocodeActivity): vscode.TreeItem {
        return {
            label: this.getActivityLabel(node),
            contextValue: 'vlocity:activity',
            tooltip: node.title,
            iconPath: this.getItemIconPath(this.getIcon(node)),
            description: this.getStatusLabel(node),
            collapsibleState: vscode.TreeItemCollapsibleState.None
        };
    }

    public getIcon(node: VlocodeActivity): { light: string, dark: string } {
        switch (node.status) {
            case VlocodeActivityStatus.InProgress: return {
                light: 'resources/light/loading.svg',
                dark: 'resources/dark/loading.svg'
            };
            case VlocodeActivityStatus.Completed: return {
                light: 'resources/light/check.svg',
                dark: 'resources/dark/check.svg'
            };
            case VlocodeActivityStatus.Cancelled: return {
                light: 'resources/light/close.svg',
                dark: 'resources/dark/close.svg'
            };
            case VlocodeActivityStatus.Failed: return {
                light: 'resources/light/warning.svg',
                dark: 'resources/dark/warning.svg'
            };
            default: return undefined;
        }
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
}