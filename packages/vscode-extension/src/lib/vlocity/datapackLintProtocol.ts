import type { Diagnostic } from '@vlocode/dplint';

export interface DatapackLintResult {
    diagnostics: Diagnostic[];
    fileCount: number;
}

export type DatapackLintRequest =
    | { type: 'lint'; cwd: string; files?: string[] }
    | { type: 'release'; cwd: string };
