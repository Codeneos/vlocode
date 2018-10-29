import * as vscode from 'vscode';

import VlocodeService from '../services/vlocodeService';
import VlocityDatapackService, * as vds from '../services/vlocityDatapackService';
import * as s from '../singleton';
import { Logger } from '../loggers';

/** Default command interface */
export interface ICommand {
    name: string;
    withProgress?: boolean;
    withProgressOptions?: vscode.ProgressOptions;
    execute(... args: any[]): void;
}

export abstract class Command implements ICommand {

    public name: string;    
    private executor: (... args: any[]) => void

    constructor(name: string, executor?: (... args: any[]) => void) {
        this.name = name;
        this.executor = executor;
    }

    public execute(... args: any[]): void {
        return this.executor(args);
    }

    protected get extensionContext() : vscode.ExtensionContext {
        return s.get(VlocodeService).getContext();
    }

    protected get logger() : Logger {
        return s.get(Logger);
    }
}

