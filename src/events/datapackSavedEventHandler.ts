import * as vscode from 'vscode';
import ServiceContainer from 'serviceContainer';
import CommandRouter from 'services/commandRouter';
import { VlocodeCommand } from '../constants';
import { EventHandlerBase } from 'events/eventHandlerBase';
import DatapackUtil, { isPartOfDatapack } from 'datapackUtil';

export default class DatapackSavedEventHandler extends EventHandlerBase<vscode.TextDocument> {
    private readonly ignoredPaths = [
        '\.vscode',
        '\.sfdx',
        '\.git'
    ];

    constructor(event: vscode.Event<vscode.TextDocument>, container: ServiceContainer) {
        super(event, container);
    }
   
    protected async handleEvent(document: vscode.TextDocument): Promise<void> {   
        if (!this.vloService.config.deployOnSave) { 
            return;
        }
        if (!isPartOfDatapack(document.fileName)) {
            return;
        }
        if (!vscode.workspace.getWorkspaceFolder(document.uri) || 
            this.ignoredPaths.some(path => new RegExp(path).test(document.fileName))) {
            this.logger.verbose(`File not in workspace or in ignored directory: ${document.uri.fsPath}`);
            return; // ignore these
        }
        this.logger.verbose(`Requesting deploy for: ${document.uri.fsPath}`);
        return this.container.get(CommandRouter).execute(VlocodeCommand.deployDatapack, document.uri, null, false);
    }
}
