import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as jsforce from 'jsforce';
import * as path from 'path';
import * as process from 'process';
import * as sfdx from 'sfdx-node';
import * as constants from '../constants';
import * as l from '../loggers';
import * as s from '../singleton';
import * as vm from 'vm';
import { isBuffer, isString, isObject, isError } from 'util';
import { getDocumentBodyAsString, readdirAsync, fstatAsync } from '../util';

/*export default class SalesforceService {  

    public async getJsForceConnection() : Promise<jsforce.Connection> {
        process.chdir(vscode.workspace.rootPath);
        return await new Promise((resolve, reject) => this.vlocityBuildTools.checkLogin(resolve, reject)).then(() =>
            this._vlocityBuildTools.jsForceConnection
        )
    }

    public async isVlocityPackageInstalled() : Promise<Boolean> {
        return (await this.getVlocityPackageDetails()) !== undefined;
    }

    public async getVlocityNamespace() : Promise<string> {
        let vlocityPackage = await this.getVlocityPackageDetails();
        if (!vlocityPackage) {
            throw 'The Vlocity managed package is not installed on your Salesforce organization';
        }
        return vlocityPackage.namespacePrefix
    }

    private async getVlocityPackageDetails() : Promise<jsforce.FileProperties | undefined> {
        let con = await this.getJsForceConnection();
        let results = await con.metadata.list( { type: 'InstalledPackage' });        
        return results.find(packageInfo => /^vlocity/i.test(packageInfo.fullName));
    }
}*/