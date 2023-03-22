import { Logger, LogManager } from '@vlocode/core';
import { DatapackDeployer, DatapackLoader, ForkedSassCompiler, DatapackDeploymentOptions } from '@vlocode/vlocity-deploy';
import { existsSync } from 'fs';
import { Argument, Option } from '../command';
import * as logSymbols from 'log-symbols';
import { join } from 'path';
import * as chalk from 'chalk';
import { countDistinct, groupBy, Timer } from '@vlocode/util';
import { SalesforceCommand } from '../salesforceCommand';

export default class extends SalesforceCommand {

    static description = 'Deploy datapacks to Salesforce';

    static args = [
        new Argument('folder', 'path to a folder containing the datapacks to be deployed').argParser(value => {
            if (!existsSync(value)) {
                throw new Error('No such folder exists');
            }
            return value;
        })
    ];

    static options = [
        ...SalesforceCommand.options,
        new Option('--purge-dependencies',
            `delete embedded dependencies with matching keys after the primary datapack record is deployed. ` +
            `By default Vlocode will only delete child records that do not have a matching key configuration, ` +
            `with this flag Vlocode will delete all child records that have a lookup relationships to the primary datapack record. ` +
            `For example; when deploying a Product2 datapack this flag will delete all child item records found in the targer org with a lookup to the Product2 datapack that is deployed.`).default(false),
        new Option('--lookup-failed', 'lookup the Ids of records that failed to deploy but are dependencies for other parts of the deployment').default(false),
        new Option('--retry-count <count>', 'the number of times a record deployment is retried before failing it').default(1),
        new Option('--bulk-api', 'use the Salesforce bulk API to update and insert records').default(false),
        new Option('--delta', 'check for changes between the source data packs and source org and only deploy the datapacks that are changed').default(false),
        new Option('--strict-dependencies',
            `enforce datapacks with dependencies on records inside other datapacks are fully deployed. ` +
            `By default Vlocode determines deployment order based on record level dependencies, ` +
            `this allows for more optimal chunking improving the overall speed of the deployment. ` +
            `If you are running into deployment errors and think that Vlocode does not follow the correct deployment order try enabling this setting.`
        ).default(false),
        new Option('--skip-lwc', 'skip LWC activation for LWC enabled OmniScripts').default(false),
        new Option('--use-metadata-api', 'deploy LWC components using the Metadata API (slower) instead of the Tooling API').default(false),
        new Option('--remote-script-activation', 'use anonymous apex to activate OmniScripts.' +
            'By default Vlocode will generate script definitions locally which is faster and more reliable than remote activation. ' +
            'Enable this when you experience issues or inconsistencies in scripts deployed through Vlocode.').default(false),
        new Option('-y, --continue-on-error', 'continue deploying when one of the datapacks can be loaded.' +
            'For any error that occurs while loading and converting a datapack to records the deployment will exit without making changes to the org. ' +
            'You can ignore these errors and continue deploying the datapacks that were loaded without errors by setting this option.').default(false),
    ];

    private prefixFormat = {
        error: chalk.bgRedBright.white.bold(`ERROR`),
        warn: chalk.bgYellowBright.black.bold(`WARN`)
    };

    constructor(private logger: Logger = LogManager.get('vlocity-deploy')) {
        super();
    }

    public async run(folder: string, options: any) {
        // Load datapacks
        this.logger.info(`Load datapacks from "${folder}"`);
        const datapackLoadTimer = new Timer();
        const datapacks = await this.container.create(DatapackLoader).loadDatapacksFromFolder(folder);
        if (datapacks.length == 0) {
            this.logger.error(`No datapacks found in specified folder: ${folder}`);
            return;
        }
        this.logger.info(`Loaded ${datapacks.length} datapacks in [${datapackLoadTimer.stop()}]`);

        // get options from command line
        const deployOptions: DatapackDeploymentOptions = {
            useBulkApi: !!options.bulkApi,
            purgeMatchingDependencies: !!options.purgeDependencies,
            lookupFailedDependencies: !!options.lookupFailed,
            maxRetries: options.retryCount,
            deltaCheck: options.delta,
            skipLwcActivation: options.skipLwc,
            remoteScriptActivation: options.remoteActivation,
            useMetadataApi: options.useMetadataApi,
            continueOnError: options.continueOnError
        };

        // Create deployment
        const deployment = await this.container.create(DatapackDeployer).createDeployment(datapacks, deployOptions);
        await deployment.start();

        // done!!
        const deploymentMessages = deployment.getMessages().filter(({ type }) => type === 'error' || type === 'warn');
        const recordCount = countDistinct(deploymentMessages, ({ record }) => record?.sourceKey);
        const groupedSortedMessages = Object.entries(groupBy(deploymentMessages,
            ({type, message}) => `${this.prefixFormat[type]} ${message}`))
            .sort((a,b) => a[0].localeCompare(b[0]));

        if (groupedSortedMessages.length) {
            this.logger.warn(`${logSymbols.warning} Deployment completed with ${groupedSortedMessages.length} distinct message(s) on ${recordCount} record(s)`);
        } else {
            this.logger.info(`${logSymbols.success} Deployment completed without errors or warnings!`);
        }

        for (const [message, records] of groupedSortedMessages) {
            const sourceKeys = records.map(({ record }) => record.sourceKey.replaceAll(/%[^%]+%__/ig,''));
            const affected = sourceKeys.splice(0, 10).join(', ') + (sourceKeys.length > 0 ? `... (and ${sourceKeys.length} more)` : '');
            this.logger.warn(`${message} for ${records.length} records: ${affected}`);
        }
    }

    protected async init(options: any) {
        super.init(options);

        // Setup SASS packed compiler when available (usually only when CLI is packed)
        const packedSassCompiler = join(__dirname, '../sassCompiler.js');
        if (existsSync(packedSassCompiler)) {
            this.container.register(this.container.create(ForkedSassCompiler, join(__dirname, '../sassCompiler.js')));
        }
    }
}
