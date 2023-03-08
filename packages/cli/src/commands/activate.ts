import { CachedFileSystemAdapter, container, Logger, LogManager, NodeFileSystem, FileSystem } from '@vlocode/core';
import { InteractiveConnectionProvider, SalesforceConnectionProvider, NamespaceService, SfdxConnectionProvider, QueryService } from '@vlocode/salesforce';
import { VlocityNamespaceService, ForkedSassCompiler, OmniScriptActivator } from '@vlocode/vlocity-deploy';
import { existsSync } from 'fs';
import { Command, Argument, Option } from '../command';
import * as logSymbols from 'log-symbols';
import { join } from 'path';
import { forEachAsyncParallel, getErrorMessage, groupBy, isSalesforceId, Timer } from '@vlocode/util';
import { OmniScriptLookupService } from '@vlocode/vlocity-deploy';

export default class extends Command {

    static description = 'Activate OmniScripts in Salesforce and deploy associated LWC components';

    static args = [
        new Argument('scriptFilter', 
            'Salesforce ID <type>/<subType>(/<language>) filter of the scripts to activate. ' + 
            'Supports wildcard characters, i.e: "MACD/" to activate multiple scripts').argParser(value => {
            if (isSalesforceId(value)) {
                return value;
            }
            const filter = value.split('/');
            return Object.fromEntries(filter.map((value, index) => [ ['type', 'subType', 'language'][index], value ]));
        }).argOptional()
    ];

    static options = [
        new Option('-u, --user <username>', 'Salesforce username or alias of the org to deploy the datapacks to').makeOptionMandatory(false),        
        new Option('-i, --instance <url>', 'Salesforce instance URL; for example: test.salesforce.com').default('test.salesforce.com'),
        new Option('--parallel-activations', 'determines the amount of parallel activations to run').default(4),
        new Option('--skip-lwc', 'skip LWC activation for LWC enabled OmniScripts').default(false),
        new Option('--use-metadata-api', 'deploy LWC components using the Metadata API (slower) instead of the Tooling API').default(false),
        new Option('--remote-activation', 'use anonymous apex to activate OmniScripts.' + 
            'By default Vlocode will generate script definitions locally which is faster and more reliable than remote activation. ' + 
            'Enable this when you experience issues or inconsistencies in scripts deployed through Vlocode.').default(false),
    ];

    private container = container.new();

    constructor(private logger: Logger = LogManager.get('vlocity-deploy')) {
        super();
    }

    public async run(scriptFilter: any, options: any) {
        // Load datapacks
        this.logger.info(`Finding script(s) matching filter: ${scriptFilter ? JSON.stringify(scriptFilter) : 'ALL'}`);        
        const filterTimer = new Timer();
        const scripts = await this.container.create(OmniScriptLookupService).getScripts(scriptFilter);
        if (scripts.length == 0) {
            this.logger.error(`No OmniScripts found that match the specified filter criteria`);
            return;
        }

        const scriptsByType = groupBy(scripts, script => `${script.type}/${script.subType}/${script.language!}`);
        this.logger.info(`Found ${Object.entries(scriptsByType).length} OmniScripts (versions: ${scripts.length}) in [${filterTimer.stop()}]`);

        // Run activator for all scripts and activate the latest version of each script found
        const activateTimer = new Timer();
        const activator = this.container.create(OmniScriptActivator);
        const errors = new Array<{ script: string, error: any }>();

        await forEachAsyncParallel(Object.entries(scriptsByType), async ([key, versions]) => {
            const lastVersion = versions[versions.length - 1];
            this.logger.info(`Activating ${key} (version: ${lastVersion.version})`);
            try {
                await activator.activate(lastVersion.id, { 
                    toolingApi: !options.useMetadataApi,
                    skipLwcDeployment: options.skipLwc,
                    remoteActivation: options.remoteActivation 
                });
                this.logger.info(`${logSymbols.success} Activated: ${key}`);
            } catch (error) {
                errors.push({ script: key,error });
                this.logger.error(`Activation error for ${key}: ${getErrorMessage(error, false)}`);     
            }
        }, options.parallelActivations);

        // Report back to the user what happened
        if (!errors.length) {
            this.logger.info(`${logSymbols.success} Activated ${Object.entries(scriptsByType).length} scripts without errors [${activateTimer.stop()}]`);
        } else {
            const activated = Object.entries(scriptsByType).length - errors.length;
            if (activated > 0) {
                this.logger.info(`${logSymbols.warning} Activated ${activated}/${Object.entries(scriptsByType).length} scripts with errors [${activateTimer.stop()}]`);
            } else {
                this.logger.info(`${logSymbols.error} Failed activation of all scripts [${activateTimer.stop()}]`);
            }

            for (const { script, error } of errors) {
                this.logger.error(`${logSymbols.error} Failed: ${script}: ${getErrorMessage(error)}`);     
            }
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
