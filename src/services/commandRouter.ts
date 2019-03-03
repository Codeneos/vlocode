
import { container } from 'serviceContainer';
import { Logger, LogManager } from 'loggers';
import VlocodeService from 'services/vlocodeService';
import * as vscode from 'vscode';
import { Command, CommandMap } from "models/command";
import { VlocodeCommand } from 'commands';
import { isError } from 'util';

type CommandCtor = (new(name: string) => Command);

class LazyCommand implements Command {
    private instance: Command;

    constructor(
        public readonly name: string, 
        private ctor: CommandCtor) {
    }

    public execute(... args: any[]){
        if (!this.instance) {
            this.instance = new this.ctor(this.name);
        }
        return this.instance.execute(...args);
    }
}

class CommandExecutor implements Command {
    constructor(
        private command: Command 
    ) { }    

    public get name() : string {
        return this.command.name;
    }

    protected get logger() : Logger {
        return LogManager.get(CommandExecutor);
    }

    protected get vlocode() : VlocodeService {
        return container.get(VlocodeService);
    }

    public async execute(... args: any[]) : Promise<void> {        
        this.logger.verbose(`Invoke command ${this.name}`);
        try {
            await this.command.execute.apply(this.command, args);
            this.logger.verbose(`Execution of command ${this.name} done`);
        } catch(err) {
            this.logger.error(`Command error: ${err}`);
            if (isError(err)) {
                this.logger.error(err.stack);                
            }
            vscode.window.showErrorMessage(`${this.name}: ${err}`);
        }
    }
}

/**
 * Class responsible for routing and handling command calls in a consistent way 
 * for the Vlocode extension. Holds 
 */
export default class CommandRouter implements CommandMap {
    [commandName: string]: Command | any;
    private _commands : Command[] = [];

    protected get logger() : Logger {
        return LogManager.get(CommandRouter);
    }

    protected get vlocode() : VlocodeService {
        return container.get(VlocodeService);
    }

    protected get count() : number {
        return this._commands.length;
    }

    constructor(commands?: { [name: string]: CommandCtor }) {
        if(commands) {
            this.registerAll(commands);
        }
    }

    public execute(commandName : VlocodeCommand | string, ...args: any[]) : Thenable<any> {
        const command : Command = this[commandName];
        if (command) {
            return Promise.resolve(command.validate(...args)).then(_ => command.execute(...args));
        }
        return vscode.commands.executeCommand(commandName, ...args);
    }

    public register(name: string, commandCtor: ((...args: any[]) => void) | CommandCtor) : Command {
        const command = new CommandExecutor(this.createCommand(name, commandCtor));
        const index = this._commands.push(command) - 1;
        Object.defineProperty(this, name, { get: () => this._commands[index] });
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