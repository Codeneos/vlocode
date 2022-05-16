#!/usr/bin/env node
import { Command as Commander } from 'commander';
import { readdirSync } from 'fs';
import * as path from 'path';
import { ConsoleWriter, Container, container, Logger, LogLevel, LogManager } from '@vlocode/core';

class CLI {
    private static description = 'CLI for hyper fast Datapack deployment';
    private static version = '0.8.0';

    private program = new Commander().name('vlocode-cli').description(CLI.description).version(CLI.version);
    private logger = LogManager.get(CLI);

    static {
        LogManager.registerWriter(new ConsoleWriter());
        LogManager.setLogLevel(Container, LogLevel.verbose);
        container.registerProvider(Logger, LogManager.get.bind(LogManager));
    }

    constructor(private commandsFolder: string) {
    }

    public run(argv: any[] = process.argv) {
        this.program.parse(argv);
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
            const commandModule = require(commandFile);
            
            if (commandModule.default) {
                this.logger.debug(`Loading command from: ${commandFile}`);

                const commandName = this.generateCommandName(commandFile)
                const commandClass = commandModule.default;            
                const command = parentCommand.command(commandName).description(commandClass.description);
    
                commandClass.args.forEach(arg => command.addArgument(arg));
                commandClass.options.forEach(option => command.addOption(option));

                command.action((...args) => {
                    const commandInstance = container.create(commandClass);
                    commandInstance.options = args.length ? args[args.length - 1] : {};
                    commandInstance.args = args.slice(0, -1);
                    return commandInstance.run(...args);
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