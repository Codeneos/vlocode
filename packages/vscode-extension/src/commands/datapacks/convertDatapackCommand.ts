import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';
import { container } from '@vlocode/core';
import { VlocityDatapack } from '@vlocode/vlocity';

import * as vscode from 'vscode';
import { DatapackCommand } from './datapackCommand';
import { OmniStudioConverter } from '@vlocode/vlocity-deploy';
import { pluralize } from '@vlocode/util';

@vscodeCommand([
    VlocodeCommand.convertOmniScript, 
    VlocodeCommand.convertDataRaptor, 
    VlocodeCommand.convertIntegrationProcedure, 
    VlocodeCommand.convertVlocityCard
])
export default class ConvertDatapackCommand extends DatapackCommand {

    public execute(...args: any[]) : Promise<void> {
        return this.convertDatapacks(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async convertDatapacks(selectedFiles: vscode.Uri[]) : Promise<any> {
        const datapacks = await this.vlocode.withProgress('Loading datapacks...', () => this.loadDatapacks(selectedFiles));
        const results: Array<{ status: string, from: string, to: string }> = [];
        const converted: VlocityDatapack[] = [];

        await this.vlocode.withProgress('Converting datapacks', async (progress) => {
            const total = datapacks.length;
            for (const datapack of datapacks) {
                progress.report({ message: datapack.name, progress: 1, total });
                const convertedDatapack = await this.convertAndExpandDatapack(datapack);
                converted.push(convertedDatapack);
                results.push({
                    from: `${datapack.sourceKey}`,
                    to: `${convertedDatapack.sourceKey}`,
                    status: 'converted'
                });
            }
        });

        if (converted[0]?.headerFile) {
            // open the first converted file in the editor
            await vscode.window.showTextDocument(vscode.Uri.file(converted[0].headerFile), { preview: false });
        }

        vscode.window.showInformationMessage(`Converted ${pluralize('datapack', results)}`);
        this.output.table(results, { focus: true });
    }

    protected async convertAndExpandDatapack(datapack: VlocityDatapack) : Promise<VlocityDatapack> {
        // convert the datapack
        const converter = container.new(OmniStudioConverter);
        const omnistudioDatapack = converter.convertDatapack(datapack);

        // execute rename and expand into new folder structure
        const expandedHeader = await this.vlocode.datapackService.expandDatapack(omnistudioDatapack, omnistudioDatapack.projectFolder ?? '.');
        (omnistudioDatapack as any).headerFile = expandedHeader; // Hack as headerFile is not readonly in the class
        return omnistudioDatapack;
    }
}
