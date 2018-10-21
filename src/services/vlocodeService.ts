'use strict';
import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as path from 'path';
import * as process from 'process';
import constants from '../constants';
import VlocodeConfiguration from '../models/VlocodeConfiguration';
import VlocityDatapackService, * as vds from './vlocityDatapackService';

export default class VlocodeService {  

    private _config: VlocodeConfiguration;
    private _outputChannel: vscode.OutputChannel;

    constructor(config?: VlocodeConfiguration) {
        if (!config) {
            throw 'Cannot create VlocodeService without specifying a configuration object.';
        }
        this._config = config;
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

