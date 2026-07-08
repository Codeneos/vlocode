import { join } from 'node:path';

import * as fs from 'fs-extra';
import { Args, Flags } from '@oclif/core';

import { DatapackExpandResult, DatapackExportDefinitionStore, DatapackExporter, type DatapackExportProgress } from '@vlocode/vlocity-deploy';
import { HttpTransport, SalesforceService } from '@vlocode/salesforce';
import { getErrorMessage } from '@vlocode/util';

import { SalesforceCommand } from '../../salesforceCommand';
import { DatapackExportFileLoader, type DatapackExportFile } from '../../lib/datapackExportFileLoader';
import { ExportProgressReporter } from '../../lib/progress';

type DatapackExportResult = Awaited<ReturnType<DatapackExporter['exportObject']>>[number];

type ExportCommandOptions = {
    definitions?: string;
    expand?: boolean;
    query?: string;
    file?: string;
    output?: string;
    depth?: number;
    type?: string;
    suppressNulls?: boolean;
    failOnError?: boolean;
    progress?: boolean;
};

type ExportDefaults = {
    datapackType?: string;
    expand: boolean;
    folder: string;
    maxDepth?: number;
    suppressNulls?: boolean;
    failOnError?: boolean;
};

type ExportRequest = ExportDefaults & {
    ids: string[];
};

type ExpandedOutputFiles = Map<string, string>;

function existingFile(label: string): (value: string) => Promise<string> {
    return async (value: string) => {
        if (!fs.existsSync(value)) {
            throw new Error(`Specified ${label} does not exist`);
        }
        return value;
    };
}

export default class DatapackExport extends SalesforceCommand<typeof DatapackExport> {

    static description = 'Export an object as datapack from Salesforce';

    static args = {
        ids: Args.string({
            description: 'list of object IDs to export',
            required: false,
        }),
    };

    static flags = {
        definitions: Flags.string({
            helpValue: '<file>',
            summary: 'path to the YAML or JSON file defining how objects are expanded into datapack files',
            parse: existingFile('definitions file'),
        }),
        file: Flags.string({
            char: 'f',
            exclusive: ['query'],
            summary: 'path to a YAML export manifest with datapack export queries',
            parse: existingFile('export file'),
        }),
        expand: Flags.boolean({
            char: 'e',
            default: false,
            summary: 'expand the exported datapack into separate files according to the definitions',
        }),
        query: Flags.string({
            char: 'q',
            exclusive: ['file'],
            summary: 'SOQL query selecting the records to export instead of passing object IDs',
        }),
        type: Flags.string({
            char: 't',
            summary: 'datapack type to use when exporting IDs or a single query',
        }),
        output: Flags.string({
            char: 'o',
            default: './',
            summary: 'folder where exported datapacks are written',
        }),
        depth: Flags.integer({
            char: 'd',
            summary: 'dependency export depth; use -1 to include all dependencies',
        }),
        'suppress-nulls': Flags.boolean({
            default: false,
            summary: 'suppress null SObject field values from exported datapacks',
        }),
        'fail-on-error': Flags.boolean({
            default: false,
            summary: 'fail the export if an error occurs while exporting a datapack',
        }),
        progress: Flags.boolean({
            default: true,
            allowNo: true,
            summary: 'show an interactive progress bar (use --no-progress for plain forward-printing output)',
        }),
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> a0X000000000000 -t Product2 -u my-org',
        '<%= config.bin %> <%= command.id %> --definitions ./export-definitions.yaml --query "SELECT Id FROM Product2" --expand -u my-org',
    ];

    private readonly exportFileLoader = new DatapackExportFileLoader();

    public async run() {
        const options: ExportCommandOptions = {
            definitions: this.flags.definitions,
            expand: this.flags.expand,
            query: this.flags.query,
            file: this.flags.file,
            output: this.flags.output,
            depth: this.flags.depth,
            type: this.flags.type,
            suppressNulls: this.flags['suppress-nulls'],
            failOnError: this.flags['fail-on-error'],
            progress: this.flags.progress,
        };
        const argIds = this.positionals;
        const exportFile = options.file ? await this.loadExportFile(options.file) : undefined;

        await this.loadExportDefinitions(options.definitions ?? exportFile?.exportDefinitions);

        const requests = exportFile
            ? await this.getRequestsFromFile(exportFile, options, argIds)
            : await this.getRequestsFromOptions(argIds, options);

        const datapackCount = requests.reduce((count, request) => count + request.ids.length, 0);
        if (datapackCount === 0) {
            throw new Error('No datapacks matched the export input');
        }

        this.logger.info(
            `Exporting ${datapackCount} datapack${datapackCount === 1 ? '' : 's'} ` +
            `in ${requests.length} batch${requests.length === 1 ? '' : 'es'}`
        );
        const exporter = this.container.new(DatapackExporter);
        const expandedOutputFiles: ExpandedOutputFiles = new Map();
        const prunedFolders = new Set<string>();
        const progress = new ExportProgressReporter({
            logger: this.logger,
            totalBatches: requests.length,
            rootDatapacks: datapackCount,
            enabled: options.progress === false ? false : undefined,
            apiCalls: () => HttpTransport.requestCount
        });

        progress.start();
        try {
            for (const [index, request] of requests.entries()) {
                progress.beginBatch(index, request.datapackType, request.ids.length);
                await this.exportRequest(exporter, request, expandedOutputFiles, prunedFolders, progress);
                progress.endBatch();
            }
            progress.succeed();
        } finally {
            // Restore the terminal even when the export throws; the CLI reports the error itself.
            progress.stop();
        }
    }

    private async getRequestsFromFile(exportFile: DatapackExportFile, defaults: ExportCommandOptions, ids: string[]) {
        if (ids.length || defaults.query || defaults.type) {
            throw new Error('Use either a YAML export file or object IDs/query/datapack type, not both');
        }

        const requestDefaults = this.getExportDefaults(defaults, exportFile);
        const requests: ExportRequest[] = [];

        for (const [datapackType, queries] of Object.entries(exportFile.export)) {
            const ids = new Array<string>();
            for (const query of queries) {
                ids.push(...await this.getIdsFromQuery(query, datapackType));
            }
            if (ids.length) {
                requests.push({
                    ...requestDefaults,
                    ids,
                    datapackType
                });
            }
        }
        return requests;
    }

    private async getRequestsFromOptions(ids: string[], options: ExportCommandOptions) {
        if (ids.length && options.query) {
            throw new Error('Use either object IDs or --query, not both');
        }

        if (options.query) {
            ids = await this.getIdsFromQuery(options.query, options.type);
        }

        if (!ids.length) {
            throw new Error('No object IDs, export query, or YAML export file specified.');
        }

        const requestDefaults = this.getExportDefaults(options);

        return [{
            ...requestDefaults,
            ids
        }];
    }

    private async exportRequest(
        exporter: DatapackExporter,
        request: ExportRequest,
        expandedOutputFiles: ExpandedOutputFiles,
        prunedFolders: Set<string>,
        progress: ExportProgressReporter
    ) {
        const context = {
            datapackType: request.datapackType,
            maxDepth: request.maxDepth,
            suppressNulls: request.suppressNulls,
            failOnError: request.failOnError,
            onProgress: (update: DatapackExportProgress) => progress.report(update)
        };

        if (request.expand) {
            const results = await exporter.exportObjectAndExpand(request.ids, context);
            let written = 0;
            for (const result of results) {
                await this.writeExpandedDatapack(result, request.folder, expandedOutputFiles, prunedFolders);
                progress.report({ phase: 'write', progress: ++written, total: results.length, sourceKey: result.sourceKey });
            }
            return;
        }

        const results = await exporter.exportObject(request.ids, context);
        let written = 0;
        for (const result of results) {
            await this.writeConsolidatedDatapack(result, request.folder, expandedOutputFiles, prunedFolders);
            progress.report({ phase: 'write', progress: ++written, total: results.length, sourceKey: result.sourceKey });
        }
    }

    private getExportDefaults(options: ExportCommandOptions, overrides: Partial<ExportDefaults> = {}): ExportDefaults {
        return {
            datapackType: overrides.datapackType ?? options.type,
            expand: overrides.expand ?? Boolean(options.expand),
            folder: overrides.folder ?? options.output ?? './',
            maxDepth: overrides.maxDepth ?? this.normalizeDepth(options.depth),
            suppressNulls: overrides.suppressNulls ?? Boolean(options.suppressNulls),
            failOnError: overrides.failOnError ?? Boolean(options.failOnError)
        };
    }

    private async getIdsFromQuery(query: string, datapackType?: string) {
        query = query.trim();
        if (!query) {
            throw new Error(`Empty export query${datapackType ? ` for ${datapackType}` : ''}`);
        }

        this.logger.verbose(`Running export query${datapackType ? ` for ${datapackType}` : ''}: ${query}`);
        const records = await this.container.get(SalesforceService).data.query<{ Id?: string }>(query);
        if (records.length === 0) {
            this.logger.warn(`No records found${datapackType ? ` for ${datapackType}` : ''}`);
            return [];
        }

        const ids = records.map(record => record.Id).filter((id): id is string => typeof id === 'string' && id.length > 0);
        if (ids.length !== records.length) {
            throw new Error(`Export query${datapackType ? ` for ${datapackType}` : ''} must select the Id field`);
        }

        this.logger.info(`Matched ${ids.length} record${ids.length === 1 ? '' : 's'}${datapackType ? ` for ${datapackType}` : ''}`);
        return ids;
    }

    private async writeExpandedDatapack(result: DatapackExpandResult, folder: string, expandedOutputFiles: ExpandedOutputFiles, prunedFolders: Set<string>) {
        this.assertNoExpandedOutputCollision(result, folder, expandedOutputFiles);
        await this.pruneFolder(join(folder, result.folder), prunedFolders);
        const filesWritten = await result.writeToFilesystem(folder);
        for (const fileName of filesWritten) {
            expandedOutputFiles.set(fileName, result.sourceKey);
        }
        this.logger.verbose(`Wrote ${filesWritten.length} file${filesWritten.length === 1 ? '' : 's'} for ${result.sourceKey}`);
    }

    private assertNoExpandedOutputCollision(result: DatapackExpandResult, folder: string, expandedOutputFiles: ExpandedOutputFiles) {
        for (const fileName of Object.keys(result.files)) {
            const outputFile = join(folder, result.folder, fileName);
            const existingSourceKey = expandedOutputFiles.get(outputFile);
            if (existingSourceKey && existingSourceKey !== result.sourceKey) {
                throw new Error(
                    `Expanded export path collision: ${outputFile}\n` +
                    `  existing: ${existingSourceKey}\n` +
                    `  current:  ${result.sourceKey}`
                );
            }
        }
    }

    private async writeConsolidatedDatapack(result: DatapackExportResult, folder: string, consolidatedOutputFiles: ExpandedOutputFiles, prunedFolders: Set<string>) {
        // The source key is unique per datapack, so it disambiguates the output as a folder; the file
        // itself keeps the human-readable Name (falling back to the source key when the record has none).
        const datapackFolder = (result.sourceKey ?? 'datapack').replace(/[/\\:]/g, '_');
        const fileName = `${(result.datapack.Name ?? datapackFolder).replace(/[/\\:]/g, '_')}_DataPack.json`;
        const outputFolder = join(folder, datapackFolder);
        const outputFile = join(outputFolder, fileName);

        const existingSourceKey = consolidatedOutputFiles.get(outputFile);
        if (existingSourceKey && existingSourceKey !== result.sourceKey) {
            throw new Error(
                `Consolidated export path collision: ${outputFile}\n` +
                `  existing: ${existingSourceKey}\n` +
                `  current:  ${result.sourceKey}`
            );
        }

        await this.pruneFolder(outputFolder, prunedFolders);
        await this.writeFile(outputFile, result.datapack);
        consolidatedOutputFiles.set(outputFile, result.sourceKey);
    }

    /**
     * Remove a datapack's output folder once per export run before its files are (re)written so stale
     * files from a previous export don't linger. Tracked in `prunedFolders` so a folder shared by
     * several datapacks in the same run is cleared only on first write, not between siblings.
     */
    private async pruneFolder(folder: string, prunedFolders: Set<string>) {
        if (prunedFolders.has(folder)) {
            return;
        }
        prunedFolders.add(folder);
        try {
            await fs.remove(folder);
        } catch (err) {
            this.logger.warn(`Failed to clear output folder ${folder}: ${getErrorMessage(err)}`);
        }
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
            this.logger.verbose(`Output file: ${fileName}`);
        } catch (err) {
            this.logger.warn(`Failed to write file ${fileName}: ${getErrorMessage(err)}`);
        }
    }

    private async loadExportDefinitions(filePath?: string) {
        if (!filePath) {
            return;
        }

        this.logger.info(`Loading export definitions from ${filePath}`);
        const definitions = await this.exportFileLoader.loadDefinitions(filePath);
        this.container.get(DatapackExportDefinitionStore).load(definitions);
        this.logger.info(`Loaded ${Object.keys(definitions).length} export definition${Object.keys(definitions).length === 1 ? '' : 's'}`);
    }

    private async loadExportFile(filePath: string): Promise<DatapackExportFile> {
        this.logger.info(`Loading export file from ${filePath}`);
        return this.exportFileLoader.load(filePath);
    }

    private normalizeDepth(value?: unknown): number | undefined {
        if (value === undefined) {
            return undefined;
        }

        if (typeof value !== 'number' && typeof value !== 'string') {
            throw new Error('Depth must be an integer');
        }

        const depth = Number(value);
        if (!Number.isInteger(depth)) {
            throw new Error('Depth must be an integer');
        }
        return depth < 0 ? Number.MAX_SAFE_INTEGER : depth;
    }
}
