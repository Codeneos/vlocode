import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';
import * as path from 'path';
import * as vscode from 'vscode';
import CloneDatapackCommand from './cloneDatapackCommand';

@vscodeCommand(VlocodeCommand.renameDatapack)
export default class RenameDatapackCommand extends CloneDatapackCommand {

    public execute(...args: any[]) : Promise<void> {
        return this.renameDatapack(args[0] || this.currentOpenDocument);
    }

    protected async renameDatapack(selectedFile: vscode.Uri) : Promise<any> {        
        const [ datapack ] = await this.vlocode.withProgress('Loading datapack...', () => this.loadDatapacks([ selectedFile ]));
        await this.cloneDatapack(datapack, { updateGlobalKey: false });

        // Delete old Datapack after rename
        const changes = new vscode.WorkspaceEdit();
        changes.deleteFile(vscode.Uri.file(path.dirname(datapack.headerFile!)), { recursive: true, ignoreIfNotExists: false });
        await vscode.workspace.applyEdit(changes);
    }
}
