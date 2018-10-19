'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as path from 'path';
import * as process from 'process';
import constants from '../constants';

declare var VlocityUtils: any;

export interface ManifestEntry {
    datapackType: String;
    name: String;
}

export default class VlocityDatapackService {  

    options: vlocity.jobOptions;
    vlocityBuildTools: vlocity;
    verboseLogging: Boolean;

    constructor(options: vlocity.jobOptions) {
        this.options = options;
        this.vlocityBuildTools  = new vlocity(this.options);
    }

    public static setLogger(logFunc: (msg: string) => void){
        VlocityUtils.output = (loggingMethod, color: string, args: IArguments) => {
            let messageArray = Array.from(args);
            let message = messageArray[0] + ': '+ messageArray.slice(1).map((arg, i) => {
                if (arg instanceof Error) {
                    return arg.stack;
                } else if (typeof arg == 'object') {
                    return JSON.stringify(arg, null);
                }
                return arg;
            }).join(' ');
            logFunc(message);
        };
    }

    public export(objects: ManifestEntry[]) : Promise<any> {
        return this.runCommand('Export',{
            'manifest': JSON.stringify(objects)
        });
    }

    private runCommand(command: vlocity.actionType, jobInfo : any) : Promise<any> {
        process.chdir(vscode.workspace.rootPath);
        return new Promise((resolve, reject) => this.vlocityBuildTools.checkLogin(resolve, reject)).then(() =>
            new Promise((resolve, reject) => {
                jobInfo = Object.assign({}, this.options, jobInfo);
                return this.vlocityBuildTools.datapacksjob.runJob(command, jobInfo, resolve, reject)
            })
        );
    }
}

