import { Args, Flags } from '@oclif/core';
import logSymbols from 'log-symbols';
import chalk from 'chalk';
import { existsSync } from 'node:fs';

import { LogLevel, LogManager } from '@vlocode/core';
import { DatapackDeployer, DatapackDeploymentOptions } from '@vlocode/vlocity-deploy';
import { DatapackLoader } from '@vlocode/vlocity';
import { groupBy, partition, pluralize, Timer } from '@vlocode/util';

import { SalesforceCommand } from '../../salesforceCommand';
import { loadDatapacks } from '../../lib/datapackLoader';
import { LiveProgressReporter } from '../../lib/progress';

export default class DatapackDeploy extends SalesforceCommand<typeof DatapackDeploy> {

    static description = 'Deploy datapacks to Salesforce';

    // `datapack import` is an alias for the same client-side datapack deploy operation.
    static aliases = ['datapack:import'];

    static args = {
        paths: Args.string({
            description: 'path of the folders containing the datapacks or datapack files to be deployed',
            required: true,
        }),
    };

    static flags = {
        'purge-dependencies': Flags.boolean({
            default: false,
            summary: 'delete embedded dependencies with matching keys after the primary datapack record is deployed',
            description:
                'By default Vlocode will only delete child records that do not have a matching key configuration, ' +
                'with this flag Vlocode will delete all child records that have a lookup relationships to the primary datapack record. ' +
                'For example; when deploying a Product2 datapack this flag will delete all child item records found in the target org with a lookup to the Product2 datapack that is deployed.',
        }),
        'lookup-failed': Flags.boolean({
            default: false,
            summary: 'lookup dependencies that fail to deploy in the org',
        }),
        'allow-unresolved': Flags.boolean({
            default: false,
            summary: 'do not fail the deployment of a datapack when a dependency cannot be resolved',
            description:
                'When this option is enabled Vlocode will attempt to deploy the datapack without the dependency and log a warning. ' +
                'The field which contains the unresolved dependency will be set to null instead, enabling this can cause inconsistent data in the target org and is only recommended to resolve deployment issues.',
        }),
        'retry-count': Flags.integer({
            default: 1,
            summary: 'the number of times a record deployment is retried before failing it',
        }),
        'bulk-api': Flags.boolean({
            default: false,
            summary: 'use the Salesforce bulk API to update and insert records',
            description:
                'Using the Bulk API for deployments is significantly slower compared to the standard Salesforce API and should only be used ' +
                'to reduce the number of call outs made during the deployment',
        }),
        delta: Flags.boolean({
            default: false,
            summary: 'check for changes between the source data packs and source org and only deploy the datapacks that are changed',
        }),
        'strict-order': Flags.boolean({
            default: false,
            summary: 'enforce a strict order for datapacks that are dependent on other datapacks in the same deployment',
            description:
                'By default Vlocode determines deployment order based on record level dependencies, ' +
                'this allows for more optimal chunking improving the overall speed of the deployment. ' +
                'By setting this option to true Vlocode also enforces that any datapack that is dependent on another datapack is deployed after the datapack it depends on. ' +
                'This reduces deployment speed but can improve compatibility, enable this option when you experience issues with deployment order.',
        }),
        'skip-lwc': Flags.boolean({
            default: false,
            summary: 'skip LWC activation for LWC enabled OmniScripts',
        }),
        'use-metadata-api': Flags.boolean({
            default: false,
            summary: 'deploy LWC components using the Metadata API (slower) instead of the Tooling API',
        }),
        'remote-script-activation': Flags.boolean({
            default: false,
            summary: 'use anonymous apex to activate OmniScripts',
            description:
                'By default Vlocode will generate script definitions locally which is faster and more reliable than remote activation. ' +
                'Enable this for edge cases when OmniScripts are not working properly when using local script activation.',
        }),
        'continue-on-error': Flags.boolean({
            char: 'y',
            default: false,
            summary: 'continue deploying when one of the datapacks cannot be loaded',
            description:
                'For any error that occurs while loading and converting a datapack to records the deployment will exit without making changes to the org. ' +
                'You can ignore these errors and continue deploying the datapacks that were loaded without errors by setting this option.',
        }),
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> ./datapacks -u my-org',
        '<%= config.bin %> <%= command.id %> ./datapacks --delta --strict-order -u my-org',
    ];

    private prefixFormat = {
        error: chalk.bgRedBright.white.bold('ERROR'),
        warn: chalk.bgYellowBright.black.bold('WARN'),
    };

    private get isVerboseLoggingEnabled() {
        return LogManager.getGlobalLogLevel() <= LogLevel.verbose;
    }

    public async run() {
        const paths = this.positionals;
        for (const path of paths) {
            if (!existsSync(path)) {
                this.error(`No such folder exists: ${path}`);
            }
        }

        // Load datapacks
        const datapacks = await loadDatapacks(this.container.get(DatapackLoader), this.logger, paths);
        if (!datapacks.length) {
            return;
        }

        // get options from command line
        const deployOptions: DatapackDeploymentOptions = {
            useBulkApi: this.flags['bulk-api'],
            strictOrder: this.flags['strict-order'],
            purgeMatchingDependencies: this.flags['purge-dependencies'],
            lookupFailedDependencies: this.flags['lookup-failed'],
            allowUnresolvedDependencies: this.flags['allow-unresolved'],
            maxRetries: this.flags['retry-count'],
            deltaCheck: this.flags.delta,
            skipLwcActivation: this.flags['skip-lwc'],
            remoteScriptActivation: this.flags['remote-script-activation'],
            useMetadataApi: this.flags['use-metadata-api'],
            continueOnError: this.flags['continue-on-error'],
        };

        // Create deployment; interactive terminals get a live record-level progress bar while the
        // engine's log output is tallied behind it, CI gets throttled forward-printed milestones.
        const deployTimer = new Timer();
        const deployment = await this.container.new(DatapackDeployer).createDeployment(datapacks, deployOptions);
        const progress = new LiveProgressReporter({ logger: this.logger, label: 'Deploying datapacks' });
        deployment.on('progress', ({ progress: deployed, total }) => progress.report(deployed, total));

        progress.start();
        try {
            await deployment.start();
        } finally {
            // Restore the terminal before the summary prints, also when the deployment throws.
            progress.stop();
        }

        // done!!
        const deploymentMessages = deployment.getMessages().filter(({ type }) => type === 'error' || type === 'warn');
        const [errorMessages, warningsMessages] = partition(deploymentMessages, ({ type }) => type === 'error');
        const groupedSortedMessages = Object.entries(
            groupBy(deploymentMessages, ({ message, type }) => message.toLowerCase() + type)
        ).sort((a, b) => a[0].localeCompare(b[0]));

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
                const normalizedSourceKey = (message.record?.sourceKey ?? message.datapackKey).replaceAll(/%[^%]+%__/ig, '');
                const logMessage = `${datapack} -- ${normalizedSourceKey} - ${message.message}`;
                if (message.type === 'error') {
                    this.logger.error(`${this.prefixFormat[message.type]} ${logMessage}`);
                } else if (this.isVerboseLoggingEnabled && message.type === 'warn') {
                    this.logger.warn(`${this.prefixFormat[message.type]} ${logMessage}`);
                }
            }
        }
    }
}
