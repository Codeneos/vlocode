import * as vscode from 'vscode';
import VlocodeService from '../lib/vlocodeService';
import { CommandFn } from '../lib/commandRouter';
import { getContext } from '../lib/vlocodeContext';
import { VlocodeCommand } from '../constants';
import { randomUUID } from 'crypto';

/**
 * Base tree data provider
 */
export default abstract class BaseDataProvider<T> implements vscode.TreeDataProvider<T> {

    protected readonly dataChangedEmitter = new vscode.EventEmitter<T | undefined>();
    protected readonly clickHandlerGuid = randomUUID();

    public get onDidChangeTreeData(): vscode.Event<T | undefined> {
        return this.dataChangedEmitter.event;
    }

    constructor(protected readonly vlocode: VlocodeService) {
        this.vlocode.commands.registerAll(this.getCommands());
        if (this.onClick) {
            this.vlocode.commands.register(this.clickHandlerGuid, this.onClick.bind(this));
        }
        this.initialize?.();
    }

    /**
     * Optional initiializer of the data-tree
     */
    protected initialize?(): any;

    protected getAbsolutePath(path: string) {
        return getContext().asAbsolutePath(path);
    }

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

    /**
     * Override this method to handle click on items passd to the default click handler.
     * @param node Node that is clicked on
     */
    public onClick?(node: T) : any | Promise<any>;

    public getTreeItem(node: T): vscode.TreeItem {
        const item = this.toTreeItem(node);
        if (!item.command && this.onClick) {
            item.command = {
                title: 'Open',
                command: this.clickHandlerGuid,
                arguments: [ node ]
            };
        }
        return item;
    }

    public abstract toTreeItem(node: T): vscode.TreeItem;

    public abstract getChildren(node?: T): Promise<T[] | undefined> | T[] | undefined;

    protected getItemIconPath(icon: { light: string; dark: string }) : { light: vscode.Uri; dark: vscode.Uri };
    protected getItemIconPath(icon: string) : string | vscode.ThemeIcon;
    protected getItemIconPath(icon: undefined) : undefined;
    protected getItemIconPath(icon: { light: string; dark: string } | string | undefined) : { light: vscode.Uri; dark: vscode.Uri } | string | vscode.ThemeIcon | undefined;
    protected getItemIconPath(icon: { light: string; dark: string } | string | undefined) : { light: vscode.Uri; dark: vscode.Uri } | string | vscode.ThemeIcon | undefined {
        if (typeof icon === 'string') {
            const themeIconMatches = icon.match(/^\$\(([^ ]+)\)$/i);
            if (themeIconMatches) {
                return new vscode.ThemeIcon(themeIconMatches[1]);
            }
            return this.getAbsolutePath(icon);
        }
        if (typeof icon === 'object') {
            return {
                light: vscode.Uri.file(this.getAbsolutePath(icon.light)),
                dark: vscode.Uri.file(this.getAbsolutePath(icon.dark))
            };
        }
        return undefined;
    }
}