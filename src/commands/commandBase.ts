import * as vscode from 'vscode';

import VlocodeService from 'lib/vlocodeService';
import { Logger, LogManager } from 'lib/logging';
import { Command } from 'lib/command';
import { getContext } from 'lib/vlocodeContext';
import cache from 'lib/util/cache';
import SalesforceService from 'lib/salesforce/salesforceService';

export class ProgressToken {
    private resolved = false;

    constructor(
        private readonly progressResolve : () => void,
        private readonly progressReject :  (reason?: any) => void,
        private readonly progress : vscode.Progress<{ message?: string; increment?: number }>,
        private readonly cancelToken? : vscode.CancellationToken) {
    }

    public get cancellationToken() : vscode.CancellationToken | undefined {
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

export abstract class CommandBase implements Command {

    public abstract execute(...args: any[]): void | Promise<void>;

    public validate?(...args: any[]): void | Promise<void> {
    }

    protected get currentOpenDocument() : vscode.Uri | undefined {
        return vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : undefined;
    }

    protected get selectedText() : string | undefined {
        return vscode.window.activeTextEditor && vscode.window.activeTextEditor.selection
            ? vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection)
            : undefined;
    }

    protected async startProgress(title: string, cancellable?: boolean) : Promise<ProgressToken> {
        return new Promise<ProgressToken>(progressTokenResolve => {
            void this.vlocode.withActivity({
                location: vscode.ProgressLocation.Notification,
                progressTitle: title,
                cancellable: cancellable == true
            }, (porgress, cancelToken) => {
                return new Promise<void>((resolve, reject) => {
                    progressTokenResolve(new ProgressToken(resolve, reject, porgress, cancelToken));
                });
            });
        });
    }

    /**
     * Show a warning message about making changes to a production org allowing the user to cancel the operation in case it was unintended
     * @param throwException Throw an exception instead of returning a boolean; default behavior is throwing an exception
     */
    protected async showProductionWarning(throwException = true) : Promise<never | boolean> {
        const productionWarning = await vscode.window.showQuickPick([
            { continue: false, label: '$(circle-slash) No', description: 'cancel the current operation' },
            { continue: true, label: '$(check) Yes', description: 'continue and make changes to the connected Production instance' }
        ], { placeHolder: 'Make changes to connected Production instance?' });

        if(!productionWarning || !productionWarning.continue ) {
            if (throwException) {
                throw new Error('Operation cancelled by user after making changes to production warning');
            }
            return false;
        }

        return true;
    }

    //@cache(-1)
    protected get logger() : Logger {
        return LogManager.get(this.getName());
    }

    //@cache(-1)
    protected get vlocode() : VlocodeService {
        return getContext().service;
    }

    private getName() : string {
        return this.constructor?.name || 'Command';
    }
}
