import * as vscode from 'vscode';

import VlocodeService from 'services/vlocodeService';
import { container } from 'serviceContainer';
import { Logger, LogManager } from 'loggers';
import { Command } from 'models/command';

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

type ShowMessageFunction<T> = (msg : String, options: vscode.MessageOptions, ...args: vscode.MessageItem[]) => Thenable<T>;
async function showMsgWithRetry<T>(
    msgFunc : ShowMessageFunction<T>, errorMsg : string, retryCallback: (...args: any[]) => Promise<T>, 
    thisArg?: any, args? : any[]) : Promise<T> {            
    const value = await msgFunc(errorMsg, { modal: false }, { title: 'Retry' });
    if (value) {
        if (args !== undefined) {
            return retryCallback.apply(thisArg || null, args || []);
        }
        return retryCallback();
    }
    return value;
}

export abstract class CommandBase implements Command {

    constructor(
        public readonly name: string, 
        private readonly executor?: (... args: any[]) => void) {
    }

    public execute(... args: any[]): void {
        return this.executor(args);
    }

    public validate(... args: any[]): void {
    }

    protected get currentOpenDocument() : vscode.Uri | undefined {
        return vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : undefined;
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

    protected showErrorWithRetry<T>(errorMsg : string, retryCallback: (...args) => Promise<T>, thisArg?: any, ...args : any[]) : Thenable<T> {
        return showMsgWithRetry<T>(vscode.window.showErrorMessage, errorMsg, retryCallback, thisArg, args);
    }
    
    protected showWarningWithRetry<T>(errorMsg : string, retryCallback: (...args) => Promise<T>, thisArg?: any, ...args : any[]) : Thenable<T> {
        return showMsgWithRetry<T>(vscode.window.showWarningMessage, errorMsg, retryCallback, thisArg, args);
    }

    protected showProgress<T>(title: string, task: Promise<T>) : Thenable<T> {
        return vscode.window.withProgress(
            {location: vscode.ProgressLocation.Notification, title: title, cancellable: false }, 
            p => task);
    }

    protected get vloService() : VlocodeService {
        return container.get(VlocodeService);
    }

    protected get extensionContext() : vscode.ExtensionContext {
        return this.vloService.getContext();
    }

    protected get logger() : Logger {
        return LogManager.get(this.name);
    }
}

