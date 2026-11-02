import { resolve } from 'node:path';
import { loadFiles } from './loader';
import { checkRules, createResult, prepareRules } from './lintEngine';
import { SourceKeyIndex } from './sourceKeyIndex';
import { LintOptions, LintResult } from './types';

/** Lint paths/globs without logging, changing files, or contacting Salesforce. */
export async function lint(inputs: string[] = [], options: LintOptions = {}): Promise<LintResult> {
    const prepared = prepareRules(options);
    const loaded = await loadFiles(inputs.length ? inputs : options.config?.files ?? ['.'], resolve(options.cwd ?? process.cwd()), options.config?.ignore);
    const sourceKeys = new SourceKeyIndex();
    sourceKeys.add(loaded.nodes);
    return createResult(loaded.files, await checkRules(loaded, prepared, sourceKeys.keys), prepared);
}
