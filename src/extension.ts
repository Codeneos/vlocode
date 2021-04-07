const startTime = Date.now(); // Track start up performance

import OnSavedEventHandler from 'events/onSavedEventHandler';
import HandleSalesforceFileDeleted from 'events/onFileDeleted';
import HandleTriggerCreated from 'events/onTriggerCreated';
import HandleClassCreated from 'events/onClassCreated';
import * as constants from '@constants';
import { LogManager, LogLevel, Logger } from 'lib/logging';
import { ConsoleWriter, OutputChannelWriter, TerminalWriter } from 'lib/logging/writers';
import Commands from 'commands';
import * as vlocityUtil from 'lib/vlocity/vlocityLogging';
import { initializeContext } from 'lib/vlocodeContext';
import DatapackProvider from 'treeDataProviders/datapackDataProvider';
import JobDataProvider from 'treeDataProviders/jobExplorer';
import ActivityDataProvider from 'treeDataProviders/activityDataProvider';
import { ConfigurationManager } from 'lib/configurationManager';
import * as vscode from 'vscode';
import * as vlocityPackageManifest from 'vlocity/package.json';
import DeveloperLogDataProvider from 'treeDataProviders/developerLogDataProvider';
import { container, LifecyclePolicy } from 'lib/core/container';
import VlocodeService from 'lib/vlocodeService';
import VlocodeConfiguration from 'lib/vlocodeConfiguration';
import { ApexLogSymbolProvider } from 'symbolProviders/apexLogSymbolProvider';
import { lazy } from 'lib/util/lazy';

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

class Vlocode {

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
        if (vscode.workspace.workspaceFolders?.length) {
            this.logger.verbose(`Updating Vlocode workspace folder to: ${vscode.workspace.workspaceFolders[0].uri.fsPath}`);
            process.chdir(vscode.workspace.workspaceFolders[0].uri.fsPath);
        } else {
            this.logger.warn('No workspace folders detected; Vlocode will not work properly without an active workspace');
        }
    }


    private startLogger() {
        // Simple switch that decides how to log
        const terminalWriter = lazy(() => this.service.registerDisposable(new TerminalWriter('Vlocode')));
        const outputChannelWriter = lazy(() => this.service.registerDisposable(new OutputChannelWriter('Vlocode')));
        let logInTerminal = false;

        LogManager.registerWriter({
            write: entry => logInTerminal ? terminalWriter.write(entry) : outputChannelWriter.write(entry),
            focus: () => logInTerminal ? terminalWriter.focus() : outputChannelWriter.focus(),
        }, new ConsoleWriter());

        // set logging level
        ConfigurationManager.watchProperties(this.service.config, [ 'logLevel' ], config => LogManager.setGlobalLogLevel(LogLevel[config.logLevel]), { initial: true });
        ConfigurationManager.watchProperties(this.service.config, [ 'logInTerminal' ], config => logInTerminal = config.logInTerminal, { initial: true });

        // setup Vlocity logger and filters
        LogManager.registerFilter(LogManager.get('vlocity'), new VlocityLogFilter());
        vlocityUtil.setLogger(LogManager.get('vlocity'));
    }

    /**
     * Creates an instance of the Developer log panel and regsiters the required event handlers
     */
    private createDeveloperLogView() {
        const developerLogDataProvider = container.get(DeveloperLogDataProvider);
        const developerLogsView = vscode.window.createTreeView('developerLogsView', {
            treeDataProvider: developerLogDataProvider
        });
        developerLogsView.onDidChangeVisibility(e => {
            developerLogDataProvider.pauseAutoRefresh(!e.visible);
        });
        return developerLogsView;
    }

    private async activate(context: vscode.ExtensionContext) {
        // All SFDX and Vlocity commands work better when we are running from the workspace folder
        vscode.workspace.onDidChangeWorkspaceFolders(this.setWorkingDirectory.bind(this));
        this.setWorkingDirectory();

        // Init logging and register services
        container.registerProvider(Logger, LogManager.get.bind(LogManager));
        container.registerFactory(VlocodeConfiguration, () => ConfigurationManager.load<VlocodeConfiguration>(constants.CONFIG_SECTION), LifecyclePolicy.singleton);

        this.service = container.get(VlocodeService);
        context.subscriptions.push(this.service);

        initializeContext(context, this.service);
        this.startLogger();

        this.logger.info(`Vlocode version ${constants.VERSION} started`);
        this.logger.info(`Using built tools version ${vlocityPackageManifest.version}`);
        this.logger.verbose('Verbose logging enabled');

        // Salesforce support
        ConfigurationManager.watchProperties(this.service.config, [ 'salesforce.enabled' ], c => this.service.enableSalesforceSupport(c.salesforce.enabled));
        if (this.service.config.salesforce.enabled) {
            this.service.enableSalesforceSupport(true);
        }

        // register commands and windows
        this.service.commands.registerAll(Commands);
        this.service.registerDisposable(vscode.window.createTreeView('datapackExplorer', {
            treeDataProvider: new DatapackProvider(this.service),
            showCollapseAll: true
        }));
        this.service.registerDisposable(vscode.window.createTreeView('jobExplorer', {
            treeDataProvider: new JobDataProvider(this.service)
        }));
        this.service.registerDisposable(vscode.window.createTreeView('activityView', {
            treeDataProvider: new ActivityDataProvider(this.service)
        }));
        this.service.registerDisposable(this.createDeveloperLogView());

        // Watch Apex classes
        const apexClassWatcher = this.service.registerDisposable(vscode.workspace.createFileSystemWatcher('**/classes/*.cls', false, true, false));
        this.service.registerDisposable(new HandleClassCreated(apexClassWatcher.onDidCreate, this.service));
        this.service.registerDisposable(new HandleSalesforceFileDeleted(apexClassWatcher.onDidDelete, this.service));

        // Watch Apex triggers
        const apexTriggerWatcher = this.service.registerDisposable(vscode.workspace.createFileSystemWatcher('**/triggers/*.trigger', false, true, false));
        this.service.registerDisposable(new HandleTriggerCreated(apexTriggerWatcher.onDidCreate, this.service));
        this.service.registerDisposable(new HandleSalesforceFileDeleted(apexTriggerWatcher.onDidDelete, this.service));

        // Watch any file saved
        this.service.registerDisposable(new OnSavedEventHandler(vscode.workspace.onDidSaveTextDocument, this.service));

        // Add apex LOG symbol provider
        try {
            this.service.registerDisposable(vscode.languages.registerDocumentSymbolProvider({ language: 'apexlog' }, new ApexLogSymbolProvider()));
        } catch(err) {
            this.logger.warn(`Unable to regsiter symbol provider for APEX logs: ${err}`);
        }

        // track activation time
        this.logger.focus();
        this.logger.info(`Vlocode activated in ${Date.now() - startTime}ms`);

        // Connect to SF
        void this.service.initialize();
    }

    private async deactivate() {
        // Log to debug as other output channels will be disposed
        this.service.dispose();
        console.debug('Vlocode extension deactivated');
    }

    static activate(context: vscode.ExtensionContext) {
        return new Vlocode().activate(context);
    }

    static deactivate() {
        return Vlocode.instance.deactivate();
    }
};

export function activate(context: vscode.ExtensionContext) {
    return Vlocode.activate(context);
}

export function deactivate() {
    return Vlocode.deactivate();
}