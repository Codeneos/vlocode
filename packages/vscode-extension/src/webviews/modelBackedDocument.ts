import * as vscode from 'vscode';

import type { ModelBackedDocumentData } from './modelBackedEditorTypes';

const SourceSyncDebounceMs = 150;

/**
 * Custom document state shared by all webview panels for one resource.
 *
 * VS Code owns the editor panels; this object owns the durable model, dirty
 * state, source-file membership, and debounced sync timers. Keeping this state
 * outside the provider prevents the provider from becoming a bag of unrelated
 * mutable fields.
 */
export class ModelBackedDocument<TModel, TData extends ModelBackedDocumentData<TModel>> implements vscode.CustomDocument {
    public readonly webviews = new Set<vscode.Webview>();
    public readonly sourceFiles = new Set<string>();
    public hasUnsavedChanges = false;
    public applyingSourceSync = false;

    private sourceWriteTimer?: ReturnType<typeof setTimeout>;
    private sourceReloadTimer?: ReturnType<typeof setTimeout>;

    public constructor(
        public readonly uri: vscode.Uri,
        public data: TData,
        private readonly onDispose?: () => void
    ) {
    }

    public dispose(): void {
        this.cancelTimers();
        this.webviews.clear();
        this.onDispose?.();
    }

    /** Debounces designer-to-source writes so rapid form edits become one text edit. */
    public scheduleSourceWrite(sync: () => Promise<void>): void {
        this.sourceWriteTimer = this.schedule(this.sourceWriteTimer, () => {
            this.sourceWriteTimer = undefined;
            return sync();
        });
    }

    /** Debounces source-to-designer reloads while the user is typing in a text editor. */
    public scheduleSourceReload(reload: () => Promise<void>): void {
        this.sourceReloadTimer = this.schedule(this.sourceReloadTimer, () => {
            this.sourceReloadTimer = undefined;
            return reload();
        });
    }

    private schedule(timer: ReturnType<typeof setTimeout> | undefined, action: () => Promise<void>): ReturnType<typeof setTimeout> {
        if (timer) {
            clearTimeout(timer);
        }
        return setTimeout(() => {
            void action();
        }, SourceSyncDebounceMs);
    }

    private cancelTimers(): void {
        if (this.sourceWriteTimer) {
            clearTimeout(this.sourceWriteTimer);
            this.sourceWriteTimer = undefined;
        }
        if (this.sourceReloadTimer) {
            clearTimeout(this.sourceReloadTimer);
            this.sourceReloadTimer = undefined;
        }
    }
}
