import * as fs from 'fs-extra';
import { Logger, LogManager } from '@vlocode/core';
import { DatapackExportJobExecutor, type DatapackExportJobOptions, type DatapackExportJobSettings } from '@vlocode/vlocity-deploy';
import { HttpTransport } from '@vlocode/salesforce';
import { Argument, Option } from '../command';
import { SalesforceCommand } from '../salesforceCommand';
import { ExportProgressReporter } from '../progress';

interface ExportCommandOptions {
    definitions?: string;
    matchingKeys?: string[];
    expand?: boolean;
    query?: string;
    file?: string;
    output?: string;
    depth?: number;
    type?: string;
    suppressNulls?: boolean;
    failOnError?: boolean;
    progress?: boolean;
}

function existingFile(label: string): (value: string) => string {
    return value => {
        if (!fs.existsSync(value)) {
            throw new Error(`Specified ${label} does not exist`);
        }
        return value;
    };
}

function parseDepth(value: string): number {
    const depth = Number(value);
    if (!Number.isInteger(depth)) {
        throw new Error('Depth must be an integer');
    }
    return depth;
}

export default class extends SalesforceCommand {

    static description = 'Export an object as datapack from Salesforce';

    static args = [
        new Argument('<ids...>', 'list of object IDs to export').argOptional()
    ];

    static options = [
        ...SalesforceCommand.options,
        new Option(
            '--definitions <file>',
            'path to the YAML or JSON file defining how objects are expanded into datapack files'
        ).argParser(existingFile('definitions file')),
        new Option(
            '-f, --file <file>',
            'path to a YAML or JSON export manifest with datapack export queries'
        ).argParser(existingFile('export file')).conflicts('query'),
        new Option(
            '-e, --expand',
            'expand the exported datapack into separate files according to the definitions'
        ).default(false),
        new Option(
            '-q, --query <soql>',
            'SOQL query selecting the records to export instead of passing object IDs'
        ).conflicts('file'),
        new Option(
            '-t, --type <type>',
            'datapack type to use when exporting IDs or a single query'
        ),
        new Option(
            '-o, --output <dir>',
            'folder where exported datapacks are written'
        ).default('./'),
        new Option(
            '-d, --depth <n>',
            'dependency export depth; use -1 to include all dependencies'
        ).argParser(parseDepth),
        new Option(
            '--suppress-nulls',
            'suppress null SObject field values from exported datapacks'
        ).default(false),
        new Option(
            '--fail-on-error',
            'fail the export if an error occurs while exporting a datapack'
        ).default(false),
        new Option(
            '--no-progress',
            'disable the interactive progress bar and use plain forward-printing output'
        ),
        SalesforceCommand.matchingKeysOption,
    ];

    constructor(private readonly logger: Logger = LogManager.get('DatapackExport')) {
        super();
    }

    public async run(ids: string[] = []): Promise<void> {
        const options = this.options as ExportCommandOptions;
        this.applyMatchingKeyOptions(options);
        if (options.file && (ids.length || options.query || options.type)) {
            throw new Error('Use either an export file or object IDs/query/datapack type, not both');
        }
        if (ids.length && options.query) {
            throw new Error('Use either object IDs or --query, not both');
        }
        const executor = this.container.new(DatapackExportJobExecutor);
        const defaults = this.getExportSettings(options);
        await this.withExportProgress(options, async progressOptions => {
            const execution = { ...progressOptions, defaults, definitionsFile: options.definitions };
            if (options.file) {
                await executor.executeFile(options.file, execution);
                return;
            }
            const recordIds = options.query ? await executor.queryRecordIds(options.query, options.type) : ids;
            await executor.executeBatches([{ ...defaults, ids: recordIds }], execution);
        });
    }

    private async withExportProgress(
        options: ExportCommandOptions,
        execute: (options: DatapackExportJobOptions) => Promise<void>
    ): Promise<void> {
        let progress: ExportProgressReporter | undefined;
        try {
            await execute({
                onPrepared: summary => {
                    progress = new ExportProgressReporter({
                        ...summary,
                        logger: this.logger,
                        enabled: options.progress === false ? false : undefined,
                        apiCalls: () => HttpTransport.requestCount
                    });
                    progress.start();
                },
                onBatchStart: (index, batch) => progress!.beginBatch(index, batch.datapackType, batch.ids.length),
                onBatchEnd: () => progress!.endBatch(),
                onProgress: update => progress!.report(update)
            });
            progress!.succeed();
        } finally {
            progress?.stop();
        }
    }

    private getExportSettings(options: ExportCommandOptions): DatapackExportJobSettings {
        return {
            datapackType: options.type,
            expand: Boolean(options.expand),
            folder: options.output ?? './',
            maxDepth: options.depth,
            suppressNulls: Boolean(options.suppressNulls),
            failOnError: Boolean(options.failOnError)
        };
    }
}
