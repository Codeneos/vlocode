import * as vscode from 'vscode';
import { container, injectable } from '@vlocode/core';

@injectable.singleton()
export class VirtualContentProvider implements vscode.TextDocumentContentProvider {

    /**
     * The URI scheme used by the VirtualContentProvider to identify its content.
     */
    public static readonly scheme = 'vlocode';

    private contentStore = new Map<string, {
        content: string;
        language?: string;
    }>();

    public static register(service: { registerDisposable: (...disposable: vscode.Disposable[]) => void }) {
        const provider = container.get(VirtualContentProvider);
        service.registerDisposable(
            vscode.workspace.registerTextDocumentContentProvider(VirtualContentProvider.scheme, provider),
            vscode.workspace.onDidOpenTextDocument((document) => provider.onDidOpenTextDocument(document)),
        );
    }

    private onDidOpenTextDocument(document: vscode.TextDocument) {
        if (document.uri.scheme !== VirtualContentProvider.scheme) {
            return;
        }

        const contentDocument = this.contentStore.get(document.uri.toString());
        if (contentDocument) {
            void vscode.languages.setTextDocumentLanguage(document, contentDocument?.language || 'plaintext');
            this.removeContent(document.uri);
        }      
    }

    public provideTextDocumentContent(uri: vscode.Uri): string {
        const document = this.contentStore.get(uri.toString());
        return document ? document.content : `Failed to load: ${uri.toString()}`;
    }

    public async showContent(options: { title: string, content: string, language?: string } & vscode.TextDocumentShowOptions) {
        // use random UUID in URI to avoid conflicts
        const uri = this.addContent(options);
        const doc = await vscode.workspace.openTextDocument(uri);
        return vscode.window.showTextDocument(doc, options);
    }

    public addContent(document: { title: string, content: string, language?: string }) {
        // use random UUID in URI to avoid conflicts
        const uri = vscode.Uri.parse(`${VirtualContentProvider.scheme}://${crypto.randomUUID()}/${encodeURIComponent(document.title)}`);
        this.contentStore.set(uri.toString(), document);
        return uri;
    }

    public removeContent(uri: vscode.Uri) {
        this.contentStore.delete(uri.toString());
    }   
}
