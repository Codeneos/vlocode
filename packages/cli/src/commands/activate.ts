import { Logger, LogManager, FileSystem } from '@vlocode/core';
import { OmniScriptActivator, OmniScriptVersionDetail, ScriptDefinitionProvider } from '@vlocode/vlocity-deploy';
import { Argument, Option } from '../command';
import * as logSymbols from 'log-symbols';
import { forEachAsyncParallel, getErrorMessage, groupBy, isSalesforceId, Iterable, sortBy, Timer } from '@vlocode/util';
import { OmniScriptLookupService } from '@vlocode/vlocity-deploy';
import { SalesforceCommand } from '../salesforceCommand';

interface ScriptActivationInfo {
    type: string,
    allVersions: Array<OmniScriptVersionDetail>,
    dependencies: Array<ScriptActivationInfo>,
    script: OmniScriptVersionDetail,
    status?: 'pending' | 'activated' | 'error',
}

export default class extends SalesforceCommand {

    static description = 'Activate OmniScripts in Salesforce and deploy associated LWC components';

    static args = [
        new Argument('scriptFilter',
            'Salesforce ID <type>/<subType>(/<language>) filter of the scripts to activate. ' +
            'Supports wildcard characters, i.e: "MACD/" to activate multiple scripts').argParser(value => {
            if (isSalesforceId(value)) {
                return value;
            }
            const filter = value.split('/');
            return Object.fromEntries(filter.map((value, index) => [ ['type', 'subType', 'language'][index], value || undefined ]));
        }).argOptional()
    ];

    static options = [
        ...SalesforceCommand.options,
        new Option('--parallel-activations', 'determines the amount of parallel activations to run').default(4),
        new Option('--skip-lwc', 'skip LWC activation for LWC enabled OmniScripts').default(false),
        new Option('--use-metadata-api', 'deploy LWC components using the Metadata API (slower) instead of the Tooling API').default(false),
        new Option('--skip-reactivate-dependencies', 'skips reactivating parent scripts that embed any of the scripts that are being activated. ' +
            'When you activate a re-usable OmniScript all the OmniScript that embed this script will also get re-activated and updated.').default(false),
        new Option('--remote-activation', 'use anonymous apex to activate OmniScripts.' +
            'By default Vlocode will generate script definitions locally which is faster and more reliable than remote activation. ' +
            'Enable this when you experience issues or inconsistencies in scripts deployed through Vlocode.').default(false),
        new Option('--debug-activation', 'save the updated script definitions as JSON file. ' + 
            'Use this option while debugging to compare scripts activate with `--remote-activation` and local activation').default(false),
    ];

    constructor(private logger: Logger = LogManager.get('vlocode-cli')) {
        super();
    }

    public async run(scriptFilter: any, options: any) {
        // Load scripts from Org
        const filterTimer = new Timer();
        this.logger.info(`Finding script(s) matching filter: ${scriptFilter ? JSON.stringify(scriptFilter) : 'ALL'}`);

        const scripts = await this.getScripts(scriptFilter);
        if (!scripts) {
            this.logger.error(`No OmniScripts found that match the specified filter criteria`);
            return;
        }

        this.logger.info(`Found ${scripts.size} OmniScripts in [${filterTimer.stop()}]`);

        // Run activator for all scripts and activate the latest version of each script found
        const activateTimer = new Timer();
        const activator = this.container.create(OmniScriptActivator);
        const errors = new Array<{ script: string, error: any }>();

        // eslint-disable-next-line no-constant-condition
        while(true) {

            const scriptsToActivate = [...this.getScriptsToActivate(scripts)];
            if (!scriptsToActivate.length) {
                break;
            }

            await forEachAsyncParallel(scriptsToActivate, async info => {
                if (options.debugActivation) {
                    // Save scripts before running activator when debugging
                    await this.saveDefinition(info.script, { preFix: 'before' });
                }
                this.logger.info(`Activating ${info.type} (version: ${info.script.version}, id: ${info.script.id})`);
                try {
                    // Activation
                    await activator.activate(info.script.id, {
                        toolingApi: !options.useMetadataApi,
                        skipLwcDeployment: options.skipLwc,
                        remoteActivation: options.remoteActivation,
                        reactivateDependentScripts: scriptFilter && options.skipReactivateDependencies !== true
                    });
                    info.status = 'activated';
                    this.logger.info(`${logSymbols.success} Activated: ${info.type} (${info.script.id})`);

                    if (options.debugActivation) {
                        await this.saveDefinition(info.script, { preFix: 'after' });
                    }
                } catch (error) {
                    info.status = 'error';
                    errors.push({ script: info.type, error });
                    this.logger.error(`Activation error for ${info.type} (${info.script.id}): ${getErrorMessage(error)}`);
                }
            }, options.parallelActivations);
        }

        // Report back to the user what happened
        if (!errors.length) {
            this.logger.info(`${logSymbols.success} Activated ${scripts.size} scripts without errors [${activateTimer.stop()}]`);
        } else {
            const activated = scripts.size - errors.length;
            if (activated > 0) {
                this.logger.info(`${logSymbols.warning} Activated ${activated}/${scripts.size} scripts with errors [${activateTimer.stop()}]`);
            } else {
                this.logger.info(`${logSymbols.error} Failed activation of all scripts [${activateTimer.stop()}]`);
            }

            for (const { script, error } of errors) {
                this.logger.error(`${logSymbols.error} Failed: ${script}: ${getErrorMessage(error)}`);
            }
        }
    }


    private async saveDefinition(script: OmniScriptVersionDetail, options?: { preFix?: string, postFix?: string } ) {
        const fileNameParts = [ 
            options?.preFix ?? '', 
            script.type, 
            script.subType, 
            options?.postFix ?? ''
        ];
        const fileName = (fileNameParts.filter(f => !!f).join('-').replace(/[\s]+/g, '').replace(/[^a-z0-9_-]+/ig, '') + `.json`).toLowerCase();
        try {
            const definition = await this.container.get(ScriptDefinitionProvider).getScriptDefinition(script.id);
            if (definition) {
                this.logger.info(`Saving definition for ${script.id} to ${fileName}`);
                await this.container.get(FileSystem).outputFile(fileName, JSON.stringify(definition, null, 4));
            }
        } catch (error) {
            this.logger.error(`Failed to save definition for ${script.id} to ${fileName}: ${getErrorMessage(error)}`);
        }
    }

    private *getScriptsToActivate(scripts: Map<string, ScriptActivationInfo>) {
        for (const [, script] of scripts) {
            if (script.status === 'activated' || script.status === 'error') {
                continue;
            }
            const pendingDependencies = script.dependencies.some(dependency => !dependency.status || dependency.status === 'pending');
            if (!pendingDependencies) {
                yield script;
            }
        }
    }

    private async getScripts(scriptFilter: any): Promise<Map<string, ScriptActivationInfo> | undefined> {
        const lookup = this.container.create(OmniScriptLookupService);
        const scripts = await lookup.getScriptVersions(scriptFilter);

        if (!scripts.length) {
            return;
        }

        // Find the version we are going to activate
        const scriptsByType = groupBy(scripts, script => `${script.type}/${script.subType}/${script.language!}`);
        const scriptsToActivate = new Map(
            Object.entries(scriptsByType)
                .map(([key, versions]) => ({
                        type: key,
                        allVersions: versions,
                        dependencies: new Array<ScriptActivationInfo>(),
                        script: versions.find(version => version.isActive) ?? sortBy(versions, 'version', 'desc')[0]
                    })
                )
                .map(info => [info.script.id, info] as const)
        );

        // Build dependency graph
        const elements = await lookup.getScriptElements([...scriptsToActivate.keys()], { type: 'OmniScript' });
        for (const element of elements.values()) {
            const propSet = JSON.parse(element.propertySet);
            const scriptRef = `${propSet['Type']}/${propSet['Sub Type']}/${propSet['Language']!}`;
            const dependency = Iterable.find(scriptsToActivate.values(), info => info.type.toLowerCase() === scriptRef.toLowerCase());

            if (dependency) {
                scriptsToActivate.get(element.omniScriptId)!.dependencies.push(dependency);
            }
        }

        return scriptsToActivate
    }
}
