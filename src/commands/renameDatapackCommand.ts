import * as vscode from 'vscode';
import { DatapackResultCollection } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import * as path from 'path';

export default class RenameDatapackCommand extends DatapackCommand {

    constructor(name : string) {
        super(name);
    }

    public execute(...args: any[]) : Promise<void> {
       return this.renameDatapack(args[0] || this.currentOpenDocument);
    }

    protected async renameDatapack(selectedFile: vscode.Uri) : Promise<any> {
        const [datapack] = await this.vloService.withProgress('Loading datapack...', () => this.loadDatapacks([selectedFile]));

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
        await this.vloService.withProgress(`Renaming ${datapack.name}...`, () => this.vloService.datapackService.expandDatapack(datapack, datapack.projectFolder));

        const changes = new vscode.WorkspaceEdit();
        changes.deleteFile(vscode.Uri.file(path.dirname(datapack.headerFile)), { recursive: true, ignoreIfNotExists: false });
        vscode.workspace.applyEdit(changes);
    }
}
