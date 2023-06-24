
import * as path from 'path';
import * as xml2js from 'xml2js';
import * as ZipArchive from 'jszip';
import { Iterable, XML , directoryName, arrayMapPush, asArray, groupBy } from '@vlocode/util';
import { FileSystem } from '@vlocode/core';
import { PackageManifest } from './deploy/packageXml';
import { MD_XML_OPTIONS } from './constants';
import { type } from 'os';

export interface SalesforcePackageComponent {
    componentType: string; // componentType
    componentName: string; // componentName
}

interface SalesforcePackageFileData extends SalesforcePackageComponent {
    fsPath?: string;
    data?: string | Buffer;
}

interface SalesforcePackageSourceMap extends SalesforcePackageComponent {
    packagePath: string;
}

interface SalesforcePackageComponentFile extends SalesforcePackageFileData {
    packagePath: string;
}

export interface SalesforceDestructiveChange extends SalesforcePackageComponent {
    type: DestructiveChangeType;
}

type DestructiveChangeType = 'pre' | 'post';

export class SalesforcePackage {

    /**
     * Get the metadata mainfest for this package
     */
    public readonly manifest = new PackageManifest();

    /**
     * Checl if this package has any destructive changes.
     * @returns `true` if the package has destructive changes otherwise `false`
     */
    public get hasDestructiveChanges() {
        return !this.destructiveChanges.pre.isEmpty ||
            !this.destructiveChanges.post.isEmpty;
    }

    /**
     * Check if this package is empty; a package is empty if it does not contain any metadata and does not contain any destructive changes.
     * @returns `true` if the package is empty otherwise `false`
     */
    public get isEmpty() {
        return this.manifest.isEmpty && !this.hasDestructiveChanges;
    }

    /**
     * Access the pre or post destructive changes in this package
     */
    private readonly destructiveChanges: Record<DestructiveChangeType, PackageManifest> = {
        pre: new PackageManifest(),
        post: new PackageManifest()
    };

    private readonly packageData = new Map<string, SalesforcePackageFileData>();

    /**
     * Maps source files to package contents
     */
    private readonly sourceFileMap = new Map<string, SalesforcePackageSourceMap>();

    /**
     * Map each component to package files
     */
    private readonly packageComponents = new Map<string, string[]>();

    /**
     * Get printable name of the package components for use in the UI.
     * Returns the name of the component in the package if there is only a single component in the package; otherwise returns the component count:
     */
    public get componentsDescription() {
        const types = [...this.manifest.types()];
        const typeName = types.length === 1 ? types[0] : `components`;
        const componentNames = this.manifest.list();
        return componentNames.length === 1
            ? `${componentNames[0]}`
            : `${componentNames.length} ${typeName}s`;
    }

    /**
     * Create a new metadata package
     * @param apiVersion API version of the package
     * @param packageDir the package directory, either package or an empty string
     * @param fs The file system to use for loading files, can be undefined if you only add files already loaded
     */
    constructor(
        public readonly apiVersion: string,
        private readonly packageDir: string = ''
    ) {
        if (!/^\d{2,3}\.\d$/.test(apiVersion)) {
            throw new Error(`Invalid API version: ${apiVersion}`);
        }
    }

    /**
     * Merge this package with another package and returns this
     * @param otherPackage Package to merge
     */
    public merge(otherPackage: SalesforcePackage) {
        for (const [path, entry] of otherPackage.packageData.entries()) {
            this.add({...entry, packagePath: path});
        }
        return this;
    }

    /**
     * Adds one or more components to the package and updates the package manifest.
     * @param entry Package data entry to add
     */
    public add(entry: SalesforcePackageComponentFile | SalesforcePackageComponentFile[]) {
        asArray(entry).forEach(entry => this.addSingle(entry));
    }

    private addSingle(entry: SalesforcePackageComponentFile) {
        if (!entry.componentName) {
            throw new Error(`Component name cannot be empty when adding metadata to a package`);
        }

        if (!entry.componentType) {
            throw new Error(`XML name cannot be empty when adding metadata to a package`);
        }

        this.addManifestEntry(entry.componentType, entry.componentName);
        this.setPackageData(entry.packagePath, {
            componentType: entry.componentType,
            componentName: entry.componentName,
            data: entry.data,
            fsPath: entry.fsPath
        });

        if (entry.fsPath) {
            this.addSourceMap(entry.fsPath, entry);
        }
    }

    /**
     * Get all files related to the specified component in the package
     * @param component Component specification for which to get the files
     */
    public *getComponentFiles(component: SalesforcePackageComponent) : Generator<SalesforcePackageComponentFile> {
        for (const [path, entry] of this.packageData.entries()) {
            if (entry.componentName === component.componentName && 
                entry.componentType === component.componentType) {
                yield {
                    packagePath: path,
                    ...entry,
                }
            }
        }
    }

    public addSourceMap(fsPath: string, entry: SalesforcePackageSourceMap) {
        this.sourceFileMap.set(fsPath, {
            packagePath: entry.packagePath,
            componentName: entry.componentName,
            componentType: entry.componentType
        });
        arrayMapPush(this.packageComponents, `${entry.componentType}.${entry.componentName}`.toLowerCase(), fsPath);
    }

    /**
     * Merges or set the package data for the file at the specified package path.
     * @param packagePath Package path to override
     * @param data Data to set
     */
    public setPackageData(packagePath: string, data: Partial<SalesforcePackageFileData>) {
        const entry = this.packageData.get(packagePath);
        if (entry) {
            Object.assign(entry, data);
        } else {
            if (!data.componentName) {
                throw new Error(`Component name cannot be empty when adding metadata to a package`);
            }
            if (!data.componentType) {
                throw new Error(`XML name cannot be empty when adding metadata to a package`);
            }
            this.packageData.set(packagePath.replace(/\/|\\/g, '/'), data as SalesforcePackageFileData);
        }
    }

    /**
     * Add a manifest entry without adding the actual file to the package. You should use {@link setPackageData} to add the actual file, or use {@link add} to add both the file and the manifest entry.
     * @param xmlName XML name
     * @param componentName Component name
     */
    public addManifestEntry(xmlName: string, componentName: string) {
        this.manifest.add(xmlName, componentName);
    }

    /**
     * Remove metadata file from the package and manifest
     * @param entry
     */
    public remove(entry: { xmlName: string; componentName: string; packagePath: string } & SalesforcePackageFileData) {
        this.manifest.remove(entry.componentType, entry.componentName);
        this.packageData.delete(entry.packagePath);

        if (entry.fsPath) {
            this.sourceFileMap.delete(entry.fsPath);
        }
    }

    /**
     * Get source folder containing the specified component.
     * @param componentType Type of the component
     * @param componentName Name of the component
     * @returns Source file folder or undefined when not found
     */
    public getSourceFolder(componentType: string, componentName: string) {
        for (const [fsPath, sourceFileInfo] of this.sourceFileMap.entries()) {
            if (sourceFileInfo.componentType === componentType && 
                sourceFileInfo.componentName === componentName) {
                return directoryName(fsPath);
            }
        }
    }

    /**
     * Get the name of the source file.
     * @param type XML Type
     * @param name Component name
     * @returns FS path from which the component was loaded or undefined when not loaded or not in the current package
     */
    public getComponentSourceFiles(type: string, name: string) {
        return this.packageComponents.get(`${type}.${name}`.toLowerCase());
    }

    /**
     * Counts the number of unique components in this package.
     */
    public size() {
        return this.manifest.count();
    }

    /**
     * Get a list of paths to files included in this package.
     * @returns Array of paths to files included in this package
     */
    public files() {
        return new Set(Iterable.filter(Iterable.map(this.packageData.values(), value => value.fsPath!), value => !!value));
    }

    /**
     * Get a list of paths to files included in this packageand the respective files on the file system from which they were generated.
     */
    public *sourceFiles() {
        for (const [packagePath, { fsPath }] of this.packageData) {
            yield { packagePath, fsPath };
        }
    }

    /**
     * Get the source file for any package path in the package.
     * @param packagePath package path
     * @returns Source file FS path
     */
    public getSourceFile(packagePath: string) {
        return this.packageData.get(packagePath)?.fsPath;
    }

    /**
     * Returns source file info such as the detected component type as well as package path for each source file.
     * @param sourceFile Source file path
     */
    public getSourceFileInfo(sourceFile: string) {
        return this.sourceFileMap.get(sourceFile);
    }

    /**
     * By default, deletions are processed before component additions (pre)
     * @param xmlName XML Name of the component to delete
     * @param componentName Name of the component to delete; cannot be a wild card
     * @param type Type of change can be pre or post, default is pre.
     */
    public addDestructiveChange(xmlName: string, componentName: string, type: keyof SalesforcePackage['destructiveChanges'] = 'pre') {
        this.destructiveChanges[type].add(xmlName, componentName);
    }

    /**
     * Merge an existing destructive changes XML into the package as pre or post change.
     * @param manifestSource Source file
     * @param type Type of changes
     */
    public mergeDestructiveChanges(manifestSource: string | Buffer, type: keyof SalesforcePackage['destructiveChanges'] = 'pre') {
        const items = XML.parse(manifestSource).Package;
        for (const packageType of asArray(items.types)) {
            const xmlName = packageType.name[0];
            for (const member of asArray(packageType.members)) {
                this.addDestructiveChange(xmlName, member, type);
            }
        }
    }

    /**
     * Get a list of all destructive changes in the package for the specified component type.
     * @param componentType Component type to filter by
     * @returns Array of destructive changes matching the specified component type
     */
    public getDestructiveChanges(componentType?: string): Array<SalesforceDestructiveChange> {
        return Object.entries(this.destructiveChanges).flatMap(
            ([type, manifest]) => [
                ...Iterable.transform(
                    manifest.components(), {
                        filter: component => !componentType || component.componentType === componentType,
                        map: component => ({ type: type as DestructiveChangeType, ...component })
                    }
                )
            ]
        );
    }

    /**
     * Get a list of all test classes with unit tests from added to the current package.
     * Uses annotation and testmethod detection on APEX class bodies.
     */
    public getTestClasses() {
        const testClasses = new Array<string>();
        for (const [packagePath, data] of this.packageData.entries()) {
            if (!packagePath.endsWith('.cls')) {
                continue;
            }

            // Get data, buffer assumes UTF-8 encoding.
            const classBody = typeof data === 'string' ? data : data.toString();
            const testClassName = path.basename(packagePath, '.cls');

            // Cheap test but accurate test for test classes; you can create false posetives but you have to try real hard
            const hasTestAnnotations = (/@IsTest([(\s]+)/ig.exec(classBody)?.length ?? 0) > 1; // atleast 2 annotations are required
            const hasTestMethods = /\s+testMethod\s+/ig.test(classBody); // or atleast one testMethod

            if (hasTestMethods || hasTestAnnotations) {
                testClasses.push(testClassName);
            }
        }

        return testClasses;
    }

    /**
     * Get the currently packaged data for the specified path in the package.
     * @param packagePath Package path
     */
    public getPackageData(packagePath: string): { data?: string | Buffer, fsPath?: string } | undefined {
        return this.packageData.get(packagePath.replace(/\/|\\/g, '/'));
    }

    /**
     * Determine if a file exists in the current packahge
     * @param packagePath Path of file in package
     */
    public hasPackageData(packagePath: string) {
        return this.packageData.has(packagePath.replace(/\/|\\/g, '/'));
    }

    /**
     * Get a list of all components in the package optionally filtered by component type.
     * @param componentType Component type to filter by or undefined to get all components
     * @returns Array of components in the package and their respective files
     */
    public components(componentType?: string): Array<SalesforcePackageComponent & { files: SalesforcePackageFileData[] }> {
        const data = groupBy(
            Iterable.filter(this.packageData, ([,entry]) => !componentType || entry.componentType === componentType),
            ([,entry]) => `${entry.componentType}/${entry.componentName}`,
            ([packagePath, entry]) => ({ packagePath, ...entry })
        );
        return Object.values(data).map(files => ({
            componentType: files[0].componentType,
            componentName: files[0].componentName,
            files: files
        }));
    }

    /**
     * Get a component in the package filtered by component type and name.
     * @param componentType Component type to filter by or undefined to get all components
     * @returns Array of components in the package and their respective files
     */
    public getComponent(componentName: string, componentType: string): SalesforcePackageComponent & { files: SalesforcePackageFileData[] } {
        const componentFiles = Array.from(Iterable.filter(this.packageData.values(), 
            entry => entry.componentType === componentType && entry.componentName === componentName));
        return {
            componentName,
            componentType,
            files: componentFiles
        };
    }

    /**
     * Get a flat array with the names of the components in this package prefixed with their type.
     */
    public getComponentNames() {
        return Iterable.reduce(this.manifest.types(), (arr, type) => arr.concat(this.manifest.list(type).map(name => `${type}/${name}`)), new Array<string>());
    }

    /**
     * Get the types of the components in this package.
     */
    public getComponentTypes() {
        return this.manifest.types();
    }

    /**
     * Gets a new package manifest optionally filtered by the specified metadata types.
     */
    public getManifest(metadataTypes?: string[]): PackageManifest {
        if (!metadataTypes) {
            return this.manifest;
        }

        const manifestForReceivedTypes = new PackageManifest();
        metadataTypes.forEach(metadataType => {
            manifestForReceivedTypes.add(metadataType, this.manifest.list(metadataType));
        });
        return manifestForReceivedTypes;
    }

    /**
     * Builds the ZipArchive from the current package and returns the package archive
     */
    public async generateArchive(options?: { fs?: FileSystem }): Promise<ZipArchive> {
        const packageZip = new ZipArchive();
        const xmlPackage = this.manifest.toXml(this.apiVersion);
        packageZip.file(path.posix.join(this.packageDir, 'package.xml'), xmlPackage);

        if (this.destructiveChanges.pre.count() > 0) {
            packageZip.file(path.posix.join(this.packageDir, 'destructiveChangesPre.xml'),
                this.destructiveChanges.pre.toXml(this.apiVersion));
        }

        if (this.destructiveChanges.post.count() > 0) {
            packageZip.file(path.posix.join(this.packageDir, 'destructiveChangesPost.xml'),
                this.destructiveChanges.post.toXml(this.apiVersion));
        }

        for (const [packagePath, entry] of this.packageData.entries()) {
            const fileData = await this.getFileData(entry, options);
            packageZip.file(
                path.posix.join(this.packageDir, packagePath),
                this.normalizeDataForPackage(packagePath, fileData)
            );
        }

        return packageZip;
    }

    private getFileData(data: SalesforcePackageFileData, options?: { fs?: FileSystem }) {
        if (data.data) {
            return data.data;
        }
        if (data.fsPath) {
            if (!options?.fs) {
                throw new Error('Specify a file system to read data from when including files based on their file system path.');
            }
            return options.fs.readFile(data.fsPath);
        }
        throw new Error(`No data or file system path specified for manifest entry ${data.componentType}/${data.componentName}`);
    }

    private normalizeDataForPackage(packagePath: string, data: Buffer | string) {
        if (XML.isXml(data)) {
            // Normalize all XML data to avoid SF deployment errors due to excess spaces
            return XML.normalize(data);
        }
        return data;
    }

    /**
     * Generates missing -meta.xml files for APEX classes using the package specified API version.
     */
    public generateMissingMetaFiles() {
        for (const [packagePath, entry] of this.packageData.entries()) {
            if (packagePath.endsWith('.cls')) {
                if (!this.packageData.has(`${packagePath}-meta.xml`)) {
                    this.packageData.set(`${packagePath}-meta.xml`, {
                        data: this.buildClassMetadata(this.apiVersion),
                        componentType: entry.componentType,
                        componentName: entry.componentName
                    });
                }
            } else if (packagePath.endsWith('.trigger')) {
                if (!this.packageData.has(`${packagePath}-meta.xml`)) {
                    this.packageData.set(`${packagePath}-meta.xml`, {
                        data: this.buildTriggerMetadata(this.apiVersion),
                        componentType: entry.componentType,
                        componentName: entry.componentName
                    });
                }
            }
        }
    }

    /**
     * Try to read the metadata associated to the specified component.
     * @param type Type of the component
     * @param name Name of the component
     * @returns Parsed XML metadata associated to the component as defined in the package
     */
    public getPackageMetadata<T extends object = Record<string, any>>(type: string, name: string): T | undefined {
        const fsPaths = this.getComponentSourceFiles(type, name);
        if (fsPaths?.length) {
            const metaFile = fsPaths.length == 1 ? fsPaths[0] : fsPaths.find(f => f.toLowerCase().endsWith('.xml'));
            const metaFileSourceMap = metaFile && this.sourceFileMap.get(metaFile);
            if (metaFileSourceMap) {
                const packageData = this.getPackageData(metaFileSourceMap.packagePath);
                if (packageData?.data && XML.isXml(packageData.data)) {
                    return Object.values(XML.parse<T>(packageData.data)).pop();
                }
            }
        }
    }

    private buildClassMetadata(apiVersion: string) {
        return this.buildMetadataXml('ApexClass', {
            apiVersion: apiVersion,
            status: 'Active'
        });
    }

    private buildTriggerMetadata(apiVersion: string) {
        return this.buildMetadataXml('ApexTrigger', {
            apiVersion: apiVersion,
            status: 'Active'
        });
    }

    private buildMetadataXml(rootName: string, data?: any) {
        const xmlBuilder = new xml2js.Builder(MD_XML_OPTIONS);
        return xmlBuilder.buildObject({
            [rootName]: {
                $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
                ...(data || {})
            }
        });
    }

    /**
     * Generate a nodejs buffer with compressed package zip that can be uploaded to Salesforce.
     * @param compressionLevel levle of compression
     */
    public async getBuffer(compressionLevel: number = 0): Promise<Buffer> {
        return (await this.generateArchive()).generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
                level: compressionLevel
            }
        });
    }
}