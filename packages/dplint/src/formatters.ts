import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { LintResult, Location } from './types';

export type OutputFormat = 'text' | 'json' | 'sarif';

export function formatResult(result: LintResult, format: OutputFormat = 'text', cwd = process.cwd()): string {
    if (format === 'json') { return JSON.stringify({ tool: 'dplint', ...result }, null, 2) + '\n'; }
    if (format === 'sarif') {
        const physicalLocation = (location: Location) => {
            const path = relative(cwd, location.file).replace(/\\/g, '/');
            const uri = path.startsWith('../') ? pathToFileURL(location.file).href : path.split('/').map(encodeURIComponent).join('/');
            return {
                artifactLocation: { uri, ...(uri.startsWith('file:') ? {} : { uriBaseId: '%SRCROOT%' }) },
                region: { startLine: location.line, startColumn: location.column }
            };
        };
        return JSON.stringify({
            $schema: 'https://json.schemastore.org/sarif-2.1.0.json', version: '2.1.0',
            runs: [{
                tool: { driver: { name: 'dplint', informationUri: 'https://github.com/Codeneos/vlocode/tree/main/packages/dplint',
                    rules: result.rules.map(rule => ({ id: rule.id, shortDescription: { text: rule.description } })) } },
                originalUriBaseIds: { '%SRCROOT%': { uri: pathToFileURL(resolve(cwd) + '/').href } },
                results: result.diagnostics.map(diagnostic => ({
                    ruleId: diagnostic.ruleId, level: diagnostic.severity === 'warn' ? 'warning' : 'error',
                    message: { text: diagnostic.message }, locations: [{ physicalLocation: physicalLocation(diagnostic) }],
                    properties: { jsonPointer: diagnostic.pointer },
                    ...(diagnostic.relatedLocations ? { relatedLocations: diagnostic.relatedLocations.map((location, index) => ({ id: index + 1, physicalLocation: physicalLocation(location) })) } : {})
                }))
            }]
        }, null, 2) + '\n';
    }
    if (format !== 'text') { throw new Error(`Unknown output format: ${format}`); }
    const lines = result.diagnostics.flatMap(item => [
        `${relative(cwd, item.file)}:${item.line}:${item.column} ${item.severity} ${item.message} (${item.ruleId}) [${item.pointer || '/'}]`,
        ...(item.relatedLocations ?? []).map(location => `  First occurrence: ${relative(cwd, location.file)}:${location.line}:${location.column}`)
    ]);
    return [...lines, `${result.files.length} files checked; ${result.errorCount} errors; ${result.warningCount} warnings`, ''].join('\n');
}
