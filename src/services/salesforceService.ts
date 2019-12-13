import * as vscode from 'vscode';
import * as jsforce from 'jsforce';
import * as path from 'path';
import * as ZipArchive from 'jszip';
import * as xml2js from 'xml2js';
import * as fs from 'fs';
import * as constants from '@constants';
import { getDocumentBodyAsString, wait } from '@util';
import JsForceConnectionProvider from 'connection/jsForceConnectionProvider';
import { Stream } from 'stream';
import * as metadataTypes from 'metadataTypes.yaml';
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
};

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
            body?: Buffer | string;
            localPath?: string;
        };
    };
}

export type DeploymentProgress = vscode.Progress<{ 
    message?: string; 
    increment?: number; 
    total?: number;
}>;

interface RetrieveResult extends jsforce.RetrieveResult {
    done: boolean | string;
    success: boolean | string;
    errorMessage?: string;
    errorStatusCode?: string;
    status: 'Pending' | 'InProgress' | 'Succeeded' | 'Failed';
}

/**
 * Object that describe the salesforce package XML, can be converted into a package.xml file body or JSON structure
 */
class PackageXml {

    private readonly metadataMembers = new Map<string, Set<string>>();

    constructor(public readonly version : string) {
        if (!/^\d{2,3}\.\d$/.test(version)) {
            throw new Error(`Invalid API version: ${version}`);
        }
    }

    /**
     * Add a new memeber to te package XML manifest
     * @param type Type of component to add
     * @param member Name of the component to add
     */
    public add(type: string, member: string) : void {
        if (!type) {
            throw new Error(`Type cannot be an empty or null string`);
        }
        if (!member) {
            throw new Error(`member cannot be an empty or null string`);
        }
        // Add component to package if this is a meta like file
        let members = this.metadataMembers.get(type);
        if (members == null) {
            this.metadataMembers.set(type, members = new Set<string>());
        }
        members.add(member);
    }

    /**
     * Converts the contents of the package to a JSON structure that can be use for retrieval 
     */
    public toJson() : {
        version: string;
        types: { name: string, members: string[] }[]
    } {
        return { 
            version: this.version,
            types: [...this.metadataMembers.entries()].map(([name, members]) => ({ name, members: [...members.values()] }))
        };
    }

    /**
     * Converts the contents of the package to XML that can be saved into a package.xml file
     */
    public toXml() : string {
        const xmlBuilder = new xml2js.Builder(constants.MD_XML_OPTIONS);
        return xmlBuilder.buildObject({ 
            Package: { 
                $: { xmlns : 'http://soap.sforce.com/2006/04/metadata' }, 
                ...this.toJson()
            }
        });
    }

    /**
     * Creates a package XML structure object from a MetadataManifest
     * @param manifest The manifest to create a PackageXML from
     */
    static from(manifest: MetadataManifest) : PackageXml {
        const packageXml = new PackageXml(manifest.apiVersion || '45.0'); 
        for (const info of Object.values(manifest.files)) {
            packageXml.add(info.type, info.name);
        }
        return packageXml;
    }    
}

interface ExtendedFileProperties extends jsforce.FileProperties { 
    packagedFileName: string;
    hasMetaFile: boolean;
    getBuffer(): Promise<Buffer>;
    getStream(): NodeJS.ReadableStream;
    getMetaBuffer(): Promise<Buffer>;
    getMetaStream(): NodeJS.ReadableStream;
}

/**
 * Wraps arround a RetrieveResult Object and allows easy iteration over the files contained in it.
 */
export class RetrieveResultPackage {

    public get success() : boolean {
        return !!this.result.zipFile;
    }
    
    constructor(private readonly result: jsforce.RetrieveResult, private readonly zip : ZipArchive) {
    }

    public getFiles() : Array<ExtendedFileProperties> {
        return this.result.fileProperties.map(file => {
            const packagedFileName = file.fileName;
            const metaFileName = `${file.fileName}-meta.xml`;
            return Object.assign(file, {
                packagedFileName: packagedFileName,
                hasMetaFile: this.zip.file(metaFileName) !== null,
                fileName: file.fileName.split('/').slice(1).join('/'),
                getBuffer: () => this.zip.file(packagedFileName).async('nodebuffer'),
                getStream: () => this.zip.file(packagedFileName).nodeStream(),
                getMetaBuffer: () => this.zip.file(metaFileName)?.async('nodebuffer'),
                getMetaStream: () => this.zip.file(metaFileName)?.nodeStream(),
            });
        });
    }

    public getFileProperties(packageFile: string) : ExtendedFileProperties {
        return this.getFiles().find(f => f.packagedFileName.toLowerCase().endsWith(packageFile.toLowerCase()));
    }

    public async unpackFile(packageFile: string, targetPath: string) : Promise<void> {
        const [ file ] = this.zip.filter(f => f.toLowerCase().endsWith(packageFile.toLowerCase()));
        if (!file) {
            throw new Error(`The specified file ${packageFile} was not found in retrieved package`);
        }
        return new Promise((resolve, reject) => {
            file.nodeStream().pipe(fs.createWriteStream(targetPath, { flags: 'w' }))
                .on('finish', () => resolve())
                .on('error', e => reject(e));
        });        
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
        return results.find(packageInfo => typeof packageName === 'string' ? packageName == packageInfo.fullName : packageName.test(packageInfo.fullName));
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
        const packageXml = new PackageXml(manifest.apiVersion || '45.0');
        const packageZip = new ZipArchive();

        for (const [packagePath, info] of Object.entries(manifest.files)) {
            // Stop directly and return null
            if (token && token.isCancellationRequested) {
                return null;
            }

            const documentBody = info.body ? info.body : await getDocumentBodyAsString(info.localPath);
            packageZip.file(path.posix.join('src', packagePath), documentBody);
            
            if (info.type) {
                packageXml.add(info.type, info.name);
            }
        }

        // Add package.xml
        return packageZip.file(`src/package.xml`, packageXml.toXml());
    }

    /**
     * Build a Salesforce Manifest from the specified files, do not add any files that match the specified pattern.
     * @param srcDir The package directory to read the source from.
     * @param ignorePatterns A list of ignore patterns of the files to ignore.
     */
    public async buildManifest(files: vscode.Uri[], token?: vscode.CancellationToken) : Promise<MetadataManifest> {
        const mdPackage : MetadataManifest = { files: {} };
        const metaFiles =  await getMetaFiles(files.map(file => file.fsPath), true);

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
                    const sourceFiles = await vscode.workspace.findFiles(new vscode.RelativePattern(path.dirname(metaFile), '**'));
                    for (const sourceFile of sourceFiles) {
                        const sourcePackagePath = path.posix.join(packageFolder, componentName, path.basename(sourceFile.fsPath));
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
                    [packagePath]: { name: componentName.split('.').slice(0,-1).join('.'), type: componentType, localPath: metaFile }
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
        const manifest = await this.buildManifest(files, token);
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
     * Deploy the specified destructive changes
     * @param manifest Destructive changes to apply
     * @param options Optional deployment options to use
     * @param token A cancellation token to stop the process
     */
    public async deployDestructiveChanges(manifest: MetadataManifest, options?: jsforce.DeployOptions, progress?: DeploymentProgress, token?: vscode.CancellationToken) : Promise<DetailedDeployResult> {
        const packageZip = await this.buildPackageFromManifest({ 
            apiVersion: manifest.apiVersion, 
            files: { 
                'destructiveChanges.xml': { body: PackageXml.from(manifest).toXml() }
            }
        });
        return this.deploy(packageZip, options, progress, token);
    }

    /**
     * Deploy the selected files to the currently selected org.
     * @param files Files to deploy
     * @param options Extra deploy options
     * @param progressOptions Progress options
     */
    public async deployFiles(files: vscode.Uri[], options?: jsforce.DeployOptions, progress?: DeploymentProgress, token?: vscode.CancellationToken) : Promise<DetailedDeployResult> {
        const packageZip = await this.buildPackageFromFiles(files, '47.0', token);
        if (!packageZip) {
            // return if the task was cancelled
            return;
        }
        return this.deploy(packageZip, options, progress, token);
    }

    /**
     * Deploy the selected files to the currently selected org.
     * @param files Files to deploy
     * @param options Extra deploy options
     * @param progressOptions Progress options
     */
    public async deployManifest(manifest: MetadataManifest, options?: jsforce.DeployOptions, progress?: DeploymentProgress, token?: vscode.CancellationToken) : Promise<DetailedDeployResult> {
        const packageZip = await this.buildPackageFromManifest(manifest, token);
        return this.deploy(packageZip, options, progress, token);
    }    

    /**
     * Deploy a package file, buffer or stream to Salesforce async and returns once the deployment is completed.
     * @param zipInput zip file, buffer or stream to deploy
     * @param options additional deploy options
     * @param progressOptions progress options
     */
    private async deploy(zipInput: Stream | Buffer | string | ZipArchive, options?: jsforce.DeployOptions, progress?: DeploymentProgress, token?: vscode.CancellationToken) : Promise<DetailedDeployResult> {
        const startTime = new Date().getTime();
        const checkInterval = 500;
        const deploymentTypeText = options && options.checkOnly ? 'Validate' : 'Deploy';

        const deploymentTask = async (progress: DeploymentProgress, cancellationToken: vscode.CancellationToken) => {
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
                    // Cancel deployment; we don't really care if the cancel is successfull or not
                    (<any>connection.metadata).cancelDeploy(deployJob.id);
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

        return deploymentTask(progress || { report() { } }, token);        
    }

    /**
     * Retrieve the files specified in the Manifest from the currently connected org.
     * @param files Files to deploy
     * @param options Extra deploy options
     * @param progressOptions Progress options
     */
    public async retrieveManifest(manifest: MetadataManifest, token?: vscode.CancellationToken) : Promise<RetrieveResultPackage> {
        const startTime = new Date().getTime();
        const checkInterval = 500;

        const retrieveTask = async (cancellationToken: vscode.CancellationToken) => {
            // Create package
            const packageXml = PackageXml.from(manifest);

            // Start deploy            
            const connection = await this.getJsForceConnection();        
            const retrieveJob = await connection.metadata.retrieve({
                singlePackage: false,
                unpackaged: packageXml.toJson()
            }, undefined);

            // Wait for deploy
            while (await wait(checkInterval)) {            
                if (cancellationToken && cancellationToken.isCancellationRequested) {
                    // we can't cancel a retrieve
                    throw new Error(`Retrieve request cancelled`);
                }

                const status = <RetrieveResult>await connection.metadata.checkRetrieveStatus(retrieveJob.id);
                if (status.done === true || status.done === 'true') {
                    const zip = status.zipFile ? await new ZipArchive().loadAsync(Buffer.from(status.zipFile, 'base64')) : null;
                    return new RetrieveResultPackage(status, zip);
                }
            }
        };

        return retrieveTask(token);
    }
}