import * as vscode from 'vscode';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

export class ReactPanel {
    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private disposables: vscode.Disposable[] = [];

    private componentProps: any;
    private filePath?: vscode.Uri;

    constructor(
        extensionUri: vscode.Uri, 
        viewType: string, 
        title: string, 
        filePath?: vscode.Uri, // Added filePath
        showOptions?: vscode.ViewColumn | { viewColumn: vscode.ViewColumn, preserveFocus?: boolean }, 
        options?: vscode.WebviewPanelOptions & vscode.WebviewOptions
    ) {
        this.extensionUri = extensionUri;
        this.filePath = filePath;
        this.panel = vscode.window.createWebviewPanel(
            viewType, 
            title, 
            showOptions || vscode.ViewColumn.One, 
            { 
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.extensionUri, 'out', 'webView'),
                    vscode.Uri.joinPath(this.extensionUri, 'resources') 
                ],
                ...options
            }
        );

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'saveScript':
                        if (this.filePath) {
                            try {
                                const dataBuffer = Buffer.from(message.data, 'utf8');
                                await vscode.workspace.fs.writeFile(this.filePath, dataBuffer);
                                this.panel.webview.postMessage({ command: 'saveComplete', message: 'OmniScript saved successfully!' });
                                vscode.window.showInformationMessage(`OmniScript saved to ${this.filePath.fsPath}`);
                            } catch (error) {
                                console.error('Error saving OmniScript:', error);
                                const errorMessage = error instanceof Error ? error.message : String(error);
                                this.panel.webview.postMessage({ command: 'saveError', message: `Error saving OmniScript: ${errorMessage}` });
                                vscode.window.showErrorMessage(`Error saving OmniScript: ${errorMessage}`);
                            }
                        } else {
                            this.panel.webview.postMessage({ command: 'saveError', message: 'File path not available. Cannot save.' });
                            vscode.window.showErrorMessage('File path not available. Cannot save OmniScript.');
                        }
                        return;
                }
            },
            null,
            this.disposables
        );
    }

    public show(component: React.ReactElement<any>, props?: any) {
        this.componentProps = props || {};
        this.panel.webview.html = this.getWebviewContent(component);
    }

    private getWebviewContent(component: React.ReactElement<any>): string {
        // Ensure the component is created with the latest props
        const componentWithProps = React.cloneElement(component, this.componentProps);
        const webViewSourcePath = vscode.Uri.joinPath(this.extensionUri, 'out', 'webView', 'webView.js');
        const webViewScript = this.panel.webview.asWebviewUri(webViewSourcePath);
        const nonce = getNonce();
        // Serialize props to pass to the main webView.js script
        const serializedProps = JSON.stringify(this.componentProps);
        const content = ReactDOMServer.renderToString(componentWithProps);


        return `
            <!DOCTYPE html>
            <html lang="en">            
            <head>
                <meta charset="UTF-8">
                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this.panel.webview.cspSource} https: data:; style-src ${this.panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
                <title>React Panel</title>
                <link href="${this.panel.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'src', 'lib', 'webviews', 'omniScriptEditor', 'omniScriptEditor.css'))}" rel="stylesheet">
            </head>
            <body>
                <div id="root">${content}</div>
                <script nonce="${nonce}">
                  window.vscodeApi = acquireVsCodeApi();
                  window.initialProps = ${serializedProps};
                </script>
                <script nonce="${nonce}" src="${webViewScript}"></script>
            </body>
            </html>
        `;
    }

    public get webview(): vscode.Webview {
        return this.panel.webview;
    }

    public dispose() {
        this.panel.dispose();
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
