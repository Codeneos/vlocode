import * as path from 'path';
import type { Uri } from 'vscode';
import * as fs from 'fs-extra';

// Import vscode as optional module, only load it when available
const vscode = import('vscode').catch(e => null);

// FS options
export const options : { mode: 'sync'|'async' } = {
    mode: 'sync'
};

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
    const doc = (await vscode)?.workspace.textDocuments.find(doc => doc.fileName == fileName);
    if (doc?.isDirty) {
        return Buffer.from(doc.getText());
    }
    if (options.mode == 'sync') {
        return fs.readFileSync(fileName);
    }
    return fs.readFile(fileName);
}

export function sanitizePath(pathStr: string, pathSeparator = path.sep) {
    if (!pathStr) {
        return pathStr;
    }
    pathStr = pathStr.replace(/^[/\\]*(.*?)[/\\]*$/g, '$1');
    pathStr = pathStr.replace(/[/\\]+/g, pathSeparator);
    return pathStr;
}

export function fileExists(filePath: string) {
    try {
        return fs.existsSync(filePath);
    } catch(err) {
        return false;
    }
}

export async function readDirectory(filePath: fs.PathLike) {
    if (options.mode == 'sync') {
        return fs.readdirSync(filePath);
    }
    return fs.readdir(filePath);
}