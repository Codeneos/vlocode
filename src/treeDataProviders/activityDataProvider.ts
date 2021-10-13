import * as vscode from 'vscode';
import { VlocodeActivity, VlocodeActivityStatus } from '@lib/vlocodeActivity';
import VlocodeService from '@lib/vlocodeService';
import { injectable } from '@vlocode/core';
import BaseDataProvider from './baseDataProvider';

/**
 * Provides a list of recently executed or executing activities 
 */
@injectable()
export default class ActivityDataProvider extends BaseDataProvider<VlocodeActivity> {

    constructor(service: VlocodeService) {
        super(service);
        this.vlocode.activities.onArrayChanged(event => {
            event.newValues?.map(v => v.onPropertyChanged(() => this.dataChangedEmitter.fire(v)));
            this.dataChangedEmitter.fire(undefined);
        });
    }

    public toTreeItem(node: VlocodeActivity): vscode.TreeItem {
        return {
            label: this.getActivityLabel(node),
            contextValue: 'vlocode:activity',
            tooltip: node.title,
            iconPath: this.getItemIconPath(this.getIcon(node)),
            description: this.getStatusLabel(node),
            collapsibleState: vscode.TreeItemCollapsibleState.None
        };
    }

    public getIcon(node: VlocodeActivity): { light: string; dark: string } | undefined {
        switch (node.status) {
            case VlocodeActivityStatus.InProgress: return {
                light: 'resources/light/loading.svg',
                dark: 'resources/dark/loading.svg'
            };
            case VlocodeActivityStatus.Completed: return {
                light: 'resources/light/checked.svg',
                dark: 'resources/dark/checked.svg'
            };
            case VlocodeActivityStatus.Cancelled: return {
                light: 'resources/light/error.svg',
                dark: 'resources/dark/error.svg'
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
        const labelValue = node.title.replace(/[.]+$/ig, '');
        return labelValue;
    }

    public getChildren(node?: VlocodeActivity): VlocodeActivity[] | undefined {
        if (!node) {
            return [...this.vlocode.activities].reverse();
        }
    }
}