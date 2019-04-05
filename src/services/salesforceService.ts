import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as jsforce from 'jsforce';
import { DescribeGlobalResult, DescribeSObjectResult } from 'jsforce/describe-result';
import * as path from 'path';
import * as process from 'process';
import * as sfdx from 'sfdx-node';
import * as constants from '../constants';
import * as l from '../loggers';
import * as s from '../serviceContainer';
import * as vm from 'vm';
import { isBuffer, isString, isObject, isError } from 'util';
import { getDocumentBodyAsString } from '../util';
import JsForceConnectionProvider from 'connection/jsForceConnectionProvider';

export interface InstalledPackageRecord extends jsforce.FileProperties {
    manageableState: string;
    namespacePrefix: string;
}

export interface OrganizationDetails {
    Id: string;
    Name: string;
    PrimaryContact: string;
    InstanceName: string;
    IsSandbox: Boolean;
    OrganizationType: string;
    NamespacePrefix: string;
}

export default class SalesforceService implements JsForceConnectionProvider {  

    constructor(private connectionProvider: JsForceConnectionProvider) {
    }

    public getJsForceConnection() : Promise<jsforce.Connection> {
        return this.connectionProvider.getJsForceConnection();
    }

    public async isPackageInstalled(packageName: string | RegExp) : Promise<Boolean> {
        return (await this.getInstalledPackageDetails(packageName)) !== undefined;
    }

    public async getInstalledPackageNamespace(packageName: string | RegExp) : Promise<string> {
        let installedPackage = await this.getInstalledPackageDetails(packageName);
        if (!installedPackage) {
            throw `Package with name ${packageName} is not installed on your Salesforce organization`;
        }
        return installedPackage.namespacePrefix;
    }

    public async getInstalledPackageDetails(packageName: string | RegExp) : Promise<InstalledPackageRecord | undefined> {
        let results = await this.getInstalledPackages();     
        return results.find(packageInfo => isString(packageName) ? packageName == packageInfo.fullName : packageName.test(packageInfo.fullName));
    }

    public async getInstalledPackages() : Promise<InstalledPackageRecord[]> {
        let con = await this.getJsForceConnection();
        let results = await con.metadata.list( { type: 'InstalledPackage' });        
        return <InstalledPackageRecord[]>results;
    }

    public async getOrganizationDetails() : Promise<OrganizationDetails> {
        let con = await this.getJsForceConnection();
        let results = await con.query('SELECT Id, Name, PrimaryContact, IsSandbox, InstanceName, OrganizationType, NamespacePrefix FROM Organization');
        return <OrganizationDetails>results.records[0];
    }

    public async getRecordPrefixes() : Promise<{ [key: string]: string }> {
        let con = await this.getJsForceConnection();
        let result = await con.describeGlobal();
        return result.sobjects.filter(rec => !!rec.keyPrefix)
                              .reduce((map: {}, rec) => map[rec.keyPrefix] = rec.name, {});
    }
}