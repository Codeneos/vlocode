'use strict';

import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as path from 'path';
import * as fs from 'fs';
import * as process from 'process';

import constants from './constants';
import commandModel from './models/commandModel';
import VlocodeService from './services/vlocodeService';
import VlocityDatapackService, * as vds from './services/vlocityDatapackService';
import * as s from './singleton';
import * as c from './commands';
import * as l from './loggers';
import { isError } from 'util';
import { readFileAsync, requireHtml } from './util';
import datapackHtml from './views/datapack.view.html';

async function getDocumentBodyAsString(file: vscode.Uri) : Promise<string> {
    let doc = vscode.workspace.textDocuments.find(doc => doc.fileName == file.fsPath);
    if (doc) return doc.getText();
    return await readFileAsync(file);
}

async function getDatapack(file: vscode.Uri) : Promise<vds.VlocityDatapack> {
    s.get(l.Logger).log(`Loading datapack: ${file.fsPath}`);
    return new vds.VlocityDatapack(await getDocumentBodyAsString(file));
}

function showMsgWithRetry<T>(
    msgFunc : (msg : String, options: vscode.MessageOptions, ...args: vscode.MessageItem[]) => Thenable<T>, 
    errorMsg : string, 
    retryCallback: (...args) => Promise<T>, args? : IArguments) : Thenable<T> {
    return msgFunc(errorMsg, { modal: false }, { title: 'Retry' })
            .then(value => {
                if (value) {
                    if (args !== undefined) {
                        return retryCallback.apply(null, Array.from(args));
                    } else {
                        return retryCallback();
                    }
                }
            });
}

function showErrorWithRetry<T>(errorMsg : string, retryCallback: (...args) => Promise<T>, args? : IArguments) : Thenable<T> {
    return showMsgWithRetry<T>(vscode.window.showErrorMessage, errorMsg, retryCallback, args);
}

function showWarningWithRetry<T>(errorMsg : string, retryCallback: (...args) => Promise<T>, args? : IArguments) : Thenable<T> {
    return showMsgWithRetry<T>(vscode.window.showWarningMessage, errorMsg, retryCallback, args);
}

export async function callCommandForFiles<T>(command : (objects: vds.ObjectEntry[]) => Promise<T>, files: vscode.Uri[]) : Promise<T> | undefined {
    let datapacks = await Promise.all(files.map(f => getDatapack(f)));    
    let objectEntries = datapacks.map(dp => { 
        return <vds.ObjectEntry>{ 
            sobjectType: dp.sobjectType,
            globalKey: dp.globalKey,
            name: dp.name
        }
    });    
    try {
        return await command.call(s.get(VlocodeService).datapackService, objectEntries);
    } catch (err) {
        if (isError(err)) {
            throw err;
        }
        return Promise.resolve(<T>err);
    }
}

export async function refreshDatapack(selectedFiles: vscode.Uri[]) {
    try {
        let result = await callCommandForFiles(VlocityDatapackService.prototype.export, selectedFiles);

        // lets do some math to find out how successfull we were
        let expectedMinResultCount = selectedFiles.length;
        let successCount = (result.records || []).reduce((c, r) => c += (r.VlocityDataPackStatus == 'Success') ? 1 : 0, 0);
        let errorCount = (result.records || []).reduce((c, r) => c += (r.VlocityDataPackStatus != 'Success') ? 1 : 0, 0);

        // Interpred the results and report back
        if (successCount > 0 && errorCount > 0) {
            await showWarningWithRetry(`Unable to refresh all selected datapack(s); refreshed ${successCount} datapacks with ${errorCount} errors`, refreshDatapack, arguments);
        }  else if (errorCount == 0) {
            if(successCount >= expectedMinResultCount) {
                vscode.window.showInformationMessage(`Succesfully refreshed ${successCount} datapack(s)`);
            } else {
                await showWarningWithRetry(`Unable to refresh all selected datapack(s); refreshed ${successCount} out of ${expectedMinResultCount}`, refreshDatapack, arguments);
            }
        } else if (successCount == 0) {
            await showErrorWithRetry(`Failed to refresh the selected datapack(s); see the log for more details`, refreshDatapack, arguments);
        }        
    } catch (err) {
        await showErrorWithRetry(`Error: ${err}`, refreshDatapack, arguments);
    }
}

export async function deployDatapack(selectedFiles: vscode.Uri[]) {
    return callCommandForFiles(VlocityDatapackService.prototype.deploy, selectedFiles);
}

export async function viewDatapackGeneric(context) {
    let viewsRoot = vscode.Uri.file(path.join(context.extensionPath, 'out', 'views'));
    const panel = vscode.window.createWebviewPanel(
        'viewDatapackGeneric', // Identifies the type of the webview. Used internally
        "Datapack View", // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        { 
            enableScripts: true, 
            localResourceRoots : [ viewsRoot ] 
        }
    );
    
    /*// Handle messages from the webview
    panel.webview.onDidReceiveMessage(message => {
        s.get(l.Logger).verbose(message);
    }, undefined, context.subscriptions);*/

    panel.webview.html = datapackHtml.replace(/(vscode-resource:)/ig, `${viewsRoot.with({ scheme: 'vscode-resource' })}`);
    s.get(l.Logger).verbose(panel.webview.html);
};

export const datapackCommands : commandModel[] = [
    {
        name: 'vlocity.refreshDatapack',
        callback: (...args) => refreshDatapack(<vscode.Uri[]>args[1])
    }, {
        name: 'vlocity.deployDatapack',
        callback: (...args) => deployDatapack(<vscode.Uri[]>args[1])
    }, {
        name: 'vlocity.viewDatapack.generic',
        callback: (context, ...args) => viewDatapackGeneric(context)
    }
];
