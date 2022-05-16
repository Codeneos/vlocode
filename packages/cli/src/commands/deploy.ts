import { CachedFileSystemAdapter, ConsoleWriter, Container, container, injectable, Logger, LogLevel, LogManager, NodeFileSystem, FileSystem } from '@vlocode/core';
import { InteractiveConnectionProvider, JsForceConnectionProvider, NamespaceService, SfdxConnectionProvider } from '@vlocode/salesforce';
import { DatapackDeployer } from '../../datapackDeployer';
import { existsSync } from 'fs';
import { Command, Argument, Option } from '../command';
import DatapackLoader from '../../datapackLoader';
import { VlocityNamespaceService } from '../../vlocityNamespaceService';

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
        new Option('-i, --instance <url>', 'the URL instance').default('test.salesforce.com')
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

        // Load datapacks
        const datapacks = await container.create(DatapackLoader).loadDatapacksFromFolder(folder);
        if (datapacks.length == 0) {
            this.logger.error(`No datapacks found in specified folder: ${folder}`);
            return;
        }

        // Create deployment
        const deployment = await container.create(DatapackDeployer).createDeployment(datapacks);
        await deployment.start();

        // done!!
        this.logger.info('Hello!');
    }
}