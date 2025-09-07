import * as vscode from 'vscode';

import { HttpMethod, HttpRequestInfo } from '@vlocode/salesforce';
import { Timer } from '@vlocode/util';

import { VlocodeCommand } from '../constants';
import { vscodeCommand } from '../lib/commandRouter';
import { ApiRequestDocumentParser } from '../lib/salesforce/apiRequestDocumentParser';
import MetadataCommand from './metadata/metadataCommand';
import { QuickPick } from '../lib/ui/quickPick';
import { container } from '@vlocode/core';
import { VirtualContentProvider } from 'contentProviders/virtualApexContentProvider';

@vscodeCommand(VlocodeCommand.execRestApi)
export default class ExecuteRestApiCommand extends MetadataCommand {

    private readonly httpMethodOptions: Array<{ label: string, method: HttpMethod, allowsBody?: boolean }> = [
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
            ...recent.map(r => ({ 
                label: `${r.method} ${r.url}`, 
                request: r,
                buttons: [
                    { iconPath: new vscode.ThemeIcon('trash'), tooltip: 'Delete request' },
                ]
            })),
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

        const quickPickMenu = QuickPick.create(options, {
            placeHolder: 'Select recent request',
            ignoreFocusOut: true
        });

        quickPickMenu.onTriggerItemButtom(async ({ item, button }) => {
            if (!(button.iconPath instanceof vscode.ThemeIcon)) {
                return;
            }
            if (button.iconPath?.id === 'trash') {
                this.context.recent.remove('apiRequests', item.request);
                quickPickMenu.removeItem(item);
                if (quickPickMenu.items.length === 3) {
                    quickPickMenu.close();
                }
            }
        });

        const selected = await quickPickMenu.onAccept();

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
        let response: unknown = undefined;
        try {
             await this.vlocode.withActivity({
                progressTitle: `${request.method} ${request.url}...`,
                location: vscode.ProgressLocation.Notification,
                cancellable: false,
                propagateExceptions: true
            }, async () => {
                const connection = await this.salesforce.getJsForceConnection();
                response = await connection.request(request);                
            });
        } catch (error) {
            void vscode.window.showErrorMessage(`API Request failed with error`);
            if (typeof error === 'object' && error && 'responseBody' in error) {
                response = error.responseBody;
            } else {
                response = error;
            }
        }
       
        this.logger.info(`${request.method} ${request.url} [${timer.stop()}]`);
        
        void container.get(VirtualContentProvider).showContent({
            title: `${request.method} ${request.url}`,
            ...this.createResonseDocument(response),
            preserveFocus: true,
            viewColumn: vscode.ViewColumn.Beside
        });
    }

    private createResonseDocument(responseBody: unknown): { content: string, language?: string } {
        if (typeof responseBody === 'string') {
            const trimmed = responseBody.trim();
            // Detect JSON
            if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                try {
                    const json = JSON.parse(trimmed);
                    return { content: JSON.stringify(json, null, 4), language: 'json' };
                } catch {
                    // Not valid JSON, fall through
                }
            }
            // Detect XML (very basic)
            if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
                // Optionally, pretty print XML (not implemented here)
                return { content: trimmed, language: 'xml' };
            }
            // Fallback: return as is
            return { content: trimmed };
        } else if (typeof responseBody === 'object' && responseBody !== null) {
            // If already parsed as object, pretty print as JSON
            return { content: JSON.stringify(responseBody, null, 4), language: 'json' };
        }
        return { content: responseBody ? String(responseBody) : 'No response body', language: 'plaintext' };
    }
}

