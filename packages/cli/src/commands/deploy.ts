import { Args, Flags } from '@oclif/core';
import logSymbols from 'log-symbols';
import chalk from 'chalk';
import { stat } from 'fs/promises';

import { Logger, LogLevel, LogManager } from '@vlocode/core';
import { DatapackDeployer, DatapackDeploymentOptions } from '@vlocode/vlocity-deploy';
import { DatapackLoader } from '@vlocode/vlocity';
import { groupBy, mapAsync, partition, pluralize, Timer } from '@vlocode/util';

import { parseExistingPath } from '../args';
import { SalesforceCommand } from '../salesforceCommand';

export default class Deploy extends SalesforceCommand<typeof Deploy> {

    static description = 'Deploy datapacks to Salesforce';

    static args = {
        paths: Args.string({
            required: true,
            multiple: true,
            description: 'path of the folders containing the datapacks or datapack files to be deployed',
            parse: parseExistingPath,
        }),
    };

    static flags = {
        ...SalesforceCommand.flags,
        purgeDependencies: Flags.boolean({
            name: 'purge-dependencies',
            default: false,
            summary: 'delete embedded dependencies with matching keys after the primary datapack record is deployed. By default Vlocode will only delete child records that do not have a matching key configuration, with this flag Vlocode will delete all child records that have a lookup relationships to the primary datapack record. For example; when deploying a Product2 datapack this flag will delete all child item records found in the target org with a lookup to the Product2 datapack that is deployed.',
        }),
        lookupFailed: Flags.boolean({
            name: 'lookup-failed',
            default: false,
            summary: 'lookup dependencies that fail to deploy in the org',
        }),
        allowUnresolved: Flags.boolean({
            name: 'allow-unresolved',
            default: false,
            summary: 'do not fail the deployment of a datapack when a dependency cannot be resolvedWhen this option is enabled Vlocode will attempt to deploy the datapack without the dependency and log a warning. The field which contains the unresolved dependency will be set to null instead, enabling this can cause inconsistent data in the target org and is only recommended to resolve deployment issues.',
        }),
        retryCount: Flags.integer({
            name: 'retry-count',
            default: 1,
            summary: 'the number of times a record deployment is retried before failing it',
        }),
        bulkApi: Flags.boolean({
            name: 'bulk-api',
            default: false,
            summary: 'use the Salesforce bulk API to update and insert recordsUsing the Bulk API for deployments is significantly slower compared to the standard Salesforce API and should only be used to reduce the number of call outs made during the deployment',
        }),
        delta: Flags.boolean({
            default: false,
            summary: 'check for changes between the source data packs and source org and only deploy the datapacks that are changed',
        }),
        strictOrder: Flags.boolean({
            name: 'strict-order',
            default: false,
            summary: 'enforce a strict order for datapacks that are dependent on other datapacks in the same deploymentBy default Vlocode determines deployment order based on record level dependencies, this allows for more optimal chunking improving the overall speed of the deployment. By setting this option to true Vlocode also enforces that any datapack that is dependent on another datapack is deployed after the datapack it depends on. This reduces deployment speed but can improve compatibility, enable this option when you experience issues with deployment order.',
        }),
        skipLwc: Flags.boolean({
            name: 'skip-lwc',
            default: false,
            summary: 'skip LWC activation for LWC enabled OmniScripts',
        }),
        useMetadataApi: Flags.boolean({
            name: 'use-metadata-api',
            default: false,
            summary: 'deploy LWC components using the Metadata API (slower) instead of the Tooling API',
        }),
        remoteScriptActivation: Flags.boolean({
            name: 'remote-script-activation',
            default: false,
            summary: 'use anonymous apex to activate OmniScripts. By default Vlocode will generate script definitions locally which is faster and more reliable than remote activation. Enable this for edge cases when OmniScripts are not working properly when using local script activation.',
        }),
        continueOnError: Flags.boolean({
            name: 'continue-on-error',
            char: 'y',
            default: false,
            summary: 'continue deploying when one of the datapacks can be loaded.For any error that occurs while loading and converting a datapack to records the deployment will exit without making changes to the org. You can ignore these errors and continue deploying the datapacks that were loaded without errors by setting this option.',
        }),
    };

    private prefixFormat = {
        error: chalk.bgRedBright.white.bold(`ERROR`),
        warn: chalk.bgYellowBright.black.bold(`WARN`)
    };

    private get isVerboseLoggingEnabled() {
        return LogManager.getGlobalLogLevel() <= LogLevel.verbose;
    }

    protected readonly logger: Logger = LogManager.get('vlocity-deploy');

    protected async execute() {
        const options = this.flags;
        // Load datapacks
        const datapacks = await this.loadDatapacks(this.args.paths);
        if (!datapacks.length) {
            return;
        }

        // get options from command line
        const deployOptions: DatapackDeploymentOptions = {
            useBulkApi: !!options.bulkApi,
            strictOrder: !!options.strictOrder,
            purgeMatchingDependencies: !!options.purgeDependencies,
            lookupFailedDependencies: !!options.lookupFailed,
            allowUnresolvedDependencies: !!options.allowUnresolved,
            maxRetries: options.retryCount,
            deltaCheck: options.delta,
            skipLwcActivation: options.skipLwc,
            remoteScriptActivation: options.remoteScriptActivation,
            useMetadataApi: options.useMetadataApi,
            continueOnError: options.continueOnError
        };

        // Create deployment
        const deployTimer = new Timer();
        const deployment = await this.container.new(DatapackDeployer).createDeployment(datapacks, deployOptions);
        await deployment.start();

        // done!!
        const deploymentMessages = deployment.getMessages().filter(({ type }) => type === 'error' || type === 'warn');
        const [ errorMessages, warningsMessages ] = partition(deploymentMessages, ({ type }) => type === 'error');
        const groupedSortedMessages = Object.entries(
                groupBy(deploymentMessages, ({ message, type }) => message.toLowerCase() + type)
            ).sort((a,b) => a[0].localeCompare(b[0]));

        if (groupedSortedMessages.length) {
            this.logger.warn(
                `${logSymbols.warning} DataPack deployment completed in ${deployTimer.toString('seconds')} with ${
                    pluralize('error', errorMessages)} and ${
                    pluralize('warning', warningsMessages)}`
                );
        } else {
            this.logger.info(`${logSymbols.success} DataPack deployment completed in ${deployTimer.toString('seconds')} without errors or warnings`);
        }

        for (const [datapack, messages] of Object.entries(deployment.getMessagesByDatapack())) {
            for (const message of messages.sort((a,b) => (a.type + a.record.sourceKey).localeCompare(b.type + b.record.sourceKey))) {
                const normalizedSourceKey = message.record.sourceKey.replaceAll(/%[^%]+%__/ig,'');
                const logMessage = `${datapack} -- ${normalizedSourceKey} - ${message.message}`;
                if (message.type === 'error') {
                    this.logger.error(`${this.prefixFormat[message.type]} ${logMessage}`);
                } else if (this.isVerboseLoggingEnabled && message.type === 'warn') { 
                    this.logger.warn(`${this.prefixFormat[message.type]} ${logMessage}`);
                }
            }
        }
    }

    private async loadDatapacks(paths: string[]) {
        this.logger.info(`Load datapacks: "${paths.join('", "')}"`);

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
        } else {
            this.logger.info(`Loaded ${datapacks.length} datapacks in [${datapackLoadTimer.stop()}]`);
        }

        return datapacks;
    }

}
