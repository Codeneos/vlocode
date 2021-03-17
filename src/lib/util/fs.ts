import * as path from 'path';
import * as fs from 'fs-extra';
import type { Uri } from 'vscode';

// Import vscode as optional module, only load it when available
const vscode = import('vscode').catch(e => null);

/**
 * Get the body of a document as string
 * @param file file name
 */
export async function getDocumentBodyAsString(file: string | Uri, encoding: BufferEncoding = 'utf-8') : Promise<string> {
    return (await getDocumentBody(file)).toString(encoding);
}

/**
 * Get the body of a document as Buffer
 * @param file file name
 */
export async function getDocumentBody(file: string | Uri) : Promise<Buffer> {
    const fileName = typeof file === 'string' ? file : file.fsPath;
    const vscodeRef = await vscode;
    if (vscodeRef) {
        const doc = vscodeRef?.workspace.textDocuments.find(doc => doc.fileName == fileName);
        if (doc && doc.isDirty) {
            return Buffer.from(doc.getText());
        }
        return Buffer.from(await vscodeRef?.workspace.fs.readFile(vscodeRef.Uri.file(fileName)));
    }
    return fs.readFile(fileName);
}

export function sanitizePath(pathStr: string) {
    if (!pathStr) {
        return pathStr;
    }
    pathStr = pathStr.replace(/^[/\\]*(.*?)[/\\]*$/g, '$1');
    pathStr = pathStr.replace(/[/\\]+/g, path.sep);
    return pathStr;
}