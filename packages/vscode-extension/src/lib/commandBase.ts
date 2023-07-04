import * as vscode from 'vscode';

import VlocodeService from '../lib/vlocodeService';
import { container, LogManager } from '@vlocode/core';
import { Command } from '../lib/command';
import { getContext } from '../lib/vlocodeContext';
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
     * Show a warning message about making changes to a production org allowing
     * the user to cancel the operation in case it was unintended.
     *
     * By default this method will throw an exception if the user cancels the operation, use overload with the `throwException` parameter to change this behavior.
     *
     * @param throwException Throw an exception if the user cancels the operation
     */
    protected async showProductionWarning(throwException?: true) : Promise<never | true>;
    protected async showProductionWarning(throwException: false) : Promise<boolean>;
    protected async showProductionWarning(throwException = true) : Promise<never | boolean> {
        const productionWarning = await vscode.window.showWarningMessage(
            'Make changes to a Production org?',
            {
                detail: 'You are about to make changes to a Production org. It is not recommended to direcly make changes to a Production instance doing so may result in data loss. Are you sure you want to continue?',
                modal: true,
            }, 'Yes', 'No'
        );

        if (productionWarning !== 'Yes') {
            if (throwException) {
                throw new Error('Operation cancelled by user due to production warning');
            }
            return false;
        }

        return true;
    }

    private getName() : string {
        return this.constructor?.name || 'Command';
    }
}
