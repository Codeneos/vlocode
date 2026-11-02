import { existsSync } from 'fs';
import * as path from 'path';

import { FileSystem, Logger, LogManager } from '@vlocode/core';
import { HttpTransport } from '@vlocode/salesforce';
import { DatapackComparer } from '@vlocode/vlocity-deploy';
import { DatapackLoader } from '@vlocode/vlocity';
import { Timer, unique } from '@vlocode/util';

import { Argument, Option } from '../command';
import { loadDatapacks } from '../datapackLoading';
import { CompareProgressReporter } from '../progress';
import { ComparisonReporter, ConsoleComparisonReporter, JsonComparisonReporter, MarkdownComparisonReporter } from '../reporters';
import { SalesforceCommand } from '../salesforceCommand';

export default class extends SalesforceCommand {

    static description = 'Compare datapacks against the data in a Salesforce org without deploying them. ' +
        'Reports per datapack if it is in sync with the org and which records a deployment would insert, update or delete.';

    static args = [
        new Argument('<paths..>', 'path of the folders containing the datapacks or datapack files to compare').argParser((value, previous: string[] | undefined) => {
            if (!existsSync(value)) {
                throw new Error('No such folder exists');
            }
            return (previous ?? []).concat([ value ]);
        })
    ];

    static options = [
        ...SalesforceCommand.options,
        new Option('-r, --reporter <reporters...>',
            'one or more reporters used to output the comparison results. ' +
            'The console reporter prints a colorized summary, the json and markdown reporters write a detailed report file.'
        ).choices([ 'console', 'json', 'markdown' ]).default([ 'console' ]),
        new Option('--report-file <path>',
            'name of the report file to which the json and markdown reporters write; the file extension is set per reporter'
        ).default('datapack-comparison'),
        new Option('--no-progress',
            'disable the interactive progress bar and use plain forward-printing output'
        ),
        new Option('--no-bulk-extract',
            'disable bulk extraction of org data; compare using filtered org queries instead. ' +
            'Bulk extraction reads all org records per compared SObject type which is significantly faster for large comparisons.'
        ),
        new Option('--bulk-extract-limit <count>',
            'maximum number of org records per SObject type to bulk extract; types with more records fall back to filtered org queries'
        ).default(200000),
        SalesforceCommand.matchingKeysOption,
    ];

    constructor(private logger: Logger = LogManager.get('DatapackCompare')) {
        super();
    }

    public async run(paths: string[], options: any) {
        const datapacks = await loadDatapacks(this.container.get(DatapackLoader), paths, this.logger, this.container.get(FileSystem));
        if (!datapacks.length) {
            return;
        }

        this.applyMatchingKeyOptions(options);

        const progress = new CompareProgressReporter({
            logger: this.logger,
            enabled: options.progress === false ? false : undefined,
            apiCalls: () => HttpTransport.requestCount
        });
        progress.start();

        const compareTimer = new Timer();
        try {
            // Hand off the datapacks so the comparer can release them after record conversion
            const result = await this.container.new(DatapackComparer).compare(datapacks.splice(0), {
                onProgress: event => progress.report(event),
                bulkExtract: options.bulkExtract,
                bulkExtractLimit: Number(options.bulkExtractLimit) || undefined
            });
            progress.succeed(result);
            this.logger.verbose(`Comparison completed in ${compareTimer.toString('seconds')}`);

            const orgUrl = (await this.getConnection()).instanceUrl;
            for (const reporter of this.getReporters(options, orgUrl)) {
                await reporter.report(result);
            }
        } finally {
            progress.stop();
        }
    }

    private getReporters(options: any, orgUrl?: string): ComparisonReporter[] {
        return [...unique(options.reporter as string[])].map(name => this.createReporter(name, options, orgUrl));
    }

    private createReporter(name: string, options: any, orgUrl?: string): ComparisonReporter {
        switch (name) {
            case 'console': return new ConsoleComparisonReporter(this.logger);
            case 'json': return new JsonComparisonReporter(this.getReportFile(options, '.json'), this.logger);
            case 'markdown': return new MarkdownComparisonReporter(this.getReportFile(options, '.md'), this.logger, { orgUrl });
            default: throw new Error(`Unknown reporter: ${name}`);
        }
    }

    private getReportFile(options: any, extension: string) {
        const parsed = path.parse(options.reportFile);
        return path.format({ dir: parsed.dir, name: parsed.name, ext: extension });
    }
}
