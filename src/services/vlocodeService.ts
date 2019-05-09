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

export default class VlocodeService implements vscode.Disposable, JsForceConnectionProvider {  

    // Privates
    private disposables: {dispose() : any}[] = [];
    private statusBar: vscode.StatusBarItem;
    private connector: SfdxConnectionProvider;
    private readonly diagnostics: { [key : string] : vscode.DiagnosticCollection } = {};

    // Properties
    private _datapackService: VlocityDatapackService;
    get datapackService(): VlocityDatapackService {
        return this._datapackService || (this._datapackService = new VlocityDatapackService(this.container, this.config));
    }

    private _outputChannel: vscode.OutputChannel;
    get outputChannel(): vscode.OutputChannel {        
        return this._outputChannel || (this._outputChannel = vscode.window.createOutputChannel(constants.OUTPUT_CHANNEL_NAME));
    }

    protected get logger() : Logger {
        return LogManager.get(VlocodeService);
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
            if (this._datapackService) {
                // re-create _datapackService class when the config changes
                this._datapackService.dispose();
                this._datapackService = null;
            }
            this.connector = null;
            this.updateStatusBar(c);
        });
    }

    public async validateSalesforceConnectivity() : Promise<string | undefined> {
        if (!this.config.sfdxUsername) {
            return 'Select a Salesforce instance for this workspace in order to use Vlocode operations.';            
        }
        if (!await this.datapackService.isVlocityPackageInstalled()) {
            return 'The Vlocity managed package is not installed on your Salesforce organization; select a different Salesforce organization or install the Vlocity.';
        }
        if (this.config.username || this.config.password) {
            vscode.window.showWarningMessage('You have have configured an SFDX username but did not remove the Salesforce username or password.');
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
}

