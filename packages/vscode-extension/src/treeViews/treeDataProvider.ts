import * as vscode from 'vscode';

import VlocodeService from '../lib/vlocodeService';
import { CommandFn } from '../lib/commandRouter';
import { VlocodeCommand } from '../constants';
import { TreeViewHost } from './treeViewHost';

/**
 * Base tree data provider
 */
export abstract class TreeDataProvider<T> implements vscode.TreeDataProvider<T> {

    protected readonly dataChangedEmitter = new vscode.EventEmitter<T | undefined>();

    
    public get onDidChangeTreeData(): vscode.Event<T | undefined> {
        return this.dataChangedEmitter.event;
    }

    constructor(protected readonly vlocode: VlocodeService) {
        this.vlocode.commands.registerAll(this.getCommands());
        this.initialize?.();
    }

    public createTreeViewHost(viewId: string): TreeViewHost<T> {
        return new TreeViewHost(viewId, this);
    }

    /**
     * Optional initiializer of the data-tree
     */
    protected initialize?(): any;

    protected executeCommand(commandName: VlocodeCommand, ... args: any[]) : Thenable<any>;
    protected executeCommand(commandName: string, ... args: any[]) : Thenable<any>;
    protected executeCommand(commandName: string | VlocodeCommand, ... args: any[]) : Thenable<any> {
        return this.vlocode.commands.execute(commandName, args);
    }

    public refresh(node?: T): void {
        this.dataChangedEmitter.fire(node);
    }

    protected getCommands(): { [name: string]: CommandFn } {
        return {};
    }

    public getTreeItem(node: T): vscode.TreeItem {
        return this.toTreeItem(node);
    }

    public abstract toTreeItem(node: T): vscode.TreeItem;

    public abstract getChildren(node?: T): Promise<T[] | undefined> | T[] | undefined;

}
