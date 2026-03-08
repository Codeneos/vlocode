import { Args, Flags } from '@oclif/core';
import { Logger, LogManager, FileSystem } from '@vlocode/core';
import { OmniScriptAccess, OmniScriptActivator, OmniScriptRecord, ScriptDefinitionProvider } from '@vlocode/omniscript';
import logSymbols from 'log-symbols';
import { forEachAsyncParallel, getErrorMessage, groupBy, isSalesforceId, Iterable, sortBy, Timer } from '@vlocode/util';
import { SalesforceCommand } from '../salesforceCommand';

interface ScriptActivationInfo {
    type: string,
    allVersions: Array<OmniScriptRecord>,
    dependencies: Array<ScriptActivationInfo>,
    script: OmniScriptRecord,
    status?: 'pending' | 'activated' | 'error',
}

export default class Activate extends SalesforceCommand<typeof Activate> {

    static description = 'Activate OmniScripts in Salesforce and deploy associated LWC components';

    static args = {
        scriptFilter: Args.string({
            required: false,
            description:
                'Salesforce ID <type>/<subType>(/<language>) filter of the scripts to activate. Supports wildcard characters, i.e: "MACD/" to activate multiple scripts',
        }),
    };

    static flags = {
        ...SalesforceCommand.flags,
        parallelActivations: Flags.integer({
            name: 'parallel-activations',
            default: 4,
            summary: 'determines the amount of parallel activations to run',
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
        skipReactivateDependencies: Flags.boolean({
            name: 'skip-reactivate-dependencies',
            default: false,
            summary: 'skips reactivating parent scripts that embed any of the scripts that are being activated. When you activate a re-usable OmniScript all the OmniScript that embed this script will also get re-activated and updated.',
        }),
        remoteActivation: Flags.boolean({
            name: 'remote-activation',
            default: false,
            summary: 'use anonymous apex to activate OmniScripts. By default Vlocode will generate script definitions locally which is faster and more reliable than remote activation. Enable this when you experience issues or inconsistencies in scripts deployed through Vlocode.',
        }),
        debugActivation: Flags.boolean({
            name: 'debug-activation',
            default: false,
            summary: 'save the updated script definitions as JSON file. Use this option while debugging to compare scripts activate with `--remote-activation` and local activation',
        }),
    };

    protected readonly logger: Logger = LogManager.get('vlocode-cli');

    protected async execute() {
        const scriptFilter = this.parseScriptFilter(this.args.scriptFilter);
        const options = this.flags;
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
        const activator = this.container.new(OmniScriptActivator);
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
                        reactivateDependentScripts: !!scriptFilter && options.skipReactivateDependencies !== true
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

    private parseScriptFilter(value?: string) {
        if (!value) {
            return value;
        }

        if (isSalesforceId(value)) {
            return value;
        }

        const filter = value.split('/');
        return Object.fromEntries(
            filter.map((part, index) => [['type', 'subType', 'language'][index], part || undefined])
        );
    }


    private async saveDefinition(script: OmniScriptRecord, options?: { preFix?: string, postFix?: string } ) {
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
        const lookup = this.container.new(OmniScriptAccess);
        const scripts = await lookup.filter(scriptFilter);

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
        const elements = await lookup.elements({ scriptId:  [...scriptsToActivate.keys()], type: 'OmniScript', active: true });
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
