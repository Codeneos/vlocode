import { join } from 'node:path';

import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import { Flags } from '@oclif/core';

import { DatapacksExpandDefinitionAccessor, MigrationDataMapperConverter, DatapacksExpandDefinition, MatchingKeyService } from '@vlocode/vlocity-deploy';
import { SalesforceService } from '@vlocode/salesforce';
import { DatapackInfoService } from '@vlocode/vlocity';

import { SalesforceCommand } from '../../salesforceCommand';

export default class DatapackBuildDefinitions extends SalesforceCommand<typeof DatapackBuildDefinitions> {

    static description = 'Generate DatapackExportDefinition YAML from DRMapItem migration records';

    static flags = {
        'expand-definition': Flags.string({
            char: 'e',
            summary: 'optional path to datapacksexpanddefinition YAML file',
            parse: async value => {
                if (!fs.existsSync(value)) {
                    throw new Error(`No such expand definition file: ${value}`);
                }
                return value;
            },
        }),
        expanded: Flags.boolean({
            char: 'x',
            default: false,
            summary: 'write one YAML file per datapack definition',
        }),
        output: Flags.string({
            char: 'o',
            default: './export-definitions.yaml',
            summary: 'output YAML file path for non-expanded mode',
        }),
        'output-dir': Flags.string({
            char: 'd',
            default: './datapack-export-definitions',
            summary: 'output directory for expanded mode',
        }),
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> -u my-org',
        '<%= config.bin %> <%= command.id %> --expanded --output-dir ./definitions -u my-org',
    ];

    public async run() {
        const expandDefinition = this.flags['expand-definition']
            ? await this.loadExpandDefinition(this.flags['expand-definition'])
            : undefined;

        const converter = new MigrationDataMapperConverter(
            this.container.get(SalesforceService),
            this.container.get(DatapackInfoService),
            this.container.get(MatchingKeyService),
            expandDefinition ? new DatapacksExpandDefinitionAccessor(expandDefinition) : undefined,
        );

        const definitions = await converter.convertAll();

        if (this.flags.expanded) {
            await this.writeSplit(definitions, this.flags['output-dir']);
        } else {
            await this.writeCombined(definitions, this.flags.output);
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
