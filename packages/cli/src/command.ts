import { Command as OclifCommand, Flags, Interfaces } from '@oclif/core';
import {
    ConsoleWriter,
    container,
    FancyConsoleWriter,
    Logger,
    LogLevel,
    LogManager
} from '@vlocode/core';
import { getErrorMessage } from '@vlocode/util';

const CLI_PROGRAM_NAME = 'vlocode-cli';

export type FlagsOf<T extends typeof OclifCommand> = Interfaces.InferredFlags<typeof Command.flags & T['flags']>;
export type ArgsOf<T extends typeof OclifCommand> = {
    [K in keyof Interfaces.InferredArgs<T['args']>]: any;
};

export abstract class Command<T extends typeof OclifCommand = typeof OclifCommand> extends OclifCommand {
    private static readonly consoleWriter = new ConsoleWriter();
    private static readonly fancyWriter = new FancyConsoleWriter();
    private static activeWriter?: ConsoleWriter | FancyConsoleWriter;

    public static strict = false;
    public static enableJsonFlag = false;
    public static baseFlags = {
        verbose: Flags.boolean({
            char: 'v',
            default: false,
            summary: 'enable more detailed verbose logging',
        }),
        debug: Flags.boolean({
            default: false,
            summary: 'print call stack when an unhandled error occurs',
        }),
    };
    public static flags = Command.baseFlags;

    protected flags!: FlagsOf<T>;
    protected args!: ArgsOf<T>;
    protected logger = LogManager.get(CLI_PROGRAM_NAME);

    static {
        container.registerProvider(Logger, (receiver) => {
            if (receiver?.name === 'default') {
                return LogManager.get(CLI_PROGRAM_NAME);
            }

            return LogManager.get(receiver);
        });
    }

    protected abstract execute(): Promise<void> | void;

    private static configureLogging(flags: { debug?: boolean; verbose?: boolean }) {
        const writer = flags.debug || flags.verbose ? Command.fancyWriter : Command.consoleWriter;

        if (Command.activeWriter !== writer) {
            if (Command.activeWriter) {
                LogManager.unregisterWriter(Command.activeWriter);
            }

            LogManager.registerWriter(writer);
            Command.activeWriter = writer;
        }

        if (flags.debug === true) {
            LogManager.setGlobalLogLevel(LogLevel.debug);
            getErrorMessage.defaults.includeStack = true;
            return;
        }

        if (flags.verbose === true) {
            LogManager.setGlobalLogLevel(LogLevel.verbose);
            getErrorMessage.defaults.includeStack = true;
            return;
        }

        LogManager.setGlobalLogLevel(LogLevel.info);
        getErrorMessage.defaults.includeStack = false;
    }

    public async init(): Promise<void> {
        const ctor = this.constructor as T;
        const { args, flags } = await this.parse(ctor);

        this.args = args as ArgsOf<T>;
        this.flags = flags as FlagsOf<T>;
        Command.configureLogging(this.flags as { debug?: boolean; verbose?: boolean });
    }

    public async run(): Promise<void> {
        try {
            await this.execute();
        } catch (error) {
            this.catchError(error);
        }
    }

    protected catchError(error: unknown): never {
        if (this.flags.debug && error instanceof Error && error.stack) {
            this.logger.error(error.message, '\n', error.stack);
        } else {
            this.logger.error(getErrorMessage(error));
        }

        return this.exit(1);
    }
}
