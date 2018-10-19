'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as path from 'path';
import * as process from 'process';
import constants from './constants';
import commandModel from './models/commandModel';
import VlocityDatapackService from './services/vlocityDatapackService';

export function refreshDatapack(datapackType: String, datapackKey: String) {
}

export function deployDatapack(datapackType: String, datapackKey: String) {
}

export const datapackCommands : commandModel[] = [
    {
        name: 'extension.refreshDatapack',
        callback: refreshDatapack
    }, {
        name: 'extension.deployDatapack',
        callback: deployDatapack
    }
];
