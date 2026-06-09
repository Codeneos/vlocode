// import 'source-map-support/register';
import * as vscode from 'vscode';
import vlocityPackageManifest from 'vlocity/package.json';

import * as constants from './constants';
import { LogManager, LogLevel, Logger , ConsoleWriter, OutputChannelWriter, container, LifecyclePolicy, Container, NodeFileSystem } from '@vlocode/core';
import * as vlocityUtil from './lib/vlocity/vlocityLogging';
import { initializeContext } from './lib/vlocodeContext';
import { ConfigurationManager } from './lib/config';
import VlocodeService from './lib/vlocodeService';
import VlocodeConfiguration from './lib/vlocodeConfiguration';
import { getErrorMessage } from '@vlocode/util';
import { WorkspaceContextDetector } from './lib/workspaceContextDetector';
import { MetadataDetector } from './lib/salesforce/metadataDetector';
import { DatapackDetector } from './lib/vlocity/datapackDetector';

import HandleClassCreated from './events/onClassCreated';
import HandleTriggerCreated from './events/onTriggerCreated';
import HandleSalesforceFileDeleted from './events/onFileDeleted';
import OnSavedEventHandler from './events/onFileSaved';
import { ApexLogSymbolProvider } from './symbolProviders/apexLogSymbolProvider';
import OnMetadataRenamed from './events/onMetadataRenamed';
import OnDatapackRenamed from './events/onDatapackRenamed';
import { VlocityNamespaceService } from '@vlocode/vlocity';

import { ExecuteApiLensProvider } from './codeLensProviders/executeApiLensProvider';
import { TestCoverageLensProvider } from './codeLensProviders/testCoverageLensProvider';
import { PushSourceLensProvider } from './codeLensProviders/pushSourceLensProvider';

import { ActivityDataProvider } from './treeViews/dataProviders/activityDataProvider';
import { DatapackDataProvider } from './treeViews/dataProviders/datapackDataProvider';
import { DeveloperLogDataProvider } from './treeViews/dataProviders/developerLogDataProvider';
import { JobDataProvider } from './treeViews/dataProviders/jobDataProvider';

import { SalesforceApexContentProvider } from './contentProviders/salesforceApexContentProvider';
import { VirtualContentProvider } from './contentProviders/virtualApexContentProvider';

import { SfdxConfigManager } from './lib/sfdxConfigManager';
import { DataMapperEditorProvider } from './webviews/dataMapperEditorProvider';
import { DatapackEditorProvider } from './webviews/datapackEditorProvider';
import { IntegrationProcedureEditorProvider } from './webviews/integrationProcedureEditorProvider';
import { VlocodeLogLinkProvider } from './lib/vlocodeLogLinkProvider';
import { DatapackDefinitionRegistry } from './lib/vlocity/datapackDefinitionRegistry';

import './commands';

/**
 * Start time of the extension set when the bundled entrypoint is loaded by VSCode.
 * This is used to determine the startup time of the extension.
 */
declare const __vlocodeStartTime: number | undefined;

class VlocityLogFilter {
    private readonly vlocityLogFilterRegex = [
        /^(Initializing Project|Using SFDX|Salesforce Org|Continuing Export|Adding to File|Deploy [0-9]* Items).*/i,
        /^(Success|Remaining|Error).*?[0-9]+$/
    ];

    constructor() {
        // @ts-ignore
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
        const outputChannelWriter = this.service.registerDisposable(new OutputChannelWriter('Vlocode', {
            languageId: 'vlocode-log'
        }));

        LogManager.registerWriter({
            write: entry => outputChannelWriter.write(entry),
            focus: () => outputChannelWriter.focus(),
        });

        if (this.isDebug) {
            getErrorMessage.defaults.includeStack = true;
            LogManager.registerWriter(new ConsoleWriter());
        }

        // set logging level
        ConfigurationManager.onConfigChange(this.service.config, [ 'logLevel' ], config => LogManager.setGlobalLogLevel(LogLevel[config.logLevel]), { initial: true });

        // setup Vlocity logger and filters
        LogManager.registerFilter(LogManager.get('vlocity'), new VlocityLogFilter());
        vlocityUtil.setLogger(LogManager.get('vlocity'));
    }

    private configureLogLinkProvider() {
        let linkProviderRegistration: vscode.Disposable | undefined;

        this.service.registerDisposable(ConfigurationManager.onConfigChange(
            this.service.config,
            'enableLogLinks',
            ({ enableLogLinks }) => {
                if (enableLogLinks) {
                    linkProviderRegistration ??= VlocodeLogLinkProvider.register();
                } else {
                    linkProviderRegistration?.dispose();
                    linkProviderRegistration = undefined;
                }
            },
            { initial: true }
        ));
        this.service.registerDisposable({ dispose: () => linkProviderRegistration?.dispose() });
    }

    private configureDatapackExportDefinitions() {
        this.service.registerDisposable(container.get(DatapackDefinitionRegistry).initialize());
    }

    private activate(context: vscode.ExtensionContext) {
        // Check context flags
        this.isDebug = context.extensionMode > 1 || /--debug|--inspect-brk/.test(process.execArgv.join(' '));

        // All SFDX and Vlocity commands work better when we are running from the workspace folder
        vscode.workspace.onDidChangeWorkspaceFolders(this.setWorkingDirectory.bind(this));
        this.setWorkingDirectory();

        // Init logging and register services
        LogManager.registerWriterFor(Container, new ConsoleWriter());
        LogManager.setLogLevel(Container, LogLevel.verbose);
        container.registerProvider(Logger, LogManager.get.bind(LogManager));
        container.registerFactory(VlocodeConfiguration, () => ConfigurationManager.load<VlocodeConfiguration>(constants.CONFIG_SECTION), LifecyclePolicy.singleton);
        container.add(VlocityNamespaceService);
        container.add(NodeFileSystem);

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

        // register commands and windows
        this.service.registerDisposable(container.get(DatapackDataProvider).createTreeViewHost('datapackExplorer').register(vscode.window));
        this.service.registerDisposable(container.get(JobDataProvider).createTreeViewHost('jobExplorer').register(vscode.window));
        this.service.registerDisposable(container.get(ActivityDataProvider).createTreeViewHost('activityView').register(vscode.window));
        this.service.registerDisposable(container.get(DeveloperLogDataProvider).createTreeViewHost('developerLogsView').register(vscode.window));

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
        PushSourceLensProvider.register(this.service);
        SalesforceApexContentProvider.register(this.service);
        VirtualContentProvider.register(this.service);
        this.configureLogLinkProvider();
        this.configureDatapackExportDefinitions();
        this.service.registerDisposable(container.get(DataMapperEditorProvider).register());
        this.service.registerDisposable(container.get(IntegrationProcedureEditorProvider).register());
        this.service.registerDisposable(container.get(DatapackEditorProvider).register());

        // Watch conditionalContextMenus for changes
        ConfigurationManager.onConfigChange(this.service.config, 'conditionalContextMenus',
            config => vscode.commands.executeCommand('setContext', `${constants.CONTEXT_PREFIX}.conditionalContextMenus`, config.conditionalContextMenus), { initial: true });

        // watch for changes
        void this.service.registerDisposable(container.new(WorkspaceContextDetector, 'datapacks', DatapackDetector.filter()).initialize());
        void this.service.registerDisposable(container.new(WorkspaceContextDetector, 'metadata', MetadataDetector.filter()).initialize());
        void this.service.registerDisposable(container.get(SfdxConfigManager).initialize());

        // track activation time
        this.logger.focus();
        __vlocodeStartTime && this.logger.info(`Vlocode activated in ${Date.now() - __vlocodeStartTime}ms`);
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
