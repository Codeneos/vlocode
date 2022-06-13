import { CachedFileSystemAdapter, container, Logger, LogManager, NodeFileSystem, FileSystem } from '@vlocode/core';
import { InteractiveConnectionProvider, JsForceConnectionProvider, NamespaceService, SfdxConnectionProvider } from '@vlocode/salesforce';
import { DatapackDeployer, DatapackLoader, VlocityNamespaceService, ForkedSassCompiler, DatapackDeploymentOptions } from '@vlocode/vlocity-deploy';
import { existsSync, fstat } from 'fs';
import { Command, Argument, Option } from '../command';
import * as logSymbols from 'log-symbols';
import { join, relative } from 'path';
import * as chalk from 'chalk';
import { countDistinct, forEachAsyncParallel, groupBy, mapAsyncParallel, segregate, Timer, unique } from '@vlocode/util';
import { writeJson, writeJsonSync } from 'fs-extra';

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
        new Option('--delta', 'check for changes between the source data packs and source org and only deploy the datapacks that are changed').default(false),
    ];

    private prefixFormat = {
        error: chalk.bgRedBright.white.bold(`ERROR`),
        warn: chalk.bgYellowBright.black.bold(`WARN`)
    };

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
        
        // debugger;
        // const conn = await container.get(JsForceConnectionProvider).getJsForceConnection();

        // const timer = new Timer();

        // let count = 0;
        // const objects = await conn.metadata.list({ type: 'CustomObject' });
        
        // const chunkSize = 10;
        // const chunks = Array<Array<string>>();

        // while (objects.length) {
        //     chunks.push(objects.splice(0, chunkSize).map(o => o.fullName));            
        // }

        // await forEachAsyncParallel(chunks, async (chunk, i) => {
        //     console.debug(`Reading ${chunk.join(', ')} ${count += chunk.length}/${objects.length}`);
        //     const objs = await conn.metadata.read('CustomObject', chunk);        
        //     //void writeJson(obj.fullName + '.json', objs, { 'spaces': 4 });
        // }, 25);
        // console.debug(`Reading custom object md done in ${timer.elapsed}`);

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
            maxRetries: options.retryCount,
            deltaCheck: options.delta
        };

        // Create deployment
        const deployment = await container.create(DatapackDeployer).createDeployment(datapacks, deployOptions);
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
}