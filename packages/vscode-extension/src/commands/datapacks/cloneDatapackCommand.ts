import { VlocodeCommand } from '@root/constants';
import { vscodeCommand } from '@root/lib/commandRouter';
import { DatapackExportQueries } from '@root/lib/vlocity/datapackExportQueries';
import { container } from '@vlocode/core';
import { VlocityDatapack } from '@vlocode/vlocity-deploy';
import path = require('path');
import * as vscode from 'vscode';
import { DatapackCommand } from './datapackCommand';

@vscodeCommand(VlocodeCommand.cloneDatapack)
export default class CloneDatapackCommand extends DatapackCommand {

    protected get exportQueries(): DatapackExportQueries {
        return container.get(DatapackExportQueries);
    }

    public execute(...args: any[]) : Promise<void> {
        return this.cloneDatapacks(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async cloneDatapacks(selectedFiles: vscode.Uri[]) : Promise<any> {        
        const datapacks = await this.vlocode.withProgress('Loading datapack...', () => this.loadDatapacks(selectedFiles));
        for (const datapack of datapacks) {
            await this.cloneDatapack(datapack, { updateGlobalKey: true });  
        }
    }

    protected async cloneDatapack(datapack: VlocityDatapack, options?: { updateGlobalKey?: boolean }) : Promise<any> {
        const matchingFields = await this.exportQueries.getMatchingFields(datapack.datapackType);

        if (!matchingFields) {
            return vscode.window.showWarningMessage('The selected datapack does not have any matching fields');
        }

        if (datapack.name && !matchingFields.includes('Name')) {
            matchingFields.push('Name');
        }

        for (const field of matchingFields) {
            const value = await vscode.window.showInputBox({
                prompt: `Enter ${field}...`,
                ignoreFocusOut: true,
                value: datapack[field]
            });  
            
            if (value === undefined) {
                return;
            }            
  
            if (field === 'Name') {
                datapack.rename(value);
            } else {
                datapack.updateField(field, value);
            }
        }

        // Regen global keys
        if (options?.updateGlobalKey) {
            datapack.regenerateGlobalKey();
        }

        // execute rename and expand into new folder structure
        await this.vlocode.withProgress(`Expanding ${datapack.name}...`, () => this.vlocode.datapackService.expandDatapack(datapack, datapack.projectFolder));
    }
}
