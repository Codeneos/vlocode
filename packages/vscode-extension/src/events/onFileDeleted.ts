import { EventHandlerBase } from './eventHandlerBase';
import * as vscode from 'vscode';

export default class extends EventHandlerBase<vscode.Uri> {

    public get enabled() : boolean {
        const manageMetadata = this.vloService.config?.salesforce.enabled && this.vloService.config.salesforce.manageMetaXmlFiles;
        const orgSelected = !!this.vloService.config?.sfdxUsername;
        return !!manageMetadata && orgSelected;
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
