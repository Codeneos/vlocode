import { Logger, injectable, LifecyclePolicy, container, LogManager } from '@vlocode/core';
import VlocodeService from '../lib/vlocodeService';
import * as vscode from 'vscode';
import { Command } from '../lib/command';
import { VlocodeCommand } from '../constants';
import { lazy, withDefaults } from '@vlocode/util';
import { CommandExecutor } from './commandExecutor';

export type CommandFn = ((...args: any[]) => void) | (new(...args: any[]) => Command) | Command;

export interface CommandOptions {
    params?: any[];
    executeParams?: any[];
    focusLog?: boolean;
    showProductionWarning?: boolean;
}

/**
 * Simple object structure that holds command decorated by the vscodeCommand decorator
 */
const commandRegistry: { [id: string]: { command: CommandFn, options?: CommandOptions } } = { };


/**
 * Decorator function that registers VSCode commands with the specified command ID(s).
 * Used to associate a function with one or more VSCode command identifiers.
 * 
 * @param ids - A single command ID or an array of command IDs to register
 * @param options - Optional configuration options for the command
 * @returns A decorator function that registers the decorated method as a VSCode command handler
 * @throws Error when attempting to register a command ID that is already registered
 * 
 * @example
 * ```typescript
 * @vscodeCommand('my.command.id')
 * export function myCommand() {
 *   // Command implementation
 * }
 * ```
 */
export function vscodeCommand(ids: string | string[], options?: CommandOptions) {
    return (command: CommandFn) => {
        if (typeof ids === 'string') {
            ids = [ ids ];
        }
        for (const id of ids) {
            if (commandRegistry[id]) {
                throw new Error(`Command with id "${id}" is already registered; command ids should be unique`);
            }
            commandRegistry[id] = { command, options };
        }
    };
}

/**
 * Class responsible for routing and handling command calls in a consistent way
 * for the Vlocode extension. Holds
 */
@injectable({ lifecycle: LifecyclePolicy.singleton })
export default class CommandRouter {
    private readonly commands = new Map<string, CommandExecutor>();
    private readonly commandTypes = new Map<string, string>();
    private readonly commandRegistrations = new Map<string, vscode.Disposable>();

    constructor(private readonly logger: Logger) {
        for (const [ id, { command, options } ] of Object.entries(commandRegistry)) {
            this.register(id, command, options);
        }
        this.logger.info(`Registered ${this.commands.size} vscode commands`);
    }

    public dispose() {
        for (const registration of this.commandRegistrations.values()) {
            registration.dispose();
        }

        this.commands.clear();
        this.commandTypes.clear();
        this.commandRegistrations.clear();
    }

    public async execute(commandName: VlocodeCommand, args?: any[]): Promise<void>;
    public async execute(commandName: string, args?: any[]): Promise<void>;
    public async execute(commandName: VlocodeCommand | string, args?: any[]) : Promise<void> {
        const command = this.commands.get(commandName);
        if (command) {
            await command.execute(...(args ?? []));
        } else {
            return vscode.commands.executeCommand(commandName, ...(args ?? []));
        }
    }

    public registerAll(commands: { [name: string]: CommandFn }) : void{
        Object.entries(commands).forEach(entry => this.register(...entry));
    }

    public register(name: string, commandFn: CommandFn, options?: CommandOptions) : Command {
        const command = new CommandExecutor(name, this.createCommand(commandFn, options), options);

        // Store command by Id
        this.commands.set(name, command);

        if (typeof commandFn === 'function' && commandFn.name) {
            // Store command by class reference
            this.commandTypes.set(commandFn.name, name);
        }

        // register command in VScode
        this.logger.verbose(`Regsiter command: ${name}`);
        this.commandRegistrations.set(name, vscode.commands.registerCommand(name, command.execute, command));
        this.initializeCommand(name, command);
        return command;
    }

    private createCommand(commandCtor: CommandFn, options?: CommandOptions): Command {
        if (typeof commandCtor === 'function' && 'prototype' in commandCtor) {
            // @ts-ignore ctor is a newable type
            return new lazy(() => new commandCtor(...options?.params ?? []));
        } else if ('execute' in commandCtor) {
            return commandCtor;
        }
        return { execute: commandCtor };
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
            setTimeout(async () => {
                try {
                    await commandInitialize.call(cmd);
                } catch(err) {
                    this.logger.error(`Failed to initialize command ${id} due to initialization error: ${err}`);
                }
            }, 1);
        }
    }
}