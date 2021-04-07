import * as path from 'path';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as jsforce from 'jsforce';
import * as vlocity from 'vlocity';
import * as vscode from 'vscode';

import { Logger, LogManager } from 'lib/logging';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import SalesforceService from 'lib/salesforce/salesforceService';
import { VlocityDatapack } from 'lib/vlocity/datapack';
import VlocodeConfiguration from 'lib/vlocodeConfiguration';

import * as exportQueryDefinitions from 'exportQueryDefinitions.yaml';
import SObjectRecord from 'lib/salesforce/sobjectRecord';
import { groupBy, mapAsync } from 'lib/util/collection';
import { getDocumentBodyAsString } from 'lib/util/fs';
import DatapackLoader from 'lib/vlocity/datapackLoader';
import { getDatapackManifestKey, getExportProjectFolder } from 'lib/vlocity/datapackUtil';
import * as DataPacksExpand from 'vlocity/lib/datapacksexpand';
import { injectable } from 'lib/core/inject';
import * as constants from '@constants';
import { stringEquals } from 'lib/util/string';
import VlocityMatchingKeyService from './vlocityMatchingKeyService';
import { VlocityNamespaceService } from './vlocityNamespaceService';
type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export interface ManifestEntry {
    datapackType: string;
    key: string;
}

export interface ObjectEntry {
    sobjectType: string;
    datapackType: string;
    globalKey?: string;
    name?: string;
    id?: string;
}

type ObjectEntryWithId = ObjectEntry & { id: string };

type QueryDefinitions = typeof import('exportQueryDefinitions.yaml');

type DatapacksExpandDefinitions = typeof import('datapacksexpanddefinition.yaml');

export interface DatapackResult {
    key: string;
    label: string;
    success: boolean;
    errorMessage?: string;
}

export class DatapackResultCollection implements Iterable<DatapackResult> {

    constructor(private results : DatapackResult[] = []) {
    }

    /**
     * Convert a `vlocity.VlocityJobResult` into a `DatapackResultCollection`
     * @param result The datapack job result to create the result collection from
     */
    public static fromJobResult(result: vlocity.VlocityJobResult) : DatapackResultCollection {
        const records : DatapackResult[] = (result.records || []).map(record => ({
            key: record.VlocityDataPackKey,
            label: record.VlocityDataPackDisplayLabel,
            success: record.VlocityDataPackStatus == 'Success',
            errorMessage: record.ErrorMessage?.trim()
        }));
        return new DatapackResultCollection(records);
    }

    /**
     * Get the total number of records in this collection
     */
    public get length() : number {
        return this.results.length;
    }

    /**
     * Are there any failed records in this collection?
     */
    public get hasErrors() : boolean {
        return this.results.some(result => !result.success);
    }

    [Symbol.iterator](): Iterator<DatapackResult> {
        return this.results[Symbol.iterator]();
    }

    /**
     * Get all failed records and their error from this collection
     */
    public getErrors() : DatapackResult[] {
        return this.results.filter(result => !result.success);
    }

    /**
     * Get a single result record for the specified datapack key
     * @param key Datapack key
     */
    public getResult(key : string) : DatapackResult | undefined {
        return this.results.find(result => result.key.toLowerCase() == key.toLowerCase());
    }

    /**
     * Push additional records to this collection.
     * @param results The records to add.
     */
    public add(...results: DatapackResult[]) : this {
        this.results.push(...results);
        return this;
    }

    /**
     * Merge/concat this collection with another collection, changes this collection and returns the merged result.
     * @param results The collection to merge
     */
    public join(results: Iterable<DatapackResult>) : DatapackResultCollection {
        this.results.push(...results);
        return this;
    }

    /** Clear all results fom this collection */
    public clear() {
        this.results = [];
    }
}

interface ExportManifest {
    [type: string] : {
        [id: string] : {
            Id: string;
            VlocityDataPackType: string;
            VlocityRecordSObjectType: string;
        };
    };
}

interface ExportQuery {
    VlocityDataPackType: string;
    query: string;
}

interface CustomJobYaml {
    customQueries: [{VlocityDataPackType: string; query: string}];
    OverrideSettings: any;
    preStepApex: any;
    postStepApex: any;
    postJobApex: any;
    [key: string] : any;
}

export interface VlocityMatchingKey {
    sobjectType: string;
    fields: Array<string>;
    returnField: string;
}

interface ExpandDefinitionProvider {
    /**
     * Get the expand definition for a datapack
     * @param key Setting name to get the definition for
     * @param target Target object
     */
    getDatapackExpandDefinition(key: string, target: { datapackType: string }) : boolean | string | object;

    getSObjectExpandDefinition(key: string, target: { datapackType: string; sobjectType: string }) : boolean | string | Array<string> | object;
}

class BuildToolsExpandDefinitionProvider implements ExpandDefinitionProvider {
    constructor(private readonly vlocityBuildTools: vlocity) {
    }

    /**
     * Get the expand definition for a datapack
     * @param key Setting name to get the definition for
     * @param target Target object
     */
    public getDatapackExpandDefinition(key: string, target: { datapackType: string }) : boolean | string | object {
        return this.vlocityBuildTools.datapacksutils.getExpandedDefinition(target.datapackType, undefined, key);
    }

    public getSObjectExpandDefinition(key: string, target: { datapackType: string; sobjectType: string }) : boolean | string | Array<string> | object {
        return this.vlocityBuildTools.datapacksutils.getExpandedDefinition(target.datapackType, target.sobjectType, key);
    }
}

@injectable()
export default class VlocityDatapackService implements vscode.Disposable {

    private vlocityBuildTools: vlocity;

    private expandProvider: ExpandDefinitionProvider;
    private customSettings: any; // Load from yaml when needed
    private customSettingsWatcher: vscode.FileSystemWatcher | undefined;

    constructor(
        private readonly logger: Logger,
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly config: VlocodeConfiguration,
        private readonly salesforceService: SalesforceService,
        private readonly matchingKeyService: VlocityMatchingKeyService,
        private readonly loader: DatapackLoader
    ) {
    }

    public dispose() {
        if (this.customSettingsWatcher) {
            this.customSettingsWatcher.dispose();
            this.customSettingsWatcher = undefined;
        }
    }

    public async initialize() : Promise<VlocityDatapackService> {
        this.vlocityBuildTools = await this.createVlocityInstance();
        return this;
    }

    private async createVlocityInstance() : Promise<vlocity> {
        const connection = await this.connectionProvider.getJsForceConnection();
        const vlocityInstanceParams = {
            accessToken: connection.accessToken,
            instanceUrl: connection.instanceUrl,
        };
        const buildTools = new vlocity({...this.config, ...vlocityInstanceParams} as VlocodeConfiguration);
        buildTools.jsForceConnection = connection;
        buildTools.utilityservice.login = async () => {};
        buildTools.utilityservice.sfdxLogin = async () => {};
        buildTools.datapacksutils.printJobStatus = () => {};
        buildTools.datapacksutils.saveCurrentJobInfo = () => {};
        buildTools.datapacksexportbuildfile.saveFile = () => {};
        buildTools.datapacksutils.updateStatusIPC  = () => {};
        await buildTools.utilityservice.checkLogin();

        // patch SASS compiler
        // buildTools.datapacksbuilder.compile = function(lang, source, options, cb) 

        // Making sure that any override definitions so that offline operations (expand) also uses the correct
        // custom definitions when defined -- do this after the login check to ensure we have namespaces set correctly
        const customJobOptions = await this.getCustomJobOptions();
        if (customJobOptions && customJobOptions.OverrideSettings) {
            buildTools.datapacksutils.overrideExpandedDefinition(customJobOptions.OverrideSettings);
        }

        // Init expand provider
        this.expandProvider = new BuildToolsExpandDefinitionProvider(this.vlocityBuildTools);

        return buildTools;
    }

    public get vlocityNamespace() : string {
        return this.vlocityBuildTools.namespace;
    }

    /**
     * Get all known query definitions.
     */
    public async getQueryDefinitions() : Promise<QueryDefinitions> {
        const customJobOptions = await this.getCustomJobOptions();
        if (customJobOptions && customJobOptions.customQueries) {
            const customQueries = customJobOptions.customQueries.reduce((map, val) =>
                Object.assign(map, { [val.VlocityDataPackType]: val }) , {});
            return {...customQueries, ...exportQueryDefinitions};
        }
        return exportQueryDefinitions;
    }

    /**
     * Get the query definition for the specified datapack type.
     * @param datapack Datapack type
     */
    public async getQueryDefinition(datapack: string) {
        return Object.entries(await this.getQueryDefinitions()).find(([type]) => stringEquals(type, datapack))?.[1];
    }

    /**
     * Expanded value for a specific datapack setting
     * @param key Setting name
     * @param datapack Datapack
     */
    public getExpandedValue(key: string, datapack: VlocityDatapack) : string | undefined {
        let definition = this.expandProvider.getSObjectExpandDefinition(key, datapack);
        // Let definition = this.vlocityBuildTools.datapacksutils.getExpandedDefinition(key, datapack.datapackType, datapack.sobjectType);
        if (typeof definition === 'string') {
            definition = [ definition ];
        }
        if (definition && Array.isArray(definition)) {
            const resolveValue = (field: string) => {

                // Statics; remove the prefix and returns string as is
                if (field.startsWith('_')) {
                    return field.substr(0);
                }

                // References; use the reference value 
                if (typeof datapack[field] === 'object') {
                    if (datapack[field].VlocityDataPackType?.endsWith('MatchingKeyObject')) {
                        return datapack[field].VlocityMatchingRecordSourceKey ||
                               datapack[field].VlocityLookupRecordSourceKey;
                    }
                }

                return datapack[field];
            };

            return definition.map(resolveValue).filter(v => !!v).join('_');
        }
    }

    public async getJsForceConnection() : Promise<jsforce.Connection> {
        return this.connectionProvider.getJsForceConnection();
    }

    public isGuaranteedParentKey(key: string) {
        return key.startsWith('RecordType/') || this.vlocityBuildTools.datapacksutils.isGuaranteedParentKey(key);
    }

    public async isVlocityPackageInstalled() : Promise<boolean> {
        return (await this.salesforceService.isPackageInstalled(/^vlocity/i)) !== undefined;
    }

    private resolvedProjectPath() {
        return path.resolve(this.config.projectPath || '.');
    }

    /**
     * Loads a datapack from the specified file.
     */
    public async loadDatapack(file: vscode.Uri) : Promise<VlocityDatapack> {
        return this.loader.loadFrom(file.fsPath);
    }

    /**
     * Loads all datapacks from the specified folder
     */
    public async loadAllDatapacks(files: vscode.Uri[]) : Promise<VlocityDatapack[]> {
        return this.loader.loadAll(files.map(file => file.fsPath));
    }

    /**
     * Expands a datapack into multiple files according to the specified expand definitions
     * @param datapack The datapack to save and expand
     * @param targetPath The path to expand to
     */
    public async expandDatapack(datapack: VlocityDatapack, targetPath: string) : Promise<void> {
        const expander = new DataPacksExpand(this.vlocityBuildTools);
        expander.targetPath = targetPath;
        const jobOptions = {...await this.getCustomJobOptions(), ...this.config};
        const parentName = expander.getDataPackFolder(datapack.datapackType, datapack.VlocityRecordSObjectType, datapack);
        this.logger.verbose(`Expanding datapack ${parentName} (${datapack.datapackType})`);
        await expander.processDataPackData(datapack.datapackType, parentName, undefined, datapack.data, false, jobOptions);
    }

    public getDatapackReferenceKey(datapack : VlocityDatapack) {
        return `${datapack.datapackType  }/${
            this.vlocityBuildTools.datapacksexpand.getDataPackFolder(datapack.datapackType, datapack.sobjectType, datapack)}`;
    }

    public async deploy(datapackHeaders: string[], token?: vscode.CancellationToken) : Promise<DatapackResultCollection>  {
        const headersByProject = groupBy(datapackHeaders, getExportProjectFolder);
        const projectPath = this.resolvedProjectPath();

        const results = await mapAsync(Object.keys(headersByProject), projectFolder => {
            const deployManifest = headersByProject[projectFolder].map(header => getDatapackManifestKey(header).key);
            return this.runCommand('Deploy', {
                manifest: deployManifest,
                projectPath: projectPath,
                expansionPath: path.relative(projectPath, projectFolder),
                activate: this.config.autoActivate,
                continueAfterError: true, // Avoids problems with interrupted deploys when a single export fails
                delete: true,
                compileOnBuild: this.config.compileOnBuild
            }, token);
        });

        return results.reduce((results, result) => results.join(result));
    }

    /**
     * Gets the first matching Salesforce ID for the specified Vlocity object.
     * @param entries Objects to query for Salesforce IDs
     */
    public async getSalesforceIds(entries: ObjectEntry[]) : Promise<string[]>  {
        const exportQueries = await this.createExportQueries(entries);
        // Query all objects even if they have an Id already; it is up to the caller to filter out objects with an Id if they
        // do not want to query them
        const results = await Promise.all(exportQueries.map(query => this.salesforceService.query<SObjectRecord>(query.query)));
        return results.map(result => result[0]?.Id);
    }

    public async export(entries: ObjectEntry[], exportFolder: string, maxDepth: number = 0, cancellationToken?: vscode.CancellationToken) : Promise<DatapackResultCollection>  {
        const exportQueries = await this.createExportQueries(entries.filter(e => !e.id));
        const exportManifest = this.createExportManifest(entries.filter(e => !!e.id) as ObjectEntryWithId[]);
        const projectPath = this.resolvedProjectPath();
        const hasSObjectExports = entries.some(entry => entry.datapackType == 'SObject');
        const parallelExports = hasSObjectExports ? 1 : this.config.parallelLimit;
        return this.runCommand('Export',{
            queries: exportQueries,
            projectPath: projectPath,
            expansionPath: path.relative(projectPath, exportFolder),
            ignoreAllErrors: false, // Avoid the export to stop when there is a dependency error -- for example missing template
            fullManifest: exportManifest,
            skipQueries: exportQueries.length == 0,
            defaultMaxParallel: parallelExports,
            maxDepth: maxDepth,
            initialized: true // Avoid project initialization when exporting
        }, cancellationToken);
    }

    private createExportManifest(objects: ObjectEntryWithId[]) : ExportManifest  {
        return objects.reduce((manifest, entry) => {
            manifest[entry.datapackType] = manifest[entry.datapackType] || {};
            manifest[entry.datapackType][entry.id] = {
                Id: entry.id,
                VlocityDataPackType: entry.datapackType,
                VlocityRecordSObjectType: entry.sobjectType
            };
            return manifest;
        }, {});
    }

    private async createExportQueries(objects: ObjectEntry[]) : Promise<Array<ExportQuery>> {
        return Promise.all(objects.map(async entry => {
            return {
                VlocityDataPackType: entry.datapackType,
                query: await this.matchingKeyService.getQuery(entry.datapackType, entry)
            };
        }));
    }

    public async runYamlJob(command: vlocity.actionType, yamlFile: string, cancellationToken?: vscode.CancellationToken) : Promise<DatapackResultCollection>  {
        const jobInfo = yaml.load(await getDocumentBodyAsString(yamlFile)) as vlocity.JobInfo;
        delete jobInfo.projectPath;
        jobInfo.initialized = true;
        return this.runCommand(command, jobInfo, cancellationToken);
    }

    public async runCommand(command: vlocity.actionType, jobInfo : vlocity.JobInfo, cancellationToken?: vscode.CancellationToken) : Promise<DatapackResultCollection> {
        const jobResult = await this.datapacksJobAsync(command, jobInfo, cancellationToken);
        return DatapackResultCollection.fromJobResult(jobResult);
    }

    private async datapacksJobAsync(command: vlocity.actionType, jobInfo : vlocity.JobInfo, cancellationToken?: vscode.CancellationToken) : Promise<vlocity.VlocityJobResult> {
        // Collect and create job optipns
        const localOptions = {
            projectPath: this.resolvedProjectPath(),
            // default settings and datapacks not packed in extension
            // so autoUpdateSettings will always fail, so never attempt this.
            autoUpdateSettings: false
        };
        const customOptions = await this.getCustomJobOptions();
        const jobOptions: any = { ...customOptions, ...this.config, ...localOptions, ...jobInfo };

        if (cancellationToken) {
            jobOptions.cancellationToken = cancellationToken;
        }

        // Create dedicated Vlocity instance
        const vlocityInstance = await this.createVlocityInstance();
        vlocityInstance.datapacksexportbuildfile.currentExportFileData = {};

        // Run the job
        const result = await vlocityInstance.datapacksjob.runJob(command, jobOptions);
        return { ...result, currentStatus: jobOptions.currentStatus };
    }

    public async getCustomJobOptions() : Promise<CustomJobYaml | undefined> {
        if (!this.config.customJobOptionsYaml) {
            // When no YAML file is specified skip this step
            return;
        }

        if (!this.customSettings) {
            // Parse any custom job options from the custom yaml
            const yamlFullPath = await this.getWorkspacePath(this.config.customJobOptionsYaml);
            if (!yamlFullPath) {
                this.logger.warn(`The specified custom YAML file '${this.config.customJobOptionsYaml}' does not exists`);
                return;
            }

            // Watch for changes or deletes of the custom YAML
            if (!this.customSettingsWatcher) {
                this.customSettingsWatcher = vscode.workspace.createFileSystemWatcher(yamlFullPath);
                this.customSettingsWatcher.onDidChange(e => this.customSettings = this.loadCustomSettingsFrom(e.fsPath));
                this.customSettingsWatcher.onDidCreate(e => this.customSettings = this.loadCustomSettingsFrom(e.fsPath));
                this.customSettingsWatcher.onDidDelete(() => this.customSettings = null);
            }

            // Load settings
            this.customSettings = await this.loadCustomSettingsFrom(yamlFullPath);
        }

        return this.customSettings;
    }

    private async loadCustomSettingsFrom(yamlFile: string) : Promise<CustomJobYaml | undefined> {
        try {
            // Parse and watch Custom YAML
            const customSettings = yaml.load((await fs.readFile(yamlFile)).toString()) as any;
            this.logger.info(`Loaded custom settings from YAML file: ${yamlFile}`);
            return  {
                OverrideSettings: customSettings.OverrideSettings,
                preStepApex: customSettings.preStepApex,
                postStepApex: customSettings.postStepApex,
                postJobApex: customSettings.postJobApex,
                customQueries: customSettings.queries
            };
        } catch(err) {
            this.logger.error(`Failed to parse custom YAML file: ${yamlFile}/nError: ${err.message || err}`);
        }
    }

    /**
     * Get the first existing path for the specified file 
     * @param file Path to resolve relative to the current loaded workspace folders
     */
    private async getWorkspacePath(file: string) : Promise<string | undefined> {
        const pathCandidates = [...(vscode.workspace.workspaceFolders || []).map(root => path.join(root.uri.fsPath, file)), file];
        for (const pathCandidate of pathCandidates) {
            if (fs.existsSync(pathCandidate)) {
                return pathCandidate;
            }
        }
    }
}