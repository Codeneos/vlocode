import { writeFile } from 'fs/promises';

import { Logger } from '@vlocode/core';
import { DatapackComparisonResult } from '@vlocode/vlocity-deploy';

import { ComparisonReporter } from './comparisonReporter';

/**
 * Writes the full datapack comparison result as a JSON report file including all per record
 * details (matched org records, mismatched fields, missing record data and extra org records)
 * so the report can be processed by other tools or CI pipelines.
 */
export class JsonComparisonReporter implements ComparisonReporter {

    constructor(
        private readonly outputFile: string,
        private readonly logger: Logger
    ) {
    }

    public async report(result: DatapackComparisonResult): Promise<void> {
        await writeFile(this.outputFile, JSON.stringify(this.generate(result), undefined, 2));
        this.logger.info(`JSON comparison report written to: ${this.outputFile}`);
    }

    /**
     * Generate the JSON report structure for the comparison result.
     */
    public generate(result: DatapackComparisonResult) {
        return {
            reportType: 'datapack-comparison',
            generatedAt: new Date().toISOString(),
            summary: {
                total: result.total,
                inSync: result.inSync,
                extraRecords: result.extraRecords,
                outOfSync: result.outOfSync,
                unknown: result.unknown
            },
            datapacks: result.datapacks
        };
    }
}
