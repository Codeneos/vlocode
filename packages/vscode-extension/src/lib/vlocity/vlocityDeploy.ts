import * as vscode from 'vscode';

export interface VlocityDeployResult {
    readonly datapack: string;
    readonly type: string;
    readonly status: 'inProgress' | 'pending' | 'success' | 'partial' | 'error';
    readonly totalRecords: number;
    readonly failedRecords: number;
    readonly messages: { type: 'error' | 'warn', message: string, code?: string }[];
}

/**
 * Describes a Vlocity dataopack deployment startegy which can deploy datapacks to the connected target org.
 */
export interface VlocityDeploy {
    deploy(
        datapackHeaders: vscode.Uri[],
        progress?: vscode.Progress<{message?: string, progress?: number; total?: number }>,
        cancellationToken?: vscode.CancellationToken
    ): Promise<VlocityDeployResult[]> | VlocityDeployResult[]
}   