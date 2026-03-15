import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Reusable base class for VSCode webview panels with React UI support.
 * Manages the lifecycle of a webview panel and provides infrastructure
 * for bidirectional message passing between the extension and the React UI.
 *
 * @template TIncoming  Message type that the webview sends to the extension.
 * @template TOutgoing  Message type that the extension sends to the webview.
 */
export abstract class WebviewPanel<TIncoming, TOutgoing> {
    #panel: vscode.WebviewPanel | undefined;
    #disposables: vscode.Disposable[] = [];

    protected readonly logger = vscode.window.createOutputChannel(this.viewType);

    constructor(
        protected readonly context: vscode.ExtensionContext,
        protected readonly viewType: string,
        protected readonly title: string,
        protected readonly scriptPath: string,
        protected readonly viewColumn: vscode.ViewColumn = vscode.ViewColumn.One
    ) {}

    /**
     * Opens or reveals the webview panel.
     */
    public open(): void {
        if (this.#panel) {
            this.#panel.reveal(this.viewColumn);
            return;
        }

        this.#panel = vscode.window.createWebviewPanel(
            this.viewType,
            this.title,
            this.viewColumn,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(this.context.extensionPath, 'dist'))
                ]
            }
        );

        this.#panel.webview.html = this.buildHtml(this.#panel.webview);

        this.#panel.webview.onDidReceiveMessage(
            (message: TIncoming) => this.handleMessage(message),
            undefined,
            this.#disposables
        );

        this.#panel.onDidDispose(
            () => this.onDispose(),
            undefined,
            this.#disposables
        );

        this.#disposables.push(this.logger);
    }

    /**
     * Sends a message to the webview.
     */
    protected post(message: TOutgoing): void {
        if (this.#panel) {
            void this.#panel.webview.postMessage(message);
        }
    }

    /**
     * Updates the panel title.
     */
    protected setTitle(title: string): void {
        if (this.#panel) {
            this.#panel.title = title;
        }
    }

    /**
     * Returns true if the panel is currently visible.
     */
    public get isVisible(): boolean {
        return this.#panel?.visible ?? false;
    }

    /**
     * Disposes the webview panel and cleans up resources.
     */
    public dispose(): void {
        this.#panel?.dispose();
    }

    /**
     * Called when the panel is disposed. Subclasses may override to add cleanup logic.
     */
    protected onDispose(): void {
        this.#panel = undefined;
        for (const d of this.#disposables) {
            d.dispose();
        }
        this.#disposables = [];
    }

    /**
     * Handle a message received from the webview. Implemented by subclasses.
     */
    protected abstract handleMessage(message: TIncoming): void | Promise<void>;

    /**
     * Generates the HTML content for the webview, injecting the bundled React script.
     */
    private buildHtml(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.file(path.join(this.context.extensionPath, 'dist', this.scriptPath))
        );
        const nonce = this.generateNonce();

        return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none';
             style-src ${webview.cspSource} 'unsafe-inline';
             script-src 'nonce-${nonce}' ${webview.cspSource};
             font-src ${webview.cspSource};
             img-src ${webview.cspSource} data:;" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${this.escapeHtml(this.title)}</title>
  <style>
    html, body, #root {
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: var(--vscode-font-weight);
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }

    private generateNonce(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
