import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as jsforce from 'jsforce';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as fs from 'fs-extra';
import ServiceContainer, { default as s, container } from 'serviceContainer';
import { existsAsync, groupBy, mapAsync, stringEquals } from '../util';
import { LogManager } from 'loggers';
import { VlocityDatapack } from 'models/datapack';
import VlocodeConfiguration from 'models/vlocodeConfiguration';
import SalesforceService from 'services/salesforceService';

import * as exportQueryDefinitions from 'exportQueryDefinitions.yaml';
import SObjectRecord from 'models/sobjectRecord';
import VlocityMatchingKeyService from './vlocityMatchingKeyService';
import { getDatapackManifestKey, getExportProjectFolder } from 'datapackUtil';
import DatapackLoader from 'datapackLoader';
import JsForceConnectionProvider from 'connection/jsForceConnectionProvider';
import * as DataPacksExpand from "vlocity/lib/datapacksexpand";

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

type ObjectEntryWithId = ObjectEntry & { id: string; };

type QueryDefinitions = typeof import('exportQueryDefinitions.yaml');

export enum VlocityJobStatus {
    success = 'Success',
    error = 'Error'
}

export type DatapackResult = { key: string, success: boolean, message?: string };

export class DatapackResultCollection implements Iterable<DatapackResult> {

    constructor(private results : DatapackResult[] = []) {
    }

    public get length() : number {
        return this.results.length;
    }

    public get hasErrors() : boolean {
        return this.results.some(result => !result.success);
    }

    [Symbol.iterator](): Iterator<DatapackResult> {
        return this.results[Symbol.iterator]();
    }

    public getErrors() : DatapackResult[] {
        return this.results.filter(result => !result.success);
    }

    public getResult(key : string) : DatapackResult {
        return this.results.find(result => result.key.toLowerCase() == key.toLowerCase());
    }

    public add(...results: DatapackResult[]) {
        this.results.push(...results);
    }

    public join(results: Iterable<DatapackResult>) : DatapackResultCollection {
        this.results.push(...results);
        return this;
    }

    /* let missingKeys = new Set(expectedKeys);
        this.results.forEach(result => missingKeys.delete(result.key));
        return Array.from(missingKeys); */

    public clear() {
        this.results = [];
    }
}

type ExportManifest = { 
    [type: string] : { 
        [id: string] : { 
            Id: string, 
            VlocityDataPackType: string, 
            VlocityRecordSObjectType: string 
        } 
    } 
};

type ExportQuery = { 
    VlocityDataPackType: string, 
    query: string 
};

type CustomJobYaml = { 
    customQueries: [{VlocityDataPackType: string, query: string}],
    OverrideSettings: any,
    preStepApex: any,
    postStepApex: any,
    postJobApex: any,
    [key: string] : any
};

export interface VlocityMatchingKey {
    sobjectType: string;
    fields: Array<string>;
    returnField: string;
}

export default class VlocityDatapackService implements vscode.Disposable {  

    private vlocityBuildTools: vlocity;
    private _matchingKeyService: VlocityMatchingKeyService;
    private _customSettings: any; // load from yaml when needed
    private _customSettingsWatcher: vscode.FileSystemWatcher; 

    constructor(
        private readonly container : ServiceContainer, 
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly config: VlocodeConfiguration,
        private readonly salesforceService: SalesforceService = new SalesforceService(connectionProvider)
        ) {
    }

    public dispose(){
        if (this._customSettingsWatcher) {
            this._customSettingsWatcher.dispose();
            this._customSettingsWatcher = null;
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
        const buildTools = new vlocity(<VlocodeConfiguration>Object.assign({}, this.config, vlocityInstanceParams));
        buildTools.jsForceConnection = connection;
        buildTools.utilityservice.login = async () => {};
        buildTools.utilityservice.sfdxLogin = async () => {};
        buildTools.datapacksutils.printJobStatus = () => {};
        buildTools.datapacksutils.saveCurrentJobInfo = () => {};
        buildTools.datapacksexportbuildfile.saveFile = () => {};
        await buildTools.utilityservice.checkLogin();

        // Making sure that any override definitions so that offline operations (expand) also uses the correct
        // custom definitions when defined -- do this after the login check to ensure we have namespaces set correctly
        const customJobOptions = await this.getCustomJobOptions();
        if (customJobOptions && customJobOptions.OverrideSettings) {
            buildTools.datapacksutils.overrideExpandedDefinition(customJobOptions.OverrideSettings);
        }

        return buildTools;
    }

    public get vlocityNamespace() : string {
        return this.vlocityBuildTools.namespace;        
    } 

    public get queryDefinitions() {
        return exportQueryDefinitions;
    }

    private get logger() {
        return LogManager.get(VlocityDatapackService);
    }

    public async getQueryDefinitions() : Promise<QueryDefinitions> {
        const customJobOptions = await this.getCustomJobOptions();
        if (customJobOptions && customJobOptions.customQueries) {
            const customQueries = customJobOptions.customQueries.reduce((map, val) => 
                Object.assign(map, {[val.VlocityDataPackType]: val}) , {});
            return Object.assign(customQueries, exportQueryDefinitions);
        }
        return exportQueryDefinitions;
    }

    public async getJsForceConnection() : Promise<jsforce.Connection> {
        return this.connectionProvider.getJsForceConnection();
    }

    public isGuaranteedParentKey(key: string) {
        return key.startsWith('RecordType/') || this.vlocityBuildTools.datapacksutils.isGuaranteedParentKey(key);
    }

    // Todo: get vlocity namespace earlier
    // instead 
    private async getVlocityNamespace() : Promise<string> {
        return this.vlocityNamespace;
    }

    public async getMatchingKeyService() : Promise<VlocityMatchingKeyService> {
        return this._matchingKeyService || (this._matchingKeyService = new VlocityMatchingKeyService(await this.getVlocityNamespace(), this, this.salesforceService));
    }

    public async isVlocityPackageInstalled() : Promise<boolean> {
        return (await this.salesforceService.isPackageInstalled(/^vlocity/i)) !== undefined;
    }
    
    /**
     * @deprecated Use `container.get(DatapackLoader).loadFrom(...)` instead
     */
    public async loadDatapack(file: vscode.Uri) : Promise<VlocityDatapack> {
        return container.get(DatapackLoader).loadFrom(file.fsPath);
    }

    /**
     * Expands a datapack into multiple files according to the specified expand definitions
     * @param datapack The datapack to save and expand
     * @param targetPath The path to expand to
     */
    public async expandDatapack(datapack: VlocityDatapack, targetPath: string) : Promise<void> {
        const expander = new DataPacksExpand(this.vlocityBuildTools);
        expander.targetPath = targetPath;
        const jobOptions = Object.assign({}, await this.getCustomJobOptions(), this.config);
        const parentName = expander.getDataPackFolder(datapack.datapackType, datapack.VlocityRecordSObjectType, datapack);
        this.logger.verbose(`Expanding datapack ${parentName} (${datapack.datapackType})`);
        await expander.processDataPackData(datapack.datapackType, parentName, undefined, datapack.data, false, jobOptions);
    }

    public getDatapackReferenceKey(datapack : VlocityDatapack) {
        return datapack.datapackType + '/' + 
               this.vlocityBuildTools.datapacksexpand.getDataPackFolder(datapack.datapackType, datapack.sobjectType, datapack);
    }

    public async deploy(...datapackHeaders: string[]) : Promise<DatapackResultCollection>  {
        const headersByProject = groupBy(datapackHeaders, header => getExportProjectFolder(header));

        const results = await mapAsync(Object.keys(headersByProject), projectFolder => {
            const deployManifest = headersByProject[projectFolder].map(header => getDatapackManifestKey(header).key);
            return this.runCommand('Deploy', {
                manifest: deployManifest,
                projectPath: projectFolder,
                activate: this.config.autoActivate,
                delete: true,
                compileOnBuild: this.config.compileOnBuild        
            });
        });

        return results.reduce((results, result) => results.join(result));
    }

    /**
     * Gets the first matching Salesforce ID for the specified Vlocity object.
     * @param entries Objects to query for Salesforce IDs
     */
    public async getSalesforceIds(entries: ObjectEntry[]) : Promise<string[]>  {
        const exportQueries = await this.createExportQueries(entries);
        const salesforceConn = await this.getJsForceConnection();
        // query all objects even if they have an Id already; it is up to the caller to filter out objects with an Id if they
        // do not want to query them
        const results = await Promise.all(exportQueries.map(query => salesforceConn.queryAll<SObjectRecord>(query.query)));
        return results.map(result => result.totalSize > 0 ? result.records[0].Id : null);
    }

    public async export(entries: ObjectEntry[], exportFolder: string, maxDepth: number = 0) : Promise<DatapackResultCollection>  {
        const exportQueries = await this.createExportQueries(entries.filter(e => !e.id));
        const exportManifest = this.createExportManifest(<ObjectEntryWithId[]>entries.filter(e => !!e.id));
        return this.runCommand('Export',{
            queries: exportQueries,
            projectPath: exportFolder,
            fullManifest: exportManifest,
            skipQueries: exportQueries.length == 0,
            maxDepth: maxDepth,
            initialized: true // avoid project initialization when exporting
        });
    }

    private createExportManifest(objects: ObjectEntryWithId[]) : ExportManifest  {
        let manifest = objects.reduce((manifest, entry) => {
            manifest[entry.datapackType] = manifest[entry.datapackType] || {};
            manifest[entry.datapackType][entry.id] = {
                Id: entry.id,
                VlocityDataPackType: entry.datapackType,
                VlocityRecordSObjectType: entry.sobjectType
            };
            return manifest;
        }, {});
        return manifest;
    }

    private async createExportQueries(objects: ObjectEntry[]) : Promise<Array<ExportQuery>> {
        return Promise.all(objects.map(async entry => {
            return {
                VlocityDataPackType: entry.datapackType,
                query: await (await this.getMatchingKeyService()).getQuery(entry.datapackType, entry)
            };
        }));
    }

    private createDeployManifest(objects: ManifestEntry[]) : any {
        return objects.reduce((mf, item) => {  
            mf[item.datapackType] = mf[item.datapackType] || [];
            mf[item.datapackType].push(item.key);
            return mf;
        }, {});
    }

    public async runCommand(command: vlocity.actionType, jobInfo : vlocity.JobInfo) : Promise<DatapackResultCollection> {
        const jobResult = await this.datapacksJobAsync(command, jobInfo);
        return new DatapackResultCollection(this.parseJobResult(jobResult));
    }
    
    private async datapacksJobAsync(command: vlocity.actionType, jobInfo : vlocity.JobInfo) : Promise<vlocity.VlocityJobResult> {
        // collect and create job optipns
        const localOptions = { projectPath: this.config.projectPath || '.' };
        const customOptions = await this.getCustomJobOptions();
        const jobOptions = Object.assign({}, customOptions, this.config, localOptions, jobInfo);

        // clean-up build tools left overs from the last invocation
        this.vlocityBuildTools.datapacksexportbuildfile.currentExportFileData = {};
        delete this.vlocityBuildTools.datapacksbuilder.allFileDataMap;

        // run the job 
        const result = await this.vlocityBuildTools.datapacksjob.runJob(command, jobOptions);
        return Object.assign(result, { currentStatus: jobOptions.currentStatus });
    }

    public async getCustomJobOptions() : Promise<CustomJobYaml> {        
        if (!this.config.customJobOptionsYaml) {
            // when no YAML file is specified skip this step
            return;
        }

        if (!this._customSettings) {
            // parse any custom job options from the custom yaml
            let yamlPaths = vscode.workspace.workspaceFolders.map(root => path.join(root.uri.fsPath, this.config.customJobOptionsYaml));
            let existsResults = await Promise.all(yamlPaths.map(p => existsAsync(p)));
            yamlPaths = yamlPaths.filter((_p,i) => existsResults[i]);
            if (yamlPaths.length == 0) {
                this.logger.warn(`The specified custom YAML file '${this.config.customJobOptionsYaml}' does not exists`);
                return;
            }

            // watch for changes or deletes of the custom YAML
            if (!this._customSettingsWatcher) {
                this._customSettingsWatcher = vscode.workspace.createFileSystemWatcher(yamlPaths[0]);
                this._customSettingsWatcher.onDidChange(e => this._customSettings = this.loadCustomSettingsFrom(e.fsPath));
                this._customSettingsWatcher.onDidCreate(e => this._customSettings = this.loadCustomSettingsFrom(e.fsPath));
                this._customSettingsWatcher.onDidDelete(_e => this._customSettings = null);       
            }
            
            // load settings
            this._customSettings = await this.loadCustomSettingsFrom(yamlPaths[0]);
        }

        return this._customSettings;
    }

    private async loadCustomSettingsFrom(yamlFile: string) : Promise<CustomJobYaml> {        
        try {
            // parse and watch Custom YAML
            const customSettings = yaml.safeLoad((await fs.readFile(yamlFile)).toString());
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

    private parseJobResult(result: vlocity.VlocityJobResult) : DatapackResult[] {
        return (result.records || []).map(record => {
            return {
                key: record.VlocityDataPackKey,
                success: record.VlocityDataPackStatus == VlocityJobStatus.success,
                status: record.VlocityDataPackStatus,
                error: (record.ErrorMessage || '').split('--').slice(-1)[0].trim() || null
            };
        });
    }
}