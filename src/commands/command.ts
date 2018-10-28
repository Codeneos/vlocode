import * as vscode from 'vscode';

import VlocodeService from '../services/vlocodeService';
import VlocityDatapackService, * as vds from '../services/vlocityDatapackService';
import * as s from '../singleton';
import { Logger } from '../loggers';

/** Default command interface */
export interface ICommand {
    name: string;
    execute: (... args) => void;
}

export abstract class Command implements ICommand {

    public name: string;
    public execute: (... args) => void;

    constructor(name: string, execute: (... args) => void) {
        this.name = name;
        this.execute = execute;
    }

    protected get extensionContext() : vscode.ExtensionContext {
        return s.get(VlocodeService).getContext();
    }

    protected get logger() : Logger {
        return s.get(Logger);
    }
}

