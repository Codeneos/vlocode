import * as vscode from 'vscode';
import MetadataCommand from './metadataCommand';

export default class ExecuteRestApiCommand extends MetadataCommand {
    public async execute() {
        let url = await vscode.window.showInputBox({ placeHolder: 'Enter the Salesforce API endpoint', ignoreFocusOut: true });
        if (!url) {
            return;
        }

        const method = await vscode.window.showQuickPick([ 'GET' ], { placeHolder: 'Select HTTP Method', ignoreFocusOut: true });
        if (!method) {
            return;
        }

        // transform into valid REST API
        if (!url.startsWith('/services')) {
            // assume APEX rest url when not prefixed with services
            url = `/services/apexrest/${url}`.replace(/[/]+/g, '/');
        }

        this.logger.info(`Invoking ${url} as ${method}`);
        const connection = await this.salesforce.getJsForceConnection();
        const response = await this.vlocode.withActivity({
            progressTitle: `${method} ${url}...`,
            location: vscode.ProgressLocation.Notification,
            cancellable: false
        }, () => connection.request({ method, url }));

        const responseDocument = await vscode.workspace.openTextDocument({ language: 'json', content: JSON.stringify(response, null, 4) });
        if (responseDocument) {
            void vscode.window.showTextDocument(responseDocument);
        }
    }
}