import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';
import { container } from '@vlocode/core';
import { VlocityDatapack } from '@vlocode/vlocity';

import * as vscode from 'vscode';
import { DatapackCommand } from './datapackCommand';
import { OmniStudioConverter } from '@vlocode/vlocity-deploy';

@vscodeCommand(VlocodeCommand.convertOmniScript)
@vscodeCommand(VlocodeCommand.convertVlocityCard)
export default class ConvertDatapackCommand extends DatapackCommand {

    public execute(...args: any[]) : Promise<void> {
        return this.convertDatapacks(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async convertDatapacks(selectedFiles: vscode.Uri[]) : Promise<any> {
        const datapacks = await this.vlocode.withProgress('Loading datapack...', () => this.loadDatapacks(selectedFiles));
        for (const datapack of datapacks) {
            const datapackName = datapack.name || datapack.sourceKey;
            const convertedDatapack = await this.convertAndExpandDatapack(datapack);
            vscode.window.showInformationMessage(`Converted datapack ${datapackName} to ${convertedDatapack.datapackType}`);
        }
    }

    protected async convertAndExpandDatapack(datapack: VlocityDatapack) : Promise<VlocityDatapack> {
        // convert the datapack
        const converter = container.create(OmniStudioConverter);
        const omnistudioDatapack = converter.convertDatapack(datapack);

        // execute rename and expand into new folder structure
        await this.vlocode.withActivity(
            `Convert datapack ${datapack.name}...`,
            this.vlocode.datapackService.expandDatapack(omnistudioDatapack, omnistudioDatapack.projectFolder!)
        );

        return omnistudioDatapack;
    }
}
