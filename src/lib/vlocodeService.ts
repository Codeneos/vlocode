import * as vscode from 'vscode';
import * as jsforce from 'jsforce';
import { VlocodeCommand, NAMESPACE_PLACEHOLDER } from '@constants';
import { VlocodeActivity, VlocodeActivityStatus } from 'lib/vlocodeActivity';
import { observeArray, ObservableArray, observeObject, Observable } from 'lib/util/observer';
import VlocodeConfiguration from './vlocodeConfiguration';
import VlocityDatapackService from './vlocity/vlocityDatapackService';
import { Logger } from './logging';
import JsForceConnectionProvider from './salesforce/connection/jsForceConnectionProvider';
import SfdxConnectionProvider from './salesforce/connection/sfdxConnectionProvider';
import SalesforceService from './salesforce/salesforceService';
import { ConfigurationManager } from './configurationManager';
import CommandRouter from './commandRouter';
import { HookManager } from './util/hookManager';
import Timer from './util/timer';
import * as chalk from 'chalk';
import { service } from './core/inject';
import { container } from './core/container';
import { VlocityNamespaceService } from './vlocity/vlocityNamespaceService';

interface ActivityOptions {
    progressTitle: string;
    activityTitle?: string;
    cancellable: boolean;
    location: vscode.ProgressLocation;
    /** Task runner throws exceptions back to so they can be caught by the called */
    propagateExceptions?: boolean;
}

@service({ provides: [JsForceConnectionProvider, VlocodeService] })
export default class VlocodeService implements vscode.Disposable, JsForceConnectionProvider {

    // Privates
    private disposables: {dispose() : any}[] = [];
    private statusBar: vscode.StatusBarItem;
    private apiStatus: vscode.StatusBarItem;
    private connector: JsForceConnectionProvider;

    private readonly connectionHooks = new HookManager<jsforce.Connection>();
    private readonly commandRouter = new CommandRouter(this);
    private readonly diagnostics: { [key : string] : vscode.DiagnosticCollection } = {};
    private readonly activitiesChangedEmitter = new vscode.EventEmitter<VlocodeActivity[]>();
    private readonly namespaceSymbol = Symbol();

    // Publics
    public readonly activities: ObservableArray<Observable<VlocodeActivity>> = observeArray([]);
    public readonly onActivitiesChanged = this.activitiesChangedEmitter.event;

    // Properties
    private _datapackService: VlocityDatapackService;
    public get datapackService(): VlocityDatapackService {
        return this._datapackService;
    }

    private _salesforceService: SalesforceService;
    public get salesforceService(): SalesforceService {
        return this._salesforceService;
    }

    private _namespaceService: VlocityNamespaceService;
    public get vlocityNamespace(): VlocityNamespaceService {
        return this._namespaceService;
    }

    public get connected() : boolean {
        return !!this._datapackService;
    }

    public get commands() : CommandRouter {
        return this.commandRouter;
    }

    // Ctor + Methods
    constructor(public readonly config: VlocodeConfiguration, private readonly logger: Logger) {
        this.registerDisposable(this.createConfigWatcher());
        this.connectionHooks.registerHook({ pre: this.updateNamespaceHook.bind(this) });
    }

    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];
        if (this._datapackService) {
            this._datapackService.dispose();
            delete this._datapackService;
        }
    }

    public async initialize() {
        this.showStatus('$(sync) Connecting to Salesforce...');
        try {
            delete this.connector;
            if (this._salesforceService) {
                container.unregister(this._salesforceService);
            }
            if (this._namespaceService) {
                container.unregister(this._namespaceService);
            }
            if (this._datapackService) {
                container.unregister(this._datapackService);
                this._datapackService.dispose();
            }
            if (this.config.sfdxUsername) {
                this._namespaceService = await container.get(VlocityNamespaceService).initialize(this);
                this._salesforceService = container.get(SalesforceService);
                this._datapackService = await container.get(VlocityDatapackService).initialize();
            }
            this.updateStatusBar(this.config);
        } catch (err) {
            console.error(err);
            this.logger.error(err.message);
            if (err?.message == 'NamedOrgNotFound') {
                this.showStatus(`$(error) Unknown Salesforce user: ${this.config.sfdxUsername}`, VlocodeCommand.selectOrg);
            } else {
                this.showStatus('$(alert) Could not connect to Salesforce', VlocodeCommand.selectOrg);
            }
        }
    }

    public getDiagnostics(name : string): vscode.DiagnosticCollection {
        if (this.diagnostics[name]) {
            return this.diagnostics[name];
        }
        return this.registerDisposable(this.diagnostics[name] = vscode.languages.createDiagnosticCollection(name));
    }

    public showStatus(text: string, command?: VlocodeCommand | string | undefined) : void {
        if (!this.statusBar) {
            this.statusBar = this.registerDisposable(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10));
        }
        this.statusBar.command = command;
        this.statusBar.text = text;
        this.statusBar.show();
    }

    private showApiVersionStatusItem() : void {
        if (!this.apiStatus) {
            this.apiStatus = this.registerDisposable(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 9));
        }
        this.apiStatus.command = VlocodeCommand.selectApiVersion;
        this.apiStatus.text = this.config.salesforce.apiVersion || 'Select Salesforce API Version';
        this.apiStatus.show();
    }

    public hideStatus() : void {
        if (this.statusBar) {
            this.statusBar.hide();
        }
    }

    /**
     * Thin wrapper around `vscode.window.withProgress` with location `Notification` and cancellable `false`. 
     * @param title Title of the task
     * @param task task to run
     */
    public withProgress<T>(title: string, task: ((progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>) | Promise<T>) : Promise<T> {
        return this.withActivity({
            progressTitle: title,
            cancellable: false,
            location: vscode.ProgressLocation.Notification
        }, typeof task === 'function' ? task : () => task);
    }

    /**
     * Thin wrapper around `vscode.window.withProgress` with location `Notification` and cancellable `true`. 
     * @param title Title of the task
     * @param task task to run
     */
    public withCancelableProgress<T>(title: string, task: (progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken) => Promise<T>) : Promise<T> {
        return this.withActivity({
            progressTitle: title,
            cancellable: true,
            location: vscode.ProgressLocation.Notification
        }, task);
    }

    /**
     * Thin wrapper around `vscode.window.withProgress` with location `Window` and cancellable `false`. 
     * @param title Title of the task
     * @param task task to run
     */
    public withStatusBarProgress<T>(title: string, task: ((progress: vscode.Progress<{ message?: string }>) => Promise<T>) | Promise<T>) : Promise<T> {
        return this.withActivity({
            progressTitle: title,
            cancellable: true,
            location: vscode.ProgressLocation.Window
        }, typeof task === 'function' ? task : () => task);
    }

    /**
     * Wrapper around `vscode.window.withProgress` that registers the task as an activity visisble in the activity exporer if used.
     * @param options Activity options
     * @param task Task to run
     */
    public withActivity<T>(
        options: ActivityOptions,
        task: (progress: vscode.Progress<{ message?: string; increment?: number }>, token?: vscode.CancellationToken) => Promise<T>) : Promise<T> {

        // Create activity record to track activity progress
        const cancelTokenSource = options.cancellable ? new vscode.CancellationTokenSource() : undefined;
        const onCompleteEmitter = new vscode.EventEmitter<VlocodeActivity>();
        const activityRecord = observeObject({
            startTime: Date.now(),
            endTime: -1,
            cancellable: options.cancellable,
            title: options.activityTitle || options.progressTitle,
            status: VlocodeActivityStatus.Pending,
            onComplete: onCompleteEmitter.event,
            cancel() {
                cancelTokenSource?.cancel();
            },
            dispose() {
                cancelTokenSource?.dispose();
                onCompleteEmitter.dispose();
            }
        });

        // anon-function that is going to run our task
        const taskRunner = async (progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken) => {
            token?.onCancellationRequested(() => cancelTokenSource && !cancelTokenSource.token.isCancellationRequested && cancelTokenSource.cancel());
            activityRecord.status = VlocodeActivityStatus.InProgress;
            try {
                const result = await task(progress, cancelTokenSource?.token);
                activityRecord.status = cancelTokenSource?.token.isCancellationRequested
                    ? VlocodeActivityStatus.Cancelled : VlocodeActivityStatus.Completed;
                return result;
            } catch(e) {
                activityRecord.status = cancelTokenSource?.token.isCancellationRequested
                    ? VlocodeActivityStatus.Cancelled : VlocodeActivityStatus.Failed;
                if (options.propagateExceptions) {
                    throw e;
                } else {
                    this.logger.error(e);
                }
            } finally {
                activityRecord.endTime = Date.now();
                onCompleteEmitter.fire(activityRecord);
            }
        };

        this.activities.push(activityRecord);
        this.registerDisposable(activityRecord);

        return vscode.window.withProgress({
            title: options.progressTitle || options.activityTitle,
            cancellable: options.cancellable,
            location: options.location
        }, taskRunner) as Promise<T>;
    }

    public async getJsForceConnection() : Promise<jsforce.Connection> {
        if (this.connector == null) {
            if (!this.config.sfdxUsername) {
                throw new Error('Cannot connect to Salesforce; no username specified in configuration');
            }
            const connectorHooks = new HookManager<SfdxConnectionProvider>().registerHook({
                post: args => {
                    if (args.name === 'getJsForceConnection') {
                        args.returnValue = args.returnValue
                            .then(connection => this.initializeNamespace(connection))
                            .then(connection => this.connectionHooks.attach(connection));
                    }
                }
            });
            this.connector = connectorHooks.attach(new SfdxConnectionProvider(this.config.sfdxUsername));
        }
        const conn = await this.connector.getJsForceConnection();
        return conn;
    }

    private async initializeNamespace(connection: jsforce.Connection) {
        if (connection[this.namespaceSymbol]) {
            // Namespace is already initialized directly return our connection
            return connection;
        }

        // Init namespace by query a Vlocity class similar as to what is done in the build tools
        const timer = new Timer();
        const results = await connection.query<{ NamespacePrefix: string }>('select NamespacePrefix from ApexClass where name = \'DRDataPackService\' limit 1');

        if (results.totalSize == 0) {
            // This usually happens when there is no VLocity package installed
            this.logger.warn('Unable to detect Vlocity Managed Package on target org, is Vlocity installed?');
        } else {
            // Define a readonly property that cannot be overwritten or changed using
            // a unique symbol only known to this class instance
            Object.defineProperty(connection, this.namespaceSymbol, {
                value: results.records[0].NamespacePrefix,
                writable: false,
                configurable: false
            });
            this.logger.info(`Initialized Vlocity namespace to ${chalk.bold(results.records[0].NamespacePrefix)} [${timer.stop()}]`);
        }

        return connection;
    }

    private updateNamespaceHook({ target, args }) {
        if (target[this.namespaceSymbol]) {
            for (let i = 0; i < args.length; i++) {
                if (typeof args[i] === 'string') {
                    args[i] = args[i].replace(NAMESPACE_PLACEHOLDER, target[this.namespaceSymbol]);
                }
            }
        }
    }

    /**
     * Get the body of a document as string
     * @param file file name
     */
    public async getDocumentBodyAsString(file: string) : Promise<string> {
        const doc = vscode.workspace.textDocuments.find(doc => doc.fileName == file);
        if (doc) {
            return doc.getText();
        }
        return (await vscode.workspace.fs.readFile(vscode.Uri.file(file))).toString();
    }

    private updateStatusBar(config: VlocodeConfiguration) {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length == 0) {
            return this.hideStatus();
        }
        if (!config.sfdxUsername ) {
            return this.showStatus('$(gear) Select Vlocity org', VlocodeCommand.selectOrg);
        }
        return this.showStatus(`$(cloud-upload) Vlocode ${config.sfdxUsername}`, VlocodeCommand.selectOrg);
    }

    public registerDisposable<T extends  {dispose() : any}>(disposable: T) : T {
        this.disposables.push(disposable);
        return disposable;
    }

    private createConfigWatcher() : vscode.Disposable {
        this.updateStatusBar(this.config);
        this.showApiVersionStatusItem();
        return ConfigurationManager.watchProperties(this.config, [ 'sfdxUsername', 'projectPath', 'customJobOptionsYaml', 'salesforce.apiVersion' ], async () => {
            this.showStatus('$(sync) Processing config changes...', VlocodeCommand.selectOrg);
            await this.initialize();
            this.showApiVersionStatusItem();
        });
    }

    public async validateSalesforceConnectivity() : Promise<string | undefined> {
        if (!this.config.sfdxUsername) {
            return 'Select a Salesforce instance for this workspace to use Vlocode';
        }
        if (!this.connected) {
            await this.initialize();
            if (!this.connected) {
                return 'Unable to connect to Salesforce; are you connected to the Internet?';
            }
        }
        if (!await this.datapackService.isVlocityPackageInstalled()) {
            return 'The Vlocity managed package is not installed on your Salesforce instance; select a different Salesforce instance or install Vlocity';
        }
    }

    public validateWorkspaceFolder() : string | undefined {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length == 0) {
            return 'No workspace folders detected. Open at least one folder in the current workspace to use Vlocode.';
        }
    }

    public async validateAll(throwException: boolean) : Promise<string | void> {
        const validationResult = this.validateWorkspaceFolder() || await this.validateSalesforceConnectivity();
        if (validationResult) {
            if (throwException) {
                throw Error(validationResult);
            }
            return validationResult;
        }
    }

    public enableSalesforceSupport(support: boolean) {
        if (this.config.salesforce.enabled !== support) {
            this.config.salesforce.enabled = support;
        }
        void vscode.commands.executeCommand('setContext', 'vlocodeSalesforceSupport', support);
        this.logger.info(`Salesforce support ${support ? chalk.green('enabled') : chalk.red('disabled')}`);
    }

    public enableDeveloperLogsPanel(enabled: boolean) {
        if (this.config.salesforce.developerLogsVisible !== enabled) {
            this.config.salesforce.developerLogsVisible = enabled;
        }
        void vscode.commands.executeCommand('setContext', 'vlocodeSalesforceDeveloperLogs', enabled);
        this.logger.info(`Salesforce developer logs view ${enabled ? chalk.green('enabled') : chalk.red('disabled')}`);
    }
}

