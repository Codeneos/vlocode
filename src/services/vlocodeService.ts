import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as path from 'path';
import * as process from 'process';
import * as constants from '../constants';
import VlocodeConfiguration from '../models/VlocodeConfiguration';
import VlocityDatapackService, * as vds from './vlocityDatapackService';
import * as s from '../singleton';
import * as l from '../loggers';
import { ICommand } from '../commands/command';

export default class VlocodeService {  

    private _config: VlocodeConfiguration;
    private _outputChannel: vscode.OutputChannel;
    private _context: vscode.ExtensionContext;
    private _datapackService: VlocityDatapackService;
    private _disposables: {dispose() : any}[] = [];

    constructor(context?: vscode.ExtensionContext, config?: VlocodeConfiguration) {
        if (!config) {
            throw 'Cannot create VlocodeService without specifying a configuration object.';
        }
        this._context = context;
        this.setConfig(config);
        context.subscriptions.push(this);
    }

    public dispose() {
        this._disposables.forEach(disposable => {
            disposable.dispose();
        });
        this._disposables = [];
    }

    public getContext(): vscode.ExtensionContext {
        return this._context;
    }
    
    public setConfig(config: VlocodeConfiguration){
        this._config = config;
    }
    
    public focusLog() : any {
        this.outputChannel.show(false);
    }

    protected get logger() : l.Logger {
        return s.get(l.Logger);
    }

    public registerDisposable<T extends  {dispose() : any}>(disposable: T) : T {
        this._disposables.push(disposable);
        return disposable;
    }

    public registerCommand(...cmds: ICommand[]) : void {
        cmds.forEach(cmd => {
            this.logger.verbose(`Register commands ${cmd.name}`);
            this.registerDisposable(vscode.commands.registerCommand(cmd.name, async (...args) => {     
                try {
                    s.get(VlocodeService).validateConfig();
                    s.get(VlocodeService).validateSalesforce();
                } catch (err) {
                    this.logger.error(`${cmd.name}: ${err}`);
                    return vscode.window.showErrorMessage(err, { modal: false }, { title: 'Open settings' }).then(r => 
                        r === undefined || vscode.commands.executeCommand('workbench.action.openWorkspaceSettings', 'test'));
                }
                this.logger.verbose(`Invoke command ${cmd.name}`);
                try {
                    await cmd.execute.apply(cmd, args);
                    this.logger.verbose(`Execution of command ${cmd.name} done`);
                } catch(err) {
                    this.logger.error(`Command execution resulted in error: ${err}`);
                }
            }))
        });
    }

    public validateSalesforce() : void {
        if (!this.datapackService.isVlocityPackageInstalled()) {
            throw 'The Vlocity managed package is not installed on your Salesforce organization; select a different Salesforce organization or install the Vlocity managed package.';
        }
    }

    public validateConfig() : void {
        if (this.config.sfdxUsername) {
            // check for username and password
            if (this.config.username || this.config.password) {
                vscode.window.showWarningMessage('You have have configured an SFDX username but did not remove the regular salesforce username and password.');
            }
        } else {
            if (!!this.config.username && !!this.config.password) {
                throw 'Invalid condiguration - Please configure either a SFDX username or Salesforce login credential in order to use Vlocode.';
            } else if (this.config.instanceUrl) {
                throw 'Invalid condiguration - Please configure the instance url for Salesforce; or use an SFDX authorized username.';
            }
        }
        if (!this.config.projectPath) {
            throw 'Invalid condiguration - Please configure the projectPath to point to the folder containing Vlocity datapack sources.';
        }
    }

    private getVlocityJobOptions() : vlocity.JobOptions {
        // for now this is a simple cast but in the future this migth change
        return <vlocity.JobOptions> (<any> this._config);
    }

    get config(): VlocodeConfiguration {
        return this._config;
    }

    get datapackService(): VlocityDatapackService {
        return this._datapackService || (this._datapackService = new VlocityDatapackService(this.getVlocityJobOptions()));
    }

    get outputChannel(): vscode.OutputChannel {
        return this._outputChannel || (this._outputChannel = vscode.window.createOutputChannel(constants.OUTPUT_CHANNEL_NAME));
    }
}

