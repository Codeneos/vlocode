import { join } from 'path';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';

import { Logger, LogManager } from '@vlocode/core';
import { DatapackExpander, DatapackExportDefinitionStore, DatapackExporter } from '@vlocode/vlocity-deploy';

import { Argument, Option } from '../command';
import { SalesforceCommand } from '../salesforceCommand';
import { QueryService } from '@vlocode/salesforce';

export default class extends SalesforceCommand {

    static description = 'Export an objecr as datapack from Salesforce';

    static args = [
        new Argument('<ids...>', 'list of object IDs to export').argOptional()
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
        }).makeOptionMandatory(),
        new Option(
            '-e, --expand',
            'expand the datapack once exported into separate files according to the export definitions'
        ),
        new Option(
            '-q, --query <query-string>',
            'specify the query to use to export the objects instead of using the object ID'
        ).conflicts('ids')
    ];

    constructor(private logger: Logger = LogManager.get('datapack-export')) {
        super();
    }

    public async run() {
        const ids = await this.getIds();
        const definitions = await this.loadDefinitions(this.options.exportDefinitions);
        this.container.get(DatapackExportDefinitionStore).load(definitions);

        const exporter = this.container.new(DatapackExporter);
        const expander = this.container.new(DatapackExpander);

        for (const id of ids) {
            const result = await exporter.exportObject(id);
            if (this.options.expand) {
                const expanded = expander.expandDatapack(result.datapack);
                for (const [fileName, fileData] of Object.entries(expanded.files)) {
                    await this.writeFile([expanded.folder, fileName], fileData);
                }
                if (result.parentKeys.length) {
                    await this.writeFile(
                        [expanded.folder, expanded.baseName +  '_ParentKeys.json'], 
                        result.parentKeys.map(({ key }) => key)
                    );
                }
            } else {
                const baseName = result.datapack.name;
                await this.writeFile(baseName + '_DataPack.json', result.datapack);
                await this.writeFile(baseName + '_ParentKeys.json', result.parentKeys);
            }
        }
    }

    private async getIds() {
        if (this.options.query) {
            const queryService = this.container.new(QueryService);
            const records = await queryService.query(this.options.query);
            if (records.length === 0) {
                throw new Error(`No records found for the specified query: ${this.options.query}`);
            }
            return records.map(record => record.Id);
        }
        if (!this.args.ids?.length) {
            throw new Error('No object IDs or export query specified. Either specify object IDs or an export query.');
        }
        return this.args.ids
    }

    public async writeFile(fileName: string | string[], data: object | string | Buffer) {
        if (Array.isArray(fileName)) {
            fileName = join(...fileName);
        }

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
