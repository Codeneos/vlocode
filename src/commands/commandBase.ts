import * as vscode from 'vscode';

import VlocodeService from 'services/vlocodeService';
import { container } from 'serviceContainer';
import { Logger, LogManager } from 'logging';
import { Command } from 'models/command';
import VlocodeContext from 'models/vlocodeContext';

export class ProgressToken {
    private resolved = false;

    constructor(
        private readonly progressResolve : () => void, 
        private readonly progressReject :  (reason?: any) => void, 
        private readonly progress : vscode.Progress<{ message?: string, increment?: number }>, 
        private readonly cancelToken : vscode.CancellationToken) {
    }
    
    public get cancellationToken() : vscode.CancellationToken {
        return this.cancelToken;
    }

    public complete() : void {
        if (!this.resolved) {
            this.progressResolve();
            this.resolved = true;
        }
    }

    public report(message: string, progress?: number ) : void {
        if (!this.resolved) {
            this.progress.report({ message: message, increment: progress });
        }
    }

    public increment(amount: number) : void {
        if (!this.resolved) {
            this.progress.report({ increment: amount });
        }
    }
}

type ShowMessageFunction<T> = (msg : string, options: vscode.MessageOptions, ...args: vscode.MessageItem[]) => Thenable<T>;
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

    protected async startProgress(title: string, cancellable?: boolean) : Promise<ProgressToken> {
        return new Promise<ProgressToken>(progressTokenResolve => {
            this.vloService.withActivity({
                    location: vscode.ProgressLocation.Notification, 
                    progressTitle: title, 
                    cancellable 
                }, (porgress, cancelToken) => {
                    return new Promise<void>((resolve, reject) => { 
                        progressTokenResolve(new ProgressToken(resolve, reject, porgress, cancelToken));
                    });
                });
        });
    }

    protected showErrorWithRetry<T>(errorMsg : string, retryCallback: (...args) => Promise<T>, thisArg?: any, ...args : any[]) : Thenable<T> {
        return showMsgWithRetry<T>(vscode.window.showErrorMessage, errorMsg, retryCallback, thisArg, args);
    }
    
    protected showWarningWithRetry<T>(errorMsg : string, retryCallback: (...args) => Promise<T>, thisArg?: any, ...args : any[]) : Thenable<T> {
        return showMsgWithRetry<T>(vscode.window.showWarningMessage, errorMsg, retryCallback, thisArg, args);
    }

    protected get vloService() : VlocodeService {
        return container.get(VlocodeService);
    }

    protected get extensionContext() : VlocodeContext {
        return this.vloService.getContext();
    }

    protected get logger() : Logger {
        return LogManager.get(this.name);
    }
}

