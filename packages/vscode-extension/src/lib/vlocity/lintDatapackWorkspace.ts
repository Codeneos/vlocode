import { access } from 'node:fs/promises';
import { join } from 'node:path';
import glob from 'fast-glob';
import { configNames, LintSession, loadConfig } from '@vlocode/dplint';
import type { DatapackLintResult } from './datapackLintProtocol';

/** Maintains one workspace cache inside the worker, without VS Code or org dependencies. */
export class DatapackWorkspaceLinter {
    private session?: LintSession;
    private configFile?: string;

    constructor(private readonly cwd: string) {
    }

    public async lint(files?: string[]): Promise<DatapackLintResult> {
        try {
            const reload = !this.session || !files || files.some(file => configNames.some(name => file === join(this.cwd, name)));
            if (reload) {
                await this.loadSession();
            }
            if (!this.session) {
                return { diagnostics: [], fileCount: 0 };
            }
            const result = !reload && files
                ? await this.session.lintFiles(files)
                : await this.session.refresh();
            return { diagnostics: result.diagnostics, fileCount: result.files.length };
        } catch (error) {
            this.session = undefined;
            return {
                fileCount: 0,
                diagnostics: [{
                    file: this.configFile ?? this.cwd, pointer: '', line: 1, column: 1,
                    severity: 'error', ruleId: 'dplint/configuration',
                    message: `DataPack lint failed: ${(error as Error).message}`
                }]
            };
        }
    }

    private async loadSession(): Promise<void> {
        this.session = undefined;
        this.configFile = undefined;
        for (const name of configNames) {
            const candidate = join(this.cwd, name);
            try {
                await access(candidate);
                this.configFile = candidate;
                break;
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                    throw error;
                }
            }
        }
        const config = await loadConfig(this.configFile, this.cwd);
        // Default discovery selects headers and their children, leaving unrelated JSON alone.
        const inputs = config.files ?? await glob('**/*_DataPack.json', {
            cwd: this.cwd, absolute: true, caseSensitiveMatch: false,
            ignore: ['**/node_modules/**', '**/.git/**', ...(config.ignore ?? [])]
        });
        if (config.files || inputs.length) {
            this.session = new LintSession(inputs, { cwd: this.cwd, config });
        }
    }
}

/** A one-off workspace check; persistent workers reuse DatapackWorkspaceLinter instead. */
export async function lintDatapackWorkspace(cwd: string): Promise<DatapackLintResult> {
    return new DatapackWorkspaceLinter(cwd).lint();
}
