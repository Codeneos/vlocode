import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as jsforce from 'jsforce';
import * as path from 'path';
import * as ZipArchive from 'jszip';
import * as xml2js from 'xml2js';
import * as fs from 'fs';
import * as process from 'process';
import * as constants from '../constants';
import * as l from '../loggers';
import * as s from '../serviceContainer';
import * as vm from 'vm';
import { isBuffer, isString, isObject, isError } from 'util';
import { getDocumentBodyAsString, wait, mapAsyncParallel } from '../util';
import JsForceConnectionProvider from 'connection/jsForceConnectionProvider';
import { Stream } from 'stream';
import { DeployResult } from 'jsforce';
import * as metadataTypes from 'metadataTypes.yaml'
import { getMetaFiles } from 'salesforceUtil';

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

export type DetailedDeployResult = jsforce.DeployResult & {
    details?: { componentFailures?: ComponentFailure[] }
}

export interface ComponentFailure {
    problem: string;
    problemType: string;
    columnNumber: string;
    lineNumber: string;
    componentType: string;
    fileName: string;
    fullName: string;
}

export interface MetadataManifest {
    apiVersion?: string;
    files: {
        [packagePath: string]: {
            type?: string;
            name?: string;
            body?: Buffer;
            localPath?: string;
        };
    }
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

    /**
     * Builds a ZIP archive from a manifest info object that can be deployed 
     * @param manifest The manifest created by hand or generated by `createDeploymentManifest`
     * @param token Optional cancellation token
     */
    public async buildPackageFromManifest(manifest: MetadataManifest, token?: vscode.CancellationToken) : Promise<ZipArchive> {
        // build package XML
        const metadataMembers = new Map<string, Set<string>>();
        const packageZip = new ZipArchive();

        for (const [packagePath, info] of Object.entries(manifest.files)) {
            // Stop directly and return null
            if (token && token.isCancellationRequested) {
                return null;
            }

            packageZip.file(path.posix.join('src', packagePath), await getDocumentBodyAsString(info.localPath));

            // Add component to package if this is a meta like file
            let members = metadataMembers.get(info.type);
            if (members == null) {
                metadataMembers.set(info.type, members = new Set<string>());
            }
            members.add(info.name);
        }

        // validate API version - default to 45
        const apiVersion = manifest.apiVersion || '45.0';
        if (!/^\d{2,3}\.\d$/.test(apiVersion)) {
            throw new Error(`Invalid API version: ${apiVersion}`);
        }

        // Build package.xml
        const packageTypes = [...metadataMembers.entries()].map(([name, members]) => ({ name, members: [...members.values()] }));
        const xmlBuilder = new xml2js.Builder(constants.MD_XML_OPTIONS);
        const packageXml = xmlBuilder.buildObject({ 
            Package: { 
                $: { xmlns : 'http://soap.sforce.com/2006/04/metadata' }, 
                version: apiVersion,
                types: packageTypes
            } 
        });

        return packageZip.file(`src/package.xml`, packageXml);
    }

    /**
     * Build a Salesforce Manifest from the specified files, do not add any files that match the specified pattern.
     * @param srcDir The package directory to read the source from.
     * @param ignorePatterns A list of ignore patterns of the files to ignore.
     */
    public async buildDeploymentManifest(files: vscode.Uri[], token?: vscode.CancellationToken) : Promise<MetadataManifest> {
        const mdPackage : MetadataManifest = { files: {} };
        const metaFiles =  await getMetaFiles(files.map(file => file.fsPath));

        // Build zip archive for all expanded files
        // Note use posix paht separators when building package.zip
        for (const metaFile of metaFiles) {

            // Stop directly and return null
            if (token && token.isCancellationRequested) {
                return null;
            }

            const metaFileExt = path.extname(metaFile).toLowerCase();
            const metaFolderName = path.dirname(metaFile).split(/\/|\\/).pop();
            const componentName = path.basename(metaFile).replace(/\.\S+\-meta\.xml/ig, '');

            const metaFileBody = await getDocumentBodyAsString(metaFile);
            const metaXml = await xml2js.parseStringPromise(metaFileBody);
            let componentType = Object.keys(metaXml)[0];            
            const packageFolder = metadataTypes[componentType] && metadataTypes[componentType].packageFolder || metaFolderName;

            // Alternate component type for settings
            if (metaFileExt == '.settings') {
                componentType = 'Settings';
            }

            if (metaFile.toLowerCase().endsWith('-meta.xml')) {
                const isBundle = componentType.endsWith('Bundle');
                if (isBundle) {
                    // Classic metadata package all related files
                    const sourceFiles = await vscode.workspace.findFiles(path.join(path.dirname(metaFile), '**/*'));
                    for (const sourceFile of sourceFiles) {
                        const sourcePackagePath = path.posix.join(packageFolder, path.basename(sourceFile.fsPath));
                        Object.assign(mdPackage.files, {   
                            [sourcePackagePath]: { name: componentName, type: componentType, localPath: sourceFile.fsPath }
                        });
                    }
                } else {                    
                    const sourceFile = metaFile.replace(/\-meta\.xml/ig, '');
                    const sourcePackagePath = path.posix.join(packageFolder, path.basename(sourceFile));
                    const metaPackagePath = path.posix.join(packageFolder, path.basename(metaFile));

                    Object.assign(mdPackage.files, {   
                        [sourcePackagePath]: { name: componentName, type: componentType, localPath: sourceFile },                    
                        [metaPackagePath]: { name: componentName, type: componentType, localPath: metaFile },    
                    });
                }
            } else {
                // other meta data type add only the meta file
                const packagePath = path.posix.join(packageFolder, path.basename(metaFile));
                Object.assign(mdPackage.files, {   
                    [packagePath]: { name: componentName, type: componentType, localPath: metaFile }
                });
            }
        }

        return mdPackage;
    }

    /**
     * Build a Salesforce package from the specified directory, do not add any files that match the specified pattern.
     * @param srcDir The package directory to read the source from.
     * @param ignorePatterns A list of ignore patterns of the files to ignore.
     */
    private async buildPackageFromFiles(files: vscode.Uri[], apiVersion: string, token?: vscode.CancellationToken) : Promise<ZipArchive> {
        const manifest = await this.buildDeploymentManifest(files, token);
        manifest.apiVersion = apiVersion;
        return this.buildPackageFromManifest(manifest, token);
    }

    /**
     * Save the package as zip file
     * @param packageZip Package zip
     * @param zipFile target file.
     */
    private savePackage(packageZip: ZipArchive, zipFile: string) : Promise<void> {
        return new Promise((resolve, reject) => {
            packageZip.generateNodeStream({ streamFiles:true, compressionOptions: { level: 8 } })
                .pipe(fs.createWriteStream(zipFile))
                .on('finish', () => {
                    resolve();
                }).on('error', function (err) {
                    reject(err);
                });
        });
    }

    /**
     * Deploy the selected files to the currently selected org.
     * @param files Files to deploy
     * @param options Extra deploy options
     * @param progressOptions Progress options
     */
    public async deployFiles(files: vscode.Uri[], options?: jsforce.DeployOptions, token?: vscode.CancellationToken) : Promise<DetailedDeployResult> {
        const packageZip = await this.buildPackageFromFiles(files, '47.0', token);
        if (!packageZip) {
            // return if the task was cancelled
            return;
        }
        return this.deploy(packageZip, options, token);
    }

    /**
     * Deploy the selected files to the currently selected org.
     * @param files Files to deploy
     * @param options Extra deploy options
     * @param progressOptions Progress options
     */
    public async deployManifest(manifest: MetadataManifest, options?: jsforce.DeployOptions, token?: vscode.CancellationToken) : Promise<DetailedDeployResult> {
        const packageZip = await this.buildPackageFromManifest(manifest, token);
        return this.deploy(packageZip, options, token);
    }

    /**
     * Deploy a package file, buffer or stream to Salesforce async and returns once the deployment is completed.
     * @param zipInput zip file, buffer or stream to deploy
     * @param options additional deploy options
     * @param progressOptions progress options
     */
    private async deploy(zipInput: Stream | Buffer | string | ZipArchive, options?: jsforce.DeployOptions, token?: vscode.CancellationToken) : Promise<jsforce.DeployResult> {
        const startTime = new Date().getTime();
        const checkInterval = 500;
        const deploymentTypeText = options && options.checkOnly ? 'Validate' : 'Deploy';

        const deploymentTask = async (progress: vscode.Progress<{ message?: string; increment?: number }>, cancellationToken: vscode.CancellationToken) => {
            // Convert jszip object to Buffer object
            if (zipInput instanceof ZipArchive) {
                zipInput = await zipInput.generateAsync({
                    type: "nodebuffer",
                    compression: "DEFLATE",
                    compressionOptions: {
                        level: 7
                    }
                });
            }

            // Start deploy            
            const connection = await this.getJsForceConnection();        
            const deployJob = await connection.metadata.deploy(zipInput, options || {});

            // Wait for deploy
            while (await wait(checkInterval)) {            
                if (cancellationToken && cancellationToken.isCancellationRequested) {
                    // we can't cancel a deploy through JSForce right now
                    throw new Error(`${deploymentTypeText} cancelled`);
                }

                const status = await connection.metadata.checkDeployStatus(deployJob.id, true);
                if (status.done) {
                    const details : any = status.details;
                    if (!Array.isArray(details.componentFailures)) {
                        details.componentFailures = [ details.componentFailures ];
                    }
                    return status;
                }
            }
        };

        return deploymentTask(null, token);        
    }

}