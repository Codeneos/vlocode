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
import OnSavedEventHandler from 'events/onSavedEventHandler';
import JobExplorer from 'jobExplorer';

class Vlocode {

    constructor(private context: vscode.ExtensionContext) {
    }

    private get logger() {
        return LogManager.get('vlocode');
    } 

    private setWorkingDirectory() {
        if ((vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length) > 0) {
            this.logger.verbose(`Updating Vlocode workspace folder to: ${vscode.workspace.workspaceFolders[0].uri.fsPath}`);
            process.chdir(vscode.workspace.workspaceFolders[0].uri.fsPath);
        } else {
            this.logger.warn(`No workspace folders detected; Vlocode will not work properly without an active workspace`);
        }
    }

    public async activate() {
        // All SFDX and Vloctiy commands work better when we are running from the workspace folder
        vscode.workspace.onDidChangeWorkspaceFolders(this.setWorkingDirectory.bind(this));
        this.setWorkingDirectory();
        
        // Init logging and register services
        let vloConfig = new VlocodeConfiguration(constants.CONFIG_SECTION);
        let vloService = container.register(VlocodeService, new VlocodeService(container, this.context, vloConfig));
    
        // logging setup
        container.register(LogWriter, new ChainWriter(new ConsoleWriter(), new OutputChannelWriter(vloService.outputChannel)));
        LogManager.setGlobalLogLevel(vloConfig.verbose ? LogLevel.verbose : LogLevel.info); // todo: support more log levels from config section    
        vloConfig.watch(c => LogManager.setGlobalLogLevel(c.verbose ? LogLevel.verbose : LogLevel.info));
    
        this.logger.info(`Vlocode version ${constants.VERSION} started`);
        this.logger.info(`Using built tools version ${vlocityUtil.getBuildToolsVersion()}`);
        this.logger.verbose(`Verbose logging enabled`);
    
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

        // Salesforce support      
        vloConfig.watch(c => vloService.enabledSalesforceSupport(c.salesforceSupport));
        if (vloConfig.salesforceSupport) {
            vloService.enabledSalesforceSupport(true);
        }
    
        // register commands and windows
        container.get(CommandRouter).registerAll(Commands);
        vloService.registerDisposable(vscode.window.createTreeView('datapackExplorer', { 
            treeDataProvider: new DatapackExplorer(container), 
            showCollapseAll: true
        }));
        vloService.registerDisposable(vscode.window.createTreeView('jobExplorer', { 
            treeDataProvider: new JobExplorer(container)
        }));
        vloService.registerDisposable(new OnSavedEventHandler(vscode.workspace.onDidSaveTextDocument, container));
    }

    public deactivate() { 

    }
}

export = {
    instance: null,
    async activate(context: vscode.ExtensionContext) {
        return (this.instance = new Vlocode(context)).activate();        
    },
    deactivate() { 
        return this.instance.deactivate(); 
    }
}