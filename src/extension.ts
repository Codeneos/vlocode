const startTime = Date.now(); // Track start up performance

import * as vscode from 'vscode';
import VlocodeConfiguration from './models/vlocodeConfiguration';
import VlocodeService from './services/vlocodeService';
import * as constants from '@constants';
import { LogManager, LogFilter, LogLevel }  from 'logging';
import { ConsoleWriter, OutputChannelWriter, TerminalWriter }  from 'logging/writers';
import CommandRouter from './services/commandRouter';
import Commands from 'commands';
import { container } from 'serviceContainer';
import * as vlocityUtil from 'vlocityUtil';
import * as fs from 'fs-extra';
import OnSavedEventHandler from 'events/onSavedEventHandler';
import { setInterval } from 'timers';
import VlocodeContext from 'models/vlocodeContext';
import DatapackProvider from 'treeDataProviders/datapackDataProvider';
import JobDataProvider from 'treeDataProviders/jobExplorer';
import ActivityDataProvider from 'treeDataProviders/activityDataProvider';

class VlocityLogFilter {
    private readonly vlocityLogFilterRegex = [
        /^(Initializing Project|Using SFDX|Salesforce Org|Continuing Export|Adding to File|Deploy [0-9]* Items).*/i,
        /^(Success|Remaining|Error).*?[0-9]+$/
    ];

    constructor() {
        return this.filter.bind(this);
    }

    public filter({ logger, args }) {
        if (LogManager.getLogLevel(logger.name) >= LogLevel.verbose) {
            return true;
        }
        return !this.vlocityLogFilterRegex.some(r => r.test(args.join(' ')));
    }
}

export = class Vlocode {

    private static instance: Vlocode;
    private service: VlocodeService;

    constructor() {
        if (!Vlocode.instance) {
            Vlocode.instance = this;
        }
        return Vlocode.instance;
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

    private setupLogging() {
        // Simple switch that decides how to log
        const terminalWriter = this.service.registerDisposable(new TerminalWriter(`Vlocode`));
        const outputChannelWriter = this.service.registerDisposable(new OutputChannelWriter(`Vlocode`));

        LogManager.registerWriter({
            write: (entry) => {
                if (this.service.config.logInTerminal) {
                    terminalWriter.write(entry);
                } else {
                    outputChannelWriter.write(entry);
                }
            }
        }, new ConsoleWriter());

        // set logging level
        LogManager.setGlobalLogLevel(this.service.config.verbose ? LogLevel.verbose : LogLevel.info); // todo: support more log levels from config section    
        this.service.config.watch(c => LogManager.setGlobalLogLevel(c.verbose ? LogLevel.verbose : LogLevel.info));

        // setup Vlocity logger and filters
        LogManager.registerFilter(LogManager.get('vlocity'), new VlocityLogFilter());
        vlocityUtil.setVlocityLogger(LogManager.get('vlocity'));
    }

    private async activate(context: vscode.ExtensionContext) {
        // All SFDX and Vloctiy commands work better when we are running from the workspace folder
        vscode.workspace.onDidChangeWorkspaceFolders(this.setWorkingDirectory.bind(this));
        this.setWorkingDirectory();
        
        // Init logging and register services
        let vloConfig = new VlocodeConfiguration(constants.CONFIG_SECTION);
        this.service = container.register(VlocodeService, new VlocodeService(container, vloConfig, VlocodeContext.createFrom(context)));
        context.subscriptions.push(this.service);
        this.setupLogging();
    
        this.logger.info(`Vlocode version ${constants.VERSION} started`);
        this.logger.info(`Using built tools version ${vlocityUtil.getBuildToolsVersion()}`);
        this.logger.verbose(`Verbose logging enabled`);
        
        // Salesforce support      
        vloConfig.watch(c => this.service.enabledSalesforceSupport(c.salesforceSupport));
        if (vloConfig.salesforceSupport) {
            this.service.enabledSalesforceSupport(true);
        }
    
        // register commands and windows
        container.get(CommandRouter).registerAll(Commands);
        this.service.registerDisposable(vscode.window.createTreeView('datapackExplorer', { 
            treeDataProvider: new DatapackProvider(container), 
            showCollapseAll: true
        }));
        this.service.registerDisposable(vscode.window.createTreeView('jobExplorer', { 
            treeDataProvider: new JobDataProvider(container)
        }));
        this.service.registerDisposable(vscode.window.createTreeView('activityView', { 
            treeDataProvider: new ActivityDataProvider(container)
        }));
        this.service.registerDisposable(new OnSavedEventHandler(vscode.workspace.onDidSaveTextDocument, container));

        // track activation time
        this.logger.info(`Vlocode activated in ${Date.now() - startTime}ms`);
    }

    private async deactivate() {
        // Log to debug as other output channels will be disposed
        Vlocode.instance = null; // destroy instance
        console.debug(`Vlocode extension deactivated`);
    }

    static activate(context: vscode.ExtensionContext) {
        return new Vlocode().activate(context);        
    }

    static deactivate() {
        return Vlocode.instance.deactivate();        
    }
};