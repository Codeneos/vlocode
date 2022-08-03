import { Logger, injectable, LifecyclePolicy } from '@vlocode/core';
import VlocodeService from '@lib/vlocodeService';
import * as vscode from 'vscode';
import { Command } from '@lib/command';
import { VlocodeCommand } from '@constants';
import { lazy, withDefaults } from '@vlocode/util';
import { CommandExecutor } from './commandExecutor';

export type CommandFn = ((...args: any[]) => void) | (new(...args: any[]) => Command) | Command
export interface CommandList {
    [name: string]: CommandFn;
}

export interface CommandExecuteOptions {
    /**
     * When true (default) the log is focused before and after command execution.
     * @default true
     */
    focusLog?: boolean;
}

/**
 * Class responsible for routing and handling command calls in a consistent way
 * for the Vlocode extension. Holds
 */
@injectable({ lifecycle: LifecyclePolicy.singleton })
export default class CommandRouter {
    private readonly commands = new Map<string, CommandExecutor>();
    private readonly commandTypes = new Map<string, string>();

    constructor(private readonly vlocode: VlocodeService, private readonly logger: Logger) {
    }

    public async execute(commandName : VlocodeCommand | string, args?: any[], options?: CommandExecuteOptions) : Promise<void> {
        const opt = withDefaults(options, { focusLog: true });        
        const command : Command = this.commands[commandName];
        if (command) {
            opt.focusLog && this.logger.focus();
            try {
                await command.execute(...(args ?? []));
            } finally {
                opt.focusLog && this.logger.focus();
            }
        }
        return vscode.commands.executeCommand(commandName, args);
    }

    public register(name: string, commandFn: CommandFn) : Command {
        const command = new CommandExecutor(name, this.createCommand(commandFn));
        this.initializeCommand(name, command);
        this.commands.set(name, command);

        if (typeof commandFn === 'function' && commandFn.name) {
            this.commandTypes.set(commandFn.name, name);
        }

        this.vlocode.registerDisposable(vscode.commands.registerCommand(name, command.execute, command));
        return command;
    }

    public registerAll(commands: { [name: string]: CommandFn }) : void{
        Object.entries(commands).forEach(entry => this.register(...entry));
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

    private createCommand(commandCtor: CommandFn) : Command {
        if (typeof commandCtor === 'function' && 'prototype' in commandCtor) {
            // @ts-ignore ctor is a newable type
            return new lazy(() => new commandCtor());
        } else if ('execute' in commandCtor) {
            return commandCtor;
        }
        return { execute: commandCtor };
    }
}