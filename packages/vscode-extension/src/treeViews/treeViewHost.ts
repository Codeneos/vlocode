// Combines TreeView and DataProvider in a registerable component making
// it easier to manage and dispose and control tree view behavior in one place.
import * as vscode from 'vscode';
import { randomUUID } from 'crypto';
import { getContext } from '../lib/vlocodeContext';

export interface TreeViewHostOptions<T> extends Omit<vscode.TreeViewOptions<T>, 'treeDataProvider'> {
    onDidChangeVisibility?: (event: vscode.TreeViewVisibilityChangeEvent) => unknown;
    checkbox?: {
        isEnabled: (item: T) => boolean;
        itemId: (item: T) => string;
        tooltip?: string;
        checkedContext?: string;
    };
}

export interface ClickableTreeDataProvider<T> {
    onClick?(item: T): any | Promise<any>;
}

export class TreeViewHost<T> implements vscode.TreeDataProvider<T>, vscode.Disposable {

    private treeView?: vscode.TreeView<T>;
    private readonly clickCommandId = randomUUID();
    private readonly checkedItems = new Map<string, T>();
    private readonly subscriptions: vscode.Disposable[] = [];
    private readonly dataChangedEmitter = new vscode.EventEmitter<void | T | T[] | null | undefined>();

    public readonly onDidChangeTreeData = this.dataChangedEmitter.event;

    constructor(
        private readonly viewId: string, 
        private readonly treeDataProvider: vscode.TreeDataProvider<T>,
        private readonly options: TreeViewHostOptions<T> = {}
    ) {
        if (this.treeDataProvider.onDidChangeTreeData) {
            this.subscriptions.push(this.treeDataProvider.onDidChangeTreeData(item => this.dataChangedEmitter.fire(item)));
        }
        if (this.clickProvider.onClick) {
            this.subscriptions.push(vscode.commands.registerCommand(this.clickCommandId, item => this.clickProvider.onClick?.(item)));
        }
    }

    public dispose() {
        this.subscriptions.forEach(subscription => subscription.dispose());
        this.subscriptions.length = 0;
        this.dataChangedEmitter.dispose();
        this.treeView?.dispose();
        if (this.treeDataProvider && 'dispose' in this.treeDataProvider) {
            (this.treeDataProvider as vscode.Disposable).dispose();
        }
    }

    public register(window: typeof vscode.window): this {
        if (!this.treeDataProvider) {
            throw new Error('TreeDataProvider is not set');
        }
        const { checkbox, onDidChangeVisibility, ...treeViewOptions } = this.options;

        this.treeView = window.createTreeView(this.viewId, {
            ...treeViewOptions,
            treeDataProvider: this,
            showCollapseAll: treeViewOptions.showCollapseAll ?? true
        });

        if (checkbox) {
            this.subscriptions.push(this.treeView.onDidChangeCheckboxState(event => this.onDidChangeCheckboxState(event)));
            this.updateCheckedContext();
        }
        if (onDidChangeVisibility) {
            this.subscriptions.push(this.treeView.onDidChangeVisibility(onDidChangeVisibility));
        }

        return this;
    }

    public onDidChangeVisibility(listener: (event: vscode.TreeViewVisibilityChangeEvent) => unknown): vscode.Disposable {
        if (!this.treeView) {
            throw new Error(`TreeView ${this.viewId} has not been registered`);
        }
        const subscription = this.treeView.onDidChangeVisibility(listener);
        this.subscriptions.push(subscription);
        return subscription;
    }

    public getTreeItem(element: T): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const treeItem = this.treeDataProvider.getTreeItem(element);
        return this.isThenable(treeItem)
            ? treeItem.then(item => this.withTreeViewState(element, item))
            : this.withTreeViewState(element, treeItem);
    }

    public getChildren(element?: T): vscode.ProviderResult<T[]> {
        return this.treeDataProvider.getChildren(element);
    }

    public getParent?(element: T): vscode.ProviderResult<T> {
        return this.treeDataProvider.getParent?.(element);
    }

    public getCheckedItems(filter?: (item: T) => boolean): T[] {
        const items = [ ...this.checkedItems.values() ];
        return filter ? items.filter(filter) : items;
    }

    public getCommandItems(item?: T, selectedItems?: readonly T[], filter?: (item: T) => boolean): T[] {
        const isIncluded = (candidate: T | undefined): candidate is T => !!candidate && (filter?.(candidate) ?? true);
        const activeSelection = selectedItems ?? this.treeView?.selection ?? [];
        const exportableSelection = activeSelection.filter(isIncluded);

        if (item) {
            return exportableSelection.some(selectedItem => this.isSameItem(selectedItem, item))
                ? exportableSelection
                : (isIncluded(item) ? [ item ] : []);
        }

        const checkedItems = this.getCheckedItems(filter);
        return checkedItems.length ? checkedItems : exportableSelection;
    }

    public clearCheckedItems(): void {
        if (!this.checkedItems.size) {
            return;
        }
        this.checkedItems.clear();
        this.updateCheckedContext();
        this.dataChangedEmitter.fire(undefined);
    }

    public static getItemIconPath(icon: { light: string; dark: string }) : { light: vscode.Uri; dark: vscode.Uri };
    public static getItemIconPath(icon: string) : string | vscode.ThemeIcon;
    public static getItemIconPath(icon: undefined) : undefined;
    public static getItemIconPath(icon: { light: string; dark: string } | string | undefined) : { light: vscode.Uri; dark: vscode.Uri } | string | vscode.ThemeIcon | undefined;
    public static getItemIconPath(icon: { light: string; dark: string } | string | undefined) : { light: vscode.Uri; dark: vscode.Uri } | string | vscode.ThemeIcon | undefined {
        if (typeof icon === 'string') {
            const themeIconMatches = icon.match(/^\$\(([^ ]+)\)$/i);
            if (themeIconMatches) {
                return new vscode.ThemeIcon(themeIconMatches[1]);
            }
            return getContext().asAbsolutePath(icon);
        }
        if (typeof icon === 'object') {
            return {
                light: vscode.Uri.file(getContext().asAbsolutePath(icon.light)),
                dark: vscode.Uri.file(getContext().asAbsolutePath(icon.dark))
            };
        }
        return undefined;
    }

    private withTreeViewState(element: T, treeItem: vscode.TreeItem): vscode.TreeItem {
        this.withDefaultClickCommand(element, treeItem);
        this.withCheckboxState(element, treeItem);
        return treeItem;
    }

    private withDefaultClickCommand(element: T, treeItem: vscode.TreeItem): vscode.TreeItem {
        if (!treeItem.command && this.clickProvider.onClick) {
            treeItem.command = {
                title: 'Open',
                command: this.clickCommandId,
                arguments: [ element ]
            };
        }

        return treeItem;
    }

    private withCheckboxState(element: T, treeItem: vscode.TreeItem): vscode.TreeItem {
        if (!this.options.checkbox?.isEnabled(element)) {
            return treeItem;
        }

        const itemId = this.options.checkbox.itemId(element);
        const isChecked = this.checkedItems.has(itemId);
        if (isChecked) {
            this.checkedItems.set(itemId, element);
        }

        treeItem.checkboxState = {
            state: isChecked
                ? vscode.TreeItemCheckboxState.Checked
                : vscode.TreeItemCheckboxState.Unchecked,
            tooltip: this.options.checkbox.tooltip
        };

        return treeItem;
    }

    private onDidChangeCheckboxState(event: vscode.TreeCheckboxChangeEvent<T>): void {
        const checkbox = this.options.checkbox;
        if (!checkbox) {
            return;
        }

        for (const [ item, state ] of event.items) {
            if (!checkbox.isEnabled(item)) {
                continue;
            }
            if (state === vscode.TreeItemCheckboxState.Checked) {
                this.checkedItems.set(checkbox.itemId(item), item);
            } else {
                this.checkedItems.delete(checkbox.itemId(item));
            }
            this.dataChangedEmitter.fire(item);
        }

        this.updateCheckedContext();
    }

    private updateCheckedContext(): void {
        const context = this.options.checkbox?.checkedContext;
        if (context) {
            void vscode.commands.executeCommand('setContext', context, this.checkedItems.size > 0);
        }
    }

    private isSameItem(left: T, right: T): boolean {
        const checkbox = this.options.checkbox;
        return checkbox
            ? checkbox.itemId(left) === checkbox.itemId(right)
            : left === right;
    }

    private isThenable<TValue>(value: TValue | Thenable<TValue>): value is Thenable<TValue> {
        return typeof value === 'object' && value !== null && 'then' in value && typeof value.then === 'function';
    }

    private get clickProvider(): ClickableTreeDataProvider<T> {
        return this.treeDataProvider as ClickableTreeDataProvider<T>;
    }
}
