import * as vscode from 'vscode';
import { container } from 'serviceContainer';
import CommandRouter from 'services/commandRouter';
import { VlocodeCommand } from 'commands';
import { EventHandlerBase } from 'events/eventHandlerBase';

export default class DatapackSavedEventHandler extends EventHandlerBase<vscode.TextDocument> {
    constructor(event: vscode.Event<vscode.TextDocument>) {
        super(event);
    }
   
    protected async handleEvent(document: vscode.TextDocument): Promise<void> {        
        if (this.vloService.config.deployOnSave) {
            return container.get(CommandRouter).execute(VlocodeCommand.deployDatapack, document.uri);
        }
    }
}
