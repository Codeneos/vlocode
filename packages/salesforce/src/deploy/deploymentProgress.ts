
import type { Progress } from 'vscode';

export type DeploymentProgress = Progress<{
    message?: string;
    deployed?: number;
    total?: number;
}>;