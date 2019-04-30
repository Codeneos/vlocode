import * as vscode from 'vscode';
import { container } from 'serviceContainer';
import CommandRouter from 'services/commandRouter';
import { VlocodeCommand } from '../constants';
import { EventHandlerBase } from 'events/eventHandlerBase';

export default class DatapackSavedEventHandler extends EventHandlerBase<vscode.TextDocument> {
    constructor(event: vscode.Event<vscode.TextDocument>) {
        super(event);
    }
   
    protected async handleEvent(document: vscode.TextDocument): Promise<void> {       
        this.logger.verbose(`DatapackSavedEventHandler: ${document.uri}`);
        if (this.vloService.config.deployOnSave) {
            if (document.uri.fsPath.includes('.vscode') || 
                document.uri.fsPath.includes('.git') ||
                !vscode.workspace.getWorkspaceFolder(document.uri)) {
                this.logger.verbose(`File not in workspace or in ignored directory: ${document.uri.fsPath}`);
                return; // ignore these
            }
            this.logger.verbose(`Requesting deploy for: ${document.uri.fsPath}`);
            return container.get(CommandRouter).execute(VlocodeCommand.deployDatapack, document.uri, null, false);
        }
    }
}
