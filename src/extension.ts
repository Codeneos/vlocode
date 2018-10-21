'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as path from 'path';
import * as process from 'process';
import constants from './constants';
import VlocodeConfiguration from './models/VlocodeConfiguration';
import VlocodeService from './services/vlocodeService';
import * as vds from './services/vlocityDatapackService';
import * as s from './singleton';
import * as c from './commands';
import * as l from './loggers';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Init extension
    let vloService = s.register(VlocodeService, new VlocodeService(VlocodeConfiguration.load()));
    let logger = s.register(l.Logger, new l.ChainLogger( 
        new l.OutputLogger(vloService.outputChannel),  
        new l.ConsoleLogger()        
    ));
    
    // Report some thing so that the users knows we are active
    logger.info('Vlocode Started: version 0.0.1');
    let vlocityLogFilterRegex = [
        /^(Current Status|Elapsed Time|Version Info|Initializing Project|Using SFDX|Salesforce Org|Continuing Export|Adding to File|Deploy).*/,
        /^(Success|Remaining|Error).*?[0-9]+$/
    ]
    vds.setLogger(new l.LogFilterDecorator(logger, (...args) => {
        return !vlocityLogFilterRegex.some(r => r.test(args[0]));
    }));

    // Resgiter all datapack commands from the commands file
    c.datapackCommands
        .map(cmd => {
            logger.info(`Register command ${cmd.name}`);
            return vscode.commands.registerCommand(cmd.name, (...args) => {                
                logger.info(`Invoke command ${cmd.name}`);
                try {
                    cmd.callback.apply(null, args);
                } catch(err) {
                    logger.info(`Command execution resulted in error: ${err}`);
                }
            });
        })
        .forEach(sub => context.subscriptions.push(sub));

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
    context.subscriptions.push(onDidSaveListner);
}


// this method is called when your extension is deactivated
export function deactivate() {
}