import * as vscode from 'vscode';

import { OmniScriptActivationOptions, OmniScriptActivator, OmniScriptDefinitionGenerator, OmniScriptSpecification, VlocityDatapack } from '@vlocode/vlocity-deploy';
import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';
import { DatapackCommand } from './datapackCommand';
import { container } from '@vlocode/core';
import { ActivityProgress } from '../../lib/vlocodeActivity';

@vscodeCommand(VlocodeCommand.omniScriptActivate, { focusLog: true, showProductionWarning: true })
export default class ActivateOmniScriptCommand extends DatapackCommand {

    public execute(...args: any[]) : Promise<void> {
        return this.executeWithSelection(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async executeWithSelection(selectedFiles: vscode.Uri[]) : Promise<void> {
        const datapacks = await this.loadDatapacks(selectedFiles);
        const options = {
            toolingApi: true,
            remoteActivation: false,
            reactivateDependentScripts: false
        };

        if (datapacks.length === 0) {
            throw new Error('Selected file is not a Vlocity OmniScript DataPack');
        }

        const hasReusableScripts = datapacks.some(datapack => datapack.IsReusable__c);
        if (hasReusableScripts && await this.promptDependencyReactivation()) {
            options.reactivateDependentScripts = true;
        }

        return this.vlocode.withActivity('OmniScript', (progress) => this.activateScripts(datapacks, options, progress));
    }

    protected async activateScripts(
        datapacks: VlocityDatapack[], 
        options: OmniScriptActivationOptions, 
        progress: ActivityProgress
    ) : Promise<void> {
        const activated = new Array<OmniScriptSpecification>();
        const failed = new Array<OmniScriptSpecification & { error: unknown }>();

        for (const datapack of datapacks) {
            const omniScriptSpec = {
                type: datapack.Type__c,
                subType: datapack.SubType__c,
                language: datapack.Language__c
            };

            if (!omniScriptSpec.subType || !omniScriptSpec.type) {
                throw new Error(`Datapack is not of type OmniScript: ${datapack.headerFile}`);
            }

            progress.report({ message: `Activating ${omniScriptSpec.type}/${omniScriptSpec.subType}...` });

            try {
                await container.get(OmniScriptActivator).activate(omniScriptSpec, options);
                activated.push(omniScriptSpec);
            } catch (error) {
                failed.push({...omniScriptSpec, error });
                this.logger.error(`Failed to activate ${omniScriptSpec.type}/${omniScriptSpec.subType}: ${error.message}`);
            }
        }

        void vscode.window.showInformationMessage(`Activated ${activated.length} OmniScript(s)`);
    }

    private async promptDependencyReactivation() : Promise<boolean> {
        const outcome = await vscode.window.showQuickPick([
            { value: true, label: 'Yes', description: 'Reactivate scripts that use this script as dependency' },
            { value: false, label: 'No', description: 'Only reactivate this script and do not refresh any scripts embedding this script as dependency' }
        ], {
            placeHolder: 'Reactivate dependent scripts?'
        });
        if (!outcome) {
            throw new Error('User cancelled operation');
        }
        return outcome.value;
    }
}