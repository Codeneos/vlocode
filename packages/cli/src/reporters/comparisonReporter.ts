import { DatapackComparisonResult } from '@vlocode/vlocity-deploy';

/**
 * Reports the result of a datapack comparison in a specific output format. Reporters are selected
 * on the compare command through the `--reporter` option.
 */
export interface ComparisonReporter {
    /**
     * Report the comparison result; writes to the console, a file or any other output medium.
     * @param result Comparison result to report
     */
    report(result: DatapackComparisonResult): void | Promise<void>;
}

/**
 * Format a field value for display in a report: objects are JSON encoded, `undefined` renders as
 * `<not set>` and long values are truncated to the specified maximum length.
 * @param value Value to format
 * @param maxLength Maximum length of the formatted value; longer values are truncated with an ellipsis
 */
export function formatValue(value: unknown, maxLength = 80): string {
    if (value === undefined) {
        return '<not set>';
    }
    if (value === null) {
        return 'null';
    }
    const formatted = typeof value === 'string' ? `"${value}"` : JSON.stringify(value);
    if (formatted.length > maxLength) {
        return `${formatted.slice(0, maxLength - 1)}…`;
    }
    return formatted;
}

/**
 * Build a short human readable summary of the differences in a datapack comparison,
 * i.e. `2 to update, 1 to insert, 3 to delete`.
 */
export function summarizeDifferences(datapack: DatapackComparisonResult['datapacks'][number]): string {
    const counts = [
        { label: 'to update', count: datapack.outOfSyncCount },
        { label: 'to insert', count: datapack.missingCount },
        { label: 'to delete', count: datapack.extraOrgRecords.length },
        { label: 'not compared', count: datapack.unknownCount },
    ];
    return counts.filter(({ count }) => count > 0).map(({ label, count }) => `${count} ${label}`).join(', ');
}
