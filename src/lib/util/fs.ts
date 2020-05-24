import * as path from 'path';
import * as fs from 'fs-extra';

// Import vscode as optional module, only load it when available
const vscode = import('vscode').catch(e => null);

/**
 * Get the body of a document as string
 * @param file file name
 */
export async function getDocumentBodyAsString(file: string) : Promise<string> {
    const vscodeRef = await vscode;
    if (vscodeRef) {
        const doc = vscodeRef?.workspace.textDocuments.find(doc => doc.fileName == file);
        if (doc) {
            return doc.getText();
        }
        return (await vscodeRef?.workspace.fs.readFile(vscodeRef.Uri.file(file))).toString();
    }
    return (await fs.readFile(file)).toString();
}

export function sanitizePath(pathStr: string) {
    if (!pathStr) {
        return pathStr;
    }
    pathStr = pathStr.replace(/^[/\\]*(.*?)[/\\]*$/g, '$1');
    pathStr = pathStr.replace(/[/\\]+/g, path.sep);
    return pathStr;
}