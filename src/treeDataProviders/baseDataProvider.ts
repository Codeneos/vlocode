import * as vscode from 'vscode';
import ServiceContainer from 'serviceContainer';
import VlocodeService from 'services/vlocodeService';
import CommandRouter, { CommandType } from 'services/commandRouter';

/**
 * Base tree data provider
 */
export default abstract class BaseDataProvider<T> implements vscode.TreeDataProvider<T> {
    
    protected readonly dataChangedEmitter = new vscode.EventEmitter<T | undefined>();
    
	public get onDidChangeTreeData(): vscode.Event<T | undefined> {
		return this.dataChangedEmitter.event;
    }
    
    constructor(private readonly container: ServiceContainer) {
        this.commandRouter.registerAll(this.getCommands()); 
    }    

    protected get vlocode() : VlocodeService {
        return this.container.get(VlocodeService);
    }
        
    protected get commandRouter() : CommandRouter {
       return this.container.get(CommandRouter);
    }
    
    protected getAbsolutePath(path: string) {
        return this.vlocode.asAbsolutePath(path);
    }

    protected executeCommand(commandName: string, ... args: any[]) : Promise<any> {
        return this.commandRouter.execute(commandName, ...args);
     }

    public refresh(node?: T): void {
        this.dataChangedEmitter.fire(node);
    }
    
    protected getCommands() : {
        [name: string]: ((...args: any[]) => void) | Promise<CommandType> | CommandType 
    } {
        return {};
    }

    public abstract getTreeItem(node: T): vscode.TreeItem;

    public abstract getChildren(node?: T): Promise<T[] | undefined> | T[] | undefined;

    protected getItemIconPath(icon: { light: string, dark: string } | string) : { light: string, dark: string } | string | undefined {
        if(!icon) {
            return undefined;
        }
        if (typeof icon === 'string') {
            return this.getAbsolutePath(icon);
        }
        if (typeof icon === 'object') {
            return {
                light: this.getAbsolutePath(icon.light),
                dark: this.getAbsolutePath(icon.dark)
            };
        }
    }
}