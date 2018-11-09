
import * as serviceProvider from '../singleton';
import { Logger } from '../loggers';
import VlocodeService from './vlocodeService';
import * as vscode from 'vscode';
import { Command, CommandMap } from "../models/command";
import { VlocodeCommand } from '../commands';

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
        private command: Command, 
        private readonly messageItemsConfigError = [
            { title: 'Select org', command: VlocodeCommand.selectOrg },
            { title: 'Open settings', command: 'workbench.action.openWorkspaceSettings' }
        ]) { }    

    public get name() : string {
        return this.command.name;
    }

    protected get logger() : Logger {
        return serviceProvider.get(Logger);
    }

    protected get vlocode() : VlocodeService {
        return serviceProvider.get(VlocodeService);
    }

    public async execute(... args: any[]) : Promise<void> {
        let configValidation = this.vlocode.validateConfig() || 
                               this.vlocode.validateSalesforce();
                               
        if (configValidation){
            this.logger.error(`${this.name}: ${configValidation}`);
            return vscode.window.showErrorMessage(configValidation, { modal: false }, ...this.messageItemsConfigError).then(outcome => {
                if (outcome && outcome.command){
                    vscode.commands.executeCommand(outcome.command);
                }
            });
        }

        this.logger.verbose(`Invoke command ${this.name}`);
        try {
            await this.command.execute.apply(this.command, args);
            this.logger.verbose(`Execution of command ${this.name} done`);
        } catch(err) {
            this.logger.error(`Command execution resulted in error: ${err}`);
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
        return serviceProvider.get(Logger);
    }

    protected get vlocode() : VlocodeService {
        return serviceProvider.get(VlocodeService);
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
        if (this[commandName]) {
            return this[commandName].execute(...args);
        }
        return vscode.commands.executeCommand(commandName, ...args);
    }

    public register(name: string, commandCtor: ((...args: any[]) => void) | CommandCtor) : Command {
        const command = new CommandExecutor(this.createCommand(name, commandCtor));
        const index = this._commands.push(command);
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