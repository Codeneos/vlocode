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

export class ProgressToken {

    private progressResolve : () => void;
    private progressReject : (reason?: any) => void;
    private progress : vscode.Progress<{ message?: string }>;
    private resolved: boolean = false;

    constructor(progressResolve : () => void, progressReject : (reason?: any) => void, progress : vscode.Progress<{ message?: string }>) {
        this.progressResolve = progressResolve;
        this.progressReject = progressReject;
        this.progress = progress;
    }

    public complete() : void {
        if (!this.resolved) {
            this.progressResolve();
            this.resolved = true;
        }
    }

    public report(message: string) : void {
        if (!this.resolved) {
        this.progress.report({ message: message });
        }
    }
}

export abstract class Command implements ICommand {

    public name: string;    
    private executor: (... args: any[]) => void;

    constructor(name: string, executor?: (... args: any[]) => void) {
        this.name = name;
        this.executor = executor;
    }

    public execute(... args: any[]): void {
        return this.executor(args);
    }

    protected async startProgress(title: string) : Promise<ProgressToken> {
        let progressPromise = new Promise<ProgressToken>(progressTokenResolve => {
            vscode.window.withProgress(
                {location: vscode.ProgressLocation.Notification, title: title, cancellable: false }, 
                p => new Promise<void>((resolve, reject) => { 
                    progressTokenResolve(new ProgressToken(resolve, reject, p));
                }));
        });        
        return await progressPromise; 
    }

    protected showProgress<T>(title: string, task: Promise<T>) : Thenable<T> {
        return vscode.window.withProgress(
            {location: vscode.ProgressLocation.Notification, title: title, cancellable: false }, 
            p => task);
    }

    protected get extensionContext() : vscode.ExtensionContext {
        return s.get(VlocodeService).getContext();
    }

    protected get logger() : Logger {
        return s.get(Logger);
    }
}

