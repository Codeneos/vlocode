import * as vscode from 'vscode';
import VlocodeConfiguration from './models/vlocodeConfiguration';
import VlocodeService from './services/vlocodeService';
import * as constants from './constants';
import { LogManager, LogWriter, ChainWriter, ConsoleWriter, OutputChannelWriter, LogLevel }  from './loggers';
import CommandRouter from './services/commandRouter';
import DatapackExplorer from 'datapackExplorer';
import Commands from 'commands';
import { container } from 'serviceContainer';
import * as vlocityUtil from 'vlocityUtil';
import * as fs from 'fs-extra';
import DatapackSavedEventHandler from 'events/datapackSavedEventHandler';

const getLogger = () => LogManager.get('vlocode');

function setWorkingDirectory() {
    if ((vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length) > 0) {
        getLogger().verbose(`Updating Vlocode workspace folder to: ${vscode.workspace.workspaceFolders[0].uri.fsPath}`);
        process.chdir(vscode.workspace.workspaceFolders[0].uri.fsPath);
    } else {
        getLogger().warn(`No workspace folders detected; Vlocode will not work properly without an active workspace`);
    }
}

export async function activate(context: vscode.ExtensionContext) : Promise<void> {
    // All SFDX and Vloctiy commands work better when we are running from the workspace folder
    vscode.workspace.onDidChangeWorkspaceFolders(setWorkingDirectory);
    setWorkingDirectory();
    
    // Init logging and register services
    let vloConfig = new VlocodeConfiguration(constants.CONFIG_SECTION);
    let vloService = container.register(VlocodeService, new VlocodeService(container, context, vloConfig));

    // logging setup
    container.register(LogWriter, new ChainWriter(new ConsoleWriter(), new OutputChannelWriter(vloService.outputChannel)));
    LogManager.setGlobalLogLevel(vloConfig.verbose ? LogLevel.verbose : LogLevel.info); // todo: support more log levels from config section    
    vloConfig.watch(c => LogManager.setGlobalLogLevel(c.verbose ? LogLevel.verbose : LogLevel.info));

    getLogger().info(`Vlocode version ${constants.VERSION} started`);
    getLogger().info(`Using built tools version ${vlocityUtil.getBuildToolsVersion()}`);
    getLogger().verbose(`Verbose logging enabled`);

    // setup Vlocity logger and filters
    const vlocityLogFilterRegex = [
        /^(Initializing Project|Using SFDX|Salesforce Org|Continuing Export|Adding to File|Deploy [0-9]* Items).*/i,
        /^(Success|Remaining|Error).*?[0-9]+$/
    ];
    LogManager.registerFilter('vlocity', (_level, ...args: any[]) => {
        if (LogManager.getGlobalLogLevel() >= LogLevel.verbose) {
            return true;
        }
        return !vlocityLogFilterRegex.some(r => r.test(args.join(' ')));
    });
    vlocityUtil.setVlocityLogger(LogManager.get('vlocity'));

    // register commands and windows
    container.get(CommandRouter).registerAll(Commands);
    vloService.registerDisposable(vscode.window.createTreeView('datapackExplorer', { 
        treeDataProvider: new DatapackExplorer(container), 
        showCollapseAll: true 
    }));
    vloService.registerDisposable(new DatapackSavedEventHandler(vscode.workspace.onDidSaveTextDocument, container));
}

export function deactivate() { }