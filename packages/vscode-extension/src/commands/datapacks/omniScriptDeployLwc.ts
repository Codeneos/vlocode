import * as vscode from 'vscode';

import { OmniScriptActivator, OmniScriptDefinitionGenerator, VlocityDatapack } from '@vlocode/vlocity-deploy';
import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';
import { DatapackCommand } from './datapackCommand';
import { container } from '@vlocode/core';
import { ActivityProgress } from '../../lib/vlocodeActivity';

@vscodeCommand(VlocodeCommand.omniScriptDeployLwc, { focusLog: true, showProductionWarning: true })
export default class DeployLwcCommand extends DatapackCommand {

    public execute(...args: any[]) : Promise<void> {
        return this.executeWithSelection(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async executeWithSelection(selectedFiles: vscode.Uri[]) : Promise<void> {
        const datapacks = await this.loadDatapacks(selectedFiles)

        if (datapacks.length === 0) {
            throw new Error('Selected file is not a Vlocity OmniScript DataPack');
        }

        const notLwcEnabled = datapacks.some(datapack => !datapack.IsLwcEnabled__c);
        if (notLwcEnabled) {
            const notLwcWarningResult = await vscode.window.showWarningMessage(
                'Not all selected OmniScripts are LWC enabled. Only LWC enabled OmniScripts can be deployed as LWC components. ' +
                'Deploying non-LWC enabled OmniScripts can result in errors during deployment.', 
                'Continue', 'Cancel'
            );
            if (notLwcWarningResult !== 'Continue') {
                return;
            }
        }

        return this.vlocode.withActivity('OmniScript', (progress) => this.deployLwc(datapacks, progress));
    }

    protected async deployLwc(datapacks: VlocityDatapack[], progress: ActivityProgress) : Promise<void> {
        for (const datapack of datapacks) {
            progress.report({ message: `Generating ${datapack.name} definitions...`, total: datapacks.length, increment: 1 });
            const definition = await container.get(OmniScriptDefinitionGenerator).getScriptDefinitionFromDatapack(datapack);

            progress.report({ message: `Deploying ${datapack.name} LWC...` });
            await container.get(OmniScriptActivator).deployLwc(definition, { 
                toolingApi: true, 
                remoteActivation: false, 
                reactivateDependentScripts: true
            });
        }
        void vscode.window.showInformationMessage(`Deployed LWC components for ${datapacks.length} OmniScript(s)`);
    }
}