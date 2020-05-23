import * as vscode from 'vscode';
import VlocodeService from 'lib/vlocodeService';
import { CommandCtor } from 'lib/commandRouter';
import { getContext } from 'lib/vlocodeContext';

/**
 * Base tree data provider
 */
export default abstract class BaseDataProvider<T> implements vscode.TreeDataProvider<T> {

    protected readonly dataChangedEmitter = new vscode.EventEmitter<T | undefined>();

    public get onDidChangeTreeData(): vscode.Event<T | undefined> {
        return this.dataChangedEmitter.event;
    }

    constructor(protected readonly vlocode: VlocodeService) {
        this.vlocode.commands.registerAll(this.getCommands());
    }

    protected getAbsolutePath(path: string) {
        return getContext().asAbsolutePath(path);
    }

    protected executeCommand(commandName: string, ... args: any[]) : Thenable<any> {
        return this.vlocode.commands.execute(commandName, ...args);
    }

    public refresh(node?: T): void {
        this.dataChangedEmitter.fire(node);
    }

    protected getCommands() : {
        [name: string]: ((...args: any[]) => void) | Promise<CommandCtor> | CommandCtor;
    } {
        return {};
    }

    public abstract getTreeItem(node: T): vscode.TreeItem;

    public abstract getChildren(node?: T): Promise<T[] | undefined> | T[] | undefined;

    protected getItemIconPath(icon: { light: string; dark: string } | string) : { light: string; dark: string } | string | undefined {
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