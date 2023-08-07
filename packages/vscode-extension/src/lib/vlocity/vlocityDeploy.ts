import * as vscode from 'vscode';

/**
 * Describes a Vlocity dataopack deployment startegy which can deploy datapacks to the connected target org.
 */
export interface VlocityDeploy {
    deploy(
        datapackHeaders: vscode.Uri[],
        progress?: vscode.Progress<{message?: string, progress?: number; total?: number }>,
        cancellationToken?: vscode.CancellationToken
    ): Promise<void> | void
}