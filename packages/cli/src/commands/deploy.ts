import logSymbols from 'log-symbols';
import chalk from 'chalk';
import { existsSync } from 'fs';

import { FileSystem, Logger, LogLevel, LogManager } from '@vlocode/core';
import { DatapackDeployer, DatapackDeploymentOptions } from '@vlocode/vlocity-deploy';
import { DatapackLoader } from '@vlocode/vlocity';
import { groupBy, partition, pluralize, removeNamespacePlaceholders, Timer } from '@vlocode/util';

import { Argument, Option } from '../command';
import { loadDatapacks } from '../datapackLoading';
import { SalesforceCommand } from '../salesforceCommand';

export default class extends SalesforceCommand {

    static description = 'Deploy datapacks to Salesforce';

    static args = [
        new Argument('<paths..>', 'path of the folders containing the datapacks or datapack files to be deployed').argParser((value, previous: string[] | undefined) => {
            if (!existsSync(value)) {
                throw new Error('No such folder exists');
            }
            return (previous ?? []).concat([ value ]);
        })
    ];

    static options = [
        ...SalesforceCommand.options,
        new Option('--purge-dependencies [mode]',
            `purge embedded matching dependencies using none, unmatched, or all. ` +
            `Using the option without a mode retains the previous all behavior.`
        ).choices([ 'none', 'unmatched', 'all' ]).preset('all').default(false),
        new Option('--purge-matching-records-filter <objects...>',
            `limit unmatched matching-dependency cleanup to the specified embedded SObject types. ` +
            `When omitted, all embedded child types are considered; completely empty collections are not inferred.`
        ).default([]),
        new Option('--lookup-failed', 'lookup dependencies that fail to deploy in the org').default(false),
        new Option('--allow-unresolved', 
            `do not fail the deployment of a datapack when a dependency cannot be resolved` +
            `When this option is enabled Vlocode will attempt to deploy the datapack without the dependency and log a warning. ` +
            `The field which contains the unresolved dependency will be set to null instead, enabling this can cause inconsistent data in the target org and is only recommended to resolve deployment issues.`
        ).default(false),
        new Option('--retry-count <count>', 'the number of times a record deployment is retried before failing it').default(1),
        new Option('--bulk-api', 
            'use the Salesforce bulk API to update and insert records' +
            'Using the Bulk API for deployments is significantly slower compared to the standard Salesforce API and should only be used ' +
            'to reduce the number of call outs made during the deployment'
        ).default(false),
        new Option('--delta', 'compare the source datapacks against the org data and only deploy records that are changed; ' +
            'records that are in sync with the target org are skipped. Embedded child records without matching keys are always ' +
            'matched by record data and preserved when in sync, only out of sync embedded records are deleted and recreated.'
        ).default(false),
        new Option('--strict-order',
            `enforce a strict order for datapacks that are dependent on other datapacks in the same deployment` +
            `By default Vlocode determines deployment order based on record level dependencies, ` +
            `this allows for more optimal chunking improving the overall speed of the deployment. ` +
            `By setting this option to true Vlocode also enforces that any datapack that is dependent on another datapack is deployed after the datapack it depends on. ` +
            `This reduces deployment speed but can improve compatibility, enable this option when you experience issues with deployment order.`
        ).default(false),
        new Option('--skip-lwc', 'skip LWC activation for LWC enabled OmniScripts').default(false),
        new Option('--use-metadata-api', 'deploy LWC components using the Metadata API (slower) instead of the Tooling API').default(false),
        new Option('--remote-script-activation', 'use anonymous apex to activate OmniScripts.' +
            'By default Vlocode will generate script definitions locally which is faster and more reliable than remote activation. ' +
            'Enable this for edge cases when OmniScripts are not working properly when using local script activation.'
        ).default(false),
        new Option('-y, --continue-on-error', 'continue deploying when one of the datapacks can be loaded.' +
            'For any error that occurs while loading and converting a datapack to records the deployment will exit without making changes to the org. ' +
            'You can ignore these errors and continue deploying the datapacks that were loaded without errors by setting this option.'
        ).default(false),
        SalesforceCommand.matchingKeysOption,
    ];

    private prefixFormat = {
        error: chalk.bgRedBright.white.bold(`ERROR`),
        warn: chalk.bgYellowBright.black.bold(`WARN`)
    };

    private get isVerboseLoggingEnabled() {
        return LogManager.getGlobalLogLevel() <= LogLevel.verbose;
    }

    constructor(private logger: Logger = LogManager.get('DatapackDeploy')) {
        super();
    }

    public async run(paths: string[], options: any) {
        // Load datapacks
        const datapacks = await loadDatapacks(this.container.get(DatapackLoader), paths, this.logger, this.container.get(FileSystem));
        if (!datapacks.length) {
            return;
        }

        this.applyMatchingKeyOptions(options);

        // get options from command line
        const deployOptions: DatapackDeploymentOptions = {
            useBulkApi: !!options.bulkApi,
            strictOrder: !!options.strictOrder,
            purgeMatchingDependencies: options.purgeDependencies,
            purgeMatchingRecordsFilter: options.purgeMatchingRecordsFilter,
            lookupFailedDependencies: !!options.lookupFailed,
            allowUnresolvedDependencies: !!options.allowUnresolved,
            maxRetries: options.retryCount,
            deltaCheck: options.delta,
            skipLwcActivation: options.skipLwc,
            remoteScriptActivation: options.remoteActivation,
            useMetadataApi: options.useMetadataApi,
            continueOnError: options.continueOnError
        };

        // Create deployment
        const deployTimer = new Timer();
        // Hand off the datapacks; once converted to records the parsed datapack data is released
        const deployment = await this.container.new(DatapackDeployer).createDeployment(datapacks.splice(0), deployOptions);
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
            for (const message of messages.sort((a, b) => (a.type + a.datapackKey + a.record?.sourceKey).localeCompare(b.type + b.datapackKey + b.record?.sourceKey))) {
                const normalizedSourceKey = removeNamespacePlaceholders(message.record?.sourceKey ?? message.datapackKey);
                const logMessage = `${datapack} -- ${normalizedSourceKey} - ${message.message}`;
                if (message.type === 'error') {
                    this.logger.error(`${this.prefixFormat[message.type]} ${logMessage}`);
                } else if (this.isVerboseLoggingEnabled && message.type === 'warn') { 
                    this.logger.warn(`${this.prefixFormat[message.type]} ${logMessage}`);
                }
            }
        }
    }

    protected async init(options: any) {
        await super.init(options);
    }
}
