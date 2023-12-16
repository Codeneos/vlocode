import * as vscode from 'vscode';

import VlocodeService from "../lib/vlocodeService";
import { container, injectable } from "@vlocode/core";

@injectable()
export class ExecuteApiLensProvider implements vscode.CodeLensProvider {

    private regex = /^(GET|POST|PUT|DELETE|PATCH) (.*)$/i

    public static register(service: VlocodeService) {
        const lens = container.get(ExecuteApiLensProvider);
        vscode.languages.registerCodeLensProvider({ pattern: '**/*.{api,http,sfhttp,sfapi}' }, lens);
        vscode.languages.registerCodeLensProvider({ language: 'sfhttp' }, lens);
    }

    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const match = line.text.match(this.regex);
            if (match) {
                return [
                    new vscode.CodeLens(line.range, {
                        title: `Execute as Salesforce API Request (${match[1].toLowerCase()})`,
                        tooltip: "Execute the API request described in this file on the selected Salesforce org",
                        command: "vlocode.api.execute",
                        arguments: [ document ]
                    })
                ];
            } else if (line.text) {
                break;
            }
        }
        return [];
    }
}