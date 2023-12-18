import * as vscode from 'vscode';

import { HttpMethod, HttpRequestInfo } from '@vlocode/salesforce';
import { Timer } from '@vlocode/util';

import { VlocodeCommand } from '../constants';
import { vscodeCommand } from '../lib/commandRouter';
import { ApiRequestDocumentParser } from '../lib/salesforce/apiRequestDocumentParser';
import MetadataCommand from './metadata/metadataCommand';

@vscodeCommand(VlocodeCommand.execRestApi)
export default class ExecuteRestApiCommand extends MetadataCommand {

    private httpMethodOptions: Array<{ label: string, method: HttpMethod, allowsBody?: boolean }> = [
        { label: 'GET', method: 'GET' },
        { label: 'POST', method: 'POST', allowsBody: true },
        { label: 'PATCH', method: 'PATCH', allowsBody: true },
        { label: 'PUT', method: 'PUT', allowsBody: true },
        { label: 'DELETE', method: 'DELETE' }
    ];

    public async execute(args?: HttpRequestInfo | vscode.Uri) {
        if (args instanceof vscode.Uri) {
            const document = await vscode.workspace.openTextDocument(args);
            await this.executeRequestFromDocument(document);
        } else if (typeof args === 'object') {
            await this.executeRequest(args);
        } else {
            const request = await this.showRecentRequests() ?? await this.showRequestInput();
            request && await this.executeRequest(request);
        }
    }

    private async executeRequestFromDocument(document: vscode.TextDocument) {
        const request = await ApiRequestDocumentParser.parse(document);
        await this.executeRequest(request);
    }

    private async showRequestInput() : Promise<HttpRequestInfo | undefined> {
        const url = await vscode.window.showInputBox({ 
            placeHolder: 'Enter the relative Salesforce API endpoint URI',
            ignoreFocusOut: true
        });

        if (!url) {
            return;
        }

        const selectedMethod = await vscode.window.showQuickPick(
            this.httpMethodOptions,
            {
                placeHolder: 'Select HTTP Method',
                ignoreFocusOut: true
            }
        );

        if (!selectedMethod) {
            return;
        }

        const body = selectedMethod.allowsBody 
            ? await vscode.window.showInputBox({ 
                placeHolder: 'Enter POST body',
                ignoreFocusOut: true
            }) : undefined;

        return {
            url,
            method: selectedMethod.method,
            body
        };
    }

    private async showRecentRequests() : Promise<HttpRequestInfo | undefined> {
        const recent = this.context.recent.get<HttpRequestInfo>('apiRequests');
        if (!recent.length) {
            return;
        }

        const options = [
            ...recent.map(r => ({ label: `${r.method} ${r.url}`, request: r })),
            ...[{
                label: '',
                kind: vscode.QuickPickItemKind.Separator
            },{
                label: '$(add) New request',
                request: undefined
            },{
                label: '$(trashcan) Clear recent requests',
                action: 'clear'
            }]
        ];

        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select recent request',
            ignoreFocusOut: true
        });

        if (selected) {
            if ('request' in selected) {
                return selected.request;
            }

            if ('action' in selected && selected.action === 'clear') {
                this.context.recent.clear('apiRequests');
            }
        }
    }

    private async executeRequest(request: HttpRequestInfo) {
        // normalize request
        request.method = request.method.toUpperCase() as HttpMethod;
        if (!request.url.startsWith('/services')) {
            // assume APEX rest url when not prefixed with services
            request.url = `/services/apexrest/${request.url}`.replace(/[/]+/g, '/');
        }

        // add to recent requests
        this.context.recent.add('apiRequests', request, {
            equals: (a, b) => a.method === b.method && a.url === b.url
        });

        const timer = new Timer();
        const response = await this.vlocode.withActivity({
            progressTitle: `${request.method} ${request.url}...`,
            location: vscode.ProgressLocation.Notification,
            cancellable: false
        }, async () => {
            const connection = await this.salesforce.getJsForceConnection();
            return await connection.request(request);
        });
        this.logger.info(`${request.method} ${request.url} [${timer.stop()}]`);

        const responseDocument = await vscode.workspace.openTextDocument({
            language: 'json',
            content: JSON.stringify(response, null, 4)
        });

        if (responseDocument) {
            void vscode.window.showTextDocument(responseDocument, {
                preview: true,
                preserveFocus: true,
                viewColumn: vscode.ViewColumn.Beside
            });
        }
    }
}

