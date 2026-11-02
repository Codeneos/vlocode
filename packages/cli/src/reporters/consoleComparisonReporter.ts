import chalk from 'chalk';
import logSymbols from 'log-symbols';

import { Logger } from '@vlocode/core';
import { removeNamespacePlaceholders } from '@vlocode/util';
import { DatapackComparisonResult, DatapackComparisonStatus, DatapackRecordComparisonResult, DatapackSyncState } from '@vlocode/vlocity-deploy';

import { ComparisonReporter, formatValue, summarizeDifferences } from './comparisonReporter';

/**
 * Writes a colorized human readable summary of a datapack comparison to the console. In-sync
 * datapacks are reported as a single line; datapacks with differences are expanded showing the
 * records that would be updated, inserted or deleted by a deployment.
 */
export class ConsoleComparisonReporter implements ComparisonReporter {

    /** Number of field mismatches displayed per record before truncating the list */
    private readonly maxFieldMismatches = 5;

    /** Number of changed records expanded per datapack before truncating the list */
    private readonly maxRecordsPerDatapack = 10;

    private readonly datapackFormat: Record<DatapackSyncState, { symbol: string, label: string, format: chalk.Chalk }> = {
        inSync: { symbol: logSymbols.success, label: 'in sync', format: chalk.green },
        extraRecords: { symbol: logSymbols.warning, label: 'extra records in org', format: chalk.yellow },
        outOfSync: { symbol: logSymbols.error, label: 'out of sync', format: chalk.red },
        missing: { symbol: logSymbols.error, label: 'missing in org', format: chalk.red },
        unknown: { symbol: logSymbols.warning, label: 'not compared', format: chalk.yellow },
    };

    constructor(private readonly logger: Logger) {
    }

    public report(result: DatapackComparisonResult): void {
        // Report in-sync datapacks first so differences are grouped at the bottom near the summary
        const orderedDatapacks = [...result.datapacks].sort((a, b) =>
            Number(a.status !== 'inSync') - Number(b.status !== 'inSync') || a.datapackKey.localeCompare(b.datapackKey));

        for (const datapack of orderedDatapacks) {
            this.reportDatapack(datapack);
        }

        this.logger.info('');
        const summary = `${result.inSync}/${result.total} datapack(s) in sync with the target org`;
        if (result.inSync === result.total) {
            this.logger.info(`${logSymbols.success} ${chalk.green(summary)}`);
        } else {
            const details = [
                result.extraRecords ? `${result.extraRecords} with extra org records` : undefined,
                result.outOfSync ? `${result.outOfSync} not in sync` : undefined,
                result.unknown ? `${result.unknown} not compared` : undefined
            ].filter(Boolean).join(', ');
            // Extra org records only (all datapack records in sync) is a warning rather than an error
            const severity = result.outOfSync || result.unknown
                ? { symbol: logSymbols.error, format: chalk.red }
                : { symbol: logSymbols.warning, format: chalk.yellow };
            this.logger.info(`${severity.symbol} ${severity.format(summary)} ${chalk.dim(`(${details})`)}`);
        }
    }

    private reportDatapack(datapack: DatapackComparisonStatus) {
        const { symbol, label, format } = this.datapackFormat[datapack.status];
        const differences = summarizeDifferences(datapack);
        const statusText = (datapack.status === 'outOfSync' || datapack.status === 'extraRecords') && differences ? differences : label;
        this.logger.info(`${symbol} ${chalk.bold(datapack.datapackKey)} ${chalk.dim(`(${datapack.recordCount} records)`)} ${format(statusText)}`);

        for (const message of datapack.messages) {
            this.logger.info(`  ${chalk.yellow('!')} ${message}`);
        }

        if (datapack.status === 'inSync') {
            return;
        }

        const changedRecords = datapack.records.filter(record => record.status !== 'inSync' && record.status !== 'skipped');
        for (const record of changedRecords.slice(0, this.maxRecordsPerDatapack)) {
            this.reportRecord(record);
        }
        if (changedRecords.length > this.maxRecordsPerDatapack) {
            this.logger.info(chalk.dim(`  … ${changedRecords.length - this.maxRecordsPerDatapack} more record(s), see the JSON or markdown report`));
        }

        for (const extra of datapack.extraOrgRecords.slice(0, this.maxRecordsPerDatapack)) {
            this.logger.info(`  ${chalk.red('-')} delete ${extra.sobjectType} ${chalk.dim(extra.recordId)} ${chalk.dim('(not in datapack)')}`);
        }
        if (datapack.extraOrgRecords.length > this.maxRecordsPerDatapack) {
            this.logger.info(chalk.dim(`  … ${datapack.extraOrgRecords.length - this.maxRecordsPerDatapack} more extra org record(s)`));
        }
    }

    private reportRecord(record: DatapackRecordComparisonResult) {
        if (record.status === 'inSync' || record.status === 'skipped') {
            return;
        }

        const recordName = `${record.sobjectType} ${removeNamespacePlaceholders(record.sourceKey)}`;
        if (record.status === 'outOfSync') {
            this.logger.info(`  ${chalk.yellow('~')} update ${recordName} ${chalk.dim(record.recordId ?? '')}`);
            const mismatches = record.mismatchedFields ?? [];
            for (const { field, expected, actual } of mismatches.slice(0, this.maxFieldMismatches)) {
                this.logger.info(`      ${chalk.cyan(field)}: ${chalk.red(formatValue(actual))} ${chalk.dim('→')} ${chalk.green(formatValue(expected))}`);
            }
            if (mismatches.length > this.maxFieldMismatches) {
                this.logger.info(chalk.dim(`      … ${mismatches.length - this.maxFieldMismatches} more field(s)`));
            }
        } else if (record.status === 'missing') {
            this.logger.info(`  ${chalk.green('+')} insert ${recordName} ${chalk.dim('(missing in org)')}`);
        } else {
            this.logger.info(`  ${chalk.yellow('?')} ${recordName} ${chalk.dim('(not compared)')}`);
        }

        for (const message of record.messages) {
            this.logger.info(chalk.dim(`      ${message}`));
        }
    }

}
