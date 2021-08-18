import * as path from 'path';
import { Logger } from '@vlocode/core';
import * as vscode from 'vscode';
import { substringAfterLast } from '@vlocode/util';
import * as xml2js from 'xml2js';
import * as constants from '@constants';
import { injectable } from '@vlocode/core';
import { LifecyclePolicy } from '@vlocode/core';
import { Iterable } from '@vlocode/util';
import { FileSystem } from '@vlocode/core';
import * as chalk from 'chalk';
import { PackageManifest } from './deploy/packageXml';
import { SalesforcePackage } from './deploymentPackage';
import { MetadataRegistry, MetadataType } from './metadataRegistry';

export enum SalesforcePackageType {
    /**
     * Deploy all files in the package
     */
    deploy = 'deploy',
    /**
     * Build a package without adding data.
     */
    retrieve = 'retrieve',
    /**
     * Build package as destructive change; files added inthe builder will be removed from the target org
     */
    destruct = 'destruct',
}

@injectable({ lifecycle: LifecyclePolicy.transient })
export class SalesforcePackageBuilder {

    private readonly mdPackage: SalesforcePackage;
    private readonly parsedFiles = new Set<string>();
    private readonly metadataRegistry = new MetadataRegistry();

    constructor(...args: any[]);
    constructor(
        public readonly apiVersion: string,
        public readonly type: SalesforcePackageType,
        private readonly fs: FileSystem,
        private readonly logger: Logger) {
        this.mdPackage = new SalesforcePackage(apiVersion, '', fs);
    }

    /**
     * Adds one or more files to the package.
     * @param files Array of files to add
     * @param token Optional cancellation token
     * @returns Instance of the package builder.
     */
    public async addFiles(files: Iterable<string | vscode.Uri>, token?: vscode.CancellationToken) : Promise<this> {
        const childMetadataFiles = new Set<[string, string, MetadataType]>();
        const fileUris = Iterable.map(files, file => typeof file !== 'string' ? file.fsPath : file);

        // Build zip archive for all expanded file; filter out files already parsed
        // Note use posix path separators when building package.zip
        for (const file of Iterable.filter(fileUris, file => !this.parsedFiles.has(file) && this.parsedFiles.add(file))) {

            // Stop directly and return null
            if (token && token.isCancellationRequested) {
                break;
            }

            // parse folders recursively
            const fileStat = await this.fs.stat(file);
            if (fileStat == null) {
                throw new Error(`The specified file does not exist or is inaccessible: ${file}`);
            }

            if (fileStat.isDirectory()) {
                await this.addFiles((await this.fs.readDirectory(file)).map(folderFileName => path.join(file, folderFileName)), token);
                continue;
            }

            // If selected file is a meta file check the source file instead
            const isMetaFile = file.endsWith('-meta.xml');
            if (isMetaFile) {
                const sourceFile = file.slice(0, -9);
                if (await this.fs.isFile(sourceFile)) {
                    await this.addFiles([ sourceFile ], token);
                    continue;
                }
            }

            // get metadata type
            const xmlName = await this.getComponentType(file);
            if (xmlName == 'Package' && path.basename(file).includes('destructive')) {
                const destructiveChangeType = file.toLocaleLowerCase().includes('post') ? 'post' : 'pre';
                await this.mdPackage.mergeDestructiveChanges(file, destructiveChangeType);
                continue;
            }

            const metadataType = xmlName && this.getMetadataType(xmlName);
            if (!xmlName || !metadataType) {
                this.logger.warn(`Adding ${file} (xmlName: ${xmlName ?? '?'}) is not a known Salesforce metadata type`);
                continue;
            }

            if (metadataType.xmlName != xmlName) {
                // Support for SFDX formatted source code
                childMetadataFiles.add([ file, xmlName, metadataType]);
                continue;
            }

            if (metadataType.isBundle) {
                // Only Aura and LWC are bundled at this moment
                // Classic metadata package all related files
                await this.addBundledSources(path.dirname(file), metadataType);
            } else {
                // add source
                await this.addSingleSourceFile(file, metadataType);
            }
        }

        for (const [file, xmlName, metadataType] of childMetadataFiles) {
            await this.mergeChildSourceWithParent(file, xmlName, metadataType);
        }

        return this;
    }

    private async addBundledSources(bundleFolder: string, metadataType: MetadataType) {
        const bundleFiles = await this.fs.readDirectory(bundleFolder);
        const componentName = bundleFolder.split(/\\|\//g).pop()!;
        for (const file of bundleFiles.map(fileName => path.join(bundleFolder, fileName))) {
            if (await this.fs.isFile(file)) {
                await this.addSingleSourceFile(file, metadataType, componentName);
            }
        }
    }

    private async addSingleSourceFile(file: string, metadataType: MetadataType, componentName?: string) {
        if (!componentName) {
            // resolve component name when not defined as input param
            componentName = this.getPackageComponentName(file, metadataType);
        }

        if (this.type === SalesforcePackageType.destruct) {
            this.mdPackage.addDestructiveChange(metadataType.xmlName, componentName);
        } else {
            const packagePath = this.getPackagePath(file, metadataType);
            this.mdPackage.add({
                xmlName: metadataType.xmlName,
                componentName,
                packagePath,
                fsPath: file
            });

            // Make sure the meta file when it exists is also added to the deployment
            const isMetaFile = file.endsWith('-meta.xml');
            const isMetaFilePackaged = this.mdPackage.hasPackageData(`${packagePath}-meta.xml`);
            if (!isMetaFile && !isMetaFilePackaged && await this.fs.isFile(`${file}-meta.xml`)) {
                this.mdPackage.add({
                    xmlName: metadataType.xmlName,
                    componentName,
                    packagePath: `${packagePath}-meta.xml`,
                    fsPath: `${file}-meta.xml`
                });
            }
        }

        this.logger.verbose(`Added ${path.basename(file)} (${componentName}) as [${chalk.green(metadataType.xmlName)}]`);
    }

    /**
     * Merge the source of the child element into the parent
     * @param sourceFile Source file containing the child source
     * @param xmlName XML name of the child element
     * @param metadataType Metadata type of the parent/root
     */
    private async mergeChildSourceWithParent(sourceFile: string, xmlName: string, metadataType: MetadataType) {
        // Get metadata type for a source file
        const tagNameInParent = substringAfterLast(path.dirname(sourceFile), /\\|\//);
        const childComponentName = this.getPackageComponentName(sourceFile, metadataType);
        const childMetadata = (await xml2js.parseStringPromise(await this.fs.readFileAsString(sourceFile)))[xmlName];

        const parentComponentFolder = path.join(...sourceFile.split(/\\|\//g).slice(0,-2));
        const parentComponentName = path.basename(parentComponentFolder);
        const parentComponentMetaFile =  path.join(parentComponentFolder, `${parentComponentName}.${metadataType.suffix}-meta.xml`);
        const parentPackagePath = this.getPackagePath(parentComponentMetaFile, metadataType);
        const parentPackageData = await this.mdPackage.getPackageData(parentPackagePath);
        const parentMetadata = parentPackageData ? await xml2js.parseStringPromise(parentPackageData)[metadataType.xmlName] : {};

        // Merge child metadata into parent metadata 
        const mergedMetadata = this.mergeMetadata(parentMetadata, { [tagNameInParent]: childMetadata });
        if (this.type == SalesforcePackageType.deploy) {
            this.mdPackage.setPackageData(parentPackagePath, { data: this.buildMetadataXml(metadataType.xmlName, mergedMetadata) });
        }

        // Add as member to the package when not yet mentioned
        if (this.type == SalesforcePackageType.destruct) {
            this.mdPackage.addDestructiveChange(xmlName, `${parentComponentName}.${childComponentName}`);
        } else {
            this.mdPackage.addManifestEntry(metadataType.xmlName, parentComponentName);
            this.mdPackage.addManifestEntry(xmlName, `${parentComponentName}.${childComponentName}`);
            this.mdPackage.addSourceMap(sourceFile, { xmlName, componentName: childComponentName, packagePath: parentPackagePath });
        }

        this.logger.verbose(`Adding ${path.basename(sourceFile)} as ${parentComponentName}.${childComponentName}`);
    }

    /**
     * Merge the source file into the existing package metadata when there is an existing metadata file.
     * @param packagePath Relative path of the source file in the package
     * @param fileToMerge Path of the metedata file to merge into the existing package file
     * @param metadataType Type of metadata to merge
     * @returns true if the file is merged otherwise false.
     */
    private async mergeWithExistingMetadata(packagePath: string, sourceFile: vscode.Uri, metadataType: MetadataType) {
        const existingPackageData = await this.mdPackage.getPackageData(packagePath);
        if (!existingPackageData) {
            return false;
        }

        const existingMetadata = await xml2js.parseStringPromise(existingPackageData);
        const newMetadata = await xml2js.parseStringPromise(await this.fs.readFileAsString(sourceFile.fsPath));
        const mergedMetadata = this.mergeMetadata(existingMetadata[metadataType.xmlName], newMetadata[metadataType.xmlName]);
        this.mdPackage.setPackageData(packagePath, { data: this.buildMetadataXml(metadataType.xmlName, mergedMetadata), fsPath: sourceFile.fsPath});
        return true;
    }

    //  private async addEmbeddedMetadataMembers(sourceFile: vscode.Uri, metadataType: MetadataType) {
    //     const metadata = await xml2js.parseStringPromise(await getDocumentBodyAsString(sourceFile));
    //     for(const [key, value] of Object.entries(metadata[metadataType.xmlName])) {
    //         //const isChildElement = 
    //         if (typeof value === 'object') {
    //             for (const child of asArray(value)) {

    //             }
    //         }
    //     }
    // }

    private mergeMetadata(targetMetadata: object, sourceMetdata: object) {
        for (let [key, value] of Object.entries(sourceMetdata)) {
            if (value === undefined) {
                continue; // skip undefined
            }

            if (typeof value === 'object' && !Array.isArray(value)) {
                value = [ value ];
            }

            const existingValue = targetMetadata[key];
            if (!existingValue) {
                targetMetadata[key] = value;
            } else if (Array.isArray(value)) {
                if (Array.isArray(existingValue)) {
                    existingValue.push(...value);
                } else if (typeof targetMetadata === 'object') {
                    targetMetadata[key] = [ targetMetadata[key], ...value ];
                } else {
                    throw new Error(`Cannot merge metadata; properties of the source and target metadata are incompatible for property ${key}: expected source to be an Object or Array `);
                }
            }
        }
        return targetMetadata;
    }

    /**
     * Gets SalesforcePackage underlying the builder.
     */
    public getPackage(): SalesforcePackage {
        this.mdPackage.generateMissingMetaFiles();
        return this.mdPackage;
    }

    /**
     * Gets SalesforcePackage underlying the builder.
     */
    public getManifest(): PackageManifest {
        this.mdPackage.generateMissingMetaFiles();
        return this.mdPackage.manifest;
    }

    private getMetadataType(xmlName: string) {
        const metadataTypes = this.metadataRegistry.getMetadataTypes();
        return metadataTypes.find(type => type.xmlName == xmlName || type.childXmlNames?.includes(xmlName));
    }

    private async getComponentType(file: string) : Promise<string| undefined> {
        const xmlName = await this.getComponentTypeFromSource(file);
        if (xmlName) {
            return xmlName;
        }

        // Strict directory name check
        const pathParts = file.split(/\\|\//g).slice(0, -1);
        const folder = pathParts.pop();
        const parentFolder = pathParts.pop();

        for (const type of this.metadataRegistry.getMetadataTypes()) {
            if (type.strictDirectoryName) {
                if (type.isBundle) {
                    // match parent folder only for bundles
                    if (parentFolder == type.directoryName){
                        return type.xmlName;
                    }
                } else if (folder == type.directoryName) {
                    return type.xmlName;
                }
            }
        }

        // Suffix check
        const fileSuffix = file.split('.').pop()?.toLocaleLowerCase();
        if (fileSuffix) {
            return this.metadataRegistry.getMetadataTypeBySuffix(fileSuffix)?.xmlName;
        }

        // const fileLowerCase = file.fsPath.toLowerCase();
        // const directoryNameOnlyMatches = new Array<string>();

        // for (const type of this.salesforce.getMetadataTypes()) {
        //     const suffixMatches = type.suffix && fileLowerCase.endsWith(`.${type.suffix.toLowerCase()}`);
        //     const metaSuffixMatches = type.suffix && type.metaFile && fileLowerCase.endsWith(`.${type.suffix.toLowerCase()}-meta.xml`);
        //     const fileDirName = type.isBundle ? path.dirname(path.dirname(file.fsPath)) : path.dirname(file.fsPath);
        //     const directoryNameMatches = type.directoryName && fileDirName.split(/[/\\]/g).some(dirname => stringEquals(dirname, type.directoryName));

        //     if (type.strictDirectoryName && !directoryNameMatches) {
        //         continue;
        //     }

        //     if (metaSuffixMatches) {
        //         return type.xmlName;
        //     }

        //     if (suffixMatches) {
        //         if (type.metaFile && fileExists(`${file.fsPath}-meta.xml`)) {
        //             return type.xmlName;
        //         }

        //         if (directoryNameMatches) {
        //             return type.xmlName;
        //         }
        //     }

        //     if (directoryNameMatches) {
        //         // Matches aura and lwc bundled files primarly
        //         directoryNameOnlyMatches.push(type.xmlName);
        //     }
        // }

        // if (directoryNameOnlyMatches.length == 1) {
        //     return directoryNameOnlyMatches.pop();
        // }
    }

    private async getComponentTypeFromSource(file: string) {
        const metaFile = `${file}-meta.xml`;

        if (await this.fs.isFile(metaFile)) {
            // Prefer meta file if they exist
            return this.getComponentTypeFromSource(metaFile);
        }

        const metadataTypes = this.metadataRegistry.getMetadataTypes();
        let xmlName = await this.getRootElementName(file);

        // Cannot detect certain metadata types properly so instead manually set the type
        if (xmlName == 'EmailFolder') {
            xmlName = 'EmailTemplate';
        } else if (xmlName && xmlName.endsWith('Folder')) {
            // Handles document Folder and other folder cases
            xmlName = xmlName.substr(0, xmlName.length - 6);
        } else if (xmlName == 'Package') {
            // Package are considered valid types for destructive changes
            return xmlName;
        }

        const metadataType = xmlName && metadataTypes.find(type => type.xmlName == xmlName || type.childXmlNames?.includes(xmlName!));
        if (metadataType) {
            return xmlName;
        }
    }

    /**
     * Get root Element/Tag name of the specified XML file.
     * @param file Path to the XML file from which to get the root element name.
     */
    private async getRootElementName(file: string) {
        const body = await this.fs.readFileAsString(file);
        if (body.trimStart().startsWith('<?xml ')) {
            try {
                return Object.keys(await xml2js.parseStringPromise(body)).shift();
            } catch{
                return undefined;
            }
        }
    }

    /**
     * Gets the name of the component for the package manifest
     * @param metaFile 
     * @param metadataType 
     */
    private getPackageComponentName(metaFile: string, metadataType: MetadataType) : string {
        const sourceFileName = path.basename(metaFile).replace(/-meta\.xml$/ig, '');
        const componentName = sourceFileName.replace(/\.[^.]+$/ig, '');

        if (metadataType.isBundle) {
            return metaFile.split(/\\|\//g).slice(-2).shift()!;
        }

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
    private getPackageFolder(fullSourcePath: string, metadataType: MetadataType) : string {
        const retainFolderStructure = !!metadataType.inFolder;
        const componentPackageFolder = metadataType.directoryName;

        if (retainFolderStructure && componentPackageFolder) {
            const packageParts = path.dirname(fullSourcePath).split(/\/|\\/g);
            const packageFolderIndex = packageParts.indexOf(componentPackageFolder);
            return packageParts.slice(packageFolderIndex).join(path.posix.sep);
        }

        if (metadataType.isBundle && componentPackageFolder) {
            const componentName = fullSourcePath.split(/\\|\//g).slice(-2).shift()!;
            return path.posix.join(componentPackageFolder, componentName);
        }

        return componentPackageFolder ?? substringAfterLast(path.dirname(fullSourcePath), /\/|\\/g);
    }

    private getPackagePath(sourceFile: string, metadataType: MetadataType) {
        return path.posix.join(this.getPackageFolder(sourceFile, metadataType), path.basename(sourceFile));
    }

    private buildMetadataXml(rootName: string, data?: any) {
        const xmlBuilder = new xml2js.Builder(constants.MD_XML_OPTIONS);
        return xmlBuilder.buildObject({
            [rootName]: {
                $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
                ...(data || {})
            }
        });
    }
}