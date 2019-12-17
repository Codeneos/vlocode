import * as vscode from 'vscode';
import * as jsforce from 'jsforce';
import * as path from 'path';
import VlocodeConfiguration from '../models/vlocodeConfiguration';
import VlocityDatapackService, * as vds from './vlocityDatapackService';
import { Logger, LogManager } from '../logging';
import { VlocodeCommand } from '@constants';
import ServiceContainer from 'serviceContainer';
import JsForceConnectionProvider from 'connection/jsForceConnectionProvider';
import SfdxConnectionProvider from 'connection/sfdxConnectionProvider';
import SalesforceService from './salesforceService';
import { fork } from 'child_process';
import VlocodeContext from 'models/vlocodeContext';
import * as constants from '@constants';
import VlocodeActivity, { VlocodeActivityStatus } from 'models/vlocodeActivity';
import { observeArray, ObservableArray, observeObject, Observable } from 'observer';
import { ConfigurationManager } from './configurationManager';

type ActivityOptions = { 
    progressTitle: string, 
    activityTitle?: string, 
    cancellable: boolean, 
    location: vscode.ProgressLocation,
    /** Task runner throws exceptions back to so they can be caught by the called */
    propagateExceptions?: boolean
};

export default class VlocodeService implements vscode.Disposable, JsForceConnectionProvider {  

    // Privates
    private disposables: {dispose() : any}[] = [];
    private statusBar: vscode.StatusBarItem;
    private connector: JsForceConnectionProvider;
    private readonly diagnostics: { [key : string] : vscode.DiagnosticCollection } = {};
    private readonly activitiesChangedEmitter = new vscode.EventEmitter<VlocodeActivity[]>();

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

    protected get logger() : Logger {
        return LogManager.get(VlocodeService);
    }

    public get connected() : boolean {
        return !!this._datapackService;
    }

    // Ctor + Methods
    constructor(
        private readonly container: ServiceContainer, 
        public readonly config: VlocodeConfiguration,
        private readonly context?: VlocodeContext) {
        this.registerDisposable(this.createConfigWatcher());
    }

    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];
        if (this._datapackService) {
            this._datapackService.dispose();
            this._datapackService = null;
        }
    }

    public async initialize() {
        this.showStatus(`$(sync) Connecting to Salesforce...`);
        try {
            this.connector = null;            
            if (this._datapackService) {
                this._datapackService.dispose();
            }
            this._salesforceService = new SalesforceService(this);
            this._datapackService = await new VlocityDatapackService(this.container, this, this.config, this.salesforceService).initialize();
            this.updateStatusBar(this.config);
        } catch (err) {
            this.logger.error(err);
            this.showStatus(`$(alert) Could not connect to Salesforce`, VlocodeCommand.selectOrg);
        }
    }

    public getDiagnostics(name : string): vscode.DiagnosticCollection {
        if (this.diagnostics[name]) {
            return this.diagnostics[name];
        }
        return this.registerDisposable(this.diagnostics[name] = vscode.languages.createDiagnosticCollection(name));
    }

    public showStatus(text: string, command: VlocodeCommand | string = undefined) : void {
        if (!this.statusBar) {
            this.statusBar = this.registerDisposable(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10));
        }
        this.statusBar.command = command;
        this.statusBar.text = text;
        this.statusBar.show();
    }

    public hideStatus() : void {
        if (this.statusBar) {
            this.statusBar.hide();
        }
    }

    /**
     * Thin wrapper arround `vscode.window.withProgress` with location `Notification` and cancellable `false`. 
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
     * Thin wrapper arround `vscode.window.withProgress` with location `Notification` and cancellable `true`. 
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
     * Thin wrapper arround `vscode.window.withProgress` with location `Window` and cancellable `false`. 
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
     * Wrapper arround `vscode.window.withProgress` that registers the task as an activity visisble in the activity exporer if used.
     * @param options Activity options
     * @param task Task to run
     */
    public withActivity<T>(
            options: ActivityOptions, 
            task: (progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken) => Promise<T>) : Promise<T> {
        
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
        const taskRunner = async (progress, token: vscode.CancellationToken) => {
            token?.onCancellationRequested(() => options.cancellable && !cancelTokenSource.token.isCancellationRequested && cancelTokenSource.cancel());
            activityRecord.status = VlocodeActivityStatus.InProgress;
            try {                
                const result = await task(progress, cancelTokenSource?.token); 
                activityRecord.status = cancelTokenSource?.token.isCancellationRequested 
                    ? VlocodeActivityStatus.Cancelled : VlocodeActivityStatus.Completed;
                return result;
            } catch(e) {
                activityRecord.status = cancelTokenSource?.token.isCancellationRequested 
                    ? VlocodeActivityStatus.Cancelled : VlocodeActivityStatus.Failed;
                if (options.propagateExceptions !== false) {
                    throw e;
                }
            } finally {
                activityRecord.endTime = Date.now();
                onCompleteEmitter.fire(activityRecord);
            }
        };

        this.activities.push(activityRecord);
        this.registerDisposable(activityRecord);

        return <Promise<T>>vscode.window.withProgress({
            title: options.progressTitle || options.activityTitle, 
            cancellable: options.cancellable, 
            location: options.location
        }, taskRunner);
    }
    
    public getJsForceConnection() : Promise<jsforce.Connection> {
        if (this.connector == null) {
            this.connector = new SfdxConnectionProvider(this.config.sfdxUsername);
        }
        return this.connector.getJsForceConnection();
    }

    public getContext(): VlocodeContext {
        return this.context;
    }

    /**
     * Get the absolute path of a resource contained in the extension.
     *
     * @param relativePath A relative path to a resource contained in the extension.
     * @return The absolute path of the resource.
     */
	public asAbsolutePath(relativePath: string): string {
        return path.join(this.context.extensionPath, relativePath);
    }

    private updateStatusBar(config: VlocodeConfiguration) {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length == 0) {
            return this.hideStatus();
        }
        if (!config.sfdxUsername && !config.username) {
            return this.showStatus(`$(gear) Select Vlocity org`, VlocodeCommand.selectOrg);
        }
        return this.showStatus(`$(cloud-upload) Vlocode ${config.sfdxUsername || config.username}`, VlocodeCommand.selectOrg);
    }

    public registerDisposable<T extends  {dispose() : any}>(disposable: T) : T {
        this.disposables.push(disposable);
        return disposable;
    }

    private createConfigWatcher() : vscode.Disposable {
        this.updateStatusBar(this.config);
        return ConfigurationManager.watch(this.config, c => {
            this.showStatus(`$(sync) Processing config changes...`, VlocodeCommand.selectOrg);
            this.initialize();
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
        if (this.config.username || this.config.password) {
            vscode.window.showWarningMessage('You have have configured an SFDX username but did not remove the Salesforce username or password');
        }
    }

    public validateWorkspaceFolder() : string | undefined {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length == 0) {
            return 'No workspace folders detected. Open at least one folder in the current workspace to use Vlocode.';
        }
    }

    public async validateAll(throwException: boolean) : Promise<string | void> {
        const validationResult = this.validateWorkspaceFolder() || 
								 await this.validateSalesforceConnectivity();
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
        vscode.commands.executeCommand('setContext', 'vlocodeSalesforceSupport', support);
        this.logger.info(`Salesforce support ${support ? 'enabled' : 'disabled'}`);
    }
}

