import { CachedFileSystemAdapter, container, Logger, LogManager, NodeFileSystem, FileSystem } from '@vlocode/core';
import { InteractiveConnectionProvider, SalesforceConnectionProvider, NamespaceService, SfdxConnectionProvider } from '@vlocode/salesforce';
import { DatapackDeployer, DatapackLoader, VlocityNamespaceService, ForkedSassCompiler, DatapackDeploymentOptions } from '@vlocode/vlocity-deploy';
import { existsSync } from 'fs';
import { Command, Argument, Option } from '../command';
import * as logSymbols from 'log-symbols';
import { join } from 'path';
import * as chalk from 'chalk';
import { countDistinct, groupBy, Timer } from '@vlocode/util';

export default class extends Command {

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
        new Option('-u, --user <username>', 'Salesforce username or alias of the org to deploy the datapacks to').makeOptionMandatory(false),        
        new Option('-i, --instance <url>', 'the URL instance').default('test.salesforce.com'),
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
        new Option('--skip-lwc', 'skip LWC activation for LWC enabled Omniscripts').default(false),
    ];

    private prefixFormat = {
        error: chalk.bgRedBright.white.bold(`ERROR`),
        warn: chalk.bgYellowBright.black.bold(`WARN`)
    };

    private container = container.new();

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
            skipLwcActivation: options.skipLwc
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

    private async init(options: any) {
        // Prep dependencies
        if (options.user) {
            this.container.registerAs(new SfdxConnectionProvider(options.user, undefined), SalesforceConnectionProvider);
        } else {
            this.container.registerAs(new InteractiveConnectionProvider(`https://${options.instance}`), SalesforceConnectionProvider);
        }

        // Setup Namespace replacer
        this.container.registerAs(await this.container.get(VlocityNamespaceService).initialize(this.container.get(SalesforceConnectionProvider)), NamespaceService);

        // Setup a Cached file system for loading datapacks
        this.container.registerAs(new CachedFileSystemAdapter(new NodeFileSystem()), FileSystem);

        // Setup SASS packed compiler when available (usually only when CLI is packed)
        const packedSassCompiler = join(__dirname, '../sassCompiler.js');
        if (existsSync(packedSassCompiler)) {
            this.container.register(this.container.create(ForkedSassCompiler, join(__dirname, '../sassCompiler.js')));
        }
    }
}
