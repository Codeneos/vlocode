import * as vscode from 'vscode';

import { groupBy, mapAsync } from '@vlocode/util';
import DatapackUtil from 'lib/vlocity/datapackUtil';
import ExportDatapackCommand from './exportDatapackCommand';

export default class RefreshDatapackCommand extends ExportDatapackCommand {

    public execute(...args: any[]) : Promise<void> {
        return this.refreshDatapacks(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async refreshDatapacks(selectedFiles: vscode.Uri[]) : Promise<void> {
        // Depth
        const dependencyExportDepth = await this.showDependencySelection();
        if (dependencyExportDepth === undefined) {
            this.logger.error('Export cancelled; no dependency depth selected.');
            return; // selection cancelled;
        }

        const datapacksByProject = await this.vlocode.withStatusBarProgress('Loading datapacks...',
            async () => groupBy(await this.loadDatapacks(selectedFiles), pack => pack.projectFolder));

        // call
        const flatDatapackList = Object.values(datapacksByProject).flat();
        const progressTitle = flatDatapackList.length > 1 ? `Refreshing ${flatDatapackList.length} datapacks...` :  `Refreshing ${DatapackUtil.getLabel(flatDatapackList[0])}...`;

        await this.vlocode.withCancelableProgress(progressTitle, async (progress, cancelToken) => {
            const results = await mapAsync(Object.keys(datapacksByProject),
                projectFolder => this.datapackService.export(datapacksByProject[projectFolder], projectFolder, dependencyExportDepth, cancelToken)
            );
            // report UI progress back
            this.showResultMessage(results.reduce((aggregate, result) => aggregate.join(result)));
        });
    }
}

