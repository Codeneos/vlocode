import { Logger } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import { CancellationToken, Timer, arrayMapPush, mapGetOrCreate } from '@vlocode/util';

import { OrgRecordComparer } from './orgRecordComparer';

/**
 * In-memory store of org records extracted per SObject type; used by the {@link DatapackComparer} to
 * resolve record lookups and comparisons locally instead of running (thousands of) filtered org queries.
 *
 * Each table is extracted with a single streamed bulk query selecting the union of the compared fields;
 * lookups against the store use the same canonical value indexing and {@link OrgRecordComparer.fieldEquals}
 * verification as the org based record matching so the matching semantics are identical.
 */
export class OrgDataStore {

    private readonly tables = new Map<string, OrgDataTable>();

    constructor(
        private readonly recordComparer: OrgRecordComparer,
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger
    ) {
    }

    /**
     * Extract all org records of the specified type into the store. Skips extraction when the number of
     * records in the org exceeds the specified limit in which case lookups fall back to org queries.
     * @param sobjectType SObject type to extract
     * @param fields Fields to extract; the `Id` field is always included
     * @param maxRows Maximum number of org rows to extract for this type
     * @param cancelToken An optional cancellation token to abort the extraction
     * @returns `true` when the type is extracted into the store; `false` when the type exceeds the limits
     */
    public async loadTable(sobjectType: string, fields: Iterable<string>, maxRows: number, cancelToken?: CancellationToken): Promise<boolean> {
        const typeKey = sobjectType.toLowerCase();
        if (this.tables.has(typeKey)) {
            return true;
        }

        try {
            const rowCount = await this.getRowCount(sobjectType);
            if (rowCount > maxRows) {
                this.logger.info(`Skipping bulk extract of ${sobjectType}; ${rowCount} records in the target org exceeds the limit of ${maxRows}`);
                return false;
            }

            const timer = new Timer();
            const queryFields = new Set([ 'Id', ...fields ]);

            // Stream the rows as plain records straight from the API instead of through the data
            // service; the query record factory decorates every row with per-field accessors which
            // at bulk extraction volumes (100k+ rows) exhausts the available heap
            const connection = await this.salesforceService.getJsForceConnection();
            const rows = new Array<{ Id: string }>();
            for await (const row of connection.query2<{ Id: string, attributes?: object }>(`select ${[...queryFields].join(',')} from ${sobjectType}`, { type: 'data' })) {
                if (cancelToken?.isCancellationRequested) {
                    return false;
                }
                delete row.attributes;
                rows.push(row);
            }

            this.tables.set(typeKey, new OrgDataTable(this.recordComparer, rows));
            this.logger.verbose(`Extracted ${rows.length} ${sobjectType} records in [${timer.stop()}]`);
            return true;
        } catch (error) {
            this.logger.warn(`Unable to bulk extract ${sobjectType}; falling back to org queries for this type: ${error instanceof Error ? error.message : error}`);
            return false;
        }
    }

    /**
     * Determines if the specified type is extracted into the store.
     */
    public has(sobjectType: string): boolean {
        return this.tables.has(sobjectType.toLowerCase());
    }

    /**
     * Get an extracted org record by ID; returns `undefined` when the record does not exist in the org.
     */
    public getRow(sobjectType: string, id: string): Record<string, unknown> | undefined {
        return this.tables.get(sobjectType.toLowerCase())?.getRow(id);
    }

    /**
     * Get the extracted org records matching the specified filter using {@link OrgRecordComparer.fieldEquals}
     * matching semantics; equivalent to an org lookup with the same (equality) filter.
     */
    public getRows(sobjectType: string, filter: Record<string, unknown>): Record<string, unknown>[] {
        return this.tables.get(sobjectType.toLowerCase())?.getRows(filter) ?? [];
    }

    private async getRowCount(sobjectType: string): Promise<number> {
        const connection = await this.salesforceService.getJsForceConnection();
        const results = await connection.query2<{ total: number }>(`select count(Id) total from ${sobjectType}`, { queryMore: false });
        return results[0]?.total ?? 0;
    }
}

/**
 * Extracted org records of a single SObject type indexed for fast filter based lookups.
 */
class OrgDataTable {

    private readonly rows = new Map<string, Record<string, unknown>>();
    /** Row indexes on the canonical form of the row values per filter field shape */
    private readonly indexes = new Map<string, Map<string, Record<string, unknown>[]>>();

    constructor(
        private readonly recordComparer: OrgRecordComparer,
        rows: Array<{ Id: string }>
    ) {
        for (const row of rows) {
            this.rows.set(row.Id, row);
        }
    }

    public getRow(id: string): Record<string, unknown> | undefined {
        return this.rows.get(id);
    }

    public getRows(filter: Record<string, unknown>): Record<string, unknown>[] {
        const shape = Object.keys(filter).sort((left, right) => left.localeCompare(right));
        if (!shape.length) {
            return [...this.rows.values()];
        }

        const keyValues = shape.map(field => this.recordComparer.getIndexValue(filter[field]));
        if (keyValues.some(value => value === undefined)) {
            // Filter contains values without an exact canonical form (e.g. dates); compare per row
            return [...this.rows.values()].filter(row => this.recordComparer.recordMatches(row, filter));
        }

        const index = mapGetOrCreate(this.indexes, JSON.stringify(shape), () => this.buildIndex(shape));
        const candidates = index.get(JSON.stringify(keyValues)) ?? [];
        // Verify each candidate with fieldEquals to preserve the exact matching semantics
        return candidates.filter(row => this.recordComparer.recordMatches(row, filter));
    }

    private buildIndex(shape: string[]): Map<string, Record<string, unknown>[]> {
        const index = new Map<string, Record<string, unknown>[]>();
        for (const row of this.rows.values()) {
            arrayMapPush(index, JSON.stringify(shape.map(field => this.recordComparer.getRecordIndexValue(row, field))), row);
        }
        return index;
    }
}
