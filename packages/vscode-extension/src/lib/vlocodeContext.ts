import * as path from 'path';
import type { ExtensionContext, Memento, ExtensionMode } from 'vscode';
import { singleton, getInstance } from '@vlocode/util';
import type VlocodeService from './vlocodeService';

/**
 * Minimal version of VScodes extension context.
 */
export class VlocodeContext {

    readonly recent: RecentItems;

    constructor(
        /**
		 * The absolute file path of the directory containing the extension.
		 */
        readonly extensionPath: string,
        /**
         * A memento object that stores state in the context
         * of the currently opened {@link workspace.workspaceFolders workspace}.
         */
        readonly workspaceState: Memento,
        /**
         * A memento object that stores state independent
         * of the current opened {@link workspace.workspaceFolders workspace}.
         */
        readonly globalState: Memento,
        /**
         * Primary service class
         */
        readonly service: VlocodeService,
        /**
         * The mode the extension is running in.
         */
        readonly mode: ExtensionMode
    ) {
        this.recent = new RecentItems(this.globalState)
    }


    /**
     * Get the absolute path of a resource contained in the extension.
     *
     * @param relativePath A relative path to a resource contained in the extension.
     * @return The absolute path of the resource.
     */
    public asAbsolutePath(relativePath: string): string {
        return path.join(this.extensionPath, relativePath);
    }
}

class RecentItems {

    private readonly recentsPrefix = 'recent:';

    constructor(private readonly globalState: Memento) {
    }

    /**
     * Get recent items for for the specified key. Recent items are stored in the global 
     * state and are sorted by most recent first. The maximum number of recent items is 10.
     * @param key Key to get recent items for
     * @returns List of recent items
     * @template T Type of the recent items
     * 
     * @example
     * ```typescript
     * const recentItems = context.getRecent<string>('myKey');
     * ```
     */
    public get<T>(key: string): T[] {
        return this.globalState.get<T[]>(`${this.recentsPrefix}:${key}`, []);
    }

    /**
     * Add an item to the recent items list for the specified key. Recent items are stored in the global
     * state and are sorted by most recent first. The maximum number of recent items is 10.
     * @param key Key to add the recent item to
     * @param item Item to add to the recent items list
     * @param options.maxItems Maximum number of recent items to store, defaults to 10 when not specified
     * @param options.equals Function to compare two items, when not specified the default matcher is used
     * @returns 
     */
    public add<T>(key: string, item: T, options?: { maxItems?: number, equals?: (item: T, other: T) => boolean }) {
        const currentValues = this.globalState.get<T[]>(`${this.recentsPrefix}:${key}`, []);
        const equals = options?.equals ?? ((a, b) => a === b);
        const newValues = [item, ...currentValues.filter(v => !equals(item, v))].slice(0, options?.maxItems ?? 10);
        this.globalState.update(`${this.recentsPrefix}:${key}`, newValues);
    }

    /**
     * Clear the recent items list for the specified key. When no key is specified all recent items
     * are cleared.
     * @param key Key to clear the recent items for
     */
    public clear<T>(key?: string) {
        if (key) {
            this.globalState.update(`${this.recentsPrefix}:${key}`, undefined);
        } else {
            for (const stateKey of this.globalState.keys()) {
                if (stateKey.startsWith(`${this.recentsPrefix}:`)) {
                    this.globalState.update(stateKey, undefined);
                }
            }
        }
    }

    /**
     * Remove an item from the recent items list for the specified key. When no key is specified all recent items
     * are cleared.
     * @param key Key to remove the recent item from
     * @param item Item to remove from the recent items list
     * @param options.equals Function to compare two items, when not specified the default matcher is used
     */
    public remove<T>(key: string, itemFn: T | ((item: T) => boolean)) {
        const predicate = typeof itemFn === 'function' ? itemFn as ((item: T) => boolean) : ((i: T) => i === itemFn);
        const currentValues = this.globalState.get<T[]>(`${this.recentsPrefix}:${key}`, []);
        const newValues = currentValues.filter(item => !predicate(item));
        this.globalState.update(`${this.recentsPrefix}:${key}`, newValues);
    }
}

/**
 * Get the currently initialized Vlocode context object
 */
export function getContext() {
    return getInstance(VlocodeContext);
}

/**
 * Create a VlocodeContext from an existing ExtensionContext object.
 * @param context VS Codes extension context
 */
export function initializeContext(context: ExtensionContext, service: VlocodeService) {
    return singleton(VlocodeContext,
        context.extensionPath,
        context.workspaceState,
        context.globalState,
        service,
        context.extensionMode
    );
}