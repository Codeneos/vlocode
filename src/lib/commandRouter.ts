import { Logger, LogManager , injectable, LifecyclePolicy } from '@vlocode/core';
import VlocodeService from 'lib/vlocodeService';
import * as vscode from 'vscode';
import { Command } from 'lib/command';
import { VlocodeCommand } from '@constants';
import { lazy } from '@vlocode/util';

export type CommandCtor = (new() => Command);
export interface CommandList {
    [name: string]: ((...args: any[]) => void) | CommandCtor | Command;
}

class CommandExecutor implements Command {
    constructor(
        public readonly name: string,
        public readonly command: Command
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
            console.error(err);
            const message = err.message || err;
            this.logger.error(`Command error: ${message}`);
            void vscode.window.showErrorMessage(message, 'Show').then(value => value === 'Show' && this.logger.focus());
        }
    }

    public validate(... args: any[]) : Promise<void> | void {
        return this.command.validate?.(...args);
    }

    public initialize() : Promise<void> | void {
        return this.command.initialize?.();
    }
}

/**
 * Class responsible for routing and handling command calls in a consistent way
 * for the Vlocode extension. Holds
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export default class CommandRouter {
    private readonly commands = new Map<string, CommandExecutor>();
    private readonly commandTypes = new Map<string, string>();

    constructor(private readonly vlocode: VlocodeService, private readonly logger: Logger) {
    }

    private get count() : number {
        return this.commands.size;
    }

    public async execute(commandName : VlocodeCommand | string, ...args: any[]) : Promise<void> {
        const command : Command = this.commands[commandName];
        if (command) {
            return command.execute(...args);
        }
        return vscode.commands.executeCommand(commandName, ...args);
    }

    public register(name: string, commandCtor: ((...args: any[]) => void) | CommandCtor | Command) : Command {
        const command = new CommandExecutor(name, this.createCommand(commandCtor));
        this.initializeCommand(name, command);
        this.commands.set(name, command);

        if (typeof commandCtor === 'function' && commandCtor.name) {
            this.commandTypes.set(commandCtor.name, name);
        }

        this.vlocode.registerDisposable(vscode.commands.registerCommand(name, command.execute, command));
        return command;
    }

    private initializeCommand(id: string, cmd: Command) {
        const commandInitialize = cmd.initialize;
        if (commandInitialize) {
            setImmediate(async () => {
                try {
                    await commandInitialize.call(cmd);
                } catch(err) {
                    this.logger.error(`Failed to initialize command ${id} due to initialization error: ${err}`);
                }
            });
        }
    }

    public get<T extends Command>(type: (new() => T) | string) : T {
        if (typeof type === 'string') {
            const command = this.commands.get(type);
            if (!command) {
                throw new Error(`No such command with name exists: ${type}`);
            }
            return command.command as T;
        }
        const commandName = this.commandTypes.get(type.name);
        if (!commandName) {
            throw new Error(`No such command with type exists: ${type.name}`);
        }
        return this.get(commandName);
    }

    public registerAll(commands: CommandList) : void{
        Object.keys(commands).forEach(key => {
            this.register(key, commands[key]);
        });
    }

    private createCommand(commandCtor: any) : Command {
        if ('prototype' in commandCtor) {
            // @ts-ignore ctor is a newable type
            return new lazy(() => new commandCtor());
        } else if ('execute' in commandCtor) {
            return commandCtor;
        }
        return { execute: commandCtor };
    }
}