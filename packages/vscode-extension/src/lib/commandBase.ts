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

    private getName() : string {
        return this.constructor?.name || 'Command';
    }
}
