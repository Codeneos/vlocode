'use strict';
import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as path from 'path';
import * as process from 'process';
import constants from '../constants';
import VlocodeConfiguration from '../models/VlocodeConfiguration';
import VlocityDatapackService, * as vds from './vlocityDatapackService';
import Constants from '../constants';
import * as s from '../singleton';
import * as l from '../loggers';

export default class VlocodeService {  

    private _config: VlocodeConfiguration;
    private _outputChannel: vscode.OutputChannel;

    constructor(config?: VlocodeConfiguration) {
        if (!config) {
            throw 'Cannot create VlocodeService without specifying a configuration object.';
        }
        this.setConfig(config);
    }
    
    public setConfig(config: VlocodeConfiguration){
        this._config = config;
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

    private getVlocityJobOptions() : vlocity.jobOptions {
        // for now this is a simple cast but in the future this migth change
        return <vlocity.jobOptions> (<any> this._config);
    }

    get config(): VlocodeConfiguration {
        return this._config;
    }

    get datapackService(): VlocityDatapackService {
        return new VlocityDatapackService(this.getVlocityJobOptions());
    }

    get outputChannel(): vscode.OutputChannel {
        return this._outputChannel || (this._outputChannel = vscode.window.createOutputChannel(constants.OUTPUT_CHANNEL_NAME));
    }
}

