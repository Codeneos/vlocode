import 'source-map-support/register';
import { Command as Commander, Option } from 'commander';
import { readdirSync } from 'fs';
import * as path from 'path';
import { FancyConsoleWriter, Container, container, Logger, LogLevel, LogManager } from '@vlocode/core';
import { decorate } from '@vlocode/util';

// @ts-ignore
const nodeRequire = typeof __non_webpack_require__ === 'function' ? __non_webpack_require__ : require;
// @ts-ignore
const buildInfo = typeof __webpack_build_info__ === 'object' ? __webpack_build_info__ : {};

/**
 * CLI base class responsible for loading and executing commands
 */
class CLI {
    private static programName = 'vlocode-cli';
    private static description = buildInfo.description ?? 'N/A';
    private static version = buildInfo.version ?? '0.0.0';
    private static versionString = `${CLI.programName} version ${CLI.version} (${buildInfo.buildDate ?? new Date().toISOString()})`;

    private program = new Commander().name(CLI.programName).description(CLI.description).version(CLI.version, '--version', CLI.versionString);
    private logger = LogManager.get(CLI);

    static options = [
        new Option('-v, --verbose', 'enable verbose logging').default(false),
        new Option('--debug', 'print call stack when an unhandled error occurs').default(false)
    ];

    static {
        LogManager.registerWriter(new FancyConsoleWriter());
        LogManager.setLogLevel(Container, LogLevel.verbose);
        container.registerProvider(Logger, LogManager.get.bind(LogManager));
    }

    constructor(private commandsFolder: string) {
    }

    public run(argv: any[] = process.argv) {
        this.program.parse(argv);
    }

    private init(options: any) { 
        this.logger.info(`${CLI.programName} v${CLI.version} (${buildInfo.buildDate ?? new Date().toISOString()}) - ${CLI.description}`);       
        if (options.verbose === true) {
            LogManager.setGlobalLogLevel(LogLevel.verbose);
        }
    }
    
    public loadCommands(folder: string = '.') {
        const fullFolderPath = path.join(__dirname, this.commandsFolder, folder);
        for (const file of readdirSync(fullFolderPath, { withFileTypes: true } )) {
            if (file.isFile() && file.name.endsWith('.js')) {
                const cmd = this.registerCommand(this.program, path.join(fullFolderPath, file.name));
            }
        }
        return this;
    }

    private generateCommandName(commandFile: string) {
        return path.relative(path.join(__dirname, this.commandsFolder), commandFile)
            .replaceAll(/^(.*)\.(.*)?$/g, '$1')
            .replaceAll(/^\./g, '-')
            .replaceAll(/^[/\\]/g, '-')
            .replaceAll(/([a-z0-9])([A-Z][a-z0-9]+)/g, '$1-$2')
            .toLowerCase();
    }
    
    private registerCommand(parentCommand: Commander, commandFile: string) {
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
                    this.init(commandInstance.options);
                    if (commandInstance.init) {
                        commandInstance.init(commandInstance.options);
                    }
                    try { 
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
            this.logger.error(err.message ?? err);
        }        
    }    
}

// Run
new CLI('./commands').loadCommands().run();