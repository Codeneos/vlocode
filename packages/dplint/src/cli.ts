import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Writable } from 'node:stream';
import { Command, CommanderError, InvalidArgumentError, Option } from 'commander';
import { loadConfig } from './config';
import { formatResult, OutputFormat } from './formatters';
import { lint } from './linter';
import { builtinRules } from './rules';

export interface CliOptions {
    config?: string;
    format?: OutputFormat;
    output?: string;
    maxWarnings?: number;
    listRules?: boolean;
}

export interface CliIO { stdout: Writable; stderr: Writable }

/** Fresh Commander options, shared by dplint and vlocode lint. */
export function lintCommandOptions(): Option[] {
    return [
        new Option('-c, --config <file>', 'YAML or JSON configuration file'),
        new Option('-f, --format <format>', 'report format').choices(['text', 'json', 'sarif']).default('text'),
        new Option('-o, --output <file>', 'write the report to a file'),
        new Option('--max-warnings <count>', 'fail if warning count exceeds this limit').argParser(value => {
            if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) { throw new InvalidArgumentError('Expected a non-negative integer'); }
            return Number(value);
        }),
        new Option('--list-rules', 'list built-in rule IDs and descriptions')
    ];
}

function write(stream: Writable, text: string): Promise<void> {
    return new Promise((resolve, reject) => stream.write(text, error => error ? reject(error) : resolve()));
}

/** Returns 0 for success, 1 for lint failures, and 2 for configuration/I/O/tool errors. */
export async function executeLint(paths: string[], options: CliOptions, io: CliIO = process, cwd = process.cwd()): Promise<number> {
    try {
        if (options.listRules) {
            await write(io.stdout, builtinRules.map(rule => `${rule.id}\t${rule.defaultSeverity}\t${rule.description}`).join('\n') + '\n');
            return 0;
        }
        const config = await loadConfig(options.config, cwd);
        if (options.config) { config.ignore = [...(config.ignore ?? []), resolve(cwd, options.config)]; }
        const result = await lint(paths, { config, cwd });
        const output = formatResult(result, options.format, cwd);
        if (options.output) { await writeFile(resolve(cwd, options.output), output); }
        else { await write(io.stdout, output); }
        return result.errorCount || (options.maxWarnings !== undefined && result.warningCount > options.maxWarnings) ? 1 : 0;
    } catch (error) {
        await write(io.stderr, `dplint: ${(error as Error).message}\n`);
        return 2;
    }
}

export async function runCli(argv = process.argv.slice(2), io: CliIO = process): Promise<number> {
    const program = new Command('dplint')
        .description('Validate Vlocity/SFI DataPacks offline')
        .version((require('../package.json') as { version: string }).version)
        .argument('[paths...]', 'files, directories, or quoted glob patterns (default: config files or current directory)')
        .exitOverride()
        .configureOutput({ writeOut: text => { io.stdout.write(text); }, writeErr: text => { io.stderr.write(text); } });
    lintCommandOptions().forEach(option => program.addOption(option));
    let exitCode = 0;
    program.action(async (paths: string[], options: CliOptions) => { exitCode = await executeLint(paths, options, io); });
    try { await program.parseAsync(argv, { from: 'user' }); }
    catch (error) {
        if (error instanceof CommanderError) { return error.exitCode === 0 ? 0 : 2; }
        throw error;
    }
    return exitCode;
}
