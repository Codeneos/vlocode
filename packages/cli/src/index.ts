import { readdirSync, readFileSync } from 'fs';
import * as path from 'path';

import { Command, Option } from 'commander';
import { FancyConsoleWriter, container, Logger, LogLevel, LogManager, ConsoleWriter } from '@vlocode/core';
import { getErrorMessage } from '@vlocode/util';

// @ts-ignore
const nodeRequire = typeof __non_webpack_require__ === 'function' ? __non_webpack_require__ : require;
// @ts-ignore
const buildInfo: Record<string, string> = typeof __webpack_build_info__ === 'object' ? __webpack_build_info__ : {
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
        debugger; // eslint-disable-line no-debugger
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
        } catch(err) {
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

    public loadCommands(folder: string = '.') {
        const fullFolderPath = path.join(__dirname, this.commandsFolder, folder);
        for (const file of readdirSync(fullFolderPath, { withFileTypes: true } )) {
            if (file.isFile() && file.name.endsWith('.js')) {
                this.registerCommand(this.program, path.join(fullFolderPath, file.name));
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

    private registerCommand(parentCommand: Command, commandFile: string) {
        try {
            // @ts-ignore
            const commandModule = nodeRequire(commandFile);

            if (commandModule.default) {
                this.logger.debug(`Loading command from: ${commandFile}`);

                const commandName = this.generateCommandName(commandFile)
                const commandClass = commandModule.default;
                const command = parentCommand.command(commandName).description(commandClass.description);

                commandClass.args.forEach(arg => command.addArgument(arg));
                [...CLI.options, ...commandClass.options].forEach(option => command.addOption(option));

                command.action(async (...args) => {
                    const commandInstance = container.create(commandClass);
                    commandInstance.options = args.slice(0, -1).pop();
                    commandInstance.args = args.slice(0, -2);

                    try {
                        this.init(commandInstance.options);
                        await commandInstance.init?.(commandInstance.options);
                        return await commandInstance.run(...args);
                    } catch(err) {
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
            }

        } catch(err) {
            this.logger.error(`Unable to load command: ${commandFile}\n\n`, err.stack);
        }
    }
}

// Run
new CLI('./commands').loadCommands().run();