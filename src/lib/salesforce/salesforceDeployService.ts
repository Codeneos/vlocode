import * as chalk from 'chalk';
import * as path from 'path';
import { Stream } from 'stream';
import * as fs from 'fs-extra';
import * as jsforce from 'jsforce';
import * as ZipArchive from 'jszip';
import { Logger } from 'lib/logging';
import { wait } from 'lib/util/async';
import { filterAsyncParallel, mapAsyncParallel, filterUndefined } from 'lib/util/collection';
import { getDocumentBodyAsString } from 'lib/util/fs';
import * as metaFileTemplates from 'metaFileTemplates.yaml';
import * as vscode from 'vscode';
import { formatString, stringEquals, substringAfterLast } from 'lib/util/string';
import { MetadataManifest, PackageXml } from './deploy/packageXml';
import { RetrieveResultPackage } from './deploy/retrieveResultPackage';
import SalesforceService from './salesforceService';
import { service } from 'lib/core/inject';
import { MetadataObject } from 'jsforce';
import VlocodeConfiguration from 'lib/vlocodeConfiguration';

export type DetailedDeployResult = jsforce.DeployResult & {
    details?: { componentFailures?: ComponentFailure[] };
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

export type DeploymentProgress = vscode.Progress<{
    message?: string;
    increment?: number;
    total?: number;
}>;

interface RetrieveStatus extends jsforce.RetrieveResult {
    done: boolean | string;
    success: boolean | string;
    errorMessage?: string;
    errorStatusCode?: string;
    status: 'Pending' | 'InProgress' | 'Succeeded' | 'Failed';
}

@service()
export class SalesforceDeployService {

    constructor(...args: any[]);
    constructor(
        private readonly salesforce: SalesforceService,
        private readonly config: VlocodeConfiguration,
        private readonly logger: Logger) {
    }

    /**
     * Builds a ZIP archive from a manifest info object that can be deployed 
     * @param manifest The manifest created by hand or generated by `createDeploymentManifest`
     * @param token Optional cancellation token
     */
    public async buildPackageFromManifest(manifest: MetadataManifest, token?: undefined) : Promise<ZipArchive>
    public async buildPackageFromManifest(manifest: MetadataManifest, token?: vscode.CancellationToken) : Promise<ZipArchive | undefined>
    public async buildPackageFromManifest(manifest: MetadataManifest, token?: vscode.CancellationToken) : Promise<ZipArchive | undefined> {
        // Build package XML
        const packageXml = new PackageXml(manifest.apiVersion || '45.0');
        const packageZip = new ZipArchive();

        // Log
        this.logger.verbose(`Building metadata ZIP package API ${packageXml.version}`);

        for (const [packagePath, info] of Object.entries(manifest.files)) {
            // Stop directly and return null
            if (token && token.isCancellationRequested) {
                return;
            }

            try {
                const documentBody = info.body !== undefined ? info.body : await getDocumentBodyAsString(info.localPath);
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
        return packageZip.file('package.xml', packageXml.toXml());
    }

    /**
     * Build a Salesforce Manifest from the specified files, do not add any files that match the specified pattern.
     * @param srcDir The package directory to read the source from.
     * @param ignorePatterns A list of ignore patterns of the files to ignore.
     */
    public async buildManifest(files: vscode.Uri[], apiVersion?: string, token?: undefined) : Promise<MetadataManifest>
    public async buildManifest(files: vscode.Uri[], apiVersion?: string, token?: vscode.CancellationToken) : Promise<MetadataManifest | undefined>
    public async buildManifest(files: vscode.Uri[], apiVersion?: string, token?: vscode.CancellationToken) : Promise<MetadataManifest | undefined> {
        const targetApiVersion = apiVersion || this.config.salesforce.apiVersion || '45.0';
        const mdPackage : MetadataManifest = { piVersion: targetApiVersion, files: {} };

        this.logger.verbose(`Building package manifest for ${files.length} selected files/folders`);

        // Build zip archive for all expanded files
        // Note use posix path separators when building package.zip
        for (const file of files) {

            // Stop directly and return null
            if (token && token.isCancellationRequested) {
                return;
            }

            // get metadata type
            const metadataType = await this.getMetadataType(file.fsPath);
            if (!metadataType) {
                continue;
            }

            const isBundle = metadataType.xmlName.endsWith('Bundle');
            const packageFolder = this.getPackageFolder(file.fsPath, metadataType);
            const componentName = this.getPackageComponentName(file.fsPath, metadataType);

            if (isBundle) {
                // Only Aura and LWC are bundled at this moment
                // Classic metadata package all related files
                const sourceFiles = await vscode.workspace.findFiles(new vscode.RelativePattern(path.dirname(file.fsPath), '**'));
                for (const sourceFile of sourceFiles) {
                    const sourcePackagePath = path.posix.join(packageFolder, componentName, path.basename(sourceFile.fsPath));
                    mdPackage.files[sourcePackagePath] = { name: componentName, type: metadataType.xmlName, localPath: sourceFile.fsPath };
                }
            } else {
                // First try adding the metadata file - if fails continue and also skip adding source
                if (metadataType.metaFile) {
                    // For files that require a separate meta file include it
                    const metaFile = `${file}-meta.xml`;
                    const metaPackagePath = path.posix.join(packageFolder, path.basename(metaFile));

                    if (fs.existsSync(metaFile)) {
                        mdPackage.files[metaPackagePath] = { name: componentName, type: metadataType.xmlName, localPath: metaFile };
                    } else {
                        const metaBody = await this.generateMetaFileBody(file.fsPath, targetApiVersion, metadataType);
                        if (!metaBody) {
                            this.logger.error(`${file} is missing a -meta.xml - auto generation of meta-xml files is not supported for type ${metadataType.xmlName}`);
                            continue;
                        }
                        mdPackage.files[metaPackagePath] = { name: componentName, type: metadataType.xmlName, body: metaBody };
                    }
                }

                // add source
                const sourcePackagePath = path.posix.join(packageFolder, path.basename(file.fsPath));
                mdPackage.files[sourcePackagePath] = { name: componentName, type: metadataType.xmlName, localPath: file.fsPath };
            }
        }

        return mdPackage;
    }

    private async generateMetaFileBody(file: string, apiVersion: string, metadataType: MetadataObject) {
        if (metaFileTemplates[metadataType.xmlName]) {
            const contextValues = {
                apiVersion, file,
                name: file.match(/((.*[\\/])|^)([\w.-]+)\.[\w]+$/)?.[3]
            };
            return formatString(metaFileTemplates[metadataType.xmlName], contextValues).trim();
        }
    }

    private async getMetadataType(fileName: string) {
        const metadataTypes = await this.salesforce.getMetadataTypes();
        for (const type of metadataTypes.metadataObjects) {
            if (type.suffix) {
                if (fileName.endsWith(`.${type.suffix}`)) {
                    return type;
                }
            } else if (type.directoryName) {
                // Consider both the directory and sub-directories
                const dirnames = [ path.dirname(fileName), path.dirname(path.dirname(fileName)) ];
                // @ts-expect-error compiler does not validate that type.directoryName cannot be null
                if (dirnames.some(dirname => stringEquals(dirname, type.directoryName))) {
                    return type;
                }
            }
        }
    }

    /**
     * Gets the name of the component for the package manifest
     * @param metaFile 
     * @param metadataType 
     */
    private getPackageComponentName(metaFile: string, metadataType: MetadataObject) : string {
        const sourceFileName = path.basename(metaFile).replace(/-meta\.xml$/ig, '');
        const componentName = sourceFileName.replace(/\.[^.]+$/ig, '');
        const packageFolder = this.getPackageFolder(metaFile, metadataType);

        if (packageFolder.includes(path.posix.sep)) {
            return packageFolder.split(path.posix.sep).slice(1).concat([ componentName ]).join(path.posix.sep);
        }

        return componentName;
    }

    /**
     * Get the packaging folder for the source file.
     * @param fullSourcePath 
     * @param metadataType 
     */
    private getPackageFolder(fullSourcePath: string, metadataType: MetadataObject) : string {
        const retainFolderStructure = metadataType.inFolder;
        const componentPackageFolder = metadataType.directoryName;

        if (retainFolderStructure && componentPackageFolder) {
            const packageParts = path.dirname(fullSourcePath).split(/\/|\\/);
            const packageFolderIndex = packageParts.indexOf(componentPackageFolder);
            return packageParts.slice(packageFolderIndex).join(path.posix.sep);
        }

        return componentPackageFolder ?? substringAfterLast(path.dirname(fullSourcePath), /\/|\\/);
    }

    /**
     * Build a Salesforce package from the specified directory, do not add any files that match the specified pattern.
     * @param srcDir The package directory to read the source from.
     * @param ignorePatterns A list of ignore patterns of the files to ignore.
     */
    private async buildPackageFromFiles(files: vscode.Uri[], apiVersion: string, token?: undefined): Promise<ZipArchive>
    private async buildPackageFromFiles(files: vscode.Uri[], apiVersion: string, token?: vscode.CancellationToken): Promise<ZipArchive | undefined>
    private async buildPackageFromFiles(files: vscode.Uri[], apiVersion: string, token?: vscode.CancellationToken): Promise<ZipArchive | undefined> {
        const manifest = await this.buildManifest(files, apiVersion, token);
        if (!manifest) {
            return;
        }
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
                }).on('error', err => {
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
    public async deployFiles(files: vscode.Uri[], options?: jsforce.DeployOptions, progress?: DeploymentProgress, token?: undefined) : Promise<DetailedDeployResult>
    public async deployFiles(files: vscode.Uri[], options?: jsforce.DeployOptions, progress?: DeploymentProgress, token?: vscode.CancellationToken) : Promise<DetailedDeployResult | undefined>
    public async deployFiles(files: vscode.Uri[], options?: jsforce.DeployOptions, progress?: DeploymentProgress, token?: vscode.CancellationToken) : Promise<DetailedDeployResult | undefined> {
        const packageZip = await this.buildPackageFromFiles(files, '47.0', token);
        if (!packageZip) {
            // Return if the task was cancelled
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
    public async deployManifest(manifest: MetadataManifest, options?: jsforce.DeployOptions, progress?: DeploymentProgress, token?: undefined) : Promise<DetailedDeployResult>
    public async deployManifest(manifest: MetadataManifest, options?: jsforce.DeployOptions, progress?: DeploymentProgress, token?: vscode.CancellationToken) : Promise<DetailedDeployResult | undefined>
    public async deployManifest(manifest: MetadataManifest, options?: jsforce.DeployOptions, progress?: DeploymentProgress, token?: vscode.CancellationToken) : Promise<DetailedDeployResult | undefined> {
        const packageZip = await this.buildPackageFromManifest(manifest, token);
        if (!packageZip) {
            // Return if the task was cancelled
            return;
        }
        return this.deploy(packageZip, options, progress, token);
    }

    /**
     * Deploy a package file, buffer or stream to Salesforce async and returns once the deployment is completed.
     * @param zipInput zip file, buffer or stream to deploy
     * @param options additional deploy options
     * @param progressOptions progress options
     */
    private async deploy(zipInput: Stream | Buffer | string | ZipArchive, options?: jsforce.DeployOptions, progress?: DeploymentProgress, token?: vscode.CancellationToken) : Promise<DetailedDeployResult> {
        const checkInterval = 500;
        const logInterval = 5000;
        const deploymentTypeText = options && options.checkOnly ? 'Validate' : 'Deploy';

        const deploymentTask = async (progress?: DeploymentProgress, cancellationToken?: vscode.CancellationToken) => {
            // Convert jszip object to Buffer object
            if (zipInput instanceof ZipArchive) {
                zipInput = await zipInput.generateAsync({
                    type: 'nodebuffer',
                    compression: 'DEFLATE',
                    compressionOptions: {
                        level: 7
                    }
                });
            }

            // Set deploy options passed to JSforce; options arg can override the defaults
            const deployOptions = {
                singlePackage: true,
                performRetrieve: true,
                ignoreWarnings: true,
                autoUpdatePackage: false,
                allowMissingFiles: false,
                // We assume we only run on developer orgs by default
                purgeOnDelete: true,
                rollbackOnError: false,
                ...options
            };

            if (await this.salesforce.isProductionOrg()) {
                this.logger.warn('Production deployment detected; running as validate/checkOnly');
                // Always check only for production
                deployOptions.rollbackOnError = true;
                deployOptions.purgeOnDelete = false;
                // @ts-expect-error Types for JSforce are outdated; checkOnly is a valid deploy options
                deployOptions.checkOnly = true;
            }

            // Start deploy            
            const connection = await this.salesforce.getJsForceConnection();
            const deployJob = await connection.metadata.deploy(zipInput, deployOptions);

            // Wait for deploy
            let lastConsoleLog = 0;
            while (await wait(checkInterval)) {
                if (cancellationToken && cancellationToken.isCancellationRequested) {
                    // @ts-expect-error; cancelDeploy is not available in jsforce types
                    void connection.metadata.cancelDeploy(deployJob.id);
                    throw new Error(`${deploymentTypeText} cancelled`);
                }

                const status = await connection.metadata.checkDeployStatus(deployJob.id, true);

                if (Date.now() - lastConsoleLog > logInterval) {
                    // Do not create seperate interval for logging but use the main status check loop
                    this.logger.info(
                        `Deployment ${status.id} - ${status.status} ` +
                        `(${status.numberComponentsDeployed ?? 0}/${status.numberComponentsTotal ?? 0})`);
                    lastConsoleLog = Date.now();
                }

                if (status.done) {
                    const details : any = status.details;
                    if (details.componentFailures && !Array.isArray(details.componentFailures)) {
                        details.componentFailures = [ details.componentFailures ];
                    }
                    return status;
                }
            }
        };

        // @ts-expect-error TS does not correctly detect the return param for the while loop `await wait` loop
        return deploymentTask(progress, token);
    }

    /**
     * Retrieve the files specified in the Manifest from the currently connected org.
     * @param files Files to deploy
     * @param options Extra deploy options
     * @param progressOptions Progress options
     */
    public async retrieveManifest(manifest: MetadataManifest, token?: vscode.CancellationToken) : Promise<RetrieveResultPackage> {
        const checkInterval = 500;

        const retrieveTask = async (cancellationToken?: vscode.CancellationToken) => {
            // Create package
            const packageXml = PackageXml.from(manifest);
            const singlePackage = true;

            // Start deploy            
            const connection = await this.salesforce.getJsForceConnection();
            const retrieveJob = await connection.metadata.retrieve({
                singlePackage, unpackaged: packageXml.toJson()
            }, undefined);

            // Wait for deploy
            while (await wait(checkInterval)) {
                if (cancellationToken && cancellationToken.isCancellationRequested) {
                    // We can't cancel a retrieve
                    throw new Error('Retrieve request cancelled');
                }

                const status = await connection.metadata.checkRetrieveStatus(retrieveJob.id) as RetrieveStatus;
                if (status.done === true || status.done === 'true') {
                    const retrieveZip = status.zipFile ? await new ZipArchive().loadAsync(Buffer.from(status.zipFile, 'base64')) : undefined;
                    return new RetrieveResultPackage(status, singlePackage, retrieveZip);
                }
            }
        };

        // @ts-expect-error TS does not correctly detect the return param for the while loop `await wait` loop
        return retrieveTask(token);
    }

    /**
     * Simpel check if the specified XML file starts with a valid XML header.
     * @param file Text file to check
     */
    private async hasXmlHeader(file: string) {
        try {
            const body = await getDocumentBodyAsString(file);
            if (body) {
                const startsWithXmlHeader = body.trimStart().startsWith('<?xml ');
                return startsWithXmlHeader;
            }
        } catch {
            // Avoid erroring out in case we ty this on an invalid path
        }
        return false;
    }

    /**
     * Gets a list of Salesforce meta files found in the specified path or paths
     * @param paths Path to get meta files from
     */
    private async getMetaFiles(paths: string[] | string, recursive: boolean = false) : Promise<string[]> {

        // Determine possible meta search paths for the selected files
        const searchPaths = [] as string[];
        for (const file of paths) {
            const pathParts = file.split(/\/|\\/ig);
            if (pathParts.includes('lwc')) {
                const componentPath = pathParts.slice(0, pathParts.lastIndexOf('lwc') + 2);
                searchPaths.push(path.join(...componentPath));
            } else if (pathParts.includes('aura')) {
                const componentPath = pathParts.slice(0, pathParts.lastIndexOf('aura') + 2);
                searchPaths.push(path.join(...componentPath));
            } else {
                searchPaths.push(file);
                searchPaths.push(`${file  }-meta.xml`);
            }
        }

        const results = await mapAsyncParallel(searchPaths, async pathStr => {
            const stat = await fs.stat(pathStr).catch(e => undefined);
            if (stat === undefined) {
                return;
            }
            const files = stat.isDirectory() ? (await fs.readdir(pathStr)).map(file => path.join(pathStr, file)) : [ pathStr ];

            // Let metaFiles = files.filter(name => constants.SF_META_EXTENSIONS.some(ext => name.toLowerCase().endsWith(ext)));
            const metaFiles = await filterAsyncParallel(files, file => this.hasXmlHeader(file), 4);

            if (recursive) {
                const folders = await filterAsyncParallel(files, async file => (await fs.stat(file)).isDirectory());
                metaFiles.push(...(await this.getMetaFiles(folders, recursive)));
            }

            return metaFiles;
        }, 4);

        return filterUndefined(results.flat());
    }
}