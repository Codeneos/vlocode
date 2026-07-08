import { Command, Errors, Flags, Interfaces } from '@oclif/core';

import { CachedFileSystemAdapter, container, FileSystem, Logger, LogManager, NodeFileSystem } from '@vlocode/core';
import { getErrorMessage } from '@vlocode/util';

import { configureLogging, logLevelChoices, type LoggingOptions } from './lib/logging';

export type CmdFlags<T extends typeof Command> = Interfaces.InferredFlags<T['baseFlags'] & T['flags']>;
export type CmdArgs<T extends typeof Command> = Interfaces.InferredArgs<T['args']>;

/**
 * Base class for all Vlocode CLI commands.
 *
 * Responsible for the CLI-wide concerns that used to live in the bespoke `CLI` loader: parsing the
 * global flags, configuring the {@link LogManager} logging pipeline, and exposing an IoC
 * {@link container} (with a {@link FileSystem}) plus `info`/`verbose`/`warn`/`error` helpers routed
 * through the Vlocode logger so all output flows through the same progress-aware writer chain.
 */
export abstract class BaseCommand<T extends typeof Command = typeof Command> extends Command {
    static strict = false;

    static baseFlags = {
        verbose: Flags.boolean({
            char: 'v',
            default: false,
            summary: 'enable more detailed verbose logging',
        }),
        debug: Flags.boolean({
            default: false,
            summary: 'print the call stack when an unhandled error occurs',
        }),
        'log-file': Flags.string({
            helpValue: '<path>',
            summary: 'append logs as NDJSON to the specified file',
        }),
        'log-level': Flags.string({
            options: logLevelChoices(),
            summary: 'set the log level, overrides -v/--debug',
        }),
    };

    protected flags!: CmdFlags<T>;
    protected args!: CmdArgs<T>;
    /** All positional arguments (used by commands that accept a variadic list, e.g. `<paths..>`). */
    protected positionals: string[] = [];

    /** Per-command IoC container (a child of the root container). */
    protected container = container.create();
    /** Logger for this command; re-scoped to the command id once flags are parsed. */
    protected logger: Logger = LogManager.get('vlocode');

    static {
        // Root-container providers shared by every command and any service resolved anywhere.
        container.registerProvider(Logger, receiver => LogManager.get(receiver));
        container.add(new CachedFileSystemAdapter(new NodeFileSystem()), { provides: [FileSystem] });
    }

    public async init(): Promise<void> {
        await super.init();

        // Configure logging from the raw argv BEFORE parsing, so that flag/argument validation
        // errors thrown by `this.parse()` are actually visible (they surface through `catch()`,
        // which logs via LogManager) and so `--log-file`/`-v` take effect from the very start.
        const logFlags = this.readLogFlags();
        configureLogging(logFlags);
        getErrorMessage.defaults.includeStack = logFlags.debug === true || logFlags.verbose === true;
        this.logger = LogManager.get(this.id ?? 'vlocode');

        const { args, argv, flags } = await this.parse({
            flags: this.ctor.flags,
            baseFlags: this.ctor.baseFlags,
            args: this.ctor.args,
            strict: this.ctor.strict,
        });
        this.flags = flags as CmdFlags<T>;
        this.args = args as CmdArgs<T>;
        this.positionals = argv as string[];
    }

    /** Read the global log-related flags directly from argv (before oclif parses them). */
    private readLogFlags(): LoggingOptions {
        const argv = this.argv;
        const has = (...names: string[]) => names.some(name => argv.includes(name));
        const value = (name: string): string | undefined => {
            const inline = argv.find(arg => arg.startsWith(`${name}=`));
            if (inline) {
                return inline.slice(inline.indexOf('=') + 1);
            }
            const index = argv.indexOf(name);
            return index !== -1 ? argv[index + 1] : undefined;
        };
        return {
            verbose: has('-v', '--verbose'),
            debug: has('--debug'),
            logFile: value('--log-file'),
            logLevel: value('--log-level'),
        };
    }

    public get verboseLogging(): boolean {
        return this.flags?.verbose === true || this.flags?.debug === true;
    }

    public get debugMode(): boolean {
        return this.flags?.debug === true;
    }

    public info(...message: unknown[]): void {
        this.logger.info(...message);
    }

    public verbose(...message: unknown[]): void {
        this.logger.verbose(...message);
    }

    public log(message = '', ...args: unknown[]): void {
        this.logger.info(message, ...args);
    }

    public warn(input: string | Error): string | Error {
        this.logger.warn(input instanceof Error ? getErrorMessage(input) : input);
        return input;
    }

    public error(input: string | Error): never;
    public error(input: string | Error, options: { code?: string; exit: false }): void;
    public error(input: string | Error, options: { code?: string; exit?: number | true }): never;
    public error(input: string | Error, options?: { code?: string; exit?: number | boolean }): never | void;
    public error(input: string | Error, options: { code?: string; exit?: number | boolean } = {}): never | void {
        this.logger.error(input instanceof Error ? getErrorMessage(input) : input);
        if (options.exit === false) {
            return;
        }
        this.exit(typeof options.exit === 'number' ? options.exit : 1);
    }

    /**
     * oclif hook for uncaught errors thrown from `run()`. Logs through the Vlocode pipeline (with a
     * stack trace in `--debug`) and exits non-zero.
     */
    protected async catch(err: Error & { exitCode?: number }): Promise<void> {
        // `this.error()`/`this.exit()` throw oclif's ExitError; let oclif's own handler set the exit
        // code and exit silently instead of re-logging its "EEXIT: n" message.
        if (err instanceof Errors.ExitError) {
            throw err;
        }
        if (this.debugMode) {
            this.logger.error(err.stack ?? getErrorMessage(err));
        } else {
            this.logger.error(getErrorMessage(err));
        }
        this.exit(err.exitCode ?? 1);
    }
}
