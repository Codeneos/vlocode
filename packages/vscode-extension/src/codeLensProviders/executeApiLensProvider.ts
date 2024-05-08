import * as vscode from 'vscode';

import VlocodeService from '../lib/vlocodeService';
import { container, injectable } from '@vlocode/core';
import { VlocodeCommand } from '../constants';

/**
 * Provides a code lens to execute the current file as a Salesforce API request
 * @example
 * ```http
 * GET /services/data/v50.0/sobjects HTTP/1.1
 *```
 */
@injectable()
export class ExecuteApiLensProvider implements vscode.CodeLensProvider {

    private readonly documentFilter : Array<vscode.DocumentFilter> = [
        { pattern: '**/*.{api,http,sfhttp,sfapi}' },
        { language: 'sfhttp' }
    ];

    private readonly regex = /^(GET|POST|PUT|DELETE|PATCH) (.*)$/i;

    public static register() {
        const lens = container.get(ExecuteApiLensProvider);
        vscode.languages.registerCodeLensProvider(lens.documentFilter, lens);
    }

    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const match = line.text.match(this.regex);
            if (match) {
                return [
                    new vscode.CodeLens(line.range, {
                        title: `Execute as Salesforce API Request (${match[1].toLowerCase()})`,
                        tooltip: 'Execute the API request described in this file on the selected Salesforce org',
                        command: VlocodeCommand.execRestApi,
                        arguments: [ document.uri ]
                    })
                ];
            } else if (line.text) {
                break;
            }
        }
        return [];
    }

    public resolveCodeLens(codeLens: vscode.CodeLens): vscode.CodeLens | undefined {
        return codeLens;
    }
}