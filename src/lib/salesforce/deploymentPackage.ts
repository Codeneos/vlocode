
import * as path from 'path';
import * as constants from '@constants';
import * as xml2js from 'xml2js';
import * as ZipArchive from 'jszip';
import { Iterable, XML , directoryName, arrayMapPush } from '@vlocode/util';
import { FileSystem } from '@vlocode/core';
import { PackageManifest } from './deploy/packageXml';

interface SalesforcePackageFileData { fsPath?: string; data?: string | Buffer }
interface SalesforcePackageSourceMap { packagePath: string; componentType: string; name: string }

export class SalesforcePackage {

    /**
     * Get the metadata mainfest for this package
     */
    public readonly manifest = new PackageManifest();

    /**
     * Access the pre or post destructive changes in this package
     */
    private readonly destructiveChanges = {
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

    constructor(
        public readonly apiVersion: string,
        private readonly packageDir: string,
        private readonly fs: FileSystem) {
        if (!/^\d{2,3}\.\d$/.test(apiVersion)) {
            throw new Error(`Invalid API version: ${apiVersion}`);
        }
    }

    public add(entry: { xmlName: string; componentName: string; packagePath: string } & SalesforcePackageFileData) {
        this.addManifestEntry(entry.xmlName, entry.componentName);
        this.setPackageData(entry.packagePath, {
            data: entry.data,
            fsPath: entry.fsPath
        });
        if (entry.fsPath) {
            this.addSourceMap(entry.fsPath, entry);
        }
    }

    public addSourceMap(fsPath: string, entry: { xmlName: string; componentName: string; packagePath: string }) {
        this.sourceFileMap.set(fsPath, {
            packagePath: entry.packagePath,
            name: entry.componentName,
            componentType: entry.xmlName
        });
        arrayMapPush(this.packageComponents, `${entry.xmlName}.${entry.componentName}`.toLowerCase(), fsPath);
    }

    public setPackageData(packagePath: string, data: SalesforcePackageFileData) {
        this.packageData.set(packagePath.replace(/\/|\\/g, '/'), data);
    }

    public addManifestEntry(xmlName: string, componentName: string) {
        this.manifest.add(xmlName, componentName);
    }

    /**
     * Get source folder containing the specified component.
     * @param componentType Type of the component
     * @param componentName Name of the component
     * @returns Source file folder or undefined when not found
     */
    public getSourceFolder(componentType: string, componentName: string) {
        for (const [fsPath, sourceFileInfo] of this.sourceFileMap.entries()) {
            if (sourceFileInfo.componentType == componentType && sourceFileInfo.name == componentName) {
                return directoryName(fsPath);
            }
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

    public *sourceFiles() {
        for (const [packagePath, { fsPath }] of this.packageData) {
            yield { packagePath, fsPath };
        }
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
     * @param sourceFile Source file path
     * @param type Type of changes
     */
    public async mergeDestructiveChanges(sourceFile: string, type: keyof SalesforcePackage['destructiveChanges'] = 'pre') {
        const items = (await xml2js.parseStringPromise(await this.fs.readFileAsString(sourceFile))).Package;
        for (const packageType of items.types) {
            const xmlName = packageType.name[0];
            for (const member of packageType.members) {
                this.addDestructiveChange(xmlName, member, type);
            }
        }
    }

    /**
     * Get a list of all test classes with unit tests from added to the current package. 
     * Uses annotation and testmethod detection on APEX class bodies.
     */
    public getTestClasses() {
        const testClasses = new Array<String>();
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
    public async getPackageData(packagePath: string) {
        const data = this.packageData.get(packagePath.replace(/\/|\\/g, '/'));
        if (!data) {
            return;
        }
        if (!data.data) {
            data.data = await this.fs.readFile(data.fsPath!);
        }
        return data.data;
    }

    /**
     * Determine if a file exists in the current packahge
     * @param packagePath Path of file in package
     */
    public hasPackageData(packagePath: string) {
        return this.packageData.has(packagePath.replace(/\/|\\/g, '/'));
    }

    /**
     * Get an iterator over the defined types in the current package
     */
    public *getPackageTypes() {
        yield *this.manifest.types();
    }

    /**
     * Get a flat array with the names of the components in this package prefixed with their type.
     */
    public getComponentNames() {
        return Iterable.reduce(this.manifest.types(), (arr, type) => arr.concat(this.manifest.list(type).map(name => `${type}/${name}`)), new Array<string>());
    }

    /**
     * Get the number of packaged components for a specific XML memeber type
     * @param xmlName XML type name
     */
    public getPackageTypeCount(xmlName: string) {
        return this.manifest.count(xmlName);
    }

    /**
     * Builds the ZipArchive from the current package and returns the package archive
     */
    public async generateArchive(): Promise<ZipArchive> {
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

        for (const [packagePath, { data, fsPath }] of this.packageData.entries()) {
            let fileData = data ?? await this.fs.readFile(fsPath!);
            if (XML.isXml(fileData)) {
                // Normalize all XML data to avoid SF deployment errors due to excess spaces
                fileData = XML.normalize(fileData);
            }
            packageZip.file(path.posix.join(this.packageDir, packagePath), fileData);
        }

        return packageZip;
    }

    /**
     * Generates missing -meta.xml files for APEX classes using the package specified API version.
     */
    public generateMissingMetaFiles() {
        for (const [packagePath] of this.packageData.entries()) {
            if (packagePath.endsWith('.cls')) {
                // APEX classes
                if (!this.packageData.has(`${packagePath}-meta.xml`)) {
                    this.packageData.set(`${packagePath}-meta.xml`, { data: this.buildClassMetadata(this.apiVersion) });
                }
            } else if (packagePath.endsWith('.trigger')) {
                // APEX classes
                if (!this.packageData.has(`${packagePath}-meta.xml`)) {
                    this.packageData.set(`${packagePath}-meta.xml`, { data: this.buildTriggerMetadata(this.apiVersion) });
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
    public async getPackageMetadata(type: string, name: string) : Promise<any> {
        const fsPaths = this.getComponentSourceFiles(type, name);
        if (fsPaths?.length) {
            const metaFile = fsPaths.length == 1 ? fsPaths[0] : fsPaths.find(f => f.toLowerCase().endsWith('.xml'));
            const metaFileSourceMap = metaFile && this.sourceFileMap.get(metaFile);
            if (metaFileSourceMap) {
                const packageData = await this.getPackageData(metaFileSourceMap.packagePath);
                if (packageData && XML.isXml(packageData)) {
                    return Object.values(XML.parse(packageData)).pop();
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
        const xmlBuilder = new xml2js.Builder(constants.MD_XML_OPTIONS);
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
