
import type { Progress } from 'vscode';

export type DeploymentProgress = Progress<{
    message?: string;
    increment?: number;
    total?: number;
}>;