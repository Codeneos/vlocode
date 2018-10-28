import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as path from 'path';
import * as process from 'process';
import constants from '../constants';
import * as l from '../loggers';
import * as s from '../singleton';
import * as vm from 'vm';
import { isBuffer, isString, isObject, isError } from 'util';
import { getDocumentBodyAsString } from '../util';

declare var VlocityUtils: any;

export interface ManifestEntry {
    datapackType: string;
    name: string;
}

export interface ObjectEntry {
    sobjectType: string;
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
export class VlocityDatapack {
    private _data;

    public get hasGlobalKey(): boolean { return this.globalKey !== undefined && this.globalKey !== null; }
    public get globalKey(): string { return this._data['%vlocity_namespace%__GlobalKey__c']; }
    public get name(): string { return this._data['Name']; }
    public get type(): string { return this._data['VlocityDataPackType']; }
    public get sobjectType(): string { return this._data['VlocityRecordSObjectType']; }
    public get sourceKey(): string { return this._data['VlocityRecordSourceKey']; }
    public get data(): any { return this._data; }
    
    constructor(data?: any) {
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
    private vlocityBuildTools: vlocity;
    private verboseLogging: Boolean;

    constructor(options: vlocity.jobOptions) {
        this.options = options;
        this.vlocityBuildTools  = new vlocity(this.options);
    }

    public get queryDefinitions() {
        return this.vlocityBuildTools.datapacksjob.queryDefinitions;
    }

    // Move to helper class
    public async readDatapackFile(file: vscode.Uri) : Promise<VlocityDatapack> {
        s.get(l.Logger).log(`Loading datapack: ${file.fsPath}`);
        return new VlocityDatapack(await getDocumentBodyAsString(file));
    }

    public deploy(objects: ObjectEntry[]) : Promise<VlocityDatapackResult>  {
        return this.runCommand('Deploy',{
            'manifest': this.createDeployManifest(objects),
            'projectPath': this.options.projectPath || vscode.workspace.rootPath
        });
    }

    public export(objects: ObjectEntry[], maxDepth: Number = 0) : Promise<VlocityDatapackResult>  {
        return this.runCommand('Export',{
            //'manifest': this.createExportManifest(objects)
            'queries': this.createExportQueries(objects),
            'maxDepth': maxDepth,
            'projectPath': this.options.projectPath || vscode.workspace.rootPath
        });
    }

    private createExportQueries(objects: ObjectEntry[]) : any {
        return objects.map(oe => {
            let dpType = this.getDatapackType(oe.sobjectType) || 'SObject';
            let query = this.buildQuery(oe);
            return {
                VlocityDataPackType: dpType,
                query: query
            };
        });
    }

    private buildQuery(entry: ObjectEntry) : string {
        if (!entry.globalKey && !entry.name) {
            throw new Error(`Cannot export object without name or global key (${entry.sobjectType})`);
        }
        let query = `select Id from ${entry.sobjectType} where `;
        if (entry.globalKey) {
            query += `%vlocity_namespace%__GlobalKey__c = '${entry.globalKey}'`;
        } else {
            query += `Name = '${entry.name}'`;
        }
        return query;
    }

    public getDatapackType(sobjectType: string) : string {
        return Object.keys(this.queryDefinitions).find(type => {
            return new RegExp(`from ${sobjectType}`,'ig').test(this.queryDefinitions[type].query);
        });
    }

    private createDeployManifest(objects: ObjectEntry[]) : any {
        return objects.reduce((mf, item) => {     
            let dpType = this.getDatapackType(item.sobjectType) || 'SObject';       
            mf[dpType] = mf[dpType] || [];
            mf[dpType].push(item.globalKey || item.name);
            return mf;
        }, {});
    }

    private createExportManifest(objects: ManifestEntry[]) : any {
        return objects.reduce((m, item) => {            
            m[item.datapackType] = m[item.datapackType] || [];
            m[item.datapackType].push(item.name);
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

