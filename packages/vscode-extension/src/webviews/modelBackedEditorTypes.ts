import * as vscode from 'vscode';

import type { ModelBackedDocument } from './modelBackedDocument';

/**
 * Extension-side data owned by a custom editor document.
 *
 * The webview can be disposed and recreated at any time; the provider keeps this
 * object as the durable editor state used for save, backup, revert, and sync.
 */
export interface ModelBackedDocumentData<TModel> {
    model: TModel;
    uri: vscode.Uri;
}

export interface EditorMessage<TModel> {
    type: string;
    model?: TModel;
    [key: string]: unknown;
}

export interface EditorView {
    resourceRoot: string;
    savedMessage: string;
    tagName: string;
    title: string;
}

export interface EditorMessageContext<TModel, TData extends ModelBackedDocumentData<TModel>> {
    document: ModelBackedDocument<TModel, TData>;
    message: EditorMessage<TModel>;
    panel: vscode.WebviewPanel;
}
