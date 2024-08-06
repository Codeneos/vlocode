import { join } from 'path';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';

import { Logger, LogManager } from '@vlocode/core';
import { DatapackExpander, DatapackExportDefinitionStore, DatapackExporter } from '@vlocode/vlocity-deploy';

import { Argument, Option } from '../command';
import { SalesforceCommand } from '../salesforceCommand';

export default class extends SalesforceCommand {

    static description = 'Export an objecr as datapack from Salesforce';

    static args = [
        new Argument('<ids...>', 'list of object IDs to export')
    ];

    static options = [
        ...SalesforceCommand.options,
        new Option(
            '-d, --export-definitions <file>', 
            'path of the YAML or JSON file containing the export definitions that define how objects are exported'
        ).argParser((value) => {
            if (!fs.existsSync(value)) {
                throw new Error('Specified definitions file does not exists');
            }
            return value;
        }),
        new Option(
            '-e, --expand',
            'expand the datapack once exported into separate files according to the export definitions'
        )
    ];

    constructor(private logger: Logger = LogManager.get('datapack-export')) {
        super();
    }

    public async run(ids: string[], options: any) {
        const definitions = await this.loadDefinitions(options.exportDefinitions);
        this.container.get(DatapackExportDefinitionStore).load(definitions);

        const exporter = this.container.create(DatapackExporter);
        const expander = this.container.create(DatapackExpander);

        for (const id of ids) {
            const result = await exporter.exportObject(id);
            if (options.expand) {
                const expanded = expander.expandDatapack(result.datapack);
                for (const [fileName, fileData] of Object.entries(expanded.files)) {
                    await this.writeFile(
                        join(expanded.objectType, expanded.folder ?? id, fileName),
                        fileData
                    );
                }
            } else {
                const baseName = result.datapack.VlocityRecordSObjectType + '_' + id;
                await this.writeFile(baseName + '_DataPack.json', result.datapack);
                await this.writeFile(baseName + '_ParentKeys.json', result.parentKeys);
            }
        }
    }

    public async writeFile(fileName: string, data: object | string | Buffer) {
        if (typeof data === 'object' && !Buffer.isBuffer(data)) {
            data = JSON.stringify(data, null, 4);
        }

        try {
            await fs.outputFile(fileName, data);
            this.logger.info(`Output file: ${fileName}`);
        } catch (err) {
            this.logger.warn(`Failed to write file ${fileName}: ${err.message}`);
        }
    }

    public async loadDefinitions(filePath: string) {
        this.logger.info(`Loading export definitions from ${filePath}`);
        try {
            if (/\.json$/i.test(filePath)) {
                return fs.readJson(filePath, { encoding: 'utf-8' });
            } else if (/\.ya?ml$/i.test(filePath)) {
                return yaml.load(await fs.readFile(filePath, { encoding: 'utf-8' }));
            } else {
                throw new Error('Unsupported file format, expected a YAML or JSON file');
            }
        } catch (err) {
            this.logger.error(`Failed to load export definitions from ${filePath}: ${err.message}`);
        }
    }
}
