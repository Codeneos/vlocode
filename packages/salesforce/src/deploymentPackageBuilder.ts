import * as path from 'path';
import * as chalk from 'chalk';
import * as ZipArchive from 'jszip';

import { Logger, injectable , LifecyclePolicy, CachedFileSystemAdapter , FileSystem, container, Container } from '@vlocode/core';
import { cache, substringAfterLast , Iterable, XML, CancellationToken, FileSystemUri, intersect, except, primitiveCompare, deepCompare, filterObject } from '@vlocode/util';

import { PackageManifest } from './deploy/packageXml';
import { SalesforcePackage, SalesforcePackageComponent } from './deploymentPackage';
import { MetadataRegistry, MetadataType } from './metadataRegistry';
import { SalesforceDeployService } from './salesforceDeployService';
import { RetrieveResultComponent } from './deploy/retrieveResultPackage';

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

type FilePath = string | FileSystemUri;

/**
 * Interface for a strategy to determine which components in the packages have changed and need to be deployed.
 * Returns a list of components that have changed which can be used to create a new deployment package.
 */
export interface DeltaPackageStrategy<TOptions extends object = object> {
    /**
     * Gets a list of components that have changed since the last deployment.
     * @param metadataPackage Package to get changed components for.
     */
    getChangedComponents(
        metadataPackage: SalesforcePackage, 
        options?: { 
            cancellationToken?: CancellationToken 
        } & TOptions
    ): Promise<Array<SalesforcePackageComponent>>;
}

interface MetadataObject {
    type: MetadataType;
    data: Record<string, unknown>;
}

@injectable( { lifecycle: LifecyclePolicy.transient } )
export class SalesforcePackageBuilder {

    /**
     * Default API version to use when no version is specified.
     */
    public static defaultApiVersion = '50.0';

    private readonly mdPackage: SalesforcePackage;
    private readonly fs: FileSystem;
    private readonly parsedFiles = new Set<string>();
    private readonly composedData = new Map<string, MetadataObject>();
    @injectable.property private readonly metadataRegistry: MetadataRegistry;
    @injectable.property private readonly logger: Logger;

    constructor(
        public readonly type: SalesforcePackageType = SalesforcePackageType.deploy,
        public readonly apiVersion: string = SalesforcePackageBuilder.defaultApiVersion,
        fs?: FileSystem
    ) {
        this.fs = fs ? new CachedFileSystemAdapter(fs) : fs!;
        this.mdPackage = new SalesforcePackage(this.apiVersion);
    }

    /**
     * Adds one or more files to the package.
     * @param files Array of files to add
     * @param token Optional cancellation token
     * @returns Instance of the package builder.
     */
    public async addFiles(files: Iterable<FilePath>, token?: CancellationToken) : Promise<this> {        
        const childMetadataFiles = new Array<[string, string, MetadataType]>();

        // Build zip archive for all expanded file; filter out files already parsed
        // Note use posix path separators when building package.zip
        for await (const file of this.getFiles(files, token)) {

            // get metadata type
            const xmlName = await this.getComponentType(file);
            if (xmlName == 'Package' && path.basename(file).includes('destructive')) {
                const destructiveChangeType = file.toLocaleLowerCase().includes('post') ? 'post' : 'pre';
                this.mdPackage.mergeDestructiveChanges(await this.fs.readFile(file), destructiveChangeType);
                continue;
            }

            const metadataType = xmlName && this.getMetadataType(xmlName);
            if (!xmlName || !metadataType) {
                const isInStaticResourceFolder = file.split(/\/|\\/).includes('staticresources');
                if (!isInStaticResourceFolder) {
                    // This is just here to avoid complaining on static resources that are part of an extracted zip file
                    this.logger.warn(`${file} (xmlName: ${xmlName ?? '?'}) is not a known Salesforce metadata type`);
                }
                continue;
            }

            if (metadataType.name != xmlName) {
                // Support for SFDX formatted source code
                childMetadataFiles.push([ file, xmlName, metadataType]);
                continue;
            }

            if (metadataType.id == 'staticresource' && file.endsWith('-meta.xml')) {
                const folder = this.stripFileExtension(file, 2);
                const isFolder = await this.fs.isDirectory(folder);
                if (isFolder) {
                    await this.addStaticResourceBundle(folder);
                }
            }

            if (metadataType.isBundle) {
                // Only Aura and LWC are bundled at this moment
                // Classic metadata package all related files
                await this.addBundledSources(path.dirname(file), metadataType);
            }

            // add source
            await this.addSingleSourceFile(file, metadataType);
        }

        for (const [file, xmlName, metadataType] of this.sortXmlFragments(childMetadataFiles)) {
            await this.mergeChildSourceWithParent(file, xmlName, metadataType);
        }

        this.persistComposedMetadata();
        return this;
    }

    private sortXmlFragments(fragments: Array<[string, string, MetadataType]>) : Array<[string, string, MetadataType]> {
        return fragments.sort(([, fragmentTypeA, parentTypeA], [, fragmentTypeB, parentTypeB]) => {
            const metaTypeCompare = parentTypeA.name.localeCompare(parentTypeB.name);
            if (metaTypeCompare != 0) {
                return metaTypeCompare;
            }

            const decompositions = Object.values(parentTypeA.children?.types ?? []);
            if (decompositions) {
                const decompositionIndexA = decompositions.findIndex(({name}) => name === fragmentTypeA);
                const decompositionIndexB = decompositions.findIndex(({name}) => name === fragmentTypeB);
                return decompositionIndexA - decompositionIndexB;
            }

            return fragmentTypeA.localeCompare(fragmentTypeB);
        });
    }

    private async* getFiles(files: Iterable<FilePath>, token?: CancellationToken): AsyncGenerator<string> {
        const fileNames = Iterable.map(files, file => typeof file !== 'string' ? file.fsPath : file);

        // Build zip archive for all expanded file; filter out files already parsed
        // Note use posix path separators when building package.zip
        for (const file of fileNames) {

            // Stop directly and return null
            if (token && token.isCancellationRequested) {
                break;
            }

            if (!this.addParsedFile(file)) {
                continue;
            }

            // parse folders recursively
            const fileStat = await this.fs.stat(file);
            if (fileStat == null) {
                throw new Error(`The specified file does not exist or is inaccessible: ${file}`);
            }

            if (fileStat.isDirectory()) {
                yield* this.getFiles((await this.fs.readDirectory(file)).map(entry => path.join(file, entry.name)), token);
                continue;
            }

            // If selected file is a meta file check the source file instead
            const isMetaFile = file.endsWith('-meta.xml');
            if (isMetaFile) {
                const sourceFile = await this.findContentFile(file);
                if (sourceFile && this.addParsedFile(sourceFile)) {
                    // If the source file is a folder yield the folder content sources
                    // this ensures when just a meta file for a folder is selected the content is also deployed
                    if (await this.fs.isDirectory(sourceFile)) {
                        yield* this.getFiles((await this.fs.readDirectory(sourceFile)).map(entry => path.join(sourceFile, entry.name)), token);
                    } else {
                        yield sourceFile;
                    }
                }
            } else {
                const metaFile = await this.findMetaFile(file);
                if (metaFile && this.addParsedFile(metaFile)) {
                    yield metaFile;
                }
            }

            yield file;
        }
    }

    /**
     * Add file a file to the parsed file set when not already added. Normalizes the file path when required/
     * @param file file to add
     * @returns Returns true when the file is nto yet parsed; returns false when the file is already parsed.
     */
    private addParsedFile(file: string){
        const normalizedFileName = file.split(/\\|\//g).join('/');
        if (!this.parsedFiles.has(normalizedFileName)) {
            this.parsedFiles.add(normalizedFileName);
            return true;
        }
        return false;
    }

    private async addBundledSources(bundleFolder: string, metadataType: MetadataType) {
        const bundleFiles = await this.fs.readDirectory(bundleFolder);
        const componentName = bundleFolder.split(/\\|\//g).pop()!;
        for (const file of bundleFiles) {
            const fullPath = path.join(bundleFolder, file.name);
            if (file.isFile() && this.addParsedFile(fullPath)) {
                await this.addSingleSourceFile(fullPath, metadataType, componentName);
            }
        }
    }

    private async addSingleSourceFile(file: string, metadataType: MetadataType, componentName?: string) {
        if (!componentName) {
            // resolve component name when not defined as input param
            componentName = this.getPackageComponentName(file, metadataType);
        }

        if (this.type === SalesforcePackageType.destruct) {
            this.mdPackage.addDestructiveChange(metadataType.name, componentName);
        } else {
            const packagePath = await this.getPackagePath(file, metadataType);
            this.mdPackage.add({
                componentType: metadataType.name,
                componentName,
                packagePath,
                data: await this.fs.readFile(file),
                fsPath: file
            });
        }

        this.logger.verbose(`Added %s (%s) as [%s]`, path.basename(file), componentName, chalk.green(metadataType.name));
    }

    /**
     * Add compressed static resource bundle to the package; compresses all the resources in the folder into a zip file but does not add
     * the meta-data file for the resource folder.
     * @param folder Folder name to add and compress
     */
    private async addStaticResourceBundle(folder: string) {
        const componentName = folder.split(/\/|\\/g).pop()!;
        const packagePath = `staticresources/${componentName}.resource`;

        if (this.type === SalesforcePackageType.destruct) {
            this.mdPackage.addDestructiveChange('StaticResource', componentName);
        } else if (this.type === SalesforcePackageType.retrieve) {
            this.mdPackage.add({ componentType: 'StaticResource', componentName, packagePath });
        } else {
            this.mdPackage.add({
                componentType: 'StaticResource', componentName, packagePath,
                data: await this.compressFolder(folder)
            });
        }
    }

    /**
     * Compress all files in the specified folder into a single ZIP archive and returns the Buffer to the ZIP archive generated
     * @param folder Folder name to add and compress
     */
    private async compressFolder(folder: string) {
        // Build zip
        const resourceBundle = new ZipArchive();
        for await (const file of this.readDirectoryRecursive(folder)) {
            const relativePath = path.relative(folder, file).replace(/\/|\\/g, '/');
            resourceBundle.file(relativePath, await this.fs.readFile(file));
            this.addParsedFile(file);        }

        return resourceBundle.generateAsync({ type: 'nodebuffer' });
    }

    private async* readDirectoryRecursive(folder: string) {
        for(const file of await this.fs.readDirectory(folder)) {
            const fullPath = path.join(folder, file.name);
            if (file.isDirectory()) {
                return yield* this.readDirectoryRecursive(fullPath);
            } else {
                yield fullPath;
            }
        }
    }

    /**
     * Merge the source of the child element into the parent
     * @param sourceFile Source file containing the child source
     * @param fragmentTypeName XML name of the child element
     * @param parentType Metadata type of the parent/root
     */
    private async mergeChildSourceWithParent(sourceFile: string, fragmentTypeName: string, parentType: MetadataType) {
        // Get metadata type for a source file
        const fragmentType = Object.values(parentType.children?.types ?? []).find(d => d.name === fragmentTypeName);// ?.decompositions.find(d => d.metadataName == xmlName);
        if (!fragmentType) {
            this.logger.error(`No decomposition configuration for: ${chalk.green(sourceFile)} (${fragmentTypeName})`);
            return;
        }

        const childComponentName = this.getPackageComponentName(sourceFile, parentType);
        const folderPerType = parentType.strategies?.decomposition === 'folderPerType';

        const parentComponentFolder = path.join(...sourceFile.split(/\\|\//g).slice(0, folderPerType ? -2 : -1));
        const parentComponentName = path.basename(parentComponentFolder);
        const parentComponentMetaFile =  path.join(parentComponentFolder, `${parentComponentName}.${parentType.suffix}-meta.xml`);
        const parentPackagePath = await this.getPackagePath(parentComponentMetaFile, parentType);

        // Merge child metadata into parent metadata
        if (this.type == SalesforcePackageType.deploy) {
            await this.mergeMetadataFragment(parentPackagePath, sourceFile, parentType);
        }

        // Add as member to the package when not yet mentioned
        if (this.type == SalesforcePackageType.destruct) {
            this.mdPackage.addDestructiveChange(fragmentTypeName, `${parentComponentName}.${childComponentName}`);
        } else {
            if (fragmentType.isAddressable) {
                this.mdPackage.addManifestEntry(fragmentTypeName, `${parentComponentName}.${childComponentName}`);
            } else {
                this.mdPackage.addManifestEntry(parentType.name, parentComponentName);
            }
            this.mdPackage.addSourceMap(sourceFile, { componentType: fragmentTypeName, componentName: `${parentComponentName}.${childComponentName}`, packagePath: parentPackagePath });
        }

        this.logger.verbose(`Added %s (%s.%s) as [%s]`, path.basename(sourceFile), parentComponentName, childComponentName, chalk.green(fragmentTypeName));
    }

    /**
     * Merge the source file into the existing package metadata when there is an existing metadata file.
     * @param packagePath Path of the parent package file in the package
     * @param fragmentFile Path of the metedata file on the FS that should be merged into the package
     * @param metadataType Type of the metadata to merge
     */
    private async mergeMetadataFragment(packagePath: string, fragmentFile: string, metadataType: MetadataType) {
        const [[fragmentTag, fragmentMetadata]] = Object.entries(XML.parse(await this.fs.readFileAsString(fragmentFile), { trimValues: true }));
        const decomposition = Object.values(metadataType.children?.types ?? []).find(d => d.name === fragmentTag);

        if (!decomposition) {
            this.logger.error(`No decomposition configuration for: ${chalk.green(fragmentFile)} (${fragmentTag})`);
            return;
        }

        // Load existing XML
        let existingPackageData = await this.readPackageData(packagePath);
        if (!existingPackageData) {
            // ensure parent files are included
            const parentBaseName =  path.posix.basename(packagePath);
            const parentSourceFile = path.posix.join(fragmentFile, '..', '..', `${parentBaseName}-meta.xml`);
            if (await this.fs.pathExists(parentSourceFile)) {
                existingPackageData = await this.fs.readFileAsString(parentSourceFile);
            }
        }

        // Merge child metadata into parent metadata
        const metadata = await this.readComposedMetadata(packagePath, fragmentFile, metadataType);
        this.mergeMetadata(metadata[metadataType.name], { [decomposition.directoryName]: fragmentMetadata });
    }

    private async readComposedMetadata(packagePath: string, fragmentFile: string, metadataType: MetadataType): Promise<any> {
        const composedData = this.composedData.get(packagePath);
        if (composedData) {
            return composedData.data;
        }

        let existingPackageData = await this.readPackageData(packagePath);
        if (!existingPackageData) {
            // ensure parent files are included
            const parentBaseName =  path.posix.basename(packagePath);
            const parentSourceFile = path.posix.join(fragmentFile, '..', '..', `${parentBaseName}-meta.xml`);
            if (await this.fs.pathExists(parentSourceFile)) {
                existingPackageData = await this.fs.readFileAsString(parentSourceFile);
            }
        }

        const existingMetadata = existingPackageData
            ? XML.parse(existingPackageData, { trimValues: true }) 
            : { [metadataType.name]: {} };
        this.composedData.set(packagePath, { data: existingMetadata, type: metadataType });
        return existingMetadata;
    }

    private async persistComposedMetadata() {
        for (const [ packagePath, { data, type } ] of this.composedData.entries()) {
            this.mdPackage.setPackageData(packagePath, {
                data: this.buildMetadataXml(type.name, data[type.name]),
                componentType: type.name,
                componentName: path.basename(packagePath, `.${type.suffix}`)
            });
        }
    }

    private async readPackageData(packagePath: string): Promise<string | Buffer | undefined> {
        const existingPackageData = this.mdPackage.getPackageData(packagePath);
        if (existingPackageData?.data) {
            return existingPackageData.data;
        } else if (existingPackageData?.fsPath) {
            return this.fs.readFile(existingPackageData.fsPath);
        }
    }

    private mergeMetadata(targetMetadata: object, sourceMetadata: object) {
        // eslint-disable-next-line prefer-const
        for (let [key, value] of Object.entries(sourceMetadata)) {
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
     * Gets a SalesforcePackage containing only the changed components using the provided strategy.
     * TODO: Based on the type of metadata a different strategy should be used instead of the generic one.
     * This will allow for more efficient in delta packaging by using a different API for certain metadata types.
     * @param strategy The strategy to use for getting the changed components
     * @param options Options that are passed to the strategy
     * @returns A SalesforcePackage containing only the changed components
     */
    public async getDeltaPackage<S extends DeltaPackageStrategy<T>, T extends object>(
        strategy: S | (new(...args: any[]) => S),
        options?: Parameters<S['getChangedComponents']>[1]
    ) {
        const mdPackage = this.getPackage();
        const deltaStrategy = typeof strategy === 'function' ? Container.get(this).create(strategy) : strategy;
        const changedComponents = await deltaStrategy.getChangedComponents(mdPackage, options);

        if (!changedComponents.length) {
            return mdPackage;
        }

        const deltaPackage = new SalesforcePackage(this.apiVersion);
        for (const component of changedComponents) {
            deltaPackage.add([...this.mdPackage.getComponentFiles(component)]);
        }

        return deltaPackage;
    }

    /**
     * Gets SalesforcePackage underlying the builder.
     */
    public getPackage(): SalesforcePackage {
        this.mdPackage.generateMissingMetaFiles();
        return this.mdPackage;
    }

    /**
     * @see SalesforcePackage.getManifest
     */
    public getManifest(types?: string[]): PackageManifest {
        return this.mdPackage.getManifest(types);
    }

    private getMetadataType(xmlName: string) {
        const metadataTypes = this.metadataRegistry.getMetadataTypes();
        return metadataTypes.find(type => type.name == xmlName || type.childXmlNames?.includes(xmlName));
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
                        return type.name;
                    }
                } else if (folder == type.directoryName) {
                    return type.name;
                }
            }
        }

        // Suffix check
        const fileSuffix = this.getFileSuffix(file)?.toLocaleLowerCase();
        if (fileSuffix) {
            return this.metadataRegistry.getMetadataTypeBySuffix(fileSuffix)?.name;
        }
    }

    private getFileSuffix(file: string) {
        const metaSuffixMatch = file.match(/\.([^-]+)-meta\.xml$/i);
        if (metaSuffixMatch) {
            return metaSuffixMatch[1];
        }
        const suffix = file.split(/\\|\//g).pop()?.match(/\.([^.]+)$/i)?.[1];
        return suffix?.toLowerCase() != 'xml' ? suffix : undefined;
    }

    private async getComponentTypeFromSource(file: string) {
        const isMetaFile = file.endsWith('-meta.xml');

        if (!isMetaFile) {
            const metaFile = await this.findMetaFile(file);
            if (metaFile) {
                // Prefer meta file if they exist
                return this.getComponentTypeFromSource(metaFile);
            }
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

        const metadataType = xmlName && metadataTypes.find(type => type.name == xmlName || type.childXmlNames?.includes(xmlName!));
        if (metadataType) {
            return xmlName;
        }
    }

    /**
     * Get root Element/Tag name of the specified XML file.
     * @param file Path to the XML file from which to get the root element name.
     */
    private async getRootElementName(file: string) {
        return XML.getRootTagName(await this.fs.readFile(file));
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

    private async getPackagePath(file: string, metadataType: MetadataType) {
        const baseName =  file.split(/\\|\//g).pop()!;
        const contentName = baseName.replace(/-meta\.xml$/i,'');

        const isMetaFile = baseName !== contentName;
        const packageFolder = this.getPackageFolder(file, metadataType);
        const expectedSuffix = isMetaFile ? `${metadataType.suffix}-meta.xml` : `${metadataType.suffix}`;

        if (isMetaFile && !metadataType.hasContent && !metadataType.isBundle) {
            // SFDX adds a '-meta.xml' to each file, when deploying we need to strip these
            // when the source does not have a meta data file
            return path.posix.join(packageFolder, contentName);
        }

        if (metadataType.id == 'document') {
            // For documents ensure each meta file matches the contents suffix
            if (isMetaFile) {
                const contentFile = await this.findContentFile(file);
                if (contentFile) {
                    return path.posix.join(packageFolder, `${contentFile.split(/\\|\//g).pop()!}-meta.xml`);
                }
            }
        } else if (metadataType.suffix && !file.endsWith(expectedSuffix)) {
            // for non-document source files should match the metadata suffix
            return path.posix.join(packageFolder, `${this.stripFileExtension(contentName, 1)}.${expectedSuffix}`);
        }

        return path.posix.join(packageFolder, baseName);
    }

    @cache({ unwrapPromise: true })
    private async findContentFile(metaFile: string) {
        const metaFileSuggestedContentFile = metaFile.slice(0, -9);
        if (await this.fs.pathExists(metaFileSuggestedContentFile)) {
            return metaFileSuggestedContentFile;
        }

        const contentFilePattern = `${this.stripFileExtension(metaFile, 2)}.*`;
        const contentMatches = (await this.fs.findFiles(contentFilePattern)).filter(f => f !== metaFile)
            .filter(file => !file.endsWith('-meta.xml'));
        if (contentMatches.length) {
            return contentMatches[0];
        }
    }

    @cache({ unwrapPromise: true })
    private async findMetaFile(contentFile: string) {
        const metaFile = `${contentFile}-meta.xml`;
        if (await this.fs.isFile(metaFile)) {
            return metaFile;
        }

        const genericMetaGlob = `${this.stripFileExtension(contentFile)}.*-meta.xml`;
        const globMetaMatch = await this.fs.findFiles(genericMetaGlob);
        if (globMetaMatch.length) {
            return globMetaMatch[0];
        }
    }

    private stripFileExtension(fileName: string, maxCount: number = 1) {
        const baseName = fileName.split(/\\|\//g).pop()!;
        const extensions = baseName.split('.');
        if (extensions.length == 1) {
            return fileName;
        }
        return fileName.split('.').slice(0,-(Math.min(extensions.length - 1, maxCount))).join('.');
    }

    private buildMetadataXml(rootName: string, data?: any) {
        return XML.stringify({
            [rootName]: {
                $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
                ...(data || {})
            }
        }, 4);
    }
}