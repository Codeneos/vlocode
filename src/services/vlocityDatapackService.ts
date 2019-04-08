import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as jsforce from 'jsforce';
import * as path from 'path';
import * as process from 'process';
import * as yaml from 'js-yaml';
import * as fs from 'fs-extra';
import ServiceContainer, { default as s, container } from 'serviceContainer';
import { isBuffer, isString, isObject, isError } from 'util';
import { getDocumentBodyAsString, getStackFrameDetails, forEachProperty, getProperties,  existsAsync, groupBy, forEachAsync, mapAsync } from '../util';
import { LogManager, Logger } from 'loggers';
import { VlocityDatapack } from 'models/datapack';
import VlocodeConfiguration from 'models/vlocodeConfiguration';
import { FSWatcher, PathLike } from 'fs';
import { runInThisContext } from 'vm';
import SalesforceService from 'services/salesforceService';

import * as exportQueryDefinitions from 'exportQueryDefinitions.yaml';
import SObjectRecord from 'models/sobjectRecord';
import { createRecordProxy } from 'salesforceUtil';
import VlocityMatchingKeyService from './vlocityMatchingKeyService';
import { getDatapackManifestKey, getExportProjectFolder } from 'datapackUtil';
import { type } from 'os';
import DatapackLoader from 'datapackLoader';

export interface ManifestEntry {
    datapackType: string;
    key: string;
}

export interface ObjectEntry {
    sobjectType: string;
    datapackType: string;
    globalKey?: string;
    name?: String;
    id?: String;
}

type ObjectEntryWithId = ObjectEntry & { id: string; };

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

export interface VlocityMatchingKey {
    sobjectType: string;
    fields: Array<string>;
    returnField: string;
}

export default class VlocityDatapackService implements vscode.Disposable {  

    private _vlocityBuildTools: vlocity;
    private _customSettings: any; // load from yaml when needed
    private _customSettingsWatcher: vscode.FileSystemWatcher; 

    constructor(
        private readonly container : ServiceContainer, 
        private readonly config: VlocodeConfiguration) {
    }

    public dispose(){
        if (this._customSettingsWatcher) {
            this._customSettingsWatcher.dispose();
            this._customSettingsWatcher = null;
        }
    }
     
    private get vlocityBuildTools() : vlocity {
        return this._vlocityBuildTools || (this._vlocityBuildTools = this.createVlocityInstance());        
    }

    private createVlocityInstance() : vlocity {
        const buildTools = new vlocity(this.config);
        buildTools.datapacksutils.printJobStatus = () => {};
        buildTools.datapacksutils.saveCurrentJobInfo = () => {};
        buildTools.datapacksexportbuildfile.saveFile = () => {};
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

    public async getJsForceConnection() : Promise<jsforce.Connection> {
        await this.checkLoginAsync();
        return this._vlocityBuildTools.jsForceConnection;
    }

    // Todo: get vlocity namespace earlier
    // instead 
    private async getVlocityNamespace() : Promise<string> {
        if (!this.vlocityNamespace) {
            await this.checkLoginAsync();
        }
        return this.vlocityNamespace;
    }

    public async getMatchingKeyService() : Promise<VlocityMatchingKeyService> {
        return new VlocityMatchingKeyService(this.container, await this.getVlocityNamespace(), this);
    }

    public async isVlocityPackageInstalled() : Promise<Boolean> {
        return (await new SalesforceService(this).isPackageInstalled(/^vlocity/i)) !== undefined;
    }
    
    /**
     * @deprecated Use datapack loader class instead: `container.get(DatapackLoader)`
     */
    public async loadDatapack(file: vscode.Uri) : Promise<VlocityDatapack> {
        return container.get(DatapackLoader).loadFrom(file.fsPath);
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

    public async export(entries: ObjectEntry[], exportFolder: string, maxDepth: number = 0) : Promise<DatapackResultCollection>  {
        const exportQueries = await this.createExportQueries(entries.filter(e => !e.id));
        const exportManifest = this.createExportManifest(<ObjectEntryWithId[]>entries.filter(e => !!e.id));
        return this.runCommand('Export',{
            queries: exportQueries,
            projectPath: exportFolder,
            fullManifest: exportManifest,
            skipQueries: exportQueries.length == 0,
            maxDepth: maxDepth
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
        await this.checkLoginAsync();
        const jobResult = await this.datapacksJobAsync(command, jobInfo);
        return new DatapackResultCollection(this.parseJobResult(jobResult));
    }

    private checkLoginAsync() : Promise<void> {
        process.chdir(vscode.workspace.rootPath);
        return this.vlocityBuildTools.checkLogin();
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

    private async getCustomJobOptions() : Promise<any> {        
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

    private async loadCustomSettingsFrom(yamlFile: string) : Promise<any> {        
        try {
            // parse and watch Custom YAML
            const customSettings = yaml.safeLoad((await fs.readFile(yamlFile)).toString());
            this.logger.info(`Loaded custom settings from YAML file: ${yamlFile}`);
            return  {
                OverrideSettings: customSettings.OverrideSettings,
                preStepApex: customSettings.preStepApex,
                postStepApex: customSettings.postStepApex,
                postJobApex: customSettings.postJobApex
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
            }
        });
    }
}