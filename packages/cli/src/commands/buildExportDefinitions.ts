import { join } from 'path';

import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import { Logger, LogManager } from '@vlocode/core';
import { DatapacksExpandDefinitionAccessor, MigrationDataMapperConverter, DatapacksExpandDefinition } from '@vlocode/vlocity-deploy';
import { SalesforceService } from '@vlocode/salesforce';
import { DatapackInfoService } from '@vlocode/vlocity';

import { Option } from '../command.js';
import { SalesforceCommand } from '../salesforceCommand.js';

export default class extends SalesforceCommand {

    static description = 'Generate DatapackExportDefinition YAML from DRMapItem migration records';

    static options = [
        ...SalesforceCommand.options,
        new Option(
            '-e, --expand-definition <file>',
            'optional path to datapacksexpanddefinition YAML file'
        ).argParser((value) => {
            if (!fs.existsSync(value)) {
                throw new Error(`No such expand definition file: ${value}`);
            }
            return value;
        }),
        new Option('-x, --expanded', 'write one YAML file per datapack definition').default(false),
        new Option('-o, --output <file>', 'output YAML file path for non-expanded mode').default('./export-definitions.yaml'),
        new Option('-d, --output-dir <dir>', 'output directory for expanded mode').default('./datapack-export-definitions'),
    ];

    constructor(private readonly logger: Logger = LogManager.get('generate-export-definitions')) {
        super();
    }

    public async run() {
        const expandDefinition = this.options.expandDefinition
            ? await this.loadExpandDefinition(this.options.expandDefinition)
            : undefined;

        const converter = new MigrationDataMapperConverter(
            this.container.get(SalesforceService),
            this.container.get(DatapackInfoService),
            expandDefinition ? new DatapacksExpandDefinitionAccessor(expandDefinition) : undefined
        );

        const definitions = await converter.convertAll();

        if (this.options.expanded) {
            await this.writeSplit(definitions, this.options.outputDir);
        } else {
            await this.writeCombined(definitions, this.options.output);
        }
    }

    private async loadExpandDefinition(filePath: string) {
        const loaded = yaml.load(await fs.readFile(filePath, 'utf-8'));
        if (!loaded || typeof loaded !== 'object' || Array.isArray(loaded)) {
            throw new Error(`Invalid expand definition in ${filePath}; expected a YAML object`);
        }
        return loaded as DatapacksExpandDefinition;
    }

    private async writeCombined(definitions: Record<string, unknown>, outputFile: string) {
        const data = yaml.dump(definitions, {
            noRefs: true,
            lineWidth: 140,
        });
        await fs.outputFile(outputFile, data, 'utf-8');
        this.logger.info(`Generated ${outputFile}`);
    }

    private async writeSplit(definitions: Record<string, unknown>, outputDir: string) {
        await fs.ensureDir(outputDir);
        const entries = Object.entries(definitions).sort(([a], [b]) => a.localeCompare(b));

        for (const [datapackType, definition] of entries) {
            const filePath = join(outputDir, `${datapackType}.yaml`);
            const data = yaml.dump(definition, {
                noRefs: true,
                lineWidth: 140,
            });
            await fs.outputFile(filePath, data, 'utf-8');
            this.logger.info(`Generated ${filePath}`);
        }

        this.logger.info(`Generated ${entries.length} datapack export definition file(s)`);
    }
}
