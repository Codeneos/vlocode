import * as vscode from 'vscode';
import * as jsforce from 'jsforce';
import * as constants from '../constants';
import VlocodeConfiguration from '../models/vlocodeConfiguration';
import VlocityDatapackService, * as vds from './vlocityDatapackService';
import { Logger, LogProvider } from '../loggers';
import { VlocodeCommand } from 'commands';
import ServiceContainer from 'serviceContainer';
import JsForceConnectionProvider from 'connection/jsForceConnectionProvider';
import SfdxConnectionProvider from 'connection/sfdxConnectionProvider';

export default class VlocodeService implements vscode.Disposable, JsForceConnectionProvider {  

    // Privates
    private disposables: {dispose() : any}[] = [];
    private statusBar: vscode.StatusBarItem;
    private connector: SfdxConnectionProvider;

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
        return LogProvider.get(VlocodeService);
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

    public showStatus(text: string, command: VlocodeCommand | string = undefined) : void {
        if (!this.statusBar) {
            this.statusBar = this.registerDisposable(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10));
        }
        this.statusBar.command = command;
        this.statusBar.text = text;
        this.statusBar.show();
    }

    public hideStatus() : void {
        this.statusBar.hide();
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
        if (!config.sfdxUsername && !config.username) {
            return this.showStatus(`$(gear) Vlocode: select org`, VlocodeCommand.selectOrg);
        }
        if (!config.projectPath) {
            return this.showStatus(`$(file-directory) Vlocode: select project path`);
        }
        return this.showStatus(`$(cloud-upload) Vlocode ${config.sfdxUsername || config.username}`, VlocodeCommand.selectOrg);
    }
    
    public focusLog() : any {
        this.outputChannel.show(false);
    }

    public registerDisposable<T extends  {dispose() : any}>(disposable: T) : T {
        this.disposables.push(disposable);
        return disposable;
    }

    public validateSalesforceConnectivity() : string {
        if (!this.datapackService.isVlocityPackageInstalled()) {
            return 'The Vlocity managed package is not installed on your Salesforce organization; select a different Salesforce organization or install the Vlocity managed package.';
        }
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

    public validateConfig() : string {
        if (this.config.sfdxUsername) {
            // check for username and password
            if (this.config.username || this.config.password) {
                vscode.window.showWarningMessage('You have have configured an SFDX username but did not remove the Salesforce username or password.');
            }
        } else {
            if (!!this.config.username && !!this.config.password) {
                return 'Invalid configuration - No salesforce username or SFDX alias/credential set';
            } else if (this.config.instanceUrl) {
                return 'Invalid configuration - Set the instance url config for Salesforce -or- use an SFDX alias/credential';
            }
        }
        if (!this.config.projectPath) {
            return 'Invalid configuration - Set projectPath config to the folder containing Vlocity datapacks';
        }
    }
}

