import * as vscode from 'vscode';

import VlocodeService from '../lib/vlocodeService';
import { container, LogManager } from '@vlocode/core';
import { Command } from '../lib/command';
import { getContext, VlocodeContext } from '../lib/vlocodeContext';
import { forEachAsyncParallel, Iterable, lazy } from '@vlocode/util';
import { OutputChannelManager } from './outputChannelManager';
import { CommandLogger } from './commandLogger';

type CommandOutputOptions<T = {}> = Partial<T> & {
    appendEmptyLine?: boolean;
    focus?: boolean;
}

const TerminalCharacters = {
    HorizontalLine: String.fromCharCode(0x2015),
    HorizontalLineBold: String.fromCharCode(0x2501),
    VerticalLine: String.fromCharCode(0x2502),
    VerticalLineBold: String.fromCharCode(0x2503)
} as const;

export abstract class CommandBase implements Command {

    private outputLogger?: CommandLogger;
    private outputChannel?: vscode.OutputChannel;
    
    protected outputChannelName?: string;
    protected readonly logger = LogManager.get(this.getName());
    protected readonly vlocode = lazy(() => container.get(VlocodeService));

    protected get output() {
        return this.outputLogger ?? (this.outputLogger = new CommandLogger(this.getOutputChannel()));
    }

    public abstract execute(...args: any[]): any | Promise<any>;

    public validate?(...args: any[]): any | Promise<any>;

    public get context(): VlocodeContext {
        return getContext();
    }

    protected get currentOpenDocument() : vscode.Uri | undefined {
        return vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : undefined;
    }

    protected get selectedText() : string | undefined {
        return vscode.window.activeTextEditor && vscode.window.activeTextEditor.selection
            ? vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection)
            : undefined;
    }
    
    /**
     * Saves all open and dirty text documents in the workspace, optionally limited to the specified files.
     *
     * @param files - An optional array of `vscode.Uri` objects representing the files to save. 
     *                If not provided, all dirty documents will be saved.
     * @returns A list of saved documents or an empty array if no documents were dirty.
     */
    protected async saveOpenDocuments(files?: Iterable<{ toString(): string } | string>) {
        const fileUris = files ? new Set(Iterable.map(files, file => typeof file === 'string' ? file : file.toString())) : undefined;
        const dirtyDocuments = vscode.workspace.textDocuments.filter(d => d.isDirty && (!fileUris || fileUris.has(d.uri.fsPath)  || fileUris.has(d.uri.toString())));
        if (dirtyDocuments.length === 0) {
            return [];
        }
        await forEachAsyncParallel(dirtyDocuments, doc => doc.save(), 4);
        return dirtyDocuments;
    }

    protected getName() : string {
        return this.constructor?.name || 'Command';
    }

    protected getOutputChannel() {
        if (!this.outputChannel) {
            this.outputChannel = this.outputChannelName
                ? OutputChannelManager.get(this.outputChannelName)
                : OutputChannelManager.getDefault();
        }
        return this.outputChannel;
    }
}
