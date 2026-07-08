import { existsSync } from 'node:fs';

import { Args } from '@oclif/core';

import { DatapackLoader } from '@vlocode/vlocity';
import { OmniStudioConverter } from '@vlocode/vlocity-deploy';

import { SalesforceCommand } from '../../salesforceCommand';
import { loadDatapacks } from '../../lib/datapackLoader';

export default class DatapackConvert extends SalesforceCommand<typeof DatapackConvert> {

    static description = 'Convert Managed runtime OmniScript datapacks to native OmniProcess datapacks';

    static args = {
        paths: Args.string({
            description: 'path of the folders containing the datapacks or datapack files to be converted',
            required: true,
        }),
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> ./datapacks -u my-org',
    ];

    public async run() {
        const paths = this.positionals;
        for (const path of paths) {
            if (!existsSync(path)) {
                this.error(`No such folder exists: ${path}`);
            }
        }

        const datapacks = await loadDatapacks(this.container.get(DatapackLoader), this.logger, paths);
        if (!datapacks.length) {
            return;
        }

        const converter = this.container.get(OmniStudioConverter);
        for (const datapack of datapacks) {
            const converted = converter.convertDatapack(datapack);
            this.logger.info(`Converted ${datapack.key} to ${converted.key}`);
            this.logger.info(converted.data);
        }
    }
}
