import * as path from 'path';
import * as fs from 'fs-extra';
import { Stream } from 'stream';

// Import vscode as optional module, only load it when available
const vscode = import('vscode').catch(() => null);

// FS options
export const options : { mode: 'sync'|'async' } = {
    mode: 'sync'
};

/**
 * VSCode File system URI compatibility interface
 */
export interface FileSystemUri {
    fsPath: string;
}

/**
 * Get the body of a document as string
 * @param file file name
 */
export async function getDocumentBodyAsString(file: string | FileSystemUri, encoding: BufferEncoding = 'utf-8') : Promise<string> {
    return (await getDocumentBody(file)).toString(encoding);
}

/**
 * Get the body of a document as Buffer
 * @param file file name
 */
export async function getDocumentBody(file: string | FileSystemUri) : Promise<Buffer> {
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

/**
 * Platform agnostic method to get the folder name from a path string (dirname); returns the folder of the path treating both / as well as \\ as directory separators.
 * @param pathLike path like string
 * @returns Folder path of a path like string
 */
export function directoryName(pathLike: string) {
    const pathParts = pathLike.split(/[\\/]/g);
    if (pathParts.length == 1) {
        return '.';
    } else if (pathParts.length == 2 && (pathParts[0] == '/' || pathParts[0] == '\\')) {
        return path.sep;
    }
    return pathParts.slice(0, -1).join(path.sep);
}

/**
 * Platform agnostic method to get the file name or basename of a path treating both / as well as \\ as directory separators.
 * @param pathLike path like string 
 * @param removeExtension remove the file extension if any
 * @returns Basename of a path with the file suffix
 */
export function fileName(pathLike: string, removeExtension: boolean = false) {
    const match = (removeExtension ? /^.*[\\|/|](.*)(\.[^.]+)$/s : /^.*[\\|/](.*)$/s).exec(pathLike);
    return match ? match[1] : pathLike;
}

/**
 * Get the file suffix without . from a file name; returns an empty string when the file has no suffix
 * @param pathLike Path like string
 * @returns File suffix without . and an empty string when there is no suffix
 */
export function fileSuffix(pathLike: string) {
    return path.extname(pathLike).slice(1);
}

/**
 * Convert a stream-like object to a buffer
 * @param stream Stream to convert into a buffer object 
 * @returns Promise of a Buffer
 */
export function streamToBuffer(stream: Stream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const buffers = new Array<any>();
        stream.on('data', data => buffers.push(data));
        stream.on('error', err => reject(err));
        stream.on('end', () => {
            resolve(Buffer.concat(buffers));
        });
    });
}