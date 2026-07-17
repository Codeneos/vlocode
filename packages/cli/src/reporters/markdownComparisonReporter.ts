import { writeFile } from 'fs/promises';

import { Logger } from '@vlocode/core';
import { DatapackComparisonResult, DatapackComparisonStatus } from '@vlocode/vlocity-deploy';

import { ComparisonReporter, formatValue, summarizeDifferences } from './comparisonReporter';

/**
 * Writes the datapack comparison result as a markdown report file with a summary table and a
 * detail section per datapack that is not in sync; suitable for posting on pull requests or wikis.
 */
export class MarkdownComparisonReporter implements ComparisonReporter {

    /** Maximum number of rows in record level detail tables */
    private static readonly maxTableRows = 200;
    /** Maximum number of rows in field level detail tables */
    private static readonly maxFieldRows = 30;

    private readonly statusLabels: Record<DatapackComparisonStatus['status'], string> = {
        inSync: '✅ In sync',
        extraRecords: '⚠️ Extra records in org',
        outOfSync: '❌ Out of sync',
        missing: '❌ Missing in org',
        unknown: '⚠️ Not compared'
    };

    /** Display order of the datapack statuses; out of sync datapacks are reported on top */
    private readonly statusOrder: Record<DatapackComparisonStatus['status'], number> = {
        outOfSync: 0,
        missing: 0,
        unknown: 1,
        extraRecords: 2,
        inSync: 3
    };

    constructor(
        private readonly outputFile: string,
        private readonly logger: Logger,
        private readonly options?: {
            /**
             * Base URL of the target org (instance URL); when set record IDs in the report are
             * rendered as links to the record in the org.
             */
            orgUrl?: string
        }
    ) {
    }

    public async report(result: DatapackComparisonResult): Promise<void> {
        await writeFile(this.outputFile, this.generate(result));
        this.logger.info(`Markdown comparison report written to: ${this.outputFile}`);
    }

    /**
     * Generate the markdown report for the comparison result.
     */
    public generate(result: DatapackComparisonResult): string {
        const lines = new Array<string>();
        lines.push(`# Datapack comparison report`);
        lines.push('');
        lines.push(`Generated: ${new Date().toISOString()}`);
        lines.push('');
        lines.push(`**${result.inSync} of ${result.total} datapack(s) in sync** with the target org` +
            (result.extraRecords ? `; ${result.extraRecords} with extra org records` : '') +
            (result.outOfSync ? `; ${result.outOfSync} not in sync` : '') +
            (result.unknown ? `; ${result.unknown} could not be compared` : ''));
        lines.push('');

        this.generateObjectTypeStats(lines, result);

        const orderedDatapacks = [...result.datapacks].sort((a, b) =>
            this.statusOrder[a.status] - this.statusOrder[b.status] || a.datapackKey.localeCompare(b.datapackKey));

        lines.push(`## Datapacks`);
        lines.push('');
        lines.push(`| Datapack | Type | Status | Records | Org record | Differences |`);
        lines.push(`|---|---|---|---:|---|---|`);
        for (const datapack of orderedDatapacks) {
            lines.push(`| ${this.escape(datapack.datapackKey)
                } | ${this.escape(datapack.datapackType)
                } | ${this.statusLabels[datapack.status]
                } | ${datapack.recordCount
                } | ${this.recordLink(datapack.records[0]?.recordId)
                } | ${this.escape(summarizeDifferences(datapack)) || '—'} |`);
        }
        lines.push('');

        for (const datapack of orderedDatapacks.filter(datapack => !datapack.inSync)) {
            // Append per line; spreading a large section into push exceeds the maximum call stack size
            for (const line of this.generateDatapackSection(datapack)) {
                lines.push(line);
            }
        }

        return lines.join('\n');
    }

    /**
     * Add a table with per SObject type record counts: total, in sync, out of sync and missing.
     */
    private generateObjectTypeStats(lines: string[], result: DatapackComparisonResult) {
        const stats = new Map<string, { total: number, inSync: number, outOfSync: number, missing: number }>();
        for (const datapack of result.datapacks) {
            for (const record of datapack.records) {
                if (record.status === 'skipped') {
                    continue;
                }
                let typeStats = stats.get(record.sobjectType);
                if (!typeStats) {
                    stats.set(record.sobjectType, typeStats = { total: 0, inSync: 0, outOfSync: 0, missing: 0 });
                }
                typeStats.total++;
                if (record.status === 'inSync') {
                    typeStats.inSync++;
                } else if (record.status === 'outOfSync') {
                    typeStats.outOfSync++;
                } else if (record.status === 'missing') {
                    typeStats.missing++;
                }
            }
        }

        lines.push(`## Records by object type`);
        lines.push('');
        lines.push(`| SObject | Total | In sync | Out of sync | Missing |`);
        lines.push(`|---|---:|---:|---:|---:|`);
        for (const [sobjectType, typeStats] of [...stats.entries()].sort(([a], [b]) => a.localeCompare(b))) {
            lines.push(`| ${this.escape(sobjectType)} | ${typeStats.total} | ${typeStats.inSync} | ${typeStats.outOfSync} | ${typeStats.missing} |`);
        }
        lines.push('');
    }

    private generateDatapackSection(datapack: DatapackComparisonStatus): string[] {
        const lines = new Array<string>();
        lines.push(`## ${this.escape(datapack.datapackKey)}`);
        lines.push('');
        lines.push(`Status: **${this.statusLabels[datapack.status]}**`);
        lines.push('');

        for (const message of datapack.messages) {
            lines.push(`> ⚠️ ${this.escape(message)}`);
            lines.push('');
        }

        const changedRecords = datapack.records.filter(record => record.status !== 'inSync' && record.status !== 'skipped');
        if (changedRecords.length) {
            lines.push(`| Record | SObject | Status | Deploy action | Org record |`);
            lines.push(`|---|---|---|---|---|`);
            for (const record of changedRecords.slice(0, MarkdownComparisonReporter.maxTableRows)) {
                lines.push(`| ${this.escape(record.sourceKey)} | ${this.escape(record.sobjectType)} | ${record.status} | ${record.deployAction} | ${this.recordLink(record.recordId)} |`);
            }
            this.pushTruncationNote(lines, changedRecords, MarkdownComparisonReporter.maxTableRows, 'record(s)');
            lines.push('');
        }

        for (const record of changedRecords) {
            if (record.mismatchedFields?.length) {
                lines.push(`### Field mismatches — ${this.escape(record.sourceKey)}`);
                lines.push('');
                lines.push(`| Field | Value in org | Value in datapack |`);
                lines.push(`|---|---|---|`);
                for (const { field, actual, expected } of record.mismatchedFields.slice(0, MarkdownComparisonReporter.maxFieldRows)) {
                    lines.push(`| ${this.escape(field)} | ${this.escape(formatValue(actual))} | ${this.escape(formatValue(expected))} |`);
                }
                this.pushTruncationNote(lines, record.mismatchedFields, MarkdownComparisonReporter.maxFieldRows, 'field(s)');
                lines.push('');
            }
        }

        if (datapack.extraOrgRecords.length) {
            lines.push(`### Records in org not in datapack (deleted on deploy)`);
            lines.push('');
            lines.push(`| SObject | Record ID |`);
            lines.push(`|---|---|`);
            for (const extra of datapack.extraOrgRecords.slice(0, MarkdownComparisonReporter.maxTableRows)) {
                lines.push(`| ${this.escape(extra.sobjectType)} | ${this.recordLink(extra.recordId)} |`);
            }
            this.pushTruncationNote(lines, datapack.extraOrgRecords, MarkdownComparisonReporter.maxTableRows, 'record(s)');
            lines.push('');
        }

        return lines;
    }

    /**
     * Render a record ID as a link to the record in the target org when the org URL is known.
     */
    private recordLink(recordId: string | undefined): string {
        if (!recordId) {
            return '—';
        }
        return this.options?.orgUrl ? `[${recordId}](${this.options.orgUrl}/${recordId})` : recordId;
    }

    /**
     * Add a trailing table row stating how many more entries were truncated from a detail table;
     * tables are limited to keep reports for large comparisons readable, the JSON report contains all entries.
     */
    private pushTruncationNote(lines: string[], rows: unknown[], limit: number, entryName: string) {
        if (rows.length > limit) {
            lines.push(`| _… ${rows.length - limit} more ${entryName}, see the JSON report for all entries_ |`);
        }
    }

    /**
     * Escape markdown table breaking characters in a value.
     */
    private escape(value: string): string {
        return value.replaceAll('|', '\\|').replaceAll(/\r?\n/g, ' ');
    }
}
