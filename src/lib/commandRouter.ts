import * as util from 'util';
import { Logger, LogManager } from 'lib/logging';
import VlocodeService from 'lib/vlocodeService';
import * as vscode from 'vscode';
import { Command } from 'lib/command';
import { VlocodeCommand } from '@constants';
import { utils } from 'mocha';

export type CommandCtor = (new() => Command);
export interface CommandList {
    [name: string]: ((...args: any[]) => void) | Promise<CommandCtor> | CommandCtor | Command;
}

class LazyCommand implements Command {
    private instance: Command;

    constructor(
        public readonly name: string,
        private readonly ctor: CommandCtor) {
    }

    public execute(... args: any[]){
        return this.getCreateInstance().execute(...args);
    }

    public validate(... args: any[]) {
        return this.getCreateInstance().validate?.(...args);
    }

    private getCreateInstance() {
        return this.instance || (this.instance = new this.ctor());
    }
}

class CommandExecutor implements Command {
    constructor(
        private readonly name: string,
        private readonly command: Command
    ) { }

    private get logger() : Logger {
        return LogManager.get(CommandExecutor);
    }

    public async execute(... args: any[]) : Promise<void> {
        this.logger.verbose(`Invoke command ${this.name}`);
        await Promise.resolve(this.validate(...args));
        try {
            await Promise.resolve(this.command.execute.apply(this.command, args));
            this.logger.verbose(`Execution of command ${this.name} done`);
        } catch(err) {
            const message = err.message || err;
            this.logger.error(`Command error: ${message}`);
            if (util.types.isNativeError(err)) {
                this.logger.verbose(err.stack);
            }
            void vscode.window.showErrorMessage(message);
        }
    }

    public validate(... args: any[]) : Promise<void> | void {
        if (this.command.validate) {
            return this.command.validate(...args);
        }
    }
}

/**
 * Class responsible for routing and handling command calls in a consistent way
 * for the Vlocode extension. Holds
 */
export default class CommandRouter {
    private readonly commands : Command[] = [];

    constructor(private readonly vlocode : VlocodeService) {
    }

    private get logger() : Logger {
        return LogManager.get(CommandRouter);
    }

    private get count() : number {
        return this.commands.length;
    }

    public async execute(commandName : VlocodeCommand | string, ...args: any[]) : Promise<void> {
        const command : Command = this.commands[commandName];
        if (command) {
            return command.execute(...args);
        }
        return vscode.commands.executeCommand(commandName, ...args);
    }

    public register(name: string, commandCtor: ((...args: any[]) => void) | Promise<CommandCtor> | CommandCtor | Command) : Command {
        const command = new CommandExecutor(name, this.createCommand(name, commandCtor));
        this.commands.push(command);

        this.vlocode.registerDisposable(vscode.commands.registerCommand(name, command.execute, command));
        return command;
    }

    public registerAll(commands: CommandList) : void{
        Object.keys(commands).forEach(key => {
            this.register(key, commands[key]);
        });
    }

    private createCommand(name: string, commandCtor: any) : Command {
        if ('prototype' in commandCtor) {
            return new LazyCommand(name, commandCtor);
        } else if ('execute' in commandCtor) {
            return commandCtor;
        }
        return { execute: commandCtor };
    }
}