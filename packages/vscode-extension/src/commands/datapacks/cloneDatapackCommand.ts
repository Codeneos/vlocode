import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';
import { DatapackExportQueries } from '../../lib/vlocity/datapackExportQueries';
import { container } from '@vlocode/core';
import { VlocityDatapack } from '@vlocode/vlocity';

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
            const datapackName = datapack.name || datapack.sourceKey;
            await this.cloneDatapack(datapack, { updateGlobalKey: true });
            const clonedDatapackName = datapack.name || datapack.sourceKey;
            vscode.window.showInformationMessage(`Cloned datapack ${datapackName} as ${clonedDatapackName}`);
        }
    }

    protected async cloneDatapack(datapack: VlocityDatapack, options?: { updateGlobalKey?: boolean }) : Promise<any> {
        const matchingFields = await this.exportQueries.getMatchingFields(datapack.datapackType);
        const datapackName = datapack.name || datapack.sourceKey;

        if (!matchingFields) {
            return vscode.window.showWarningMessage('The selected datapack does not have any matching fields');
        }

        if (datapack.name && !matchingFields.includes('Name')) {
            matchingFields.push('Name');
        }

        for (const field of matchingFields) {
            if (/Global[a-z]*Key__c$/i.test(field)) {
                continue;
            }
            const currentValue = datapack[field];
            const value = await this.getMatchingKeyFieldValue(field, currentValue);

            if (field === 'Name') {
                if (typeof value !== 'string') {
                    throw new Error('The datapack name field must be a string');
                }
                datapack.rename(value);
            } else {
                datapack.updateField(field, value);
            }
        }

        // Regen global keys
        if (options?.updateGlobalKey) {
            datapack.updateGlobalKeyField();
        }

        // execute rename and expand into new folder structure
        await this.vlocode.withActivity(
            `Clone datapack ${datapackName}...`,
            async () => {
                await this.vlocode.datapackService.expandDatapack(datapack, datapack.projectFolder!);
            }
        );
    }

    private async getMatchingKeyFieldValue(field: string, currentValue: any) {
        const newValue = await vscode.window.showInputBox({
            prompt: `Enter new value for: ${field}`,
            ignoreFocusOut: true,
            value: `${currentValue}`
        });

        if (newValue === undefined) {
            throw new Error(`Operation cancelled, no value provided for: ${field}`);
        }

        if (typeof currentValue === 'number') {
            const numberValue = Number(newValue);
            return isNaN(numberValue) ? newValue : numberValue;
        }

        if (typeof currentValue === 'boolean') {
            if (/true|yes|1/i.test(newValue)) {
                return true;
            } else if (/false|no|0/i.test(newValue)) {
                return false;
            }
            throw new Error(`${field} requires a boolean value, "${
                    newValue
                }" cannot be converted to a boolean. Use "true" or "false" instead.`);
        }

        return newValue;
    }
}
