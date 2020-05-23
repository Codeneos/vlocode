import * as path from 'path';
import * as vscode from 'vscode';
import { DatapackCommand } from './datapackCommand';

export default class RenameDatapackCommand extends DatapackCommand {

    public execute(...args: any[]) : Promise<void> {
        return this.renameDatapack(args[0] || this.currentOpenDocument);
    }

    protected async renameDatapack(selectedFile: vscode.Uri) : Promise<any> {
        const [datapack] = await this.vlocode.withProgress('Loading datapack...', () => this.loadDatapacks([selectedFile]));

        if (!datapack || datapack.name === undefined) {
            return vscode.window.showWarningMessage('The selected datapack does not have a Name property');
        }

        const newName = await vscode.window.showInputBox({
            prompt: `Enter new name for ${datapack.name}...`,
            ignoreFocusOut: true,
            value: datapack.name
        });
        if (!newName) {
            return;
        }
        if (datapack.name == newName) {
            return vscode.window.showWarningMessage('The new name cannot be same the old name');
        }

        // execute rename and expand into new folder structure
        datapack.rename(newName);
        await this.vlocode.withProgress(`Renaming ${datapack.name}...`, () => this.vlocode.datapackService.expandDatapack(datapack, datapack.projectFolder));

        const changes = new vscode.WorkspaceEdit();
        changes.deleteFile(vscode.Uri.file(path.dirname(datapack.headerFile)), { recursive: true, ignoreIfNotExists: false });

        const applied = await vscode.workspace.applyEdit(changes);
        if (!applied) {
            // TODO: Open renamed datapack
        }
    }
}
