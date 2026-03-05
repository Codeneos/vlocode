import { join } from 'path';

import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import { Logger, LogManager } from '@vlocode/core';
import { RecordFactory, SalesforceService } from '@vlocode/salesforce';
import { convertDatapackExportDefinitions } from '@vlocode/vlocity-deploy';

import { Option } from '../command';
import { SalesforceCommand } from '../salesforceCommand';

const defaultRecordsFile = 'dataRaptorItems.json';

export default class extends SalesforceCommand {

    static description =
        'Generate DatapackExportDefinition YAML files per datapack type from legacy datapack expand + DataRaptor migration records';

    static options = [
        ...SalesforceCommand.options,
        new Option(
            '-e, --expand-definition <file>',
            'path to datapacksexpanddefinition YAML file'
        ).argParser((value) => {
            if (!fs.existsSync(value)) {
                throw new Error(`No such expand definition file: ${value}`);
            }
            return value;
        }).makeOptionMandatory(),
        new Option(
            '-d, --records-file <file>',
            'path to dryrun JSON file with DRMapItem/DRBundle records'
        ).default(defaultRecordsFile).argParser((value) => {
            if (!fs.existsSync(value)) {
                throw new Error(`No such records file: ${value}`);
            }
            return value;
        }),
        new Option(
            '-o, --output-dir <dir>',
            'directory where per-datapack definition YAML files will be written'
        ).default('./datapack-export-definitions'),
        new Option(
            '--from-salesforce',
            'query DRMapItem + DRBundle Migration records from Salesforce instead of reading --records-file'
        ).default(false),
    ];

    constructor(private readonly logger: Logger = LogManager.get('datapack-export-definition-generator')) {
        super();
    }

    protected async init(options: any) {
        if (options.fromSalesforce) {
            await super.init(options);
        }
    }

    public async run() {
        const expandDefinition = await this.loadExpandDefinition(this.options.expandDefinition);
        const records = this.options.fromSalesforce
            ? await this.queryMigrationRecords()
            : await this.loadRecordsFromJson(this.options.recordsFile);

        const definitions = convertDatapackExportDefinitions({
            expandDefinition,
            records,
        });

        const outputDir = this.options.outputDir;
        await fs.ensureDir(outputDir);

        const entries = Object.entries(definitions)
            .sort(([a], [b]) => a.localeCompare(b));

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

    private async loadExpandDefinition(filePath: string) {
        const loaded = yaml.load(await fs.readFile(filePath, 'utf-8'));
        if (!loaded || typeof loaded !== 'object' || Array.isArray(loaded)) {
            throw new Error(`Invalid expand definition in ${filePath}; expected a YAML object`);
        }
        return loaded as Record<string, unknown>;
    }

    private async loadRecordsFromJson(filePath: string) {
        const loaded = await fs.readJson(filePath, { encoding: 'utf-8' });
        const records = Array.isArray(loaded)
            ? loaded
            : Array.isArray(loaded?.records)
                ? loaded.records
                : undefined;

        if (!Array.isArray(records)) {
            throw new Error(`Invalid records JSON in ${filePath}; expected an array or { records: [] }`);
        }

        return records.map(record => RecordFactory.create<Record<string, any>>(record));
    }

    private async queryMigrationRecords() {
        const salesforce = this.container.get(SalesforceService);

        const [mapItems, bundles] = await Promise.all([
            salesforce.data.query(`
                SELECT
                    Id,
                    Name,
                    %vlocity_namespace%__ConfigurationAttribute__c,
                    %vlocity_namespace%__ConfigurationCategory__c,
                    %vlocity_namespace%__ConfigurationKey__c,
                    %vlocity_namespace%__ConfigurationValue__c,
                    %vlocity_namespace%__IsDisabled__c
                FROM %vlocity_namespace%__DRMapItem__c
                WHERE Name LIKE '% Migration'
            `),
            salesforce.data.query(`
                SELECT
                    Id,
                    Name,
                    %vlocity_namespace%__Type__c
                FROM %vlocity_namespace%__DRBundle__c
                WHERE Name LIKE '% Migration'
            `),
        ]);

        const migrationBundles = bundles.filter(record => {
            const type = String((record as any)['Type__c'] ?? (record as any)['vlocity_cmt__Type__c'] ?? '');
            return !type || type.toLowerCase() === 'migration';
        });

        return [...mapItems, ...migrationBundles];
    }
}
