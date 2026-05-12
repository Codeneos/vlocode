import { join } from 'path';
import * as fs from 'fs-extra';

import { Logger, LogManager } from '@vlocode/core';
import { DatapackExpandResult, DatapackExportDefinitionStore, DatapackExporter } from '@vlocode/vlocity-deploy';

import { Argument, Option } from '../command';
import { SalesforceCommand } from '../salesforceCommand';
import { SalesforceService } from '@vlocode/salesforce';
import { getErrorMessage } from '@vlocode/util';
import { DatapackExportFileLoader, type DatapackExportFile } from '../datapackExportFileLoader';

type DatapackExportResult = Awaited<ReturnType<DatapackExporter['exportObject']>>[number];

type ExportCommandOptions = {
    exportDefinitions?: string;
    expand?: boolean;
    query?: string;
    file?: string;
    folder?: string;
    depth?: number;
    datapackType?: string;
};

type ExportDefaults = {
    datapackType?: string;
    expand: boolean;
    folder: string;
    maxDepth?: number;
};

type ExportRequest = ExportDefaults & {
    ids: string[];
};

type ExpandedOutputFiles = Map<string, string>;

function existingFile(label: string): (value: string) => string {
    return (value: string) => {
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
            '-d, --export-definitions <file>', 
            'path of the YAML or JSON file containing the export definitions that define how objects are exported'
        ).argParser(existingFile('definitions file')),
        new Option(
            '-f, --file <file>',
            'path to a YAML export file with datapack export queries'
        ).argParser(existingFile('export file')).conflicts('query'),
        new Option(
            '-e, --expand',
            'expand the datapack once exported into separate files according to the export definitions'
        ).default(false),
        new Option(
            '-q, --query <query-string>',
            'specify the query to use to export the objects instead of using the object ID'
        ).conflicts('file'),
        new Option(
            '-t, --datapack-type <type>',
            'datapack type to use when exporting IDs or a single query'
        ),
        new Option(
            '--folder <folder>',
            'folder where exported datapacks are written'
        ).default('./'),
        new Option(
            '--depth <depth>',
            'dependency export depth; use -1 to include all dependencies'
        ).argParser(parseDepth)
    ];

    private readonly exportFileLoader = new DatapackExportFileLoader();

    constructor(private logger: Logger = LogManager.get('DatapackExport')) {
        super();
    }

    public async run(ids?: string[]) {
        const options = this.options as ExportCommandOptions;
        const argIds = Array.isArray(ids) ? ids : [];
        const exportFile = options.file ? await this.loadExportFile(options.file) : undefined;

        await this.loadExportDefinitions(options.exportDefinitions ?? exportFile?.exportDefinitions);

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

        for (const request of requests) {
            await this.exportRequest(exporter, request, expandedOutputFiles);
        }

        this.logger.info('Datapack export completed');
    }

    private async getRequestsFromFile(exportFile: DatapackExportFile, defaults: ExportCommandOptions, ids: string[]) {
        if (ids.length || defaults.query || defaults.datapackType) {
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
            ids = await this.getIdsFromQuery(options.query, options.datapackType);
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

    private async exportRequest(exporter: DatapackExporter, request: ExportRequest, expandedOutputFiles: ExpandedOutputFiles) {
        const context = {
            datapackType: request.datapackType,
            maxDepth: request.maxDepth
        };

        if (request.expand) {
            const results = await exporter.exportObjectAndExpand(request.ids, context);
            for (const result of results) {
                await this.writeExpandedDatapack(result, request.folder, expandedOutputFiles);
            }
            return;
        }

        const results = await exporter.exportObject(request.ids, context);
        for (const result of results) {
            await this.writeExportTree(result, request.folder);
        }
    }

    private getExportDefaults(options: ExportCommandOptions, overrides: Partial<ExportDefaults> = {}): ExportDefaults {
        return {
            datapackType: overrides.datapackType ?? options.datapackType,
            expand: overrides.expand ?? Boolean(options.expand),
            folder: overrides.folder ?? options.folder ?? './',
            maxDepth: overrides.maxDepth ?? this.normalizeDepth(options.depth)
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

    private async writeExportTree(result: DatapackExportResult, folder: string) {
        await this.writeConsolidatedDatapack(result, folder);

        for (const related of result.relatedDatapacks ?? []) {
            await this.writeExportTree(related, folder);
        }
    }

    private async writeExpandedDatapack(result: DatapackExpandResult, folder: string, expandedOutputFiles: ExpandedOutputFiles) {
        this.assertNoExpandedOutputCollision(result, folder, expandedOutputFiles);
        const filesWritten = await result.writeToFilesystem(folder);
        for (const fileName of filesWritten) {
            expandedOutputFiles.set(fileName, result.sourceKey);
        }
        this.logger.info(`Wrote ${filesWritten.length} file${filesWritten.length === 1 ? '' : 's'} for ${result.sourceKey}`);
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

    private async writeConsolidatedDatapack(result: DatapackExportResult, folder: string) {
        const baseName = result.datapack.name ?? result.datapack.Name ?? result.sourceKey.replace(/[/\\:]/g, '_');
        await this.writeFile([folder, `${baseName}_DataPack.json`], result.datapack);
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
