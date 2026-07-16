import { existsSync } from 'fs';
import { mkdir, stat, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';

import { Logger, LogLevel, LogManager } from '@vlocode/core';
import { DatapackDeployer, type DatapackDeploymentOptions } from '@vlocode/vlocity-deploy';
import { DatapackLoader } from '@vlocode/vlocity';
import { mapAsync, Timer } from '@vlocode/util';

import { Argument, Option } from '../command';
import { SalesforceCommand } from '../salesforceCommand';
import {
    createDatapackCompareReporter,
    type DatapackCompareReportFormat
} from '../reporters/datapackCompareReporters';

type CompareCommandOptions = {
    purgeDependencies?: boolean;
    lookupFailed?: boolean;
    allowUnresolved?: boolean;
    strictOrder?: boolean;
    continueOnError?: boolean;
    reporter: DatapackCompareReportFormat;
    output?: string;
};

export default class extends SalesforceCommand {

    static description = 'Compare datapacks with Salesforce without deploying changes';

    static args = [
        new Argument('<paths..>', 'path of the folders containing datapacks or datapack files to compare').argParser((value, previous: string[] | undefined) => {
            if (!existsSync(value)) {
                throw new Error('No such folder exists');
            }
            return (previous ?? []).concat([ value ]);
        })
    ];

    static options = [
        ...SalesforceCommand.options,
        new Option('--purge-dependencies',
            `compare embedded dependencies as they would behave when all child records with matching keys are deleted and recreated. ` +
            `Without this flag Vlocode only treats embedded child records without matching keys, or records with lookup skipped, as delete and recreate candidates.`
        ).default(false),
        new Option('--lookup-failed', 'lookup dependencies that fail to deploy in the org').default(false),
        new Option('--allow-unresolved',
            `do not fail comparison when a dependency cannot be resolved. ` +
            `The comparison will continue with null dependency values where possible.`
        ).default(false),
        new Option('--strict-order',
            `enforce the same strict datapack ordering rules used by deploy when resolving dependencies.`
        ).default(false),
        new Option('-y, --continue-on-error', 'continue comparing datapacks that can be loaded when another datapack fails to load').default(false),
        new Option('--reporter <format>', 'report format to render').choices([ 'console', 'json', 'markdown' ]).default('console'),
        new Option('-o, --output <file>', 'write the selected report format to a file')
    ];

    constructor(private logger: Logger = LogManager.get('DatapackCompare')) {
        super();
    }

    public async run(paths: string[], options: CompareCommandOptions) {
        const timer = new Timer();
        const machineReadableStdout = !options.output && options.reporter !== 'console';
        const previousLogLevel = LogManager.getGlobalLogLevel();
        let report: string | undefined;
        let result: Awaited<ReturnType<DatapackDeployer['compare']>> | undefined;

        if (machineReadableStdout) {
            LogManager.setGlobalLogLevel(LogLevel.error);
        }

        try {
            const datapacks = await this.loadDatapacks(paths, { quiet: machineReadableStdout });
            if (!datapacks.length) {
                return;
            }

            const compareOptions: DatapackDeploymentOptions = {
                strictOrder: !!options.strictOrder,
                purgeMatchingDependencies: !!options.purgeDependencies,
                lookupFailedDependencies: !!options.lookupFailed,
                allowUnresolvedDependencies: !!options.allowUnresolved,
                continueOnError: !!options.continueOnError,
                deltaCheck: true
            };

            result = await this.container.new(DatapackDeployer).compare(datapacks, compareOptions);
            const reporter = createDatapackCompareReporter(options.reporter);
            report = reporter.render(result);
        } finally {
            if (machineReadableStdout) {
                LogManager.setGlobalLogLevel(previousLogLevel);
            }
        }

        if (report === undefined || result === undefined) {
            return;
        }

        if (machineReadableStdout) {
            process.stdout.write(`${report}\n`);
        } else if (options.output) {
            this.logger.info(createDatapackCompareReporter('console').render(result));
            await this.writeReport(options.output, report);
            this.logger.info(`Wrote ${options.reporter} comparison report to ${resolve(options.output)}`);
        } else {
            this.logger.info(report);
        }

        if (!machineReadableStdout) {
            this.logger.info(`Comparison completed in ${timer.stop().toString('seconds')}`);
        }
    }

    private async loadDatapacks(paths: string[], options: { quiet?: boolean } = {}) {
        if (!options.quiet) {
            this.logger.info(`Load datapacks: "${paths.join('", "')}"`);
        }

        const datapackLoadTimer = new Timer();
        const loader = this.container.get(DatapackLoader);
        const datapacks = (await mapAsync(paths, async path => {
            const fileInfo = await stat(path);
            if (fileInfo.isDirectory()) {
                return loader.loadDatapacksFromFolder(path);
            } else {
                return [ await loader.loadDatapack(path) ];
            }
        })).flat();

        if (datapacks.length == 0) {
            this.logger.error(`No datapacks found in specified paths: "${paths.join('", "')}"`);
        } else if (!options.quiet) {
            this.logger.info(`Loaded ${datapacks.length} datapacks in [${datapackLoadTimer.stop()}]`);
        }

        return datapacks;
    }

    private async writeReport(file: string, contents: string) {
        const outputFile = resolve(file);
        await mkdir(dirname(outputFile), { recursive: true });
        await writeFile(outputFile, contents, 'utf-8');
    }
}
