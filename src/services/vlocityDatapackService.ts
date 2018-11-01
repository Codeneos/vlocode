import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as path from 'path';
import * as process from 'process';
import constants from '../constants';
import * as l from '../loggers';
import * as s from '../singleton';
import * as vm from 'vm';
import { isBuffer, isString, isObject, isError } from 'util';
import { getDocumentBodyAsString, readdirAsync, fstatAsync } from '../util';

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
}

// Derrived from Vlocity Tools
export interface VlocityDatapackResult {
    action?: string;
    message?: string;
    status?: string;
    records?: VlocityDatapackRecord[];
}

// Derrived from Vlocity Tools
export interface VlocityDatapackRecord {
    ErrorMessage?: string;
    VlocityDataPackKey?: string;
    VlocityDataPackStatus?: string;
}

/**
 * Simple representation of a datapack; maps common values to properties. Source of the datapsck can be accessed through the `data` property
 */
export class VlocityDatapack implements ManifestEntry, ObjectEntry {
    private _data: any;
    private _headerFile: string;
    private _key: string;
    private _type: string;

    public get hasGlobalKey(): boolean { return this.globalKey !== undefined && this.globalKey !== null; }
    public get globalKey(): string { return this._data['%vlocity_namespace%__GlobalKey__c']; }
    public get name(): string { return this._data['Name']; }
    public get datapackType(): string { return this._type; }
    public get sobjectType(): string { return this._data['VlocityRecordSObjectType']; }
    public get sourceKey(): string { return this._data['VlocityRecordSourceKey']; }
    public get data(): any { return this._data; }
    public get key(): string { return this._key; }    
    public get mainfestEntry(): ManifestEntry { return { key: this._key, datapackType: this._type }; }
    
    constructor(headerFile: string, type: string, key: string, data?: any) {
        this._headerFile = headerFile;
        this._type = type;
        this._key = key;        
        if (isBuffer(data)) {
            data = data.toString();
        }        
        if (isString(data)) {
            try {
                this._data = JSON.parse(data);
            } catch (err) {
                s.get(l.Logger).error('Unable to parse datapack JSON: ' + (err.message || err));
            }
        } else if (isObject(data)) {
            this._data = data;
        } else {
            this._data = {};
        }
    }
}

export default class VlocityDatapackService {  

    private options: vlocity.jobOptions;
    private _vlocityBuildTools: vlocity;
    private verboseLogging: Boolean;

    constructor(options?: vlocity.jobOptions) {
        this.options = options || {};
    }
     
    private get vlocityBuildTools() : vlocity {
        return this._vlocityBuildTools || (this._vlocityBuildTools = new vlocity(this.options));
    }    

    public get queryDefinitions() {
        return this.vlocityBuildTools.datapacksjob.queryDefinitions;
    }

    protected get logger() {
        return s.get(l.Logger);
    }

    // Move to helper class
    public async loadDatapackFromFile(file: vscode.Uri) : Promise<VlocityDatapack> {
        this.logger.log(`Loading datapack: ${file.fsPath}`);
        let mainfestEntry = this.getDatapackManifestKey(file);
        return new VlocityDatapack(file.fsPath, mainfestEntry.datapackType, mainfestEntry.key, await getDocumentBodyAsString(file));
    }

    private senatizePath(pathStr: string) {
        if (!pathStr) {
            return pathStr;
        }
        pathStr = pathStr.replace(/^[\/\\]*(.*?)[\/\\]*$/g, '$1');
        pathStr = pathStr.replace(/[\/\\]+/g,path.sep);
        return pathStr;
    }

    private resolveProjectPathFor(file: vscode.Uri) : string {
        if (path.isAbsolute(this.options.projectPath)) {
            return this.options.projectPath || '';
        }
        let rootFolder = vscode.workspace.getWorkspaceFolder(file);
        return rootFolder 
            ? path.resolve(rootFolder.uri.fsPath, this.options.projectPath) 
            : path.resolve(this.options.projectPath);
    }

    public getDatapackManifestKey(file: vscode.Uri) : ManifestEntry {
        let filePath = file.fsPath; // always passed as absolute path
        let projectPath = this.resolveProjectPathFor(file);
        let relativePath = filePath.replace(projectPath,'');
        let splitedPath = relativePath.split(/\/|\\/gm).filter(v => !!v);
        return {
            datapackType: splitedPath[0],
            key: `${splitedPath.slice(1, splitedPath.length - 1).join('/')}`
        };        
    }

    public deploy(mainfest: ManifestEntry[]) : Promise<VlocityDatapackResult>  {
        return this.runCommand('Deploy',{
            'manifest': this.createDeployManifest(mainfest),
            'projectPath': this.options.projectPath || '.'
        });
    }

    public export(entries: ObjectEntry[], maxDepth: Number = 0) : Promise<VlocityDatapackResult>  {
        return this.runCommand('Export',{
            'queries': this.createExportQueries(entries),
            //'manifest': this.createDeployManifest(mainfest),
            'maxDepth': maxDepth,
            'projectPath': this.options.projectPath || '.'
        });
    }

    private createExportQueries(objects: ObjectEntry[]) : any {
        return objects.map(oe => {
            return {
                VlocityDataPackType: oe.datapackType || 'SObject',
                query: this.buildQuery(oe)
            };
        });
    }

    private buildQuery(entry: ObjectEntry) : string {
        if (!entry.globalKey && !entry.name) {
            throw new Error(`Cannot export object without name or global key (${entry.sobjectType})`);
        }
        // determine the base query
        let query = this.getDefaultQuery(entry.datapackType);
        if (!query) {
            this.logger.warn('No default query available for datapack of type ${(entry.datapackType}; building generic query instead')
            query = `select Id from ${entry.sobjectType}`;
        }
        // append query conditions
        query += / where /gi.test(query) ? ' and ' : ' where ';
        if (entry.globalKey) {
            query += `%vlocity_namespace%__GlobalKey__c = '${entry.globalKey}'`;
        } else {
            query += `Name = '${entry.name}'`;
        }
        return query;
    }

    private getDefaultQuery(datapackType: string) : string | undefined {
        if (this.queryDefinitions[datapackType]) {
            return this.queryDefinitions[datapackType].query;
        }
        return undefined
    }

    /**
     * Tries to get the Vlocity datapack type for a specified SObject type, this 
     * will not work for objects that are associated with multiple datapacks types, i.e: OmniScripts
     * @param sobjectType Salesforce object type, replace Vlocity namespace with %vlocity_namespace%
     */
    public getDatapackType(sobjectType: string) : string | undefined {
        return Object.keys(this.queryDefinitions).find(type => {
            return new RegExp(`from ${sobjectType}`,'ig').test(this.queryDefinitions[type].query);
        });
    }

    private createDeployManifest(objects: ManifestEntry[]) : any {
        return objects.reduce((mf, item) => {  
            mf[item.datapackType] = mf[item.datapackType] || [];
            mf[item.datapackType].push(item.key);
            return mf;
        }, {});
    }

    /**
     * Finds the datapacks header JSON by scanning the directory for files post fixed with _datapack.json
     * @param file file or folder for which to find the _datapack.json file
     */
    public async resolveDatapackHeader(file: vscode.Uri) : Promise<vscode.Uri> {
        if (file.fsPath.toLowerCase().endsWith('_datapack.json')) {
            return file;
        }
        try{
            // either detect based on ending or do a full stat command
            let isDirectory = file.fsPath.endsWith(path.sep) || (await fstatAsync(file)).isDirectory();
            if (isDirectory) {
                return this.findDatapackHeaderInFolder(file.fsPath);
            }
            return this.findDatapackHeaderInFolder(path.dirname(file.fsPath));
        } catch (err) {
            // catch fstatAsync exceptions; this indeicates tha file does not exoist and as such we
            // return undefined indicating the DP header cannot be resolved.
            return undefined;
        }
    }

    private async findDatapackHeaderInFolder(pathStr: string) : Promise<vscode.Uri> {
        try {
            let files = await readdirAsync(pathStr);
            let datapackFile = files.find(f => f.toLowerCase().endsWith('_datapack.json'));
            return datapackFile ? vscode.Uri.file(path.join(pathStr, datapackFile)) : undefined;
        } catch (err) {
            // in case this is not a folder readdirAsync will return an exception
            // which we will catch and for that return a undefined aka not found result 
            return undefined;
        }
    }

    /*private createDeployManifest(objects: ObjectEntry[]) : any {
        return objects.reduce((mf, item) => {     
            let dpType = this.getDatapackType(item.sobjectType) || 'SObject';       
            mf[dpType] = mf[dpType] || [];
            mf[dpType].push(item.globalKey || item.name);
            return mf;
        }, {});
    }*/

    private createExportManifest(objects: ManifestEntry[]) : any {
        return objects.reduce((m, item) => {            
            m[item.datapackType] = m[item.datapackType] || [];
            m[item.datapackType].push(item.key);
            return m;
        }, {});
    }

    private async runCommand(command: vlocity.actionType, jobInfo : any) : Promise<VlocityDatapackResult> {
        try {
            process.chdir(vscode.workspace.rootPath);
            return await new Promise((resolve, reject) => this.vlocityBuildTools.checkLogin(resolve, reject)).then(() =>
                new Promise((resolve, reject) => {
                    jobInfo = Object.assign({}, this.options, jobInfo);
                    return this.vlocityBuildTools.datapacksjob.runJob(command, jobInfo, resolve, reject);
                })
            );
        } catch (err) {
            if (isError(err)) {
                throw err;
            }
            return <VlocityDatapackResult>err;
        }
    }
}

function formatMsgArg(arg: any) {
    if (arg instanceof Error) {
        return arg.stack;
    } else if (typeof arg == 'object') {
        return JSON.stringify(arg, null);
    }
    return arg;
}

export function setLogger(logger : l.Logger){
    VlocityUtils.output = (loggingMethod, color: string, args: IArguments) => {
        logger.log.apply(logger, Array.from(args).map(formatMsgArg));
    };
}

