import * as vscode from 'vscode';
import { DatapackCommand } from './datapackCommand';

export default class CloneDatapackCommand extends DatapackCommand {

    constructor(name : string) {
        super(name);
    }

    public execute(...args: any[]) : Promise<void> {
       return this.cloneDatapack(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async cloneDatapack(selectedFiles: vscode.Uri[]) : Promise<any> {
        const datapacks = await this.showProgress('Loading datapack...', this.loadDatapacks(selectedFiles));

        for (const datapack of datapacks) {
            if (!datapack || datapack.name === undefined) {
                this.logger.warn(`Datapack ${datapack.name} cannot be cloned as it doesn't have a name property`);
                vscode.window.showWarningMessage('The datapack does not have a Name property');
                continue;
            }
    
            const newName = await vscode.window.showInputBox({ 
                prompt: `Name for clone of ${datapack.name}...`, 
                ignoreFocusOut: true, 
                value: `${datapack.name}-clone`,
            });            
            if (!newName) {
                return;
            }

            datapack.rename(newName);
            datapack.regenerateGlobalKey();
            
            await this.showProgress(`Cloning ${datapack.name}...`, this.vloService.datapackService.expandDatapack(datapack, datapack.projectFolder));
        }
    }
}
