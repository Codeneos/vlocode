import * as vscode from 'vscode';
import ServiceContainer from 'serviceContainer';
import { EventHandlerBase } from 'events/eventHandlerBase';
import * as path from 'path';

export default class OnClassFileDeleted extends EventHandlerBase<vscode.Uri> {

    constructor(event: vscode.Event<vscode.Uri>, container: ServiceContainer) {
        super(event, container);
    }
   
    protected async handleEvent(document: vscode.Uri): Promise<void> {
        // Try delete metadata file
        const workspaceEdit = new vscode.WorkspaceEdit();
        workspaceEdit.deleteFile(document.with({ path: document.path + '-meta.xml' }), { ignoreIfNotExists: true });
        await vscode.workspace.applyEdit(workspaceEdit);
    }
}
