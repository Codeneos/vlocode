'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as path from 'path';
import * as process from 'process';
import constants from './constants';
import VlocodeService from './services/vlocodeService';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let helloCommand = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    let vloService = new VlocodeService();
    vloService.outputChannel.appendLine('Vlocode Started.');

    let runDataPackCommand = function(action: vlocity.actionType, options: vlocity.jobOptions) {
        process.chdir(vscode.workspace.rootPath);
        let vlocityBuildTools = new vlocity(options);       
        //vlocityBuildTools.tempFolder = path.join(context.storagePath, '.vlocity');
        return new Promise((resolve, reject) => vlocityBuildTools.checkLogin(resolve, reject)).then(() =>
            new Promise((resolve, reject) => {
                return vlocityBuildTools.datapacksjob.runJob(action, options, resolve, reject)
            })           
        );
    }

    let onDidSaveListner = vscode.workspace.onDidSaveTextDocument((textDocument: vscode.TextDocument) => {
        let datapackMatches = textDocument.fileName.match(/(.*)(\\|\/)(.*?)_DataPack\.json$/i);
        if (datapackMatches == null) {
            return;
        }
        let [,folder,,datapackName] = datapackMatches; 
        /*outputChannel.show();       
        outputChannel.appendLine('Deploying datapack ' + datapackName);
        runDataPackCommand(
            'Export', {
                sfdxUsername: 'peter.van.gulik@accenture.com.peter',
                verbose: true
            }
        ).catch(err => {
            console.error(err);
            outputChannel.appendLine(err);

        });*/
        
        //vscode.window.showInformationMessage(JSON.stringify(datapack));
        //vscode.
        //const toolingType: string = getAnyTTFromFolder(textDocument.uri);
        //return commandService.runCommand('ForceCode.compileMenu', textDocument);
        //vscode.window.showErrorMessage('The file you are trying to save to the server isn\'t in the current org\'s source folder (' + vscode.window.forceCode.projectRoot + ')');
    });

    context.subscriptions.push(helloCommand, onDidSaveListner);
}


// this method is called when your extension is deactivated
export function deactivate() {
}