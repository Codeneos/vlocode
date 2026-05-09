import * as vscode from 'vscode';
import { VlocodeActivity, VlocodeActivityStatus } from '../lib/vlocodeActivity';
import VlocodeService from '../lib/vlocodeService';
import { injectable } from '@vlocode/core';
import BaseDataProvider from './baseDataProvider';

/**
 * Provides a list of recently executed or executing activities 
 */
@injectable()
export default class ActivityDataProvider extends BaseDataProvider<VlocodeActivity> {

    private readonly propertyListeners = new Map<VlocodeActivity, vscode.Disposable>();

    constructor(service: VlocodeService) {
        super(service);
        this.vlocode.registerDisposable(this.vlocode.activities.onArrayChanged(event => {
            for (const removed of event.oldValues ?? []) {
                this.propertyListeners.get(removed)?.dispose();
                this.propertyListeners.delete(removed);
            }
            for (const added of event.newValues ?? []) {
                this.propertyListeners.set(added, added.onPropertyChanged(() => this.dataChangedEmitter.fire(added)));
            }
            this.dataChangedEmitter.fire(undefined);
        }));
        this.vlocode.registerDisposable({
            dispose: () => {
                for (const listener of this.propertyListeners.values()) {
                    listener.dispose();
                }
                this.propertyListeners.clear();
            }
        });
    }

    public toTreeItem(node: VlocodeActivity): vscode.TreeItem {
        return {
            label: this.getActivityLabel(node),
            contextValue: 'vlocode:activity',
            tooltip: node.title,
            iconPath: this.getItemIconPath(this.getIcon(node)),
            description: this.getActivityDetail(node),
            collapsibleState: vscode.TreeItemCollapsibleState.None
        };
    }

    public getIcon(node: VlocodeActivity): { light: string; dark: string } | string | undefined {
        switch (node.status) {
            case VlocodeActivityStatus.InProgress: return `$(loading~spin)`;
            case VlocodeActivityStatus.Completed: return `$(check)`;
            case VlocodeActivityStatus.Cancelled: return `$(close)`;
            case VlocodeActivityStatus.Failed: return `$(warning)`;
            default: return undefined;
        }
    }

    public getActivityDetail(node: VlocodeActivity): string {
        switch (node.status) {
            case VlocodeActivityStatus.InProgress: 
                return 'In progress';
            case VlocodeActivityStatus.Completed:
                if (node.executionTime) {
                    return `${VlocodeActivityStatus[node.status]} in ${(node.executionTime/1000).toFixed(2)}s`;
                }
            // eslint-disable-next-line no-fallthrough
            default: 
                return VlocodeActivityStatus[node.status];
        }
    }

    public getActivityLabel(node: VlocodeActivity): string {
        const labelValue = node.title.replace(/[.]+$/ig, '');
        if (node.status === VlocodeActivityStatus.Completed) {
            return labelValue.replace(/^([a-z]+)ing /ig, '$1ed ');
        }            
        return labelValue;
    }

    public getChildren(node?: VlocodeActivity): VlocodeActivity[] | undefined {
        if (!node) {
            return [...this.vlocode.activities].filter(a => !a.hidden).reverse();
        }
    }
}