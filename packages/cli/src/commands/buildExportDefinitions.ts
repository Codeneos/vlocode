import { Flags } from '@oclif/core';
import { join } from 'path';

import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import { Logger, LogManager } from '@vlocode/core';
import { DatapacksExpandDefinitionAccessor, MigrationDataMapperConverter, DatapacksExpandDefinition } from '@vlocode/vlocity-deploy';
import { SalesforceService } from '@vlocode/salesforce';
import { DatapackInfoService } from '@vlocode/vlocity';

import { SalesforceCommand } from '../salesforceCommand.js';

export default class BuildExportDefinitions extends SalesforceCommand<typeof BuildExportDefinitions> {

    static description = 'Generate DatapackExportDefinition YAML from DRMapItem migration records';

    static flags = {
        ...SalesforceCommand.flags,
        expandDefinition: Flags.file({
            name: 'expand-definition',
            char: 'e',
            exists: true,
            summary: 'optional path to datapacksexpanddefinition YAML file',
        }),
        expanded: Flags.boolean({
            char: 'x',
            default: false,
            summary: 'write one YAML file per datapack definition',
        }),
        output: Flags.file({
            char: 'o',
            default: './export-definitions.yaml',
            summary: 'output YAML file path for non-expanded mode',
        }),
        outputDir: Flags.directory({
            name: 'output-dir',
            char: 'd',
            default: './datapack-export-definitions',
            summary: 'output directory for expanded mode',
        }),
    };

    protected readonly logger: Logger = LogManager.get('generate-export-definitions');

    protected async execute() {
        const expandDefinition = this.flags.expandDefinition
            ? await this.loadExpandDefinition(this.flags.expandDefinition)
            : undefined;

        const converter = new MigrationDataMapperConverter(
            this.container.get(SalesforceService),
            this.container.get(DatapackInfoService),
            expandDefinition ? new DatapacksExpandDefinitionAccessor(expandDefinition) : undefined
        );

        const definitions = await converter.convertAll();

        if (this.flags.expanded) {
            await this.writeSplit(definitions, this.flags.outputDir);
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
