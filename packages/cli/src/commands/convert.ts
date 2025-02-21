import { Logger, LogManager } from '@vlocode/core';
import { Argument } from '../command';
import { mapAsync, Timer } from '@vlocode/util';
import { SalesforceCommand } from '../salesforceCommand';
import { existsSync } from 'fs';
import { DatapackLoader } from '@vlocode/vlocity';
import { stat } from 'fs/promises';
import { OmniStudioConverter } from '@vlocode/vlocity-deploy';

export default class extends SalesforceCommand {

    static description = 'Convert Managed runtime OmniScript datapacks to native OmniProcess datapacks';

    static args = [
        new Argument('<paths..>', 'path of the folders containing the datapacks or datapack files to be deployed')
            .argParser((value, previous: string[] | undefined) => {
                if (!existsSync(value)) {
                    throw new Error('No such folder exists');
                }
                return (previous ?? []).concat([ value ]);
            })
        ];

    static options = [
        ...SalesforceCommand.options,
    ];

    constructor(private logger: Logger = LogManager.get('vlocode-cli')) {
        super();
    }

    public async run(paths: any) {
        // Load datapacks
        const datapacks = await this.loadDatapacks(paths);
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
