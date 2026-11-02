import { dirname, resolve } from 'path';
import { Container, Logger, injectable } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import { DatapackExporter, type DatapackExportOptions, type DatapackExportProgress } from './datapackExporter';
import { DatapackExpander } from './datapackExpander';
import { DatapackExportDefinitionStore } from './exportDefinitionStore';
import { DatapackExportFileLoader, type DatapackExportQueryGroup } from './datapackExportFileLoader';
import { DatapackExportWriter } from './datapackExportWriter';
import { MatchingKeyService } from '../matchingKeyService';

export interface DatapackExportJobSettings extends Pick<DatapackExportOptions, 'maxDepth' | 'suppressNulls' | 'failOnError'> {
    folder: string;
    expand?: boolean;
    datapackType?: string;
}

export interface DatapackExportJobBatch extends DatapackExportJobSettings {
    ids: string[];
}

export type DatapackExportJobProgress = Omit<DatapackExportProgress, 'phase' | 'id' | 'status'> & {
    phase: DatapackExportProgress['phase'] | 'write';
    id?: string;
    status?: DatapackExportProgress['status'];
};

export interface DatapackExportJobOptions {
    defaults?: Partial<DatapackExportJobSettings>;
    definitionsFile?: string;
    cancellationToken?: DatapackExportOptions['cancellationToken'];
    onPrepared?: (summary: { totalBatches: number; rootDatapacks: number }) => void;
    onBatchStart?: (index: number, batch: DatapackExportJobBatch) => void;
    onBatchEnd?: () => void;
    onProgress?: (progress: DatapackExportJobProgress) => void;
}

export interface DatapackExportJobResult {
    exported: number;
    cancelled: boolean;
}

/** Executes manifest and ad hoc exports with the same definition and filesystem behavior. */
@injectable.transient()
export class DatapackExportJobExecutor {
    private readonly loader = new DatapackExportFileLoader();

    constructor(private readonly services: Container, private readonly logger: Logger) {
    }

    public async executeFile(file: string, options: DatapackExportJobOptions = {}): Promise<DatapackExportJobResult> {
        this.logger.info(`Loading export file from ${file}`);
        const job = await this.loader.load(file);
        const settings: DatapackExportJobSettings = {
            ...options.defaults,
            folder: job.folder ? resolve(dirname(file), job.folder) : options.defaults?.folder ?? dirname(file),
            expand: job.expand ?? options.defaults?.expand,
            maxDepth: job.maxDepth ?? options.defaults?.maxDepth,
            suppressNulls: job.suppressNulls ?? options.defaults?.suppressNulls
        };
        const batches = await this.queryBatches(job.export, settings, options.cancellationToken);
        return this.executeBatches(batches, { ...options, definitionsFile: options.definitionsFile ?? job.exportDefinitions });
    }

    private async queryBatches(
        queriesByType: DatapackExportQueryGroup,
        settings: DatapackExportJobSettings,
        token: DatapackExportJobOptions['cancellationToken']
    ): Promise<DatapackExportJobBatch[]> {
        const batches: DatapackExportJobBatch[] = [];
        for (const [datapackType, queries] of Object.entries(queriesByType)) {
            const ids: string[] = [];
            for (const query of queries) {
                if (token?.isCancellationRequested) {
                    return batches;
                }
                ids.push(...await this.queryRecordIds(query, datapackType));
            }
            if (ids.length) {
                batches.push({ ...settings, datapackType, ids: [...new Set(ids)] });
            }
        }
        return batches;
    }

    public async queryRecordIds(query: string, datapackType?: string): Promise<string[]> {
        query = query.trim();
        if (!query) {
            throw new Error(`Empty export query${datapackType ? ` for ${datapackType}` : ''}`);
        }
        this.logger.verbose(`Running export query${datapackType ? ` for ${datapackType}` : ''}: ${query}`);
        const records = await this.services.get(SalesforceService).data.query<{ Id?: string }>(query);
        const ids = records.map(record => record.Id).filter((id): id is string => typeof id === 'string' && id.length > 0);
        if (ids.length !== records.length) {
            throw new Error(`Export query${datapackType ? ` for ${datapackType}` : ''} must select the Id field`);
        }
        if (!ids.length) {
            this.logger.warn(`No records found${datapackType ? ` for ${datapackType}` : ''}`);
        } else {
            this.logger.info(`Matched ${ids.length} records${datapackType ? ` for ${datapackType}` : ''}`);
        }
        return ids;
    }

    public async executeBatches(batches: DatapackExportJobBatch[], options: DatapackExportJobOptions = {}): Promise<DatapackExportJobResult> {
        const rootDatapacks = batches.reduce((count, batch) => count + batch.ids.length, 0);
        if (options.cancellationToken?.isCancellationRequested) {
            return { exported: 0, cancelled: true };
        }
        if (!rootDatapacks) {
            throw new Error('No datapacks matched the export input');
        }
        const services = await this.createExportServices(options.definitionsFile);
        const writer = new DatapackExportWriter(this.logger);
        let exported = 0;
        try {
            const exporter = services.new(DatapackExporter);
            options.onPrepared?.({ totalBatches: batches.length, rootDatapacks });
            for (const [index, batch] of batches.entries()) {
                if (options.cancellationToken?.isCancellationRequested) {
                    break;
                }
                options.onBatchStart?.(index, batch);
                exported += await this.exportBatch(exporter, writer, batch, options);
                options.onBatchEnd?.();
            }
            const cancelled = Boolean(options.cancellationToken?.isCancellationRequested);
            if (!exported && !cancelled) {
                throw new Error('No datapacks were exported');
            }
            return { exported, cancelled };
        } finally {
            services.dispose();
        }
    }

    private async exportBatch(
        exporter: DatapackExporter,
        writer: DatapackExportWriter,
        batch: DatapackExportJobBatch,
        options: DatapackExportJobOptions
    ): Promise<number> {
        const context: DatapackExportOptions = {
            datapackType: batch.datapackType,
            maxDepth: batch.maxDepth !== undefined && batch.maxDepth < 0 ? Number.MAX_SAFE_INTEGER : batch.maxDepth,
            suppressNulls: batch.suppressNulls,
            failOnError: batch.failOnError,
            cancellationToken: options.cancellationToken,
            onProgress: options.onProgress
        };
        if (batch.expand) {
            const results = await exporter.exportObjectAndExpand(batch.ids, context);
            return this.writeResults(results, result => writer.writeExpanded(result, batch.folder), options);
        }
        const results = await exporter.exportObject(batch.ids, context);
        return this.writeResults(results, result => writer.writeConsolidated(result, batch.folder), options);
    }

    private async writeResults<T extends { sourceKey: string }>(
        results: T[],
        write: (result: T) => Promise<void>,
        options: DatapackExportJobOptions
    ): Promise<number> {
        let written = 0;
        for (const result of results) {
            if (options.cancellationToken?.isCancellationRequested) {
                break;
            }
            await write(result);
            written++;
            options.onProgress?.({ phase: 'write', progress: written, total: results.length, sourceKey: result.sourceKey });
        }
        return written;
    }

    private async createExportServices(definitionsFile?: string): Promise<Container> {
        const definitions = new DatapackExportDefinitionStore();
        for (const definition of this.services.get(DatapackExportDefinitionStore).objectDefinitions()) {
            definitions.add(definition, { datapackType: definition.datapackType, scope: definition.scope });
        }
        if (definitionsFile) {
            definitions.load(await this.loader.loadDefinitions(definitionsFile));
        }
        const services = this.services.create();
        services.add(definitions, { provides: [DatapackExportDefinitionStore] });
        services.add(DatapackExpander);
        services.use(this.services.get(MatchingKeyService).createForDefinitions(definitions), MatchingKeyService);
        return services;
    }
}
