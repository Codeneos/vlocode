
import * as path from 'path';
import ZipArchive from 'jszip';
import { Iterable, XML , directoryName, arrayMapPush, asArray, groupBy, stringEqualsIgnoreCase } from '@vlocode/util';
import { FileSystem } from '@vlocode/core';
import { PackageManifest } from './deploy/packageXml';
import { isPromise } from 'util/types';

export interface SalesforcePackageComponent {
    componentType: string; // componentType
    componentName: string; // componentName
}

export interface SalesforcePackageComponentFile extends SalesforcePackageComponent {
    packagePath: string;
}

interface SalesforcePackageFileData extends SalesforcePackageComponent {
    fsPath?: string;
    data?: string | Buffer;
}

interface SalesforcePackageSourceMap extends SalesforcePackageComponent {
    packagePath: string;
}

export interface SalesforceDestructiveChange extends SalesforcePackageComponent {
    type: DestructiveChangeType;
}

type SalesforcePackageEntry = 
    SalesforcePackageComponentFile & 
    SalesforcePackageFileData;  /*& ({ fsPath: string } | { data: string | Buffer})*/

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

    /**
     * Defines the structure of the metadata package, where the key is the package path in the package 
     * zip file and the value contains the info about the component as well as the data.
     */
    private readonly packageData = new Map<string, SalesforcePackageEntry>();

    /**
     * Maps source files by file system path to the package metadata entries.
     * * key - source file path
     * * value - package metadata entry
     */
    private readonly sourceFileToComponent = new Map<string, SalesforcePackageSourceMap>();

    /**
     * Map package components to one or more source files from which they were loaded.
     * * key - component type and name separated by a dot (e.g. `apexclass.myclass`) to lower case
     * * value - array of source file paths
     */
    private readonly componentToSource = new Map<string, string[]>();

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
    public add(entry: SalesforcePackageEntry | SalesforcePackageEntry[]) {
        asArray(entry).forEach(entry => {
            this.addManifestEntry(entry);
            this.setPackageData(entry.packagePath, entry);
            if (entry.fsPath) {
                this.addSourceMap(entry.fsPath, entry);
            }
        });
    }

    /**
     * Get all files related to the specified component in the package
     * @param component Component specification for which to get the files
     */
    public *getComponentFiles(component: SalesforcePackageComponent) : Generator<SalesforcePackageEntry> {
        for (const [path, entry] of this.packageData.entries()) {
            if (entry.componentName === component.componentName && 
                entry.componentType === component.componentType) {
                yield entry;
            }
        }
    }

    public addSourceMap(fsPath: string, entry: SalesforcePackageSourceMap) {
        this.sourceFileToComponent.set(fsPath, {
            packagePath: entry.packagePath,
            componentName: entry.componentName,
            componentType: entry.componentType
        });
        arrayMapPush(this.componentToSource, `${entry.componentType}.${entry.componentName}`.toLowerCase(), fsPath);
    }

    /**
     * Merges or set the package data for the file at the specified package path.
     * @param packagePath Package path to override
     * @param data Data to set
     */
    public setPackageData(packagePath: string, data: Partial<SalesforcePackageFileData>) {
        const normalizedPackagePath = packagePath.replace(/\/|\\/g, '/');
        const entry = this.packageData.get(normalizedPackagePath);
        if (entry) {
            Object.assign(entry, {
                componentType: data.componentType || entry.componentType,
                componentName: data.componentName || entry.componentName,
                data: data.data,
                fsPath: data.fsPath
            });
        } else {
            if (!data.componentName) {
                throw new Error(`Component name cannot be empty when adding metadata to a package`);
            }
            if (!data.componentType) {
                throw new Error(`XML name cannot be empty when adding metadata to a package`);
            }
            this.packageData.set(normalizedPackagePath, {
                packagePath,
                componentType: data.componentType,
                componentName: data.componentName,
                data: data.data,
                fsPath: data.fsPath
            });
        }
    }

    /**
     * Add a manifest entry without adding the actual file to the package. 
     * You should use {@link setPackageData} to add the actual file, or use {@link add} to add both the file and the manifest entry.
     * @param component A component to add to the manifest
     */
    public addManifestEntry(component : SalesforcePackageComponent): void;
    /**
     * Add a manifest entry without adding the actual file to the package. 
     * You should use {@link setPackageData} to add the actual file, or use {@link add} to add both the file and the manifest entry.
     * @param componentType XML name
     * @param componentName Component name
     */
    public addManifestEntry(componentType: string, componentName: string): void;
    public addManifestEntry(componentType: string | SalesforcePackageComponent, componentName?: string) {
        if (typeof componentType === 'object') {
            componentName = componentType.componentName;
            componentType = componentType.componentType;
        }
        if (!componentName) {
            throw new Error(`Component name cannot be empty when adding metadata to a package`);
        }
        if (!componentType) {
            throw new Error(`Component type cannot be empty when adding metadata to a package`);
        }
        this.manifest.add(componentType, componentName);
    }

    /**
     * Removes all package data from the package for the specified component.
     * 
     * @param entry - The component to remove.
     */
    public remove(entry: SalesforcePackageComponent) {
        this.manifest.remove(entry.componentType, entry.componentName);

        // Clean up source file mappings
        const packageKey = `${entry.componentType}.${entry.componentName}`.toLowerCase();
        const sourceFiles = this.componentToSource.get(packageKey);
        for (const fsPath of sourceFiles ?? []) {
            this.sourceFileToComponent.delete(fsPath);
        }
        this.componentToSource.delete(packageKey);

        // Clean up package data
        for (const path of this.getPackagePaths(entry)) {
            this.packageData.delete(path);
        }
    }

    /**
     * Get source folder containing the specified component.
     * @param componentType Type of the component
     * @param componentName Name of the component
     * @returns Source file folder or undefined when not found
     */
    public getSourceFolder(componentType: string, componentName: string) {
        for (const [fsPath, sourceFileInfo] of this.sourceFileToComponent.entries()) {
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
        return this.componentToSource.get(`${type}.${name}`.toLowerCase());
    }

    /**
     * Counts the number of unique components in this package.
     */
    public size() {
        return this.manifest.count();
    }

    /**
     * List of paths from the disk from which this package is composed, contains the source files and composed source files.
     * @returns Array of paths to files included in this package
     */
    public files(): Set<string> {
        return new Set(Iterable.join(
            Iterable.transform(this.packageData.values(), {
                filter: value => !!value.fsPath,
                map: value => value.fsPath!
            }),
            this.sourceFileToComponent.keys()
        ));
    }

    /**
     * Get a list of paths to files included in this package and the respective files on the file system from which they were generated.
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
        return this.sourceFileToComponent.get(sourceFile);
    }

    /**
     * Adds one or more a destructive change to the package.
     * @param destructiveChange Destructive change to add
     */
    public addDestructiveChange(destructiveChange: SalesforceDestructiveChange | SalesforceDestructiveChange[]) : void;

    /**
     * By default, deletions are processed before component additions (pre)
     * @param componentType XML Name of the component to delete
     * @param componentName Name of the component to delete; cannot be a wild card
     * @param type Type of change can be pre or post, default is pre.
     */
    public addDestructiveChange(componentType: string, componentName: string, type?: DestructiveChangeType) : void;
    public addDestructiveChange(...args: [ SalesforceDestructiveChange | SalesforceDestructiveChange[] ] | [ string, string, DestructiveChangeType? ]) {
        if (args.length === 1) {
            asArray(args[0]).forEach(({type, componentType, componentName}) => this.destructiveChanges[type].add(componentType, componentName));
        } else {
            this.destructiveChanges[args[2] ?? 'pre'].add(args[0], args[1]);
        }
    }

    /**
     * Merge an existing destructive changes XML into the package as pre or post change.
     * @param manifestSource Source file
     * @param type Type of changes
     */
    public mergeDestructiveChanges(manifestSource: string | Buffer, type: DestructiveChangeType = 'pre') {
        const items = XML.parse(manifestSource).Package;
        for (const packageType of asArray(items.types)) {
            const xmlName = packageType.name;
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
     * Get a list of all unit test classes that have been added to the current package. 
     * Detects test classes based on class and test method annotations.
     *
     * When a file system is specified the file system is used to read the file contents if the file is not already loaded. In this case the method will return a promise.
     * Otherwise the method will return a string array with the names of the test classes.
     */
    public getTestClasses(): string[];
    public getTestClasses(options: { fs: FileSystem }): Promise<string[]>;
    public getTestClasses(options?: { fs?: FileSystem }): Promise<string[]> | string[] {        
        const testClassFilter = (entry: SalesforcePackageEntry) => {
            // Get data, buffer assumes UTF-8 encoding.
            const classBody = typeof entry.data === 'string' 
                ? entry.data : Buffer.isBuffer(entry.data) 
                ? entry.data.toString('utf-8') : undefined;

            if (!classBody) {
                return false;
            }

            // Cheap test but accurate test for test classes; you can create false positives but you have to try real hard
            const hasTestAnnotations = (/@IsTest([(\s]+)/ig.exec(classBody)?.length ?? 0) > 1; // atleast 2 annotations are required
            const hasTestMethods = /\s+testMethod\s+/ig.test(classBody); // or atleast one testMethod

            return hasTestMethods || hasTestAnnotations;
        }

        const packagedClasses = this.filterPackageEntries(entry => entry.componentType === 'ApexClass', options?.fs);
        if (isPromise(packagedClasses)) {
            return packagedClasses.then(entries => entries.filter(testClassFilter).map(entry => entry.componentName));
        }
        return packagedClasses.filter(testClassFilter).map(entry => entry.componentName);
    }

    private filterPackageEntries(predicate: (entry: SalesforcePackageEntry) => boolean, fs?: undefined) : SalesforcePackageEntry[];
    private filterPackageEntries(predicate: (entry: SalesforcePackageEntry) => boolean, fs: FileSystem) : Promise<SalesforcePackageEntry[]>;
    private filterPackageEntries(predicate: (entry: SalesforcePackageEntry) => boolean, fs: FileSystem | undefined) : Promise<SalesforcePackageEntry[]> | SalesforcePackageEntry[];
    private filterPackageEntries(predicate: (entry: SalesforcePackageEntry) => boolean, fs?: FileSystem | undefined)
        : Promise<SalesforcePackageEntry[]> | SalesforcePackageEntry[] 
    {
        const packagedClasses = [...this.packageData.values()].filter(predicate);

        if (fs) {
            return Promise.all(
                packagedClasses.map(async entry => Object.assign(entry, { data: await this.getFileData(entry, { fs }) }))
            );
        }

        return packagedClasses;
    }

    /**
     * Get all package paths for the specified component. Use this method to get all files in the package for a specific component. 
     * Use get {@see getPackageData} to get the actual data for the package path at the specified path.
     * @param component Component to get package paths for
     */
    public getPackagePaths(component: SalesforcePackageComponent): Array<string> {
        return [...Iterable.transform(this.packageData.entries(), {
            filter: ([, entry]) => entry.componentType === component.componentType && entry.componentName === component.componentName,
            map: ([path]) => path
        })];
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
    public components(componentType?: string): Array<SalesforcePackageComponent & { files: SalesforcePackageEntry[] }> {
        const data = groupBy(
            Iterable.filter(this.packageData.values(), (entry) => !componentType || stringEqualsIgnoreCase(entry.componentType, componentType)),
            (entry) => `${entry.componentType}/${entry.componentName}`
        );
        return Object.values(data).map(files => ({
            componentType: files[0].componentType,
            componentName: files[0].componentName,
            files: files
        }));
    }

    /**
     * Get a component in the package filtered by component name getting the first component that matches the name ignore the component type.
     * If the specified component name is a full name the type will be extracted from the full name (format: <type>/<name>) and used to filter the component.
     * If the component does not exist in the package the files property will be an empty array.
     * @param componentName Name of the component
     * @returns Component matching the specified component name in the package and it's respective files
     */
    public getComponent(componentNameOrFullName: string): SalesforcePackageComponent & { files: SalesforcePackageFileData[] };
    /**
     * Get a component in the package filtered by component type and name.
     * If the component does not exist in the package the files property will be an empty array.
     * @param componentType Type of the component
     * @param componentName Name of the component
     * @returns Component matching the specified component type and name in the package and it's respective files
     */
    public getComponent(componentType: string, componentName: string): SalesforcePackageComponent & { files: SalesforcePackageFileData[] };
    /**
     * Get a component in the package filtered by component type and name.
     * If the component does not exist in the package the files property will be an empty array.
     * @param component Component to get specified by type and name
     * @returns Component matching the specified component type and name in the package and it's respective files
     */
    public getComponent(component: SalesforcePackageComponent): SalesforcePackageComponent & { files: SalesforcePackageFileData[] };
    public getComponent(component: string | SalesforcePackageComponent, componentName?: string): SalesforcePackageComponent & { files: SalesforcePackageFileData[] } {
        const componentSpec = typeof component === 'string'
            ? {
                componentType: componentName === undefined ? undefined : component,
                componentName: componentName ?? component 
            }
            : component;

        if (componentName === undefined && typeof component === 'string' && component.includes('/')) {
            // When the component is specified as a string and contains a slash we assume it's in the format <type>/<name>
            const [type, name] = component.split('/');
            componentSpec.componentName = name;
            componentSpec.componentType = type;
        }

        const componentFiles = Array.from(
            Iterable.filter(
                this.packageData.values(),
                entry =>
                    stringEqualsIgnoreCase(entry.componentType, componentSpec.componentType) && 
                    stringEqualsIgnoreCase(entry.componentName, componentSpec.componentName)
            )
        );

        return {
            // Don't spread componentSpec here because it might contain additional properties
            // which we don't want to spread into the result.
            componentType: componentFiles[0]?.componentType ?? componentSpec.componentType,
            componentName: componentSpec.componentName,
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
     * Gets a new package manifest with just the specified metadata types. If no metadata types are specified a copy of the current manifest is returned.
     * @param metadataTypes Metadata types to filter by or undefined (default) to get all metadata types
     */
    public getManifest(metadataTypes?: string[]): PackageManifest {
        return this.manifest.filter(metadataTypes ?? this.manifest.types());
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
        if (XML.isXml(data, { requireDeclaration: true })) {
            // Normalize all XML data to avoid SF deployment errors due to excess spaces
            return XML.normalize(data, { indent: 4, headless: false });
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
                        packagePath: `${packagePath}-meta.xml`,
                        data: this.buildClassMetadata(this.apiVersion),
                        componentType: entry.componentType,
                        componentName: entry.componentName
                    });
                }
            } else if (packagePath.endsWith('.trigger')) {
                if (!this.packageData.has(`${packagePath}-meta.xml`)) {
                    this.packageData.set(`${packagePath}-meta.xml`, {
                        packagePath: `${packagePath}-meta.xml`,
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
            const metaFileSourceMap = metaFile && this.sourceFileToComponent.get(metaFile);
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
        return XML.stringify({
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