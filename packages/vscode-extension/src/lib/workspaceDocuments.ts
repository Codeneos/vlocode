import * as vscode from 'vscode';
import path from 'path';

/**
 * Utilities for open VS Code workspace text documents.
 *
 * The custom editors sync against open VS Code text documents, not only files on
 * disk, so all comparisons must use the same normalized absolute path.
 */
export namespace WorkspaceDocuments {

    export function normalizeFileName(fileName: string): string {
        return path.resolve(fileName).replace(/\\/g, '/');
    }

    export function findOpenDocument(uri: vscode.Uri): vscode.TextDocument | undefined {
        if (uri.scheme !== 'file') {
            return undefined;
        }
        const fileName = normalizeFileName(uri.fsPath);
        return vscode.workspace.textDocuments.find(document =>
            document.uri.scheme === 'file' && normalizeFileName(document.uri.fsPath) === fileName
        );
    }

    export function openDocumentTexts(): Map<string, string> {
        return new Map(vscode.workspace.textDocuments
            .filter(document => document.uri.scheme === 'file')
            .map(document => [normalizeFileName(document.uri.fsPath), document.getText()]));
    }

    export function sourceTextMap(entries: Iterable<readonly [string | vscode.Uri, string]>): Map<string, string> {
        return new Map([...entries].map(([fileName, text]) => [
            normalizeFileName(fileName instanceof vscode.Uri ? fileName.fsPath : fileName),
            text
        ]));
    }

    export function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
        return new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));
    }
}
