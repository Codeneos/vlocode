import { EventHandlerBase } from 'events/eventHandlerBase';
import * as path from 'path';
import * as vscode from 'vscode';

export default class OnClassFileDeleted extends EventHandlerBase<vscode.Uri> {

    public get enabled() : boolean {
        return !!(this.vloService.config?.salesforce?.enabled && this.vloService.config?.salesforce.manageMetaXmlFiles);
    }

    protected async handleEvent(document: vscode.Uri): Promise<void> {
        if (!this.enabled) {
            return;
        }
        // Try delete metadata file
        const workspaceEdit = new vscode.WorkspaceEdit();
        workspaceEdit.deleteFile(document.with({ path: `${document.path  }-meta.xml` }), { ignoreIfNotExists: true });
        await vscode.workspace.applyEdit(workspaceEdit);
    }
}
