import * as vscode from 'vscode';

import { groupBy, mapAsync } from '@vlocode/util';
import ExportDatapackCommand from './exportDatapackCommand';
import { DatapackUtil } from '@vlocode/vlocity';
import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';

@vscodeCommand(VlocodeCommand.refreshDatapack, { focusLog: true  })
export default class RefreshDatapackCommand extends ExportDatapackCommand {

    public execute(...args: any[]) : Promise<void> {
        return this.refreshDatapacks(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async refreshDatapacks(selectedFiles: vscode.Uri[]) : Promise<void> {
        // Depth
        const dependencyExportDepth = await this.showDependencySelection();
        if (dependencyExportDepth === undefined) {
            return; // selection cancelled;
        }

        const datapacksByProject = await this.vlocode.withStatusBarProgress('Loading datapacks...',
            async () => groupBy(await this.loadDatapacks(selectedFiles), pack => pack.projectFolder));

        // determine what to refresh, get IDs for all relevant datapacks and select the best matching record Id
        const flatDatapackList = Object.values(datapacksByProject).flat();     
        const progressTitle = flatDatapackList.length > 1 ? `Refreshing ${flatDatapackList.length} datapacks...` :  `Refreshing ${DatapackUtil.getLabel(flatDatapackList[0])}...`;

        if (!flatDatapackList.length) {
            return; // do datapacks found
        }

        await this.vlocode.withActivity(progressTitle, async (progress, cancelToken) => {
            const results = await mapAsync(Object.entries(datapacksByProject),
                async ([projectFolder, datapacks]) => {
                    const exportEntries = await this.getSalesforceRecords(datapacks, { showRecordSelection: flatDatapackList.length > 1 });
                    return this.datapackService.export(exportEntries.filter(e => e.id), projectFolder, dependencyExportDepth, cancelToken);
                }
            );
            // report UI progress back
            this.showResultMessage(results.reduce((aggregate, result) => aggregate.join(result)));
        });
    }
}

