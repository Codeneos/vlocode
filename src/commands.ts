'use strict';

import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as path from 'path';
import * as fs from 'fs';
import * as process from 'process';

import constants from './constants';
import commandModel from './models/commandModel';
import VlocodeService from './services/vlocodeService';
import * as vds from './services/vlocityDatapackService';
import * as s from './singleton';
import * as c from './commands';
import * as l from './loggers';

function readFileAsync(file: vscode.Uri) : Promise<string> {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(file.fsPath, (err, data) => {
            if(err) reject(err);
            else resolve(data.toString());
        })
    });
}

async function getDocumentBodyAsString(file: vscode.Uri) : Promise<string> {
    let doc = vscode.workspace.textDocuments.find(doc => doc.fileName == file.fsPath);
    if (doc) return doc.getText();
    return await readFileAsync(file);
}

async function getDatapack(file: vscode.Uri) : Promise<vds.VlocityDatapack> {
    s.get(l.Logger).log(`Loading datapack: ${file.fsPath}`);
    return new vds.VlocityDatapack(await getDocumentBodyAsString(file));
}

function showErrorWithRetry<T>(errorMsg : string, retryCallback: (...args) => Promise<T>, args? : IArguments) : Thenable<T> {
    return vscode.window.showErrorMessage(errorMsg, { modal: false }, { title: 'Retry' })
            .then(value => {
                if (value) {
                    if (args !== undefined) {
                        return retryCallback.apply(null, Array.prototype.splice.apply(args));
                    } else {
                        return retryCallback();
                    }
                }
            });
}

export async function refreshDatapack(selectedFiles: vscode.Uri[]) {
    let datapacks = await Promise.all(selectedFiles.map(f => getDatapack(f)));    
    let datapacksForExport = datapacks.map(dp => { 
        return <vds.ObjectEntry>{ 
            objectType: dp.sobjectType,
            key: dp.globalKey
        }
    });

    datapacks.forEach(dp => s.get(l.Logger).info(`Selected datapack ${dp.name} (${dp.globalKey})`));

    try{
        await s.get(VlocodeService).datapackService.export(datapacksForExport);
    } catch (_err) {
        // Errors cannot be type in TS for now so we use cast, but the export function will
        let err = <vds.VlocityDatapackResult> _err;
        let errParts = (err.message || _err).split('---').map(v => v.trim());
        return showErrorWithRetry(`Error refreshing datapack: ${errParts[0]} ${errParts[errParts.length - 1]}`, refreshDatapack, arguments);
    }
}

export function deployDatapack(datapackType: String, datapackKey: String) {
}

export const datapackCommands : commandModel[] = [
    {
        name: 'extension.refreshDatapack',
        callback: (...args) => refreshDatapack(<vscode.Uri[]>args[1])
    }, {
        name: 'extension.deployDatapack',
        callback: deployDatapack
    }
];
