import * as vscode from 'vscode';
import * as constants from '../../constants';

import { DatapackCommand } from './datapackCommand';
import { vscodeCommand } from '../../lib/commandRouter';
import { container } from '@vlocode/core';
import { DatapackImportService } from '@vlocode/vlocity';
import { sortBy } from '@vlocode/util';

@vscodeCommand(constants.VlocodeCommand.importMultipack, { focusLog: true  })
export default class ImportMultipackCommand extends DatapackCommand {

    constructor() {
        super();
    }

    public async execute() : Promise<void>  {
        const multipack = await this.selectMultipack();
        if (!multipack) {
            return; // selection cancelled;
        }
        const result = await this.install(multipack.name);
        vscode.window.showInformationMessage(
            `Multipack ${multipack.name}: ${result.Status} (${result.Total})`,
        );
    }

    private async selectMultipack() {
        const datapacks = await this.salesforce.listStaticResources('DP_%', { contentType: 'text/json' });
        const options = datapacks.map(dp => ({
            label: this.formatLabel(dp.name),
            description: `${dp.id} (${(dp.size / 1024).toFixed(1)} KB)`,            
            datapack: dp
        }))
        const selected = await vscode.window.showQuickPick(
            sortBy(options, 'label'), 
            { placeHolder: 'Select a multipack to install' }
        );
        if (!selected) {
            return; // selection cancelled;
        }
        return selected.datapack;
    }

    private formatLabel(name: string) {
        // Remove 'DP_' prefix
        const label = name.replace(/^DP_/, '');
        // Extract group (first segment)
        const [group, ...rest] = label.split('_');
        // Always use group as prefix, capitalized
        const prefix = group.charAt(0).toUpperCase() + group.slice(1).toLowerCase();
        // Join the rest and split camel case words
        const mainLabel = rest.join('_')
            .replace(/_/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            .replace(/\s+/g, ' ')
            .trim();
        // Capitalize first letter of each word
        const formattedLabel = mainLabel.replace(/\b\w/g, c => c.toUpperCase());
        return `${prefix}: ${formattedLabel}`;
    }

    private install(name: string) { 
        return this.vlocode.withActivity(`Installing multipack`, async (progress, token) => {
            progress.report({ message: `initializing VF remoting...` });
            const multipackService = await container.get(DatapackImportService).initialize(
                this.vlocode.getNamespace()
            );
            return await multipackService.installMultipack(name, {
                progress: (status) => {
                    progress.report({ 
                        message: `${status.status} (${status.completed}/${status.total})`, 
                        total: status.total, 
                        progress: status.completed 
                    });
                },
                cancelationToken: token
            });
        });
    }
}