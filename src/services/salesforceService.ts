import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as jsforce from 'jsforce';
import * as path from 'path';
import * as process from 'process';
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

    private readonly describeCache = new Map<string, jsforce.DescribeSObjectResult>();
    private packageCache: InstalledPackageRecord[];
    
    constructor(private readonly connectionProvider: JsForceConnectionProvider) {
    }

    public getJsForceConnection() : Promise<jsforce.Connection> {
        return this.connectionProvider.getJsForceConnection();
    }

    public async isPackageInstalled(packageName: string | RegExp) : Promise<Boolean> {
        return (await this.getInstalledPackageDetails(packageName)) !== undefined;
    }

    public async getPageUrl(page : string, namespacePrefix? : string) {
        const con = await this.getJsForceConnection();
        const urlNamespace = namespacePrefix ? '--' + namespacePrefix.replace(/_/i, '-') : '';
        return con.instanceUrl.replace(/(http(s|):\/\/)([^.]+)(.*)/i, `$1$3${urlNamespace}$4/${page.replace(/^\/+/, '')}`);
    }

    public async getInstalledPackageNamespace(packageName: string | RegExp) : Promise<string> {
        const installedPackage = await this.getInstalledPackageDetails(packageName);
        if (!installedPackage) {
            throw new Error(`Package with name ${packageName} is not installed on your Salesforce organization`);
        }
        return installedPackage.namespacePrefix;
    }

    public async getInstalledPackageDetails(packageName: string | RegExp) : Promise<InstalledPackageRecord | undefined> {
        const results = await this.getInstalledPackages();     
        return results.find(packageInfo => isString(packageName) ? packageName == packageInfo.fullName : packageName.test(packageInfo.fullName));
    }

    public async getInstalledPackages() : Promise<InstalledPackageRecord[]> {
        if (this.packageCache) {
            return this.packageCache;
        }
        const con = await this.getJsForceConnection();
        const results = await con.metadata.list( { type: 'InstalledPackage' });        
        this.packageCache = <InstalledPackageRecord[]>results;
        return this.packageCache;
    }

    public async getOrganizationDetails() : Promise<OrganizationDetails> {
        const con = await this.getJsForceConnection();
        const results = await con.query('SELECT Id, Name, PrimaryContact, IsSandbox, InstanceName, OrganizationType, NamespacePrefix FROM Organization');
        return <OrganizationDetails>results.records[0];
    }

    public async getRecordPrefixes() : Promise<{ [key: string]: string }> {
        const con = await this.getJsForceConnection();
        const result = await con.describeGlobal();
        return result.sobjects.filter(rec => !!rec.keyPrefix)
                              .reduce((map: {}, rec) => map[rec.keyPrefix] = rec.name, {});
    }

    public async describeSObject(type: string) : Promise<jsforce.DescribeSObjectResult> {
        let result = this.describeCache.get(type);
        if (!result) {
            const con = await this.getJsForceConnection();
            try {
                result = await con.describe(type);
            } catch(err) {
                throw Error(`No such object with name ${type} exists in this Salesforce instance`);
            }
            this.describeCache.set(type, result);
        }
        return result;
    }

    public async getSObjectField(type: string, fieldName: string) : Promise<jsforce.Field> {
        const result = await this.describeSObject(type);
        const field = result.fields.find(field => field.name.toLowerCase() == fieldName.toLowerCase());
        if (!field) {
            throw new Error(`No such field with name ${fieldName} on SObject ${type}`);
        }
        return field;
    }
}