import { CachedFileSystemAdapter, container, Logger, LogManager, NodeFileSystem, FileSystem } from '@vlocode/core';
import { InteractiveConnectionProvider, JsForceConnectionProvider, NamespaceService, SfdxConnectionProvider } from '@vlocode/salesforce';
import { DatapackDeployer, DatapackLoader, VlocityNamespaceService, ForkedSassCompiler, DatapackDeploymentOptions } from '@vlocode/vlocity-deploy';
import { existsSync } from 'fs';
import { Command, Argument, Option } from '../command';
import * as logSymbols from 'log-symbols';
import { join, relative } from 'path';
import * as chalk from 'chalk';
import { groupBy, segregate } from '@vlocode/util';

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
        new Option('--purge-dependencies', 'purges records embedded in the datapack from the target org to ensure a clean deployment. Purging dependencies is slower').default(false),
        new Option('--lookup-failed', 'lookup the Ids of records that failed to deploy but are dependencies for other parts of the deployment').default(false),        
        new Option('--retry-count <count>', 'the number of times a record deployment is retried before failing it').default(1),
        new Option('--bulk-api', 'use the Salesforce bulk API to update and insert records').default(false),
    ];

    constructor(private logger: Logger = LogManager.get('vlocity-deploy')) {
        super();
    }

    public async run(folder: string, options: any) {
        // Prep dependencies
        if (options.user) {
            container.registerAs(new SfdxConnectionProvider(options.user, undefined), JsForceConnectionProvider);
        } else {
            container.registerAs(new InteractiveConnectionProvider(`https://${options.instance}`), JsForceConnectionProvider);
        }

        // Setup Namespace replacer
        container.registerAs(await container.get(VlocityNamespaceService).initialize(container.get(JsForceConnectionProvider)), NamespaceService);

        // Setup a Cached file system for loading datapacks
        container.registerAs(new CachedFileSystemAdapter(new NodeFileSystem()), FileSystem);

        // Setup SASS packed compiler when available (usually only when CLI is packed)
        const packedSassCompiler = join(__dirname, '../sassCompiler.js');
        if (existsSync(packedSassCompiler)) {
            container.register(container.create(ForkedSassCompiler, join(__dirname, '../sassCompiler.js')));
        }

        // Load datapacks
        const datapacks = await container.create(DatapackLoader).loadDatapacksFromFolder(folder);
        if (datapacks.length == 0) {
            this.logger.error(`No datapacks found in specified folder: ${folder}`);
            return;
        }

        // get options from command line
        const deployOptions: DatapackDeploymentOptions = {
            useBulkApi: !!options.bulkApi,
            purgeMatchingDependencies: !!options.purgeDependencies,
            lookupFailedDependencies: !!options.lookupFailed,
            maxRetries: options.retryCount
        };

        // Create deployment
        const deployment = await container.create(DatapackDeployer).createDeployment(datapacks, deployOptions);
        await deployment.start();

        // done!!
        const deploymentMessages = deployment.getMessages().filter(({ type }) => type === 'error' || type === 'warn');
        const [ errors, warnings ] = segregate(deploymentMessages, ({type}) => type === 'error');        

        if (errors.length ) {
            this.logger.warn(`${logSymbols.error} Deployment completed with ${errors.length} error(s) and ${warnings.length} warning(s)`);
        } else if (warnings.length) {
            this.logger.warn(`${logSymbols.warning} Deployment completed ${warnings.length} warning(s)`);
        } else {
            this.logger.info(`${logSymbols.success} Deployment completed without errors or warnings!`);          
        }
        
        const prefixFormat = {
            error: chalk.bgRedBright.white.bold(`ERROR`),
            warn: chalk.bgYellowBright.black.bold(`WARN`)
        };

        const groupedSortedMessages = Object.entries(groupBy(deploymentMessages, 
            ({type, message}) => `${prefixFormat[type]} ${message}`))
            .sort((a,b) => a[0].localeCompare(b[0]));

        for (const [message, recordMessages] of groupedSortedMessages) {
            const sourceKeys = recordMessages.map(({ record }) => record.sourceKey.replaceAll(/%[^%]+%__/ig,''));
            const affected = sourceKeys.splice(0, 10).join(', ') + (sourceKeys.length > 0 ? `... (and ${sourceKeys.length} more)` : '');
            this.logger.info(`${message} for ${recordMessages.length} records: ${affected}`);
        }
    }
}