import * as vscode from 'vscode';

import { DatapackResultCollection } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import { groupBy, mapAsyncParallel, mapAsync } from '../util';
import ExportDatapackCommand from './exportDatapackCommand';
import DatapackUtil from 'datapackUtil';

export default class RefreshDatapackCommand extends ExportDatapackCommand {

    public execute(...args: any[]) : Promise<void> {
       return this.refreshDatapacks(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async refreshDatapacks(selectedFiles: vscode.Uri[]) : Promise<void> {
        // Depth
        const dependencyExportDepth = await this.showDependencySelection();
        if (dependencyExportDepth === undefined) {
            this.logger.error(`Export cancelled; no dependency depth selected.`)
            return; // selection cancelled;
        }

        const datapacksByProject = await this.vloService.withStatusBarProgress('Loading datapacks...',
                async () => groupBy(await this.loadDatapacks(selectedFiles), pack => pack.projectFolder));

        // call
        const flatDatapackList = Object.values(datapacksByProject).flat();
        const progressTitle = flatDatapackList.length > 1 ? `Refreshing ${flatDatapackList.length} datapacks...` :  `Refreshing ${DatapackUtil.getLabel(flatDatapackList[0])}...`;

        await this.vloService.withCancelableProgress(progressTitle, async (progress, cancelToken) => {
            const results = await mapAsync(Object.keys(datapacksByProject),
                projectFolder => this.datapackService.export(datapacksByProject[projectFolder], projectFolder, dependencyExportDepth, cancelToken)
            );
            // report UI progress back
            this.showResultMessage(results.reduce((results, result) => results.join(result)));
        });
    }
}

