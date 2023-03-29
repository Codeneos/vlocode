import * as vscode from 'vscode';
import { ActivityProgress } from '../../lib/vlocodeActivity';

/**
 * Describes a Vlocity dataopack deployment startegy which can deploy datapacks to the connected target org.
 */
export interface VlocityDeploy {
    deploy(
        datapackHeaders: vscode.Uri[], 
        cancellationToken?: vscode.CancellationToken
    ): Promise<void> | void
}