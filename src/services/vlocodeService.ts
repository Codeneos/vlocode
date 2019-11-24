import * as vscode from 'vscode';
import * as jsforce from 'jsforce';
import * as constants from '../constants';
import VlocodeConfiguration from '../models/vlocodeConfiguration';
import VlocityDatapackService, * as vds from './vlocityDatapackService';
import { Logger, LogManager } from '../loggers';
import { VlocodeCommand } from '../constants';
import ServiceContainer from 'serviceContainer';
import JsForceConnectionProvider from 'connection/jsForceConnectionProvider';
import SfdxConnectionProvider from 'connection/sfdxConnectionProvider';
import SalesforceService from './salesforceService';

export default class VlocodeService implements vscode.Disposable, JsForceConnectionProvider {  

    // Privates
    private disposables: {dispose() : any}[] = [];
    private statusBar: vscode.StatusBarItem;
    private connector: JsForceConnectionProvider;
    private readonly diagnostics: { [key : string] : vscode.DiagnosticCollection } = {};


    // Properties
    private _datapackService: VlocityDatapackService;
    get datapackService(): VlocityDatapackService {
        return this._datapackService;
    }

    private _outputChannel: vscode.OutputChannel;
    get outputChannel(): vscode.OutputChannel {        
        return this._outputChannel || (this._outputChannel = vscode.window.createOutputChannel(constants.OUTPUT_CHANNEL_NAME));
    }

    private _salesforceService: SalesforceService;
    get salesforceService(): SalesforceService {
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
        private readonly context: vscode.ExtensionContext, 
        public readonly config: VlocodeConfiguration) {
        this.registerDisposable(this.createConfigWatcher());
        context.subscriptions.push(this);
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
    
    public getJsForceConnection() : Promise<jsforce.Connection> {
        if (this.connector == null) {
            this.connector = new SfdxConnectionProvider(this.config.sfdxUsername);
        }
        return this.connector.getJsForceConnection();
    }

    public getContext(): vscode.ExtensionContext {
        return this.context;
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
    
    public focusLog() : any {
        this.outputChannel.show(true);
    }

    public registerDisposable<T extends  {dispose() : any}>(disposable: T) : T {
        this.disposables.push(disposable);
        return disposable;
    }

    private createConfigWatcher() : vscode.Disposable {
        this.updateStatusBar(this.config);
        return this.config.watch(c => {
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

    public enabledSalesforceSupport(support: boolean) {
        if (this.config.salesforceSupport !== support) {
            this.config.salesforceSupport = support;
        }
        vscode.commands.executeCommand('setContext', 'vlocodeSalesforceSupport', support);
        this.logger.info(`Salesforce support ${support ? 'enabled' : 'disabled'}`);
    }
}

