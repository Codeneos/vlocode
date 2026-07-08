import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Resolve the candidate locations of a workspace file: absolute paths resolve to themselves while
 * relative paths resolve against each of the opened workspace folders, or against the current
 * working directory when no workspace folders are open.
 * @param file Absolute or workspace-relative file path
 */
export function getWorkspaceFileCandidates(file: string): string[] {
    if (path.isAbsolute(file)) {
        return [ file ];
    }

    const workspaceFolders = vscode.workspace.workspaceFolders ?? [];
    if (!workspaceFolders.length) {
        return [ path.resolve(file) ];
    }

    return workspaceFolders.map(workspace => path.join(workspace.uri.fsPath, file));
}
