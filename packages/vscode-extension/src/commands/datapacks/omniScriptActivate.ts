import * as vscode from 'vscode';

import { OmniScriptActivationOptions, OmniScriptActivator, OmniScriptRecord } from '@vlocode/omniscript';
import { VlocityDatapack } from '@vlocode/vlocity';
import { container } from '@vlocode/core';

import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';
import { DatapackCommand } from './datapackCommand';
import { ActivityProgress } from '../../lib/vlocodeActivity';
import { FlexCardActivationOptions, FlexCardActivator, FlexCardDefinition, FlexCardDefinitionAccess } from '@vlocode/vlocity-deploy';
import { getErrorMessage, Timer } from '@vlocode/util';

@vscodeCommand(VlocodeCommand.omniScriptActivate, { focusLog: true, showProductionWarning: true })
@vscodeCommand(VlocodeCommand.cardActivate, { focusLog: true, showProductionWarning: true })
export default class ActivateOmniScriptCommand extends DatapackCommand {

    public execute(...args: any[]) : Promise<void> {
        return this.executeWithSelection(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async executeWithSelection(selectedFiles: vscode.Uri[]) : Promise<void> {
        const datapacks = await this.loadDatapacks(selectedFiles);
        if (datapacks.length === 0) {
            throw new Error('Selected file is not a Vlocity OmniScript DataPack');
        }

        const options: OmniScriptActivationOptions | FlexCardActivationOptions = {
            useStandardRuntime: await this.promptUseStandardRuntime(),
            toolingApi: true,
            skipLwcDeployment: false
        };

        const results = await this.vlocode.withActivity('Datapack activation', 
            (progress) => this.activateDatapacks(datapacks, options, progress)
        );
        this.outputTable(results, { focus: true, labels: { time: 'activation time (ms)' } });
    }

    protected async activateDatapacks(
        datapacks: VlocityDatapack[], 
        options: OmniScriptActivationOptions, 
        progress: ActivityProgress
    ) : Promise<{ datapack: string, status: string, time: number, error?: string }[]> {

        const results: { datapack: string, status: string, time: number, error?: string }[] = [];

        for (const datapack of datapacks) {
            progress.report({ message: `${datapack.name}...` });
            const timer = new Timer();
            try {
                if (datapack.datapackType === 'OmniScript') {
                    await this.activateOmniScript(datapack, options);
                } else if (datapack.datapackType === 'FlexCard' || datapack.datapackType === 'VlocityCard') {
                    await this.activateFlexCard(datapack, options);
                } else {
                    throw new Error(`Unsupported datapack ${datapack.datapackType} (${datapack.sobjectType})`);
                }
                results.push({ datapack: datapack.Name, status: 'activated', time: timer.elapsed });
            } catch (error) {
                this.logger.error(`Failed to activate ${datapack.name}: ${getErrorMessage(error)}`);
                results.push({ datapack: datapack.Name, status: 'error', time: timer.elapsed, error: getErrorMessage(error) });
            }
        }

        const failed = results.filter(r => r.error);
        const activated = results.filter(r => !r.error);

        if (failed.length && !activated.length) {
            throw new Error(`Failed to activate ${failed.length} Datapack(s): ${failed.map(f => f.datapack).join(', ')}`);
        } else if (failed.length) {
            void vscode.window.showWarningMessage(`Activated ${activated.length} Datapack(s) but failed to activate ${failed.length} Datapack(s): ${failed.map(f => f.datapack).join(', ')}`);
        } else {
            void vscode.window.showInformationMessage(`Activated ${datapacks.length} Datapack(s)`);
        }

        return results;
    }

    private async activateOmniScript(datapack: VlocityDatapack, options: OmniScriptActivationOptions)  {
        const omniScriptDef = OmniScriptRecord.fromDatapack(datapack);
        if (!omniScriptDef.subType || !omniScriptDef.type) {
            throw new Error(`Datapack is not of type OmniScript: ${datapack.headerFile}`);
        }
        const reactivateDependentScripts = omniScriptDef.isReusable && await this.promptDependencyReactivation(omniScriptDef);
        await container.get(OmniScriptActivator).activate({
                type: omniScriptDef.type,
                subType: omniScriptDef.subType,
                language: omniScriptDef.language
            }, { ...options, reactivateDependentScripts });
    }

    private async activateFlexCard(datapack: VlocityDatapack, options: FlexCardActivationOptions)  {
        const cardDefinition = FlexCardDefinition.fromDatapack(datapack);
        const deployedCards = [...(await container.get(FlexCardDefinitionAccess).getFlexCardDefinitions({ 
            name: cardDefinition.Name, 
            author: cardDefinition.AuthorName, 
            version: cardDefinition.VersionNumber 
        })).values()];
        if (deployedCards.length === 0) {
            throw new Error(`Unable to find deployed FlexCard: ${cardDefinition.Name} v${cardDefinition.VersionNumber} by ${cardDefinition.AuthorName}. Resolve this issue by deploying the FlexCard before re-activating it.`);
        }
        await container.get(FlexCardActivator).activate(deployedCards[0], options);
    }

    private async promptDependencyReactivation(record: OmniScriptRecord) : Promise<boolean> {
        const outcome = await vscode.window.showQuickPick([
            { value: true, label: 'Yes', description: `Reactivate scripts that embed '${record.type}/${record.subType}'` },
            { value: false, label: 'No', description: `Only reactivate '${record.type}/${record.subType}', scripts that embed this script will not be changed` }
        ], {
            placeHolder: `Reactivate scripts that embed ;${record.type}/${record.subType}' as dependency?`,
            ignoreFocusOut: true,
        });
        if (!outcome) {
            throw new Error('User cancelled operation');
        }
        return outcome.value;
    }
}