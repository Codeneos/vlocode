import * as vscode from 'vscode';

/**
 * Wrapper around vscode.QuickPick that allows for easier usage of advance quick pick menus without using 
 * the event based API of {@link vscode.QuickPick} created by the  {@link vscode.window.createQuickPick} method.
 * @template T Type of the quick pick items
 */
export class QuickPick<T extends vscode.QuickPickItem> implements vscode.Disposable {

    private readonly disposables: vscode.Disposable[];
    private readonly acceptPromise: Promise<readonly T[] | undefined>;
    private isVisisble = false;

    public get items() : readonly T[] {
        return this.quickPick.items;
    }

    /**
     * Create a new quick pick menu with the specified options. Uses the {@link vscode.window.createQuickPick} method to create the quick pick.
     *
     * For more information on the options, see {@link vscode.QuickPickOptions} and {@link vscode.QuickPickItem}.
     * For general details on the quick pick menu see {@link vscode.window.createQuickPick}
     *
     * @param items Items to show in the quick pick menu
     * @param options Options to configure the quick pick menu
     */
    public static create<T extends vscode.QuickPickItem>(items: readonly T[], options?: vscode.QuickPickOptions) : QuickPick<T> {
        const quickPick = vscode.window.createQuickPick<T>();
        quickPick.items = items;
        quickPick.ignoreFocusOut = options?.ignoreFocusOut ?? false;
        quickPick.placeholder = options?.placeHolder;
        quickPick.canSelectMany = options?.canPickMany ?? false;
        quickPick.title = options?.title;
        quickPick.matchOnDescription = options?.matchOnDescription ?? false;
        quickPick.matchOnDetail = options?.matchOnDetail ?? false;
        return new QuickPick(quickPick);
    }

    private constructor(private readonly quickPick: vscode.QuickPick<T>) {
        this.disposables = [ quickPick ];
        this.acceptPromise = new Promise(resolve => {
            this.disposables.unshift(quickPick.onDidAccept(() => {
                resolve(quickPick.selectedItems);
            }));
            this.disposables.unshift(quickPick.onDidHide(() => {
                this.dispose();
                resolve(undefined);
            }));
        });
    }

    public dispose(): void {
        for (const disposable of this.disposables.slice(0)) {
            disposable.dispose();
        }
        if (this.isVisisble) {
            this.quickPick.hide();
        }
    }

    /**
     * Add items to the quick pick menu. Items are appended to the end of the quick pick menu.
     * @param items Items to add to the quick pick menu.
     */
    public addItems(items: readonly T[]) : void {
        this.quickPick.items = [...this.quickPick.items, ...items];
    }

    /**
     * Remove items from the quick pick menu.
     * @param items Items to remove from the quick pick menu.
     */
    public removeItem(...items: readonly T[]) : void {
        this.quickPick.items = this.quickPick.items.filter(item => !items.includes(item));
    }

    /**
     * Remove items from the quick pick menu based on a predicate.
     * @param predicate Predicate that determines if an item should be removed from the quick pick menu.
     */
    public removeItems(predicate: (item: T) => boolean) : void {
        this.quickPick.items = this.quickPick.items.filter(item => !predicate(item));
    }

    /**
     * Promise that resolves when the user accepts a quick pick item. 
     * When the user cancels the quick pick, the value `undefined` is returned.
     * @returns Promise that resolves when the user accepts the quick pick. When the user cancels the quick pick, the value `undefined` is returned.
     */
    public onAccept(): Promise<T | undefined> {
        this.quickPick.canSelectMany = false;
        this.quickPick.show();
        this.isVisisble = true;
        return this.acceptPromise.then(items => items?.[0]);
    }

    /**
     * Allows the user to select multiple items from the quick pick.
     * @returns Promise that resolves when the user accepts the quick pick. When the user cancels the quick pick, the value `undefined` is returned.
     */
    public onAcceptMultiple(): Promise<readonly T[] | undefined> {
        this.quickPick.canSelectMany = true;
        this.quickPick.show();
        this.isVisisble = true;
        return this.acceptPromise;
    }

    public close(): void {
        this.dispose();
    }

    /**
     * Promise that resolves when the clicked on the button of a quick pick item.
     */
    public onTriggerItemButtom(fn: ((event: { button: vscode.QuickInputButton, item: T }) => any)) {
        this.disposables.unshift(this.quickPick.onDidTriggerItemButton(({ button, item }) => {
            fn({ button, item });
        }));
    }
}
