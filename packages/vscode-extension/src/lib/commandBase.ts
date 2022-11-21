import * as vscode from 'vscode';

import VlocodeService from '@lib/vlocodeService';
import { container, LogManager } from '@vlocode/core';
import { Command } from '@lib/command';
import { getContext } from '@lib/vlocodeContext';
import { lazy } from '@vlocode/util';

export abstract class CommandBase implements Command {

    protected readonly logger = LogManager.get(this.getName());
    protected readonly vlocode = lazy(() => container.get(VlocodeService));

    public abstract execute(...args: any[]): any | Promise<any>;

    public validate?(...args: any[]): any | Promise<any>;

    protected get currentOpenDocument() : vscode.Uri | undefined {
        return vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : undefined;
    }

    protected get selectedText() : string | undefined {
        return vscode.window.activeTextEditor && vscode.window.activeTextEditor.selection
            ? vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection)
            : undefined;
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

    private getName() : string {
        return this.constructor?.name || 'Command';
    }
}
