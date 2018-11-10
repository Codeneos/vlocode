import * as vscode from 'vscode';

import VlocodeService from 'services/vlocodeService';
import { container } from 'serviceContainer';
import { Logger, LogProvider } from 'loggers';
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

export abstract class CommandBase implements Command {

    constructor(
        public readonly name: string, 
        private readonly executor?: (... args: any[]) => void) {
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

    protected get vloService() : VlocodeService {
        return container.get(VlocodeService);
    }

    protected get extensionContext() : vscode.ExtensionContext {
        return this.vloService.getContext();
    }

    protected get logger() : Logger {
        return LogProvider.get(this.name);
    }
}

