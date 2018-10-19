'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as path from 'path';
import * as process from 'process';
import constants from '../constants';
import VlocodeConfiguration from '../models/VlocodeConfiguration';
import VlocityDatapackService from './vlocityDatapackService';

export default class VlocodeService {  

    private _config: VlocodeConfiguration;
    private _datapackService: VlocityDatapackService;
    private _outputChannel: vscode.OutputChannel;

    constructor();
    constructor(config?: VlocodeConfiguration) {
        this._config = config || new VlocodeConfiguration();
        VlocityDatapackService.setLogger((msg) => this.outputChannel.appendLine(msg));
        this._datapackService = new VlocityDatapackService(this.createVlocityJobOptins(this._config)); 
    }

    private createVlocityJobOptins(config: VlocodeConfiguration) : vlocity.jobOptions {
        // for now this is a simple cast but in the future this migth change
        return <vlocity.jobOptions> config.toObject();
    }

    get config(): VlocodeConfiguration {
        return this._config;
    }

    get datapackService(): VlocityDatapackService {
        return this._datapackService;
    }

    get outputChannel(): vscode.OutputChannel {
        return this._outputChannel || (this._outputChannel = vscode.window.createOutputChannel(constants.OUTPUT_CHANNEL_NAME));
    }
}

