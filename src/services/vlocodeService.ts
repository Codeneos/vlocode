import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as path from 'path';
import * as process from 'process';
import * as constants from '../constants';
import VlocodeConfiguration from '../models/vlocodeConfiguration';
import VlocityDatapackService, * as vds from './vlocityDatapackService';
import { default as serviceProvider } from 'serviceContainer';
import { Logger, LogProvider } from '../loggers';
import CommandRouter from './commandRouter';
import { VlocodeCommand } from 'commands';
import ServiceContainer from 'serviceContainer';

export default class VlocodeService implements vscode.Disposable {  

    private _outputChannel: vscode.OutputChannel;
    private _datapackService: VlocityDatapackService;
    private _disposables: {dispose() : any}[] = [];
    private _statusBar: vscode.StatusBarItem;

    constructor(private readonly container: ServiceContainer, private readonly context: vscode.ExtensionContext, public readonly config: VlocodeConfiguration) {
        this.updateStatusBar(config);
        this.registerDisposable(VlocodeConfiguration.watch(config, (c) => {
            if (this._datapackService) {
                this._datapackService.dispose();
                this._datapackService = null;
            }
            this.updateStatusBar(c);
        }));
        context.subscriptions.push(this);
    }

    public showStatus(text: string, command: VlocodeCommand | string = undefined) : void {
        if (!this._statusBar) {
            this._statusBar = this.registerDisposable(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10));
        }
        this._statusBar.command = command;
        this._statusBar.text = text;
        this._statusBar.show();
    }

    public hideStatus() : void {
        this._statusBar.hide();
    }

    public dispose() {
        this._disposables.forEach(disposable => disposable.dispose());
        this._disposables = [];
        if (this._datapackService) {
            this._datapackService.dispose();
            this._datapackService = null;
        }
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

    protected get logger() : Logger {
        return LogProvider.get(VlocodeService);
    }

    public registerDisposable<T extends  {dispose() : any}>(disposable: T) : T {
        this._disposables.push(disposable);
        return disposable;
    }

    public validateSalesforce() : string {
        if (!this.datapackService.isVlocityPackageInstalled()) {
            return 'The Vlocity managed package is not installed on your Salesforce organization; select a different Salesforce organization or install the Vlocity managed package.';
        }
    }

    public validateConfig() : string {
        if (this.config.sfdxUsername) {
            // check for username and password
            if (this.config.username || this.config.password) {
                vscode.window.showWarningMessage('You have have configured an SFDX username but did not remove the regular salesforce username and password.');
            }
        } else {
            if (!!this.config.username && !!this.config.password) {
                return 'Invalid condiguration - Please configure either a SFDX username or Salesforce login credential in order to use Vlocode.';
            } else if (this.config.instanceUrl) {
                return 'Invalid condiguration - Please configure the instance url for Salesforce; or use an SFDX authorized username.';
            }
        }
        if (!this.config.projectPath) {
            return 'Invalid condiguration - Please configure the projectPath to point to the folder containing Vlocity datapack sources.';
        }
    }

    get datapackService(): VlocityDatapackService {
        return this._datapackService || (this._datapackService = new VlocityDatapackService(this.container, this.config));
    }

    get outputChannel(): vscode.OutputChannel {
        return this._outputChannel || (this._outputChannel = vscode.window.createOutputChannel(constants.OUTPUT_CHANNEL_NAME));
    }
}

