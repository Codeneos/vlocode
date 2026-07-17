import { existsSync } from 'node:fs';
import path from 'node:path';

import { Args, Flags } from '@oclif/core';

import { HttpTransport } from '@vlocode/salesforce';
import { DatapackComparer } from '@vlocode/vlocity-deploy';
import { DatapackLoader } from '@vlocode/vlocity';
import { Timer, unique } from '@vlocode/util';

import { SalesforceCommand } from '../../salesforceCommand';
import { loadDatapacks } from '../../lib/datapackLoader';
import { CompareProgressReporter } from '../../lib/progress';
import { ComparisonReporter } from '../../lib/reports/comparisonReporter';
import { ConsoleComparisonReporter } from '../../lib/reports/consoleComparisonReporter';
import { JsonComparisonReporter } from '../../lib/reports/jsonComparisonReporter';
import { MarkdownComparisonReporter } from '../../lib/reports/markdownComparisonReporter';

export default class DatapackCompare extends SalesforceCommand<typeof DatapackCompare> {

    static description =
        'Compare datapacks against the data in a Salesforce org without deploying them. ' +
        'Reports per datapack if it is in sync with the org and which records a deployment would insert, update or delete.';

    static args = {
        paths: Args.string({
            description: 'path of the folders containing the datapacks or datapack files to compare',
            required: true,
        }),
    };

    static flags = {
        reporter: Flags.string({
            char: 'r',
            multiple: true,
            options: ['console', 'json', 'markdown'],
            default: ['console'],
            summary: 'one or more reporters used to output the comparison results',
            description:
                'The console reporter prints a colorized summary, the json and markdown reporters write a detailed report file.',
        }),
        'report-file': Flags.string({
            default: 'datapack-comparison',
            summary: 'name of the report file to which the json and markdown reporters write; the file extension is set per reporter',
        }),
        progress: Flags.boolean({
            default: true,
            allowNo: true,
            summary: 'show an interactive progress bar (use --no-progress for plain forward-printing output)',
        }),
        'bulk-extract': Flags.boolean({
            default: true,
            allowNo: true,
            summary: 'bulk extract org data for comparison (use --no-bulk-extract to compare using filtered org queries)',
            description:
                'Bulk extraction reads all org records per compared SObject type which is significantly faster for large comparisons.',
        }),
        'bulk-extract-limit': Flags.integer({
            default: 200000,
            summary: 'maximum number of org records per SObject type to bulk extract; types with more records fall back to filtered org queries',
        }),
        ...SalesforceCommand.matchingKeysFlag,
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> ./datapacks -u my-org',
        '<%= config.bin %> <%= command.id %> ./datapacks -r console -r markdown --report-file compare-report -u my-org',
    ];

    public async run() {
        const paths = this.positionals;
        for (const datapackPath of paths) {
            if (!existsSync(datapackPath)) {
                this.error(`No such folder exists: ${datapackPath}`);
            }
        }

        const datapacks = await loadDatapacks(this.container.get(DatapackLoader), this.logger, paths);
        if (!datapacks.length) {
            return;
        }

        this.applyMatchingKeyOptions(this.flags['matching-keys']);

        const progress = new CompareProgressReporter({
            logger: this.logger,
            enabled: this.flags.progress === false ? false : undefined,
            apiCalls: () => HttpTransport.requestCount,
        });
        progress.start();

        const compareTimer = new Timer();
        try {
            // Hand off the datapacks so the comparer can release them after record conversion
            const result = await this.container.new(DatapackComparer).compare(datapacks.splice(0), {
                onProgress: event => progress.report(event),
                bulkExtract: this.flags['bulk-extract'],
                bulkExtractLimit: this.flags['bulk-extract-limit'] || undefined,
            });
            progress.succeed(result);
            this.logger.verbose(`Comparison completed in ${compareTimer.toString('seconds')}`);

            for (const reporter of this.getReporters()) {
                await reporter.report(result);
            }
        } finally {
            progress.stop();
        }
    }

    private getReporters(): ComparisonReporter[] {
        return [...unique(this.flags.reporter)].map(name => this.createReporter(name));
    }

    private createReporter(name: string): ComparisonReporter {
        switch (name) {
            case 'console': return new ConsoleComparisonReporter(this.logger);
            case 'json': return new JsonComparisonReporter(this.getReportFile('.json'), this.logger);
            case 'markdown': return new MarkdownComparisonReporter(this.getReportFile('.md'), this.logger, { orgUrl: this.connection.instanceUrl });
            default: throw new Error(`Unknown reporter: ${name}`);
        }
    }

    private getReportFile(extension: string) {
        const parsed = path.parse(this.flags['report-file']);
        return path.format({ dir: parsed.dir, name: parsed.name, ext: extension });
    }
}
