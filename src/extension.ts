'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, ExtensionContext } from 'vscode';
import * as vlocity from 'vlocity';
import * as path from 'path';
import * as process from 'process';
import * as constants from './constants';
import VlocodeConfiguration from './models/VlocodeConfiguration';
import VlocodeService from './services/vlocodeService';
import * as vds from './services/vlocityDatapackService';
import * as s from './singleton';
import * as l from './loggers';
import { DatapackExplorer } from './datapackExplorer';
import { DatapackCommands } from './commands';

export function activate(context: ExtensionContext) : void {

    // Init logging and regsiter services
    let vloService = s.register(VlocodeService, new VlocodeService(context, VlocodeConfiguration.fromWorkspaceConfiguration(constants.CONFIG_SECTION)));
    let logger = s.register(l.Logger, new l.ChainLogger( 
        new l.OutputLogger(vloService.outputChannel),  
        new l.ConsoleLogger()        
    ));

    // Report some thing so that the users knows we are active
    logger.info(`Vlocode version ${constants.VERSION} started`);
    const vlocityLogFilterRegex = [
        /^(Current Status|Elapsed Time|Version Info|Initializing Project|Using SFDX|Salesforce Org|Continuing Export|Adding to File|Deploy).*/,
        /^(Success|Remaining|Error).*?[0-9]+$/
    ];
    vds.setLogger(new l.ChainLogger( 
        new l.LogFilterDecorator(new l.OutputLogger(s.get(VlocodeService).outputChannel), (args: any[]) => 
            !vlocityLogFilterRegex.some(r => r.test(args.join(' ')))
        ),  
        new l.ConsoleLogger()
    )); 

    // Regsiter commands
    vloService.registerDisposable(window.registerTreeDataProvider('datapackExplorer', new DatapackExplorer()));
    DatapackCommands.forEach(cmd => vloService.registerCommand(cmd));
}

export function deactivate() { }