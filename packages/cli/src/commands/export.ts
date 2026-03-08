import { Args, Flags } from '@oclif/core';
import { join } from 'path';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';

import { Logger, LogManager } from '@vlocode/core';
import { DatapackExpander, DatapackExportDefinitionStore, DatapackExporter } from '@vlocode/vlocity-deploy';

import { SalesforceCommand } from '../salesforceCommand';
import { SalesforceService } from '@vlocode/salesforce';

export default class Export extends SalesforceCommand<typeof Export> {

    static description = 'Export an objecr as datapack from Salesforce';

    static args = {
        ids: Args.string({
            required: false,
            multiple: true,
            description: 'list of object IDs to export',
        }),
    };

    static flags = {
        ...SalesforceCommand.flags,
        exportDefinitions: Flags.file({
            name: 'export-definitions',
            char: 'd',
            exists: true,
            required: true,
            summary: 'path of the YAML or JSON file containing the export definitions that define how objects are exported',
        }),
        expand: Flags.boolean({
            char: 'e',
            default: false,
            summary: 'expand the datapack once exported into separate files according to the export definitions',
        }),
        query: Flags.string({
            char: 'q',
            name: 'query',
            summary: 'specify the query to use to export the objects instead of using the object ID',
        }),
    };

    protected readonly logger: Logger = LogManager.get('datapack-export');

    protected async execute() {
        const ids = await this.getIds();
        const definitions = await this.loadDefinitions(this.flags.exportDefinitions);
        this.container.get(DatapackExportDefinitionStore).load(definitions);

        const exporter = this.container.new(DatapackExporter);
        const expander = this.container.new(DatapackExpander);

        for (const id of ids) {
            const result = await exporter.exportObject(id);
            if (this.flags.expand) {
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
        if (this.flags.query && this.args.ids?.length) {
            throw new Error('Specify either object IDs or an export query, not both.');
        }

        if (this.flags.query) {
            const records = await this.container.get(SalesforceService).data.query(this.flags.query);
            if (records.length === 0) {
                throw new Error(`No records found for the specified query: ${this.flags.query}`);
            }
            return records.map(record => record.Id);
        }
        const ids = this.args.ids;
        if (!ids?.length) {
            throw new Error('No object IDs or export query specified. Either specify object IDs or an export query.');
        }
        return ids;
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
        } catch (err: any) {
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
        } catch (err: any) {
            this.logger.error(`Failed to load export definitions from ${filePath}: ${err.message}`);
        }
    }
}
