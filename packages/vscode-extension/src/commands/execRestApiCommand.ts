import { VlocodeCommand } from '@root/constants';
import { vscodeCommand } from '@root/lib/commandRouter';
import { HttpMethod } from '@vlocode/salesforce';
import { Timer } from '@vlocode/util';
import * as vscode from 'vscode';
import MetadataCommand from './metadata/metadataCommand';

@vscodeCommand(VlocodeCommand.execRestApi)
export default class ExecuteRestApiCommand extends MetadataCommand {
    public async execute() {
        let url = await vscode.window.showInputBox({ placeHolder: 'Enter the Salesforce API endpoint', ignoreFocusOut: true });
        if (!url) {
            return;
        }

        const method = await vscode.window.showQuickPick(
            [ 'GET', 'POST' ], 
            { placeHolder: 'Select HTTP Method', ignoreFocusOut: true }) as HttpMethod;
        if (!method) {
            return;
        }

        // transform into valid REST API
        if (!url.startsWith('/services')) {
            // assume APEX rest url when not prefixed with services
            url = `/services/apexrest/${url}`.replace(/[/]+/g, '/');
        }

        let body;
        if (method == 'POST') {
            body = await vscode.window.showInputBox({ placeHolder: 'Enter POST body', ignoreFocusOut: true });
            if (!body) {
                return;
            }
        }

        this.logger.info(`Invoking ${url} as ${method}`);
        const timer = new Timer();
        const connection = await this.salesforce.getJsForceConnection();
        const request = { method, url, body };
        const response = await this.vlocode.withActivity({
            progressTitle: `${method} ${url}...`,
            location: vscode.ProgressLocation.Notification,
            cancellable: false
        }, () => connection.request(request));
        this.logger.info(`${method} ${url} [${timer.stop()}]`);

        const responseDocument = await vscode.workspace.openTextDocument({ language: 'json', content: JSON.stringify(response, null, 4) });
        if (responseDocument) {
            void vscode.window.showTextDocument(responseDocument);
        }
    }
}