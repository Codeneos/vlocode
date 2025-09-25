import { readdirSync, readFileSync } from 'fs';
import * as path from 'path';

import { Command, Option } from 'commander';
import { FancyConsoleWriter, container, Logger, LogLevel, LogManager, ConsoleWriter } from '@vlocode/core';
import { getErrorMessage } from '@vlocode/util';
import { Module } from 'vm';

// // @ts-ignore
const buildInfo: Record<string, string> = {
    ...JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')),
    buildDate: new Date().toISOString()
};

/**
 * CLI base class responsible for loading and executing commands
 */
class CLI {
    private static readonly programName = 'vlocode-cli';
    private static readonly description = buildInfo.description;
    private static readonly version = buildInfo.version;

    private static readonly isVerbose = process.argv.includes('-v') || process.argv.includes('--verbose');
    private static readonly isDebug = process.argv.includes('--debug');

    private readonly program: Command;
    private readonly logger = LogManager.get(CLI.programName);

    static readonly options = [
        new Option('-v, --verbose', 'enable more detailed verbose logging').default(false),
        new Option('--debug', 'print call stack when an unhandled error occurs').default(false)
    ];

    static {
        // Init global logging
        if (CLI.isVerbose || CLI.isDebug) {
            LogManager.registerWriter(new FancyConsoleWriter());
            if (CLI.isDebug) {
                LogManager.setGlobalLogLevel(LogLevel.debug);
            } else {
                LogManager.setGlobalLogLevel(LogLevel.verbose);
            }
        } else {
            LogManager.registerWriter(new ConsoleWriter());
            LogManager.setGlobalLogLevel(LogLevel.info);
        }
        container.registerProvider(Logger, (receiver) => {
            if (receiver?.name === 'default') {
                return LogManager.get('vlocode-cli');
            }
            return LogManager.get(receiver);
        });
    }

    private get versionString() {
        return buildInfo ? `${CLI.programName} version ${CLI.version} (${buildInfo.buildDate})`
            : `${CLI.programName} non-packaged custom build`
    }

    constructor(private commandsFolder: string) {
        this.logger.verbose(this.versionString);
        this.program = new Command()
            .name(CLI.programName)
            .description(CLI.description)
            .version(`${CLI.version} (${buildInfo.buildDate})`)
            .configureOutput({
                writeErr: (str: string) => this.logger.error(str),
                writeOut: (str: string) => this.logger.info(str)
            })
            .addHelpCommand('help [cmd]', 'display help for the specified command')
            .configureHelp({
                sortSubcommands: true,
                sortOptions: true
            });
    }

    public run(argv: any[] = process.argv) {
        try {
            this.program.parse(argv);
        } catch(err: any) {
            this.logger.error(err.message ?? err);
        }
    }

    private init(options: any) {
        if (options.debug === true) {
            LogManager.setGlobalLogLevel(LogLevel.debug);
            getErrorMessage.defaults.includeStack = true;
        } else if (options.verbose === true) {
            LogManager.setGlobalLogLevel(LogLevel.verbose);
            getErrorMessage.defaults.includeStack = true;
        }
    }

    public async loadCommands(options: string | { [file: string]: { default: unknown } } = '.') {
        if (typeof options === 'string') {
            await this.loadCommandsFolder(options);
        } else {
            this.logger.debug(`Loading ${Object.keys(options).length} command(s) from build manifest`);
            for (const [name, module] of Object.entries(options)) {
                await this.registerCommand(this.program, { name, module });
            }
        }
        return this;
    }

    public async loadCommandsFolder(folder: string = '.') {
        const fullFolderPath = path.join(__dirname, this.commandsFolder, folder);
        for (const file of readdirSync(fullFolderPath, { withFileTypes: true } )) {
            if (file.isFile() && /.m?js$/.test(file.name)) {
                await this.loadCommand(this.program, path.join(fullFolderPath, file.name));
            }
        }
        return this; 
    }

    private generateCommandName(commandFile: string) {
        return path.relative(path.join(__dirname, this.commandsFolder), commandFile)
            .replace(/^(.*)\.(.*)?$/g, '$1')
            .replace(/^\./g, '-')
            .replace(/^[/\\]/g, '-')
            .replace(/([a-z0-9])([A-Z][a-z0-9]+)/g, '$1-$2')
            .toLowerCase();
    }

    private async loadCommand(parentCommand: Command, commandFile: string) {
        try {
            const commandModule = await import(commandFile);
            this.logger.debug(`Loaded command module from: ${commandFile}`);
            await this.registerCommand(parentCommand, { module: commandModule, name: this.generateCommandName(commandFile) });
        } catch (err: any) {
            this.logger.error(`Failed to load command from ${commandFile}: ${err.message}`);
        }
    }

    private async registerCommand(parentCommand: Command, options: { module: any, name?: string }) {
        try {
            const commandName = options.name ?? options.module.name
            const commandClass = options.module;

            if (!this.isValidCommand(commandClass)) {
                this.logger.error(`Skipping invalid command module: ${commandName}`);
                return;
            }

            const command = parentCommand.command(commandName).description(commandClass.description);

            commandClass.args.forEach(arg => command.addArgument(arg));
            [...CLI.options, ...commandClass.options].forEach(option => command.addOption(option));

            command.action(async (...args) => {
                const commandInstance = container.new(commandClass);
                commandInstance.options = args.slice(0, -1).pop();
                commandInstance.args = args.slice(0, -2);

                try {
                    this.init(commandInstance.options);
                    await commandInstance.init?.(commandInstance.options);
                    return await commandInstance.run(...args);
                } catch(err: any) {
                    if (commandInstance.options.debug && err instanceof Error) {
                        this.logger.error(err.message, '\n', err.stack);
                    } else {
                        this.logger.error(err.message ?? err);
                    }
                    process.exit(1);
                } finally {
                    process.exit(0);
                }
            });

            return command;
        } catch(err: any) {
            this.logger.error(`Unable to load command: ${options.name}\n\n`, err.stack);
        }
    }

    private isValidCommand(commandClass: any) {
        if (typeof commandClass !== 'function') {
            this.logger.error(`Invalid command module, no default export found in ${commandClass}`);
            return false;
        }

        if (typeof commandClass.prototype.run !== 'function') {
            this.logger.error(`Invalid command class exported from ${commandClass}, missing run() method`);
            return false;
        }
        
        if (typeof commandClass.description !== 'string') {
            this.logger.error(`Invalid command class exported from ${commandClass}, missing static description property`);
            return false;
        }

        return true;
    }
}

// Run
(await new CLI('./commands').loadCommands(/*=COMMANDS*/)).run();