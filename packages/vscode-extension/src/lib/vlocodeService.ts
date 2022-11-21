import * as vscode from 'vscode';
import * as jsforce from 'jsforce';
import { CONFIG_SECTION, CONTEXT_PREFIX, VlocodeCommand } from '@constants';
import { Activity as ActivityTask, ActivityOptions, ActivityProgress, CancellableActivity, NoncancellableActivity, VlocodeActivity, VlocodeActivityStatus } from '@lib/vlocodeActivity';
import { observeArray, ObservableArray, observeObject, Observable , HookManager , sfdx , isPromise , intersect, options, poll, getErrorMessage } from '@vlocode/util';
import * as chalk from 'chalk';
import { Logger , injectable , container } from '@vlocode/core';
import VlocodeConfiguration from './vlocodeConfiguration';
import VlocityDatapackService from './vlocity/vlocityDatapackService';
import { ConfigurationManager } from './config';
import CommandRouter from './commandRouter';
import { SalesforceConnectionProvider, SalesforceService, SfdxConnectionProvider } from '@vlocode/salesforce';
import { VlocityMatchingKeyService, VlocityNamespaceService } from '@vlocode/vlocity-deploy';

@injectable({ provides: [SalesforceConnectionProvider, VlocodeService] })
export default class VlocodeService implements vscode.Disposable, SalesforceConnectionProvider {

    // Privates
    private disposables: { dispose() : any }[] = [];
    private statusItems: { [id: string] : vscode.StatusBarItem } = {};
    private connector?: SalesforceConnectionProvider;

    private readonly connectionHooks = new HookManager<jsforce.Connection>();
    private readonly diagnostics: { [key : string] : vscode.DiagnosticCollection } = {};
    private readonly activitiesChangedEmitter = new vscode.EventEmitter<VlocodeActivity[]>();
    @injectable.property private readonly nsService: VlocityNamespaceService;

    // Publics
    public readonly activities: ObservableArray<Observable<VlocodeActivity>> = observeArray([]);
    public readonly onActivitiesChanged = this.activitiesChangedEmitter.event;

    // Properties
    private _datapackService?: VlocityDatapackService;
    public get datapackService(): VlocityDatapackService {
        if (!this._datapackService) {
            console.debug(`Accessing VlocityDatapackService before it Vlocode is initialized from:\n`, new Error().stack);
            throw new Error('Vlocode is not initialized; VlocityDatapackService is null');
        }
        return this._datapackService;
    }

    private _salesforceService?: SalesforceService;
    public get salesforceService(): SalesforceService {
        if (!this._salesforceService) {
            console.debug(`Accessing SalesforceService before it Vlocode is initialized from:\n`, new Error().stack);
            throw new Error('Vlocode is not initialized; SalesforceService is null');
        }
        return this._salesforceService;
    }

    public get commands() : CommandRouter {
        return this.commandRouter;
    }

    // Ctor + Methods
    constructor(
        public readonly config: VlocodeConfiguration,
        private readonly commandRouter: CommandRouter,
        private readonly logger: Logger) {
        this.createConfigWatcher();
        this.connectionHooks.registerHook({ pre: this.updateNamespaceHook.bind(this) });
    }

    public dispose() {
        console.log('dispose service');
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];
        if (this._datapackService) {
            this._datapackService.dispose();
            delete this._datapackService;
        }
    }

    public async initialize() {
        this.showStatus('$(sync~spin) Connecting to Salesforce...');
        try {
            delete this.connector;
            if (this._salesforceService) {
                container.unregister(this._salesforceService);
            }
            if (this._datapackService) {
                container.unregister(this._datapackService);
            }
            if (this.config.sfdxUsername) {
                this._salesforceService = container.get(SalesforceService);
                this.showStatus('$(sync~spin) Initializing datapack services...');
                await this.nsService.initialize(this._salesforceService);
                this._datapackService = await container.get(VlocityDatapackService).initialize();
                await container.get(VlocityMatchingKeyService).initialize();
            }
            this.updateExtensionStatus(this.config);
        } catch (err) {
            this.logger.debug(err);
            if (err?.message == 'NamedOrgNotFound') {
                this.logger.error(`Unknown username/alias ${this.config.sfdxUsername} -- select a different org or re-authenticate with the target org`);
                this.showStatus(`$(error) Unknown Salesforce user - ${this.config.sfdxUsername}`, VlocodeCommand.selectOrg);
            } else if (err?.message == 'The org cannot be found') {
                this.logger.error(err?.message);
                this.showStatus(`$(error) Org not found - ${this.config.sfdxUsername}`, VlocodeCommand.selectOrg);
            } else if (err?.name === 'invalid_grant' || err?.message == 'RefreshTokenAuthError') {                
                this.logger.error(`Authorization token expired for ${this.config.sfdxUsername} -- select a different org or re-authenticate with the target org`);
                this.showStatus(`$(key) Authorization expired - ${this.config.sfdxUsername}`, VlocodeCommand.selectOrg);
            } else if (err?.code == 'ENOTFOUND') {
                this.logger.error(`Unable to reach Salesforce; are you connected to the internet?`);
                this.showStatus(`$(cloud-offline) Unable to reach Salesforce`, VlocodeCommand.selectOrg);
            } else {                
                this.logger.error(err);
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

    public showStatus(text: string, command?: VlocodeCommand) : void {
        this.createUpdateStatusBarItem(
            'connection', {
                text, command,
                tooltip: command ? 'Click to select a different Salesforce org for Vlocode' : undefined
            }
        );
    }

    private showApiVersionStatusItem() : void {
        this.createUpdateStatusBarItem(
            'apiVersion', {
                text: this.config.salesforce.apiVersion ?? 'Select Salesforce API Version',
                tooltip: `Currently using API version ${this.config.salesforce.apiVersion}, click to select a different API version`,
                command: VlocodeCommand.selectApiVersion
            }
        );
    }

    public getStatusText() : string {
        return this.statusItems['connection']?.text;
    }

    public hideAllStatusBarItems() : void {
        for (const statusItem of Object.values(this.statusItems)) {
            statusItem.hide();
        }
    }

    public createUpdateStatusBarItem(localName: string, options: Partial<vscode.StatusBarItem>) : vscode.StatusBarItem {
        if (!this.statusItems[localName]) {
            const priority = 30 - Object.keys(this.statusItems).length;
            this.statusItems[localName] = this.registerDisposable(vscode.window.createStatusBarItem(`${CONFIG_SECTION}.${localName}`, vscode.StatusBarAlignment.Left, priority));
        }
        for (const key of intersect(Object.keys(options), ['text', 'tooltip', 'command'])) {
            this.statusItems[localName][key] = options[key];
        }
        this.statusItems[localName].show();
        return this.statusItems[localName];
    }

    /**
     * Thin wrapper around `vscode.window.withProgress` with location `Notification` and cancellable `false`. 
     * @param title Title of the task
     * @param task task to run
     */
    public withProgress<T>(title: string, task: NoncancellableActivity<T> | Promise<T>) : Promise<T> {
        return this.withActivity({
            progressTitle: title,
            cancellable: false,
            hidden: true,
            location: vscode.ProgressLocation.Notification
        }, typeof task === 'function' ? task : () => task);
    }

    /**
     * Thin wrapper around `vscode.window.withProgress` with location `Notification` and cancellable `true`. 
     * @param title Title of the task
     * @param task task to run
     */
    public withCancelableProgress<T>(title: string, task: CancellableActivity<T>) : Promise<T> {
        return this.withActivity({
            progressTitle: title,
            cancellable: true,
            hidden: true,
            location: vscode.ProgressLocation.Notification
        }, task);
    }

    /**
     * Thin wrapper around `vscode.window.withProgress` with location `Window` and cancellable `false`. 
     * @param title Title of the task
     * @param task task to run
     */
    public withStatusBarProgress<T>(title: string, task: NoncancellableActivity<T> | Promise<T>) : Promise<T> {
        return this.withActivity({
            progressTitle: title,
            cancellable: false,
            hidden: true,
            location: vscode.ProgressLocation.Window
        }, typeof task === 'function' ? task : () => task);
    }

    /**
     * Wrapper around `vscode.window.withProgress` that registers the task as an activity visible in the activity explorer if used.
     * @param title Title of the task to run as it will appear on the progress and UI
     * @param task Task to run
     */
    public withActivity<T>(title: string, task: ActivityTask<T>) : Promise<T>;
    /**
     * Wrapper around `vscode.window.withProgress` that registers the task as an activity visible in the activity explorer if used.
     * @param options Activity options
     * @param task Task to run
     */
    public withActivity<T>(options: ActivityOptions, task: ActivityTask<T>) : Promise<T>;
    public withActivity<T>(input: ActivityOptions | string, task: ActivityTask<T>) {
        // Create activity record to track activity progress
        const options: ActivityOptions = typeof input == 'string' ? {
            activityTitle: input,
            progressTitle: input,
            propagateExceptions: true,
            cancellable: task.length > 2,
            location: vscode.ProgressLocation.Notification
        } : input;

        const cancelTokenSource = options.cancellable ? new vscode.CancellationTokenSource() : undefined;
        const onCompleteEmitter = new vscode.EventEmitter<VlocodeActivity>();
        const activityRecord = observeObject({
            startTime: Date.now(),
            endTime: -1,
            executionTime: -1,
            hidden: options.hidden === true,
            cancellable: options.cancellable === true,
            title: options.activityTitle || options.progressTitle,
            status: VlocodeActivityStatus.Pending,
            progess: 0,
            normalizedProgress: 0,
            total: 100,
            onComplete: onCompleteEmitter.event,
            cancel() {
                cancelTokenSource?.cancel();
            },
            dispose() {
                cancelTokenSource?.dispose();
                onCompleteEmitter.dispose();
            }
        });

        const progressInterceptor = (vscodeProgress: vscode.Progress<{ message?: string; increment?: number }>) => {            
            return {
                report({message, progress, total, status}) {
                    let relativeIncrement: number | undefined = undefined;
                    if (progress !== undefined && total) {
                        const lastRelativeProgress = activityRecord.progess / activityRecord.total;
                        const currentRelativeProgress = progress / total;

                        relativeIncrement = Math.floor((currentRelativeProgress - lastRelativeProgress) * 100);
                        if (relativeIncrement < 0) {
                            vscodeProgress.report( { increment: -activityRecord.normalizedProgress } );
                            activityRecord.normalizedProgress = 0;
                            relativeIncrement = Math.floor(currentRelativeProgress * 100);
                        }

                        activityRecord.progess = progress;
                        activityRecord.total = total;
                        activityRecord.normalizedProgress += relativeIncrement;
                    }
                    vscodeProgress.report( { message, increment: relativeIncrement ?? undefined } );
                    if (status !== undefined) {
                        activityRecord.status = status;
                    }
                }
            } as ActivityProgress;
        };

        // anon-function that is going to run our task
        const taskRunner = async (progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken) => {
            token?.onCancellationRequested(() => cancelTokenSource && !cancelTokenSource.token.isCancellationRequested && cancelTokenSource.cancel());
            activityRecord.status = VlocodeActivityStatus.InProgress;
            try {
                const result = await task(progressInterceptor(progress), cancelTokenSource?.token);
                if (activityRecord.status == VlocodeActivityStatus.InProgress) {
                    activityRecord.status = VlocodeActivityStatus.Completed;
                }
                return result;
            } catch(e) {
                if (activityRecord.status == VlocodeActivityStatus.InProgress) {
                    activityRecord.status = VlocodeActivityStatus.Failed;
                }
                if (options.propagateExceptions !== false) {
                    throw e;
                } else {
                    this.logger.error(e);
                }
            } finally {
                if (cancelTokenSource?.token.isCancellationRequested) {
                    activityRecord.status = VlocodeActivityStatus.Cancelled;
                }
                activityRecord.endTime = Date.now();
                activityRecord.executionTime = activityRecord.endTime - activityRecord.startTime;
                onCompleteEmitter.fire(activityRecord);
            }
        };

        this.activities.push(activityRecord);
        this.registerDisposable(activityRecord);

        return vscode.window.withProgress({
            title: options.progressTitle || options.activityTitle,
            cancellable: options.cancellable === true,
            location: options.location ?? vscode.ProgressLocation.Notification
        }, taskRunner) as Promise<T>;
    }

    public getJsForceConnection() : Promise<jsforce.Connection> {
        return this.getConnector().getJsForceConnection();
    }

    public isProductionOrg() {
        return this.getConnector().isProductionOrg();
    }

    public getApiVersion() {
        return this.config.salesforce.apiVersion;
    }

    private getConnector() {
        if (!this.connector) {
            if (!this.config.sfdxUsername) {
                throw new Error('Cannot connect to Salesforce; no username specified in configuration');
            }
            const connectorHooks = new HookManager<SfdxConnectionProvider>().registerHook({
                post: args => {
                    if (args.name === 'getJsForceConnection') {
                        args.returnValue = args.returnValue
                            .catch(err =>  this.handleGetConnectionError(args.target, err))
                            .then(connection => this.connectionHooks.attach(connection));
                    }
                }
            });
            this.connector = connectorHooks.attach(new SfdxConnectionProvider(this.config.sfdxUsername, this.config.salesforce.apiVersion));
        }
        return this.connector!;
    }

    private async handleGetConnectionError(connector: SalesforceConnectionProvider, err: Error | undefined) {
        if (err?.message == 'RefreshTokenAuthError') {
            const action = await vscode.window.showWarningMessage(
                `Your refresh token for ${this.config.sfdxUsername} has expired. Do you want to refresh it?`,
                { title: 'Yes', refresh: true },
                { title: 'No', refresh: false }
            );
            if (action?.refresh) {
                const authResult = await this.refreshOAuthTokens();
                if (authResult.accessToken) {
                    return connector!.getJsForceConnection();
                }
            } else {
                throw new Error(`Unable to connect to Salesforce, the refresh token for ${this.config.sfdxUsername} has expired`);
            }
        } else {
            throw err;
        }
    }

    public refreshOAuthTokens() {
        return this.withActivity({
            progressTitle: `Refresh ${this.config.sfdxUsername} org credentials...`,
            location: vscode.ProgressLocation.Notification,
            propagateExceptions: true,
            cancellable: true
        }, (progress, token) => sfdx.refreshOAuthTokens(this.config.sfdxUsername!, token));
    }

    private updateNamespaceHook({ args }) {
        for (let i = 0; i < args.length; i++) {
            if (typeof args[i] === 'string') {
                args[i] = this.nsService.updateNamespace(args[i]);
            }
        }
    }

    /**
     * Get the body of a document as string
     * @param file file name
     */
    public async readWorkspaceFile(uri: vscode.Uri) : Promise<string> {
        const doc = vscode.workspace.textDocuments.find(doc => doc.uri.path == uri.path);
        if (doc) {
            return doc.getText();
        }
        return (await vscode.workspace.fs.readFile(uri)).toString();
    }

    private updateExtensionStatus(config: VlocodeConfiguration) {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length == 0) {
            this.setExtensionContext('orgSelected', false);
            return this.hideAllStatusBarItems();
        }

        if (!config.sfdxUsername) {
            this.setExtensionContext('orgSelected', false);
            return this.showStatus('$(gear) Select Salesforce org', VlocodeCommand.selectOrg);
        }

        this.setExtensionContext('orgSelected', true);
        this.showStatus(`$(cloud-upload) Vlocode ${config.sfdxUsername}`, VlocodeCommand.selectOrg);
        void sfdx.resolveAlias(config.sfdxUsername).then(userAliasOrName => {
            if (this.getStatusText() !== `$(cloud-upload) Vlocode ${config.sfdxUsername}`) {
                // Avoid overwriting more up to date status bar text during extension start-up
                return;
            }
            this.showStatus(`$(cloud-upload) Vlocode ${userAliasOrName}`, VlocodeCommand.selectOrg)
        });
    }

    private setExtensionContext(key: string, value: any) {
        void vscode.commands.executeCommand('setContext', `${CONTEXT_PREFIX}.${key}`, value);
    }

    public registerDisposable<T extends {dispose() : any}>(disposable: T) : T
    public registerDisposable<T extends {dispose() : any}>(disposable: Promise<T>) : Promise<T>
    public registerDisposable<T extends {dispose() : any}>(disposable: T | Promise<T>) : T | Promise<T> {
        if (isPromise(disposable)) {
            return disposable.then(result => this.registerDisposable(result));
        }
        this.disposables.push(disposable);
        return disposable;
    }

    private createConfigWatcher() {
        this.updateExtensionStatus(this.config);
        this.showApiVersionStatusItem();
        this.disposables.push(
            ConfigurationManager.watchProperties(this.config, [ 'sfdxUsername', 'projectPath', 'customJobOptionsYaml' ], this.processConfigurationChange.bind(this)),
            ConfigurationManager.watchProperties(this.config.salesforce, [ 'apiVersion' ], this.processConfigurationChange.bind(this))
        );
    }

    private async processConfigurationChange() {
        this.showStatus('$(sync~spin) Processing config changes...', VlocodeCommand.selectOrg);
        await this.initialize();
        this.showApiVersionStatusItem();
    }

    public async validateSalesforceConnectivity() : Promise<string | undefined> {        
        if (!this.config.sfdxUsername) {
            const message = 'Select a Salesforce instance for this workspace to use Vlocode';
            const selectedAction = await vscode.window.showInformationMessage(message, 'Connect to Salesforce');
            if (selectedAction) {
                await this.commands.execute(VlocodeCommand.selectOrg);
                if (!this.config.sfdxUsername) {
                    return 'Salesforce org selection cancelled';
                }
            } else {
                return message;
            }
        }

        if (!this._datapackService || !this._salesforceService) {
            // Await service initialization
            await vscode.window.withProgress({ 
                title: 'Vlocode: initializing services...',  
                location: vscode.ProgressLocation.Window  
            }, () => poll(() => this._datapackService && this._salesforceService, 60000, 500, { resolveOnTimeout: true }));
        }

        if (!this._salesforceService) {
            return 'Vlocode failed to initialize within the given time; check the debug console for possible errors';
        }

        if (!await this.datapackService.isVlocityPackageInstalled()) {
            return 'Vlocity not installed on this Salesforce instance; select a different Salesforce instance or install Vlocity';
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

    public updateApiVersion(apiVersion: string | number) {
        if (typeof apiVersion === 'string') {
            return this.updateApiVersion(parseInt(apiVersion, 10));
        }
        this.logger.verbose(`Using Salesforce API version: ${apiVersion}`);
        this.config.salesforce.apiVersion = `${apiVersion}.0`;
    }
}

