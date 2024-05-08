// Easier debugging with source maps
import * as vscode from 'vscode';
import vlocityPackageManifest from 'vlocity/package.json';

import * as constants from './constants';
import { LogManager, LogLevel, Logger , ConsoleWriter, OutputChannelWriter, TerminalWriter , container, LifecyclePolicy, Container, FileSystem, NodeFileSystem } from '@vlocode/core';
import * as vlocityUtil from './lib/vlocity/vlocityLogging';
import { getContext, initializeContext } from './lib/vlocodeContext';
import { ConfigurationManager } from './lib/config';
import VlocodeService from './lib/vlocodeService';
import VlocodeConfiguration from './lib/vlocodeConfiguration';
import { getErrorMessage, lazy } from '@vlocode/util';
import { WorkspaceContextDetector } from './lib/workspaceContextDetector';
import { MetadataDetector } from './lib/salesforce/metadataDetector';
import { DatapackDetector } from './lib/vlocity/datapackDetector';

import DeveloperLogDataProvider from './treeDataProviders/developerLogDataProvider';
import ActivityDataProvider from './treeDataProviders/activityDataProvider';
import JobDataProvider from './treeDataProviders/jobExplorer';
import DatapackProvider from './treeDataProviders/datapackDataProvider';
import HandleClassCreated from './events/onClassCreated';
import HandleTriggerCreated from './events/onTriggerCreated';
import HandleSalesforceFileDeleted from './events/onFileDeleted';
import OnSavedEventHandler from './events/onFileSaved';
import { ApexLogSymbolProvider } from './symbolProviders/apexLogSymbolProvider';
import OnMetadataRenamed from './events/onMetadataRenamed';
import OnDatapackRenamed from './events/onDatapackRenamed';
import { VSCodeFileSystemAdapter } from './lib/fs/vscodeFileSystemAdapter';
import { NamespaceService } from '@vlocode/salesforce';
import { VlocityNamespaceService } from '@vlocode/vlocity';
import { SfdxConfigWatcher } from './lib/sfdxConfigWatcher';

import './commands';
import { ExecuteApiLensProvider } from './codeLensProviders/executeApiLensProvider';
import { TestCoverageLensProvider } from './codeLensProviders/testCoverageLensProvider';

/**
 * Start time of the extension set when the extension is packed by webpack when the entry point is loaded
 * by VSCode. This is used to determine the startup time of the extension.
 */
declare const __vlocodeStartTime: number | undefined;

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
    private isDebug: boolean;
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
        const terminalOptions = { 
            iconPath: {
                light: vscode.Uri.file(getContext().asAbsolutePath('resources/light/log-terminal.svg')),
                dark: vscode.Uri.file(getContext().asAbsolutePath('resources/dark/log-terminal.svg'))
            }
        };
        const terminalWriter = lazy(() => this.service.registerDisposable(new TerminalWriter('Vlocode', terminalOptions)));
        const outputChannelWriter = lazy(() => this.service.registerDisposable(new OutputChannelWriter('Vlocode')));
        let logInTerminal = this.service.config.logInTerminal;

        LogManager.registerWriter({
            write: entry => logInTerminal ? terminalWriter.write(entry) : outputChannelWriter.write(entry),
            focus: () => logInTerminal ? terminalWriter.focus() : outputChannelWriter.focus(),
        });

        if (this.isDebug) {
            getErrorMessage.defaults.includeStack = true;
            LogManager.registerWriter(new ConsoleWriter());
        }

        // set logging level
        ConfigurationManager.onConfigChange(this.service.config, [ 'logLevel' ], config => LogManager.setGlobalLogLevel(LogLevel[config.logLevel]), { initial: true });
        ConfigurationManager.onConfigChange(this.service.config, [ 'logInTerminal' ], config => logInTerminal = config.logInTerminal, { initial: true });

        // setup Vlocity logger and filters
        LogManager.registerFilter(LogManager.get('vlocity'), new VlocityLogFilter());
        vlocityUtil.setLogger(LogManager.get('vlocity'));
    }

    /**
     * Creates an instance of the Developer log panel and registers the required event handlers
     */
    private createDeveloperLogView() {
        const developerLogDataProvider = container.get(DeveloperLogDataProvider);
        const developerLogsView = vscode.window.createTreeView('developerLogsView', {
            treeDataProvider: developerLogDataProvider
        });
        developerLogsView.onDidChangeVisibility(e => {
            developerLogDataProvider.pauseAutoRefresh(!e.visible);
            if (e.visible) {
                developerLogDataProvider.refreshLogs({ refreshView: true });
            }
        });
        return developerLogsView;
    }

    private activate(context: vscode.ExtensionContext) {
        // Check context flags
        this.isDebug = context.extensionMode > 1 || /--debug|--inspect-brk/.test(process.execArgv.join(' '));
        if (this.isDebug) {
            import('source-map-support/register');
        }

        // All SFDX and Vlocity commands work better when we are running from the workspace folder
        vscode.workspace.onDidChangeWorkspaceFolders(this.setWorkingDirectory.bind(this));
        this.setWorkingDirectory();

        // Init logging and register services
        LogManager.registerWriterFor(Container, new ConsoleWriter());
        LogManager.setLogLevel(Container, LogLevel.verbose);
        container.registerProvider(Logger, LogManager.get.bind(LogManager));
        container.registerFactory(VlocodeConfiguration, () => ConfigurationManager.load<VlocodeConfiguration>(constants.CONFIG_SECTION), LifecyclePolicy.singleton);
        container.registerType(VSCodeFileSystemAdapter, [ FileSystem ], { priority: 100, lifecycle: LifecyclePolicy.singleton });
        container.registerType(VlocityNamespaceService, [ NamespaceService, VlocityNamespaceService ], { lifecycle: LifecyclePolicy.singleton });

        this.service = container.get(VlocodeService);
        context.subscriptions.push(this.service);

        initializeContext(context, this.service);
        this.startLogger();

        this.logger.info(`Vlocode version ${constants.VERSION} started`);
        this.logger.info(`Using built tools version ${vlocityPackageManifest.version}`);
        this.logger.verbose('Verbose logging enabled');

        // Salesforce support
        ConfigurationManager.onConfigChange(this.service.config.salesforce, 'enabled', c => this.service.enableSalesforceSupport(c.enabled));
        if (this.service.config.salesforce.enabled) {
            this.service.enableSalesforceSupport(true);
        }

        // Register switchable FS interface
        const fsProxy = container.registerProxyService(FileSystem);
        ConfigurationManager.onConfigChange(this.service.config, 'fsInterface', config => {
            this.logger.verbose(`Setting FS interface to ${config.fsInterface}`);
            config.fsInterface === 'vscode'
                ? fsProxy.setInstance(container.create(VSCodeFileSystemAdapter))
                : fsProxy.setInstance(container.create(NodeFileSystem));
        }, { initial: true, noInitialTimeout: true });

        // register commands and windows
        //this.service.commands.registerAll(Commands);
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
        const apexClassWatcher = this.service.registerDisposable(vscode.workspace.createFileSystemWatcher('**/classes/**/*.cls', false, true, false));
        this.service.registerDisposable(new HandleClassCreated(apexClassWatcher.onDidCreate, this.service));
        this.service.registerDisposable(new HandleSalesforceFileDeleted(apexClassWatcher.onDidDelete, this.service));

        // Watch Apex triggers
        const apexTriggerWatcher = this.service.registerDisposable(vscode.workspace.createFileSystemWatcher('**/triggers/**/*.trigger', false, true, false));
        this.service.registerDisposable(new HandleTriggerCreated(apexTriggerWatcher.onDidCreate, this.service));
        this.service.registerDisposable(new HandleSalesforceFileDeleted(apexTriggerWatcher.onDidDelete, this.service));

        // Watch any file saved
        this.service.registerDisposable(new OnSavedEventHandler(vscode.workspace.onDidSaveTextDocument, this.service));
        this.service.registerDisposable(new OnMetadataRenamed(vscode.workspace.onDidRenameFiles, this.service));
        this.service.registerDisposable(new OnDatapackRenamed(vscode.workspace.onDidRenameFiles, this.service));

        // Add apex LOG symbol provider
        try {
            ApexLogSymbolProvider.register(this.service);
        } catch(err) {
            this.logger.warn(`Unable to register symbol provider for APEX logs: ${err}`);
        }

        ExecuteApiLensProvider.register();
        TestCoverageLensProvider.register(this.service);

        // Watch conditionalContextMenus for changes
        ConfigurationManager.onConfigChange(this.service.config, 'conditionalContextMenus',
            config => vscode.commands.executeCommand('setContext', `${constants.CONTEXT_PREFIX}.conditionalContextMenus`, config.conditionalContextMenus), { initial: true });

        // watch for changes
        void this.service.registerDisposable(container.create(WorkspaceContextDetector, 'datapacks', DatapackDetector.filter()).initialize());
        void this.service.registerDisposable(container.create(WorkspaceContextDetector, 'metadata', MetadataDetector.filter()).initialize());
        void this.service.registerDisposable(container.create(SfdxConfigWatcher).initialize());

        // track activation time
        this.logger.focus();
        __vlocodeStartTime && this.logger.info(`Vlocode activated in ${Date.now() - __vlocodeStartTime}ms`);

        // Connect to SF
        void this.service.initialize();
    }

    private deactivate() {
        // Log to debug as other output channels will be disposed
        this.service.dispose();
    }

    static activate(context: vscode.ExtensionContext) {
        return new Vlocode().activate(context);
    }

    static deactivate() {
        return Vlocode.instance.deactivate();
    }
}

export function activate(context: vscode.ExtensionContext) {
    return Vlocode.activate(context);
}

export function deactivate() {
    console.log('deactivate');
    return Vlocode.deactivate();
}