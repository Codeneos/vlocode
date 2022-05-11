import { getDocumentBodyAsString } from '@vlocode/util';
import { Uri } from 'vscode';

/**
 * Search the project for a datapack with a certain matching key in the currently open workspace folders.
 * @param file Datapack header file path
 */
export async function getDatapackHeaderByMatchingKey(matchingKey: string) : Promise<string | undefined> {
    const files = (await getDatapackHeadersInWorkspace()).map(uri => uri.fsPath);
    for (const file of files) {
        const body = await getDocumentBodyAsString(file);
        if (body.includes(matchingKey)) {
            return file;
        }
    }
}

/**
 * Get all datapack header file in the current workspace folders.
 */
export async function getDatapackHeadersInWorkspace() : Promise<Uri[]> {
    return require('vscode').workspace.findFiles('**/*_DataPack.json');
}
