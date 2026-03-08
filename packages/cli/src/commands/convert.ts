import { Args } from '@oclif/core';
import { Logger, LogManager } from '@vlocode/core';
import { mapAsync, Timer } from '@vlocode/util';
import { SalesforceCommand } from '../salesforceCommand';
import { parseExistingPath } from '../args';
import { DatapackLoader } from '@vlocode/vlocity';
import { stat } from 'fs/promises';
import { OmniStudioConverter } from '@vlocode/vlocity-deploy';

export default class Convert extends SalesforceCommand<typeof Convert> {

    static description = 'Convert Managed runtime OmniScript datapacks to native OmniProcess datapacks';

    static args = {
        paths: Args.string({
            required: true,
            multiple: true,
            description: 'path of the folders containing the datapacks or datapack files to be deployed',
            parse: parseExistingPath,
        }),
    };

    protected readonly logger: Logger = LogManager.get('vlocode-cli');

    protected async execute() {
        // Load datapacks
        const datapacks = await this.loadDatapacks(this.args.paths);
        if (!datapacks.length) {
            return;
        }

        // Convert datapacks
        const converter = this.container.get(OmniStudioConverter);
        for (const datapack of datapacks) {
            const converted = converter.convertDatapack(datapack);
            this.logger.info(`Converted ${datapack.key} to ${converted.key}`);
            this.logger.info(converted.data);
        }
    }

    private async loadDatapacks(paths: string[]) {
        this.logger.info(`Load datapacks: "${paths.join('", "')}"`);

        const datapackLoadTimer = new Timer();
        const loader = this.container.get(DatapackLoader);
        const datapacks = (await mapAsync(paths, async path => {
            const fileInfo = await stat(path);
            if (fileInfo.isDirectory()) {
                return loader.loadDatapacksFromFolder(path);
            } else {
                return [ await loader.loadDatapack(path) ];
            }
        })).flat();

        if (datapacks.length == 0) {
            this.logger.error(`No datapacks found in specified paths: "${paths.join('", "')}"`);
        } else {
            this.logger.info(`Loaded ${datapacks.length} datapacks in [${datapackLoadTimer.stop()}]`);
        }

        return datapacks;
    }
}
