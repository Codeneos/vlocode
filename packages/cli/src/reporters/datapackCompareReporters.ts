import chalk from 'chalk';
import logSymbols from 'log-symbols';

import type {
    DatapackComparisonDatapackResult,
    DatapackComparisonResult,
    DatapackRecordComparison
} from '@vlocode/vlocity-deploy';

export type DatapackCompareReportFormat = 'console' | 'json' | 'markdown';

export interface DatapackCompareReporter {
    readonly format: DatapackCompareReportFormat;
    render(result: DatapackComparisonResult): string;
}

/**
 * Human-facing report optimized for terminal scans. It shows the same underlying comparison details as
 * JSON/Markdown, but groups them by datapack and only expands records that would be touched by deploy.
 */
export class DatapackCompareConsoleReporter implements DatapackCompareReporter {
    public readonly format = 'console';

    public render(result: DatapackComparisonResult): string {
        const recordCount = result.datapacks.reduce((total, datapack) => total + datapack.recordCount, 0);
        const mismatchCount = result.datapacks.reduce((total, datapack) => total + datapack.mismatches.length, 0);
        const lines = new Array<string>();

        lines.push(result.upToDate
            ? `${logSymbols.success} ${chalk.green(`All ${result.total} datapacks are up to date`)} (${recordCount} records checked)`
            : `${logSymbols.warning} ${chalk.yellow(`${mismatchCount} of ${recordCount} records would be touched across ${result.total} datapacks`)}`);

        for (const datapack of result.datapacks) {
            lines.push('');
            lines.push(this.renderDatapackSummary(datapack));
            for (const record of datapack.mismatches) {
                lines.push(...this.renderRecordDetails(record).map(line => `  ${line}`));
            }
        }

        return lines.join('\n');
    }

    private renderDatapackSummary(datapack: DatapackComparisonDatapackResult): string {
        const status = datapack.upToDate
            ? chalk.green('up to date')
            : chalk.yellow(`${datapack.mismatches.length}/${datapack.recordCount} records would change`);
        const type = datapack.type ? chalk.dim(` (${datapack.type})`) : '';
        return `${datapack.upToDate ? logSymbols.success : logSymbols.warning} ${chalk.bold(datapack.datapack)}${type}: ${status}`;
    }

    private renderRecordDetails(record: DatapackRecordComparison): string[] {
        const lines = [
            `- ${chalk.bold(record.sourceKey)} ${chalk.dim(`(${record.sobjectType})`)} - ${this.renderAction(record)}`
        ];

        if (record.recordId) {
            lines.push(`  target: ${record.recordId}`);
        }
        if (record.matchedBy !== 'none') {
            lines.push(`  matched by: ${record.matchedBy}`);
        }
        if (record.mismatchedFields?.length) {
            lines.push('  mismatched fields:');
            lines.push(...record.mismatchedFields.map(field =>
                `    ${field.field}: expected ${formatValue(field.expected)}, actual ${formatValue(field.actual)}`
            ));
        }
        if (record.missingRecordData?.length) {
            lines.push(record.deleteRecreate
                ? '  embedded record data missing from target:'
                : '  record data missing from target:');
            lines.push(...record.missingRecordData.map(field =>
                `    ${field.field}: ${formatValue(field.expected)}`
            ));
        }

        return lines;
    }

    private renderAction(record: DatapackRecordComparison): string {
        switch (record.plannedAction) {
            case 'none':
                return chalk.green('no change');
            case 'update':
                return chalk.yellow('update');
            case 'insert':
                return chalk.yellow('insert');
            case 'deleteRecreate':
                return chalk.yellow('delete + recreate');
        }
    }
}

export class DatapackCompareJsonReporter implements DatapackCompareReporter {
    public readonly format = 'json';

    public render(result: DatapackComparisonResult): string {
        return JSON.stringify(result, null, 2);
    }
}

/**
 * Documentation/reporting format intended for pull requests, release notes, or audit hand-off.
 */
export class DatapackCompareMarkdownReporter implements DatapackCompareReporter {
    public readonly format = 'markdown';

    public render(result: DatapackComparisonResult): string {
        const recordCount = result.datapacks.reduce((total, datapack) => total + datapack.recordCount, 0);
        const mismatchCount = result.datapacks.reduce((total, datapack) => total + datapack.mismatches.length, 0);
        const lines = [
            '# Datapack Compare Report',
            '',
            `Status: ${result.upToDate ? 'Up to date' : 'Changes detected'}`,
            `Datapacks: ${result.total}`,
            `Records checked: ${recordCount}`,
            `Records touched by deploy: ${mismatchCount}`,
            '',
            '| Datapack | Type | Status | Records | Touched |',
            '| --- | --- | --- | ---: | ---: |',
            ...result.datapacks.map(datapack =>
                `| ${escapeMarkdown(datapack.datapack)} | ${escapeMarkdown(datapack.type)} | ${datapack.upToDate ? 'Up to date' : 'Changed'} | ${datapack.recordCount} | ${datapack.mismatches.length} |`
            )
        ];

        for (const datapack of result.datapacks.filter(datapack => datapack.mismatches.length)) {
            lines.push('', `## ${escapeMarkdown(datapack.datapack)}`, '');
            lines.push('| Record | Object | Match | Target ID | Planned action |');
            lines.push('| --- | --- | --- | --- | --- |');
            lines.push(...datapack.mismatches.map(record =>
                `| ${escapeMarkdown(record.sourceKey)} | ${escapeMarkdown(record.sobjectType)} | ${record.matchedBy} | ${record.recordId ?? ''} | ${record.plannedAction} |`
            ));

            for (const record of datapack.mismatches) {
                lines.push('', `### ${escapeMarkdown(record.sourceKey)}`, '');
                if (record.mismatchedFields?.length) {
                    lines.push('Mismatched fields:', '');
                    lines.push('| Field | Expected | Actual |');
                    lines.push('| --- | --- | --- |');
                    lines.push(...record.mismatchedFields.map(field =>
                        `| ${escapeMarkdown(field.field)} | ${escapeMarkdown(formatValue(field.expected))} | ${escapeMarkdown(formatValue(field.actual))} |`
                    ));
                }
                if (record.missingRecordData?.length) {
                    lines.push(record.deleteRecreate ? 'Embedded record data missing from target:' : 'Record data missing from target:', '');
                    lines.push('| Field | Expected |');
                    lines.push('| --- | --- |');
                    lines.push(...record.missingRecordData.map(field =>
                        `| ${escapeMarkdown(field.field)} | ${escapeMarkdown(formatValue(field.expected))} |`
                    ));
                }
            }
        }

        return lines.join('\n');
    }
}

export function createDatapackCompareReporter(format: DatapackCompareReportFormat): DatapackCompareReporter {
    switch (format) {
        case 'console':
            return new DatapackCompareConsoleReporter();
        case 'json':
            return new DatapackCompareJsonReporter();
        case 'markdown':
            return new DatapackCompareMarkdownReporter();
    }
}

function formatValue(value: unknown): string {
    if (value === undefined) {
        return '<undefined>';
    }
    if (value === null) {
        return '<null>';
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}

function escapeMarkdown(value: string): string {
    return value.replaceAll('|', '\\|').replaceAll('\n', '<br>');
}
