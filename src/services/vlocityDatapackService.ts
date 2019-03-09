import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as jsforce from 'jsforce';
import * as path from 'path';
import * as process from 'process';
import * as yaml from 'js-yaml';
import ServiceContainer, { default as s } from 'serviceContainer';
import { isBuffer, isString, isObject, isError } from 'util';
import { getDocumentBodyAsString, readdirAsync, fstatAsync, getStackFrameDetails, forEachProperty, getProperties, readFileAsync, existsAsync } from '../util';
import { LogManager, Logger } from 'loggers';
import { VlocityDatapack } from 'models/datapack';
import VlocodeConfiguration from 'models/vlocodeConfiguration';
import { FSWatcher, PathLike } from 'fs';
import { runInThisContext } from 'vm';
import SalesforceService from 'services/salesforceService';

import exportQueryDefinitions = require('exportQueryDefinitions.yaml');
import SObjectRecord from 'models/sobjectRecord';
import { createRecordProxy } from 'salesforceUtil';
import VlocityMatchingKeyService from './vlocityMatchingKeyService';
import { getDatapackManifestKey, getExportProjectFolder } from 'datapackUtil';

declare var VlocityUtils: any;

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

export enum DatapackCommandOutcome {
    success = 0,
    partial = 1,
    error = 2
}

export enum VlocityJobStatus {
    success = 'Success',
    error = 'Error'
}

export interface DatapackCommandResult {
    outcome: DatapackCommandOutcome;
    totalCount: number;
    missingCount?: number;
    errors: { error: string, key: string }[];
    success: string[];
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
    
    public async loadDatapack(file: vscode.Uri) : Promise<VlocityDatapack> {
        this.logger.log(`Loading datapack: ${file.fsPath}`);
        let mainfestEntry = getDatapackManifestKey(file.fsPath);
        return new VlocityDatapack(
            file.fsPath, 
            mainfestEntry.datapackType, 
            mainfestEntry.key, 
            getExportProjectFolder(file.fsPath), 
            await getDocumentBodyAsString(file));
    }

    public async deploy(manifest: ManifestEntry[]) : Promise<DatapackCommandResult>  {
        let result = await this.runCommand('Deploy', {
            manifest: [],
            currentStatus: Object.values(manifest).reduce((map, key) =>Object.assign(map, { [key.key]: 'Ready' }), {}),
            activate: this.config.autoActivate,
            delete: true,
            compileOnBuild: this.config.compileOnBuild        
        });
        return Object.assign(result, { 
            missingCount: Math.max(result.totalCount - manifest.length, 0)
        });
    }

    public async export(entries: ObjectEntry[], exportFolder: string, maxDepth: number = 0) : Promise<DatapackCommandResult>  {
        const exportQueries = await this.createExportQueries(entries.filter(e => !e.id));
        const exportMainfest = this.createExportManifest(<ObjectEntryWithId[]>entries.filter(e => !!e.id));
        let result = await this.runCommand('Export',{
            queries: exportQueries,
            projectPath: exportFolder,
            fullManifest: exportMainfest,
            skipQueries: exportQueries.length == 0,
            maxDepth: maxDepth
        });
        return Object.assign(result, { 
            missingCount: Math.max(result.totalCount - entries.length, 0) 
        });
    }

    private createExportManifest(objects: ObjectEntryWithId[]) : ExportManifest  {
        let mainfest = objects.reduce((mainfest, entry) => {
            mainfest[entry.datapackType] = mainfest[entry.datapackType] || {};
            mainfest[entry.datapackType][entry.id] = {
                Id: entry.id,
                VlocityDataPackType: entry.datapackType,
                VlocityRecordSObjectType: entry.sobjectType
            };
            return mainfest;
        }, {});
        return mainfest;
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

    public async runCommand(command: vlocity.actionType, jobInfo : vlocity.JobInfo) : Promise<DatapackCommandResult> {
        let jobResult : vlocity.VlocityJobResult;
        try {
            await this.checkLoginAsync();
            jobResult = await this.datapacksJobAsync(command, jobInfo);
        } catch (err) {
            if (isError(err)) {
                throw err;
            }
            jobResult = <vlocity.VlocityJobResult>err;
        }
        return this.parseJobResult(jobResult);
    }

    private checkLoginAsync() : Promise<void> {
        return new Promise((resolve, reject) => {
            process.chdir(vscode.workspace.rootPath);
            
            return this.vlocityBuildTools.checkLogin(resolve, reject);
        });
    }

    private datapacksJobAsync(command: vlocity.actionType, jobInfo : vlocity.JobInfo) : Promise<vlocity.VlocityJobResult> {
        return new Promise(async (resolve, reject) => {

            // collect and create job optipns
            const localOptions = { projectPath: this.config.projectPath || '.' };
            const customOptions = await this.getCustomJobOptions();
            const jobOptions = Object.assign({}, customOptions, this.config, localOptions, jobInfo);

            // clean-up build tools left overs from the last invocation
            this.vlocityBuildTools.datapacksexportbuildfile.currentExportFileData = {};
            delete this.vlocityBuildTools.datapacksbuilder.allFileDataMap;

            // run the jon
            try {
                this.vlocityBuildTools.datapacksjob.runJob(command, jobOptions, resolve, reject).catch(
                    (reason) => {
                        reject(reason);
                    }
                ).then((e) => {
                    return jobOptions.currentStatus;
                });
            } catch(err) {
                this.logger.error(err);
            }
        });
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

    private async loadCustomSettingsFrom(yamlFile: PathLike) : Promise<any> {        
        try {
            // parse and watch Custom YAML
            const customSettings = yaml.safeLoad(await readFileAsync(yamlFile));
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

    private parseJobResult(result: vlocity.VlocityJobResult) : DatapackCommandResult {
        const errorRecords = (result.records || []).filter(r => r.VlocityDataPackStatus != VlocityJobStatus.success);
        const successRecords = (result.records || []).filter(r => r.VlocityDataPackStatus == VlocityJobStatus.success);
        let outcome = DatapackCommandOutcome.success;

        if (successRecords.length > 0 && errorRecords.length > 0) {
            outcome = DatapackCommandOutcome.partial;
        }  else if (errorRecords.length == 0) {
            outcome = DatapackCommandOutcome.success;
        } else if (successRecords.length == 0) {
            outcome = DatapackCommandOutcome.error;
        }

        return {
            outcome: outcome, 
            totalCount: (result.records || []).length,
            success: successRecords.map(r => r.VlocityDataPackKey),
            errors: errorRecords.map(r => [{ error: r.ErrorMessage, key: r.VlocityDataPackKey }][0])
        };
    }
}

export function setLogger(logger : Logger, includeCallerDetails: Boolean = false){
    const vlocityLogFn = (logFn: (...args: any[]) => void, args: any[]) : void => {
        if (includeCallerDetails) {
            let callerFrame = getStackFrameDetails(2);
            args.push(`(${callerFrame.fileName}:${callerFrame.lineNumber})`);
        }
        logFn.apply(logger, args);
    };
    const vlocityLoggerMaping : { [ func: string ]: (...args: any[]) => void } = {
        report: logger.info,
        success: logger.info,
        warn: logger.warn,
        error: logger.error,
        verbose: logger.verbose        
    };
    // Override all methods
    getProperties(vlocityLoggerMaping).forEach(kvp => VlocityUtils[kvp.key] = (...args: any[]) => vlocityLogFn(kvp.value, args));
    VlocityUtils.output = (loggingMethod, color: string, args: IArguments) => vlocityLogFn(logger.log, Array.from(args));
    VlocityUtils.fatal = (...args: any[]) => { 
        vlocityLogFn(logger.error, Array.from(args));
        throw new Error(Array.from(args).join(' ')); 
    };    
}