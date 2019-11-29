
import { container } from 'serviceContainer';
import { Logger, LogManager } from 'logging';
import VlocodeService from 'services/vlocodeService';
import * as vscode from 'vscode';
import { Command, CommandMap } from "models/command";
import { VlocodeCommand } from '@constants';
import { isError } from 'util';

type CommandCtor = (new(name: string) => Command);

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
        return this.getCreateInstance().validate(...args);
    }    

    private getCreateInstance() {
        return this.instance || (this.instance = new this.ctor(this.name));
    }
}

class CommandExecutor implements Command {
    constructor(
        private readonly command: Command
    ) { }

    public get name() : string {
        return this.command.name;
    }

    private get logger() : Logger {
        return LogManager.get(CommandExecutor);
    }

    private get vlocode() : VlocodeService {
        return container.get(VlocodeService);
    }

    public async execute(... args: any[]) : Promise<void> {
        this.logger.verbose(`Invoke command ${this.name}`);
        await Promise.resolve(this.validate(...args));
        try {
            await this.command.execute.apply(this.command, args);
            this.logger.verbose(`Execution of command ${this.name} done`);
        } catch(err) {
            this.logger.error(`Command error: ${err}`);
            if (isError(err)) {
                this.logger.error(err);
            }
            vscode.window.showErrorMessage(`${this.name}: ${err}`);
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
export default class CommandRouter implements CommandMap {
    [commandName: string]: Command | any;
    private readonly commands : Command[] = [];

    protected get logger() : Logger {
        return LogManager.get(CommandRouter);
    }

    protected get vlocode() : VlocodeService {
        return container.get(VlocodeService);
    }

    protected get count() : number {
        return this.commands.length;
    }

    constructor(commands?: { [name: string]: CommandCtor }) {
        if(commands) {
            this.registerAll(commands);
        }
    }

    public async execute(commandName : VlocodeCommand | string, ...args: any[]) : Promise<void> {
        const command : Command = this[commandName];
        if (command) {
            return command.execute(...args);
        }
        return vscode.commands.executeCommand(commandName, ...args);
    }

    public register(name: string, commandCtor: ((...args: any[]) => void) | CommandCtor) : Command {
        const command = new CommandExecutor(this.createCommand(name, commandCtor));
        const index = this.commands.push(command) - 1;
        Object.defineProperty(this, name, { get: () => this.commands[index] });
        this.vlocode.registerDisposable(vscode.commands.registerCommand(command.name, command.execute, command));
        return command;
    }

    public createCommand(name: string, commandCtor: any) : Command {
        if ('prototype' in commandCtor) {
            return new LazyCommand(name, commandCtor);
        } 
        return { name: name, execute: commandCtor };
    }

    public registerAll(commands: { [name: string]: ((...args: any[]) => void) | CommandCtor }) : void{
        Object.keys(commands).forEach(key => {
            this.register(key, commands[key]);
        });
    }
}