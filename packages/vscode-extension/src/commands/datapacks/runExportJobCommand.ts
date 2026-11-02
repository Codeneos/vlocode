import * as vscode from 'vscode';
import { dirname } from 'path';
import { container } from '@vlocode/core';
import { DatapackExportJobExecutor } from '@vlocode/vlocity-deploy';
import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';
import { DatapackDefinitionRegistry } from '../../lib/vlocity/datapackDefinitionRegistry';
import { DatapackCommand } from './datapackCommand';

@vscodeCommand(VlocodeCommand.runExportJob, { focusLog: true })
export default class RunExportJobCommand extends DatapackCommand {

    public async execute(file?: vscode.Uri): Promise<void> {
        const jobFile = file ?? await this.selectJobFile();
        if (!jobFile) {
            return;
        }
        await this.saveOpenDocuments([jobFile]);
        await container.get(DatapackDefinitionRegistry).reload();
        const executor = this.vlocode.services.new(DatapackExportJobExecutor);
        await this.vlocode.withActivity({
            progressTitle: `Running export job ${jobFile.fsPath}`,
            location: vscode.ProgressLocation.Notification,
            cancellable: true
        }, async (progress, token) => {
            const result = await executor.executeFile(jobFile.fsPath, {
                defaults: { folder: this.vlocode.config.projectPath || dirname(jobFile.fsPath), failOnError: true },
                cancellationToken: token,
                onProgress: status => progress.report({ message: status.sourceKey, progress: status.progress, total: status.total })
            });
            if (!result.cancelled) {
                void vscode.window.showInformationMessage(`Exported ${result.exported} datapacks`);
            }
        });
    }

    private async selectJobFile(): Promise<vscode.Uri | undefined> {
        const files = await vscode.window.showOpenDialog({
            title: 'Select an export job',
            filters: { 'Export jobs': ['yaml', 'yml', 'json'] },
            canSelectMany: false,
            defaultUri: this.currentOpenDocument
        });
        return files?.[0];
    }
}
