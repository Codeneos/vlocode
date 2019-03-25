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
        if (this.vloService.config.deployOnSave) {
            console.debug('# Handle onDidSaveEvent');
            if (document.uri.fsPath.includes('.vscode') || 
                document.uri.fsPath.includes('.git') ||
                !vscode.workspace.getWorkspaceFolder(document.uri)) {
                return; // ignore these
            }
            return container.get(CommandRouter).execute(VlocodeCommand.deployDatapack, document.uri, null, false);
        }
    }
}
