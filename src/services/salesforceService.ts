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
import { getMetaFiles, createRecordProxy } from 'salesforceUtil';
import { stripPrefix, parseNumbers } from 'xml2js/lib/processors';
import axios from 'axios';
import SObjectRecord from 'models/sobjectRecord';
import Lazy from 'util/lazy';
import cache from 'util/cache';
import { LogManager, Logger } from 'logging';
import chalk = require('chalk');

export interface InstalledPackageRecord extends jsforce.FileProperties {
    manageableState: string;
    namespacePrefix: string;
}

export interface OrganizationDetails {
    id: string;
    name: string;
    primaryContact: string;
    instanceName: string;
    isSandbox: Boolean;
    organizationType: string;
    namespacePrefix: string;
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

interface ApexLogLevels {
    ApexCode: 'None' | 'Error' | 'Warn' | 'Info' | 'Debug' | 'Fine' | 'Finer' | 'Finest';
    ApexProfiling: 'None' | 'Info' | 'Fine' | 'Finest' ;
    Callout: 'None' | 'Info' | 'Finest';
    Database: 'None' | 'Info' | 'Finest';
    Validation: 'Info' | 'None';
    Visualforce: 'None' | 'Info' | 'Fine' | 'Finest' ;
    Workflow: 'None' | 'Error' | 'Warn' | 'Info' |  'Fine' | 'Finer' ;    
    System: 'None' | 'Info' | 'Debug' | 'Fine' ;
}

type SoapDebuggingLevel = 'NONE' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'FINE' | 'FINER' | 'FINEST';
export type SoapDebuggingHeader = {
    Db?: SoapDebuggingLevel
    Workflow?: SoapDebuggingLevel
    Validation?: SoapDebuggingLevel
    Callout?: SoapDebuggingLevel
    Apex_code?: SoapDebuggingLevel
    Apex_profiling?: SoapDebuggingLevel
    Visualforce?: SoapDebuggingLevel
    System?: SoapDebuggingLevel
    All?: SoapDebuggingLevel
};


/**
 * Simple Salesforce SOAP request formatter
 */
class SoapRequest {
    
    constructor(
        public readonly method : string, 
        public readonly namespace : string, 
        public readonly debuggingHeader: SoapDebuggingHeader = {}) {        
    }

    /**
     * Converts the contents of the package to XML that can be saved into a package.xml file
     */
    public toXml(requestBody: Object, sessionId: string) : string {
        const soapRequestObject = { 
            'soap:Envelope': {
                $: {
                    "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
                    "xmlns": this.namespace
                },
                'soap:Header': {
                    CallOptions: {
                        client: constants.API_CLIENT_NAME
                    },
                    DebuggingHeader: {
                        categories: Object.entries(this.debuggingHeader).map(([category, level]) => ({ category, level }))
                    },
                    SessionHeader: {
                        sessionId: sessionId
                    }
                },
                'soap:Body': {
                    [this.method]: requestBody,
                }
            }
        }; 
        return new xml2js.Builder(constants.MD_XML_OPTIONS).buildObject(soapRequestObject);
    }
}

/**
 * Simple SOAP response
 */
interface SoapResponse { 
    Envelope: {
        Header?: any,
        Body?: {
            Fault?: {
                faultcode: string,
                faultstring: string
            },
            [key: string]: any
        }
    };
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
    packageName: string;
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
    
    constructor(private readonly result: jsforce.RetrieveResult, private readonly singlePackage: boolean, private readonly zip : ZipArchive) {
    }

    public getFiles() : Array<ExtendedFileProperties> {
        return this.result.fileProperties.map(file => {
            const fullFileName = file.fileName;
            const fileName = this.singlePackage ? file.fileName : file.fileName.split('/').slice(1).join('/');
            const packageName = this.singlePackage ? file.fileName.split('/').shift() : undefined;
            const metaFileName = `${file.fileName}-meta.xml`;
            return Object.assign(file, {
                packageName: packageName,
                fullFileName: fullFileName,
                fileName: fileName,
                hasMetaFile: this.zip.file(metaFileName) !== null,
                getBuffer: () => this.zip.file(fullFileName).async('nodebuffer'),
                getStream: () => this.zip.file(fullFileName).nodeStream(),
                getMetaBuffer: () => this.zip.file(metaFileName)?.async('nodebuffer'),
                getMetaStream: () => this.zip.file(metaFileName)?.nodeStream(),
            });
        });
    }

    public getFileProperties(packageFile: string) : ExtendedFileProperties {
        return this.getFiles().find(f => f.fileName.toLowerCase().endsWith(packageFile.toLowerCase()));
    }

    public async unpackFile(packageFile: string, targetPath: string) : Promise<void> {
        const [ file ] = this.zip.filter(file => file.toLowerCase().endsWith(packageFile.toLowerCase()));
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
    private readonly vlocityNamespace = new Lazy(() => this.getInstalledPackageNamespace(/vlocity/i));
    
    constructor(private readonly connectionProvider: JsForceConnectionProvider) {
    }

    protected get logger() : Logger {
        return LogManager.get(SalesforceService);
    }

    public async isProductionOrg() : Promise<Boolean> {
        return (await this.getOrganizationDetails()).isSandbox !== true;
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

    @cache(-1)
    public async getInstalledPackageNamespace(packageName: string | RegExp) : Promise<string> {
        const installedPackage = await this.getInstalledPackageDetails(packageName);
        if (!installedPackage) {
            throw new Error(`Package with name ${packageName} is not installed on your Salesforce organization`);
        }
        return installedPackage.namespacePrefix;
    }

    @cache(-1)
    public async getInstalledPackageDetails(packageName: string | RegExp) : Promise<InstalledPackageRecord | undefined> {
        const results = await this.getInstalledPackages();     
        return results.find(packageInfo => typeof packageName === 'string' ? packageName == packageInfo.fullName : packageName.test(packageInfo.fullName));
    }

    @cache(-1)
    public async getInstalledPackages() : Promise<InstalledPackageRecord[]> {
        const con = await this.getJsForceConnection();
        return con.metadata.list( { type: 'InstalledPackage' }) as Promise<InstalledPackageRecord[]>;
    }

    @cache(-1)
    public async getOrganizationDetails() : Promise<OrganizationDetails> {
        const results = await this.query<OrganizationDetails>('SELECT Id, Name, PrimaryContact, IsSandbox, InstanceName, OrganizationType, NamespacePrefix FROM Organization');
        return results[0];
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
     * Returns a list of records. All records are mapped to record proxy object 
     * @param query SOQL Query to execute
     */
    public async query<T extends Partial<SObjectRecord>>(query: string) : Promise<T[]> {
        const connection = await this.connectionProvider.getJsForceConnection();
        const actualQuery = query.replace(constants.NAMESPACE_PLACEHOLDER, await this.vlocityNamespace);
        const queryResult = await connection.query<T>(actualQuery);
        return queryResult.records.map(record => createRecordProxy<T>(record));
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

            try {
                const documentBody = info.body ? info.body : await getDocumentBodyAsString(info.localPath);
                packageZip.file(packagePath, documentBody);
            } catch(err) {
                this.logger.warn(`Unable to read data from path ${chalk.underline(info.localPath)} when building metadata package`);
                continue;
            }
            
            if (info.type) {
                packageXml.add(info.type, info.name);
            }
        }

        // Add package.xml
        return packageZip.file(`package.xml`, packageXml.toXml());
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
        // Note use posix path separators when building package.zip
        for (const metaFile of metaFiles) {

            // Stop directly and return null
            if (token && token.isCancellationRequested) {
                return null;
            }

            const componentType = await this.getComponentType(metaFile);
            const packageFolder = this.getPackageFolder(metaFile, componentType);
            const componentName = this.getPackageComponentName(metaFile, componentType);

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
                    [packagePath]: { name: componentName, type: componentType, localPath: metaFile }
                });
            }
        }

        return mdPackage;
    }

    private getPackageComponentName(metaFile: string, componentType: string) : string {
        const sourceFileName = path.basename(metaFile).replace(/-meta\.xml$/ig, '');
        const componentName = sourceFileName.replace(/\.[^.]+$/ig, '');
        const packageFolder = this.getPackageFolder(metaFile, componentType);

        if (packageFolder.includes(path.posix.sep)) {
            return packageFolder.split(path.posix.sep).slice(1).concat([ componentName ]).join(path.posix.sep);
        }

        return componentName;
    }

    private getPackageFolder(fullSourcePath: string, componentType: string) : string {
        const componentTypeInfo = metadataTypes[componentType];
        const retainFolderStructure = !!(componentTypeInfo && componentTypeInfo.retainFolderStructure);
        const componentPackageFolder = componentTypeInfo && componentTypeInfo.packageFolder;

        if (retainFolderStructure) {
            const packageParts = path.dirname(fullSourcePath).split(/\/|\\/);
            const packageFolderIndex = packageParts.indexOf(componentPackageFolder);
            return packageParts.slice(packageFolderIndex).join(path.posix.sep);
        }
        
        return componentPackageFolder || path.dirname(fullSourcePath).split(/\/|\\/).pop();
    }

    private async getComponentType(metaFile: string) {
        const metaFileExt = path.extname(metaFile).toLowerCase();

        // Alternate component type for settings
        if (metaFileExt == '.settings') {
            return 'Settings';
        } 

        const metaXml = await xml2js.parseStringPromise(await getDocumentBodyAsString(metaFile));
        const metaBodyTag = Object.keys(metaXml)[0];
        const componentTypeInfo = metadataTypes[metaBodyTag];

        if (componentTypeInfo && componentTypeInfo.packageType) {
            return componentTypeInfo.packageType;
        }

        return metaBodyTag;
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
            const deployJob = await connection.metadata.deploy(zipInput, {
                singlePackage: true, 
                performRetrieve: true, 
                ignoreWarnings: false,
                autoUpdatePackage: false,
                allowMissingFiles: false,
                // We asssume we only run on developer orgs, as such set these options to true by default
                purgeOnDelete: true,
                rollbackOnError: false,
                ...options
            });

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
                    if (details.componentFailures && !Array.isArray(details.componentFailures)) {
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
            const singlePackage = true;

            // Start deploy            
            const connection = await this.getJsForceConnection();        
            const retrieveJob = await connection.metadata.retrieve({
                singlePackage, unpackaged: packageXml.toJson()
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
                    return new RetrieveResultPackage(status, singlePackage, zip);
                }
            }
        };

        return retrieveTask(token);
    }

    private async soapToolingRequest(methodName: string, request: object, debuggingHeader?: SoapDebuggingHeader) : Promise<{ body?: any, debugLog?: any }> {
        const connection = await this.getJsForceConnection();
        const soapRequest = new SoapRequest(methodName, "http://soap.sforce.com/2006/08/apex", debuggingHeader);
        const endpoint = `${connection.instanceUrl}/services/Soap/s/${connection.version}`;
        const result = await axios({
            method: 'POST',
            url: endpoint,
            headers: {
                'SOAPAction': '""',
                'Content-Type':  'text/xml;charset=UTF-8'
            },
            transformResponse: (data: any, headers?: any) => {
                return xml2js.parseStringPromise(data, {
                    tagNameProcessors: [ stripPrefix ],            
                    attrNameProcessors: [ stripPrefix ],
                    valueProcessors: [
                        (value) => {
                            if (/^[0-9]+(\.[0-9]+){0,1}$/i.test(value)) {
                                return parseFloat(value);
                            } else if (/^true|false$/i.test(value)) {
                                return value.localeCompare('true', undefined, { sensitivity: 'base' }) === 0;
                            }
                            return value;
                        }
                    ],
                    explicitArray: false
                });
            },
            data: soapRequest.toXml(request, connection.accessToken)
        });        
        const response = <SoapResponse>(await result.data);

        if (response.Envelope.Body?.Fault) {
            throw new Error(`SOAP API Fault: ${response.Envelope.Body.Fault?.faultstring}`);
        }

        return {
            body: response.Envelope.Body,
            debugLog: response.Envelope?.Header?.DebuggingInfo.debugLog,
        };
    }

    /**
     * Executes the specified APEX using the SOAP API and returns the result.
     * @param apex APEX code to execute
     * @param logLevels Optional debug log levels to use
     */
    public async executeAnonymous(apex: string, logLevels?: SoapDebuggingHeader) : Promise<jsforce.ExecuteAnonymousResult & { debugLog?: string }> {
        const response = await this.soapToolingRequest('executeAnonymous', {
            String: apex
        }, logLevels);
        return {
            ...response.body.executeAnonymousResponse.result,
            debugLog: response.debugLog
        };
    }

    /**
     * Compiles the specified class bodies on the server
     * @param apexClassBody APEX classes to compile
     */
    public async compileClasses(apexClassBody: string[]) : Promise<any> {
        const response = await this.soapToolingRequest('compileClasses', {
            scripts: apexClassBody
        });
        return {
            ...response.body.compileClassesResponse
        };
    }

    // public async getDeveloperLogs(numberOfLogs = 10) {
    //     const connection = await this.getJsForceConnection();
    //     const selectFields = ['Id', 'Application', 'DurationMilliseconds', 'Location', 'LogLength', 'LogUser.Name', 'Operation', 'Request', 'StartTime', 'Status' ];
    //     const toolingQuery = `Select ${selectFields.join(',')} From ApexLog Order By StartTime${numberOfLogs ? ` DESC LIMIT ${numberOfLogs}` : ''}`;
    //     const toolingUrl = `${connection.instanceUrl}/services/data/v${connection.version}/tooling/query/?q=${toolingQuery.replace(' ', '+')}`;
    //     const results1 = await connection.tooling.query(toolingQuery);
    //     const results2 = <any>await connection.request(toolingQuery);
    //     return results2?.records;
    // }

    // public async setLogLevel(name: string, logLevels: ApexLogLevels) {
    //     connection.tooling.create('traceFlag', records)
    //     const connection = await this.getJsForceConnection();
    //     const selectFields = ['Id', 'Application', 'DurationMilliseconds', 'Location', 'LogLength', 'LogUser.Name', 'Operation', 'Request', 'StartTime', 'Status' ];
    //     const toolingQuery = `Select ${selectFields.join(',')} From ApexLog Order By StartTime${numberOfLogs ? ` DESC LIMIT ${numberOfLogs}` : ''}`;
    //     const toolingUrl = `${connection.instanceUrl}/services/data/v${connection.version}/tooling/query/?q=${toolingQuery.replace(' ', '+')}`;
    //     const results1 = await connection.tooling.query(toolingQuery);
    //     const results2 = <any>await connection.request(toolingQuery);
    //     return results2?.records;
    // }
}