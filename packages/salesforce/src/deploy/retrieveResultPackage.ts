
import * as path from 'path';
import * as fs from 'fs-extra';
import ZipArchive from 'jszip';
import { groupBy, substringBefore, XML } from '@vlocode/util';
import { FileProperties, RetrieveResult } from '../connection';
import { PackageManifest } from './maifest';
import { SalesforcePackageComponent, SalesforcePackageComponentFile } from './package';
import { MetadataExpander } from './metadataExpander';
import { container } from '@vlocode/core';
import { MetadataRegistry } from '../metadataRegistry';

/**
 * Extends typings on the JSZipObject with internal _data object
 */
 declare module 'jszip' {
    interface JSZipObject {
        _data?: CompressedObjectData;
    }

    /**
     * Represents internal information on JSZIp _data object
     */
    interface CompressedObjectData {
        compressedSize?: number;
        uncompressedSize?: number;
        crc32?: number;
        compressionMethod?: string | null;
        compressedContent?: string | null;
    }
}

export interface ExtendedFileProperties extends FileProperties {
    fullFileName: string;
    fullMetaFileName?: string;
    componentName?: string;
    hasMetaFile: boolean;
    unpackToFolder(targetFolder: string, fileOnly?: boolean): Promise<void>;
    getBuffer(): Promise<Buffer> | undefined;
    getStream(): NodeJS.ReadableStream | undefined;
    getMetaBuffer(): Promise<Buffer> | undefined;
    getMetaStream(): NodeJS.ReadableStream | undefined;
}

/**
 * Represents a single component in a retrieve result package with all its related files.
 * @see RetrieveResult
 */
export interface RetrieveResultComponent<
    F extends SalesforceRetrievedComponentFile = SalesforceRetrievedComponentFile
> {
    /**
     * The full name of the component (e.g. ApexClass/MyClass)
     */
    fullName: string,
    /**
     * The component type (e.g. ApexClass) 
     */
    componentType: string,
    /**
     * The component name (e.g. MyClass)
     */
    componentName: string,
    /**
     * The files tha represent this component.
     */
    files: F[]
}

export interface SalesforceRetrievedComponentFile extends SalesforcePackageComponentFile {
    /**
     * Gets a buffer of the file contents.
     * @returns {Promise<Buffer> | Buffer}| Buffer of the file contents.
     */
    getBuffer(): Promise<Buffer> | Buffer;
}

/**
 * Defines the properties of a file in a retrieve result package.
 * This is used to represent files in the retrieve result package and provides methods to access the file
 */
export type RetrieveResultFileType = 'content' | 'metadata';

export class RetrieveResultFile implements SalesforceRetrievedComponentFile {
    /**
     * Type of the component (e.g. ApexClass)
     */
    public readonly componentType: string;

    /**
     * Name of the component (e.g. MyClass) to which this file belongs.
     */
    public readonly componentName: string;

    /**
     * Package path of the file, if a single package the package path will be the same as {@link archivePath}.
     */
    public readonly packagePath: string;

    /**
     * Path of the file in the zip archive; when a single package is retrieved this is the same as {@link packagePath}.
     */
    public readonly archivePath: string;  

    /**
     * Uncompressed size of the file in bytes.
     */
    public get fileSize() {
        return this.contentFile?._data?.uncompressedSize ?? -1;
    }

    /**
     * Compressed size of the file in bytes.
     */
    public get compressedSize() {
        return this.contentFile?._data?.compressedSize ?? -1;
    }

    /**
     * CRC32 checksum of the file.
     */
    public get crc32() {
        return this.contentFile?._data?.crc32
    }

    /**
     * Gets the base name of the archive file path, excluding any directory components.
     * 
     * @returns The file name portion of the archive path.
     */
    public get fileName() {
        return path.basename(this.archivePath);
    }

    /**
     * Gets the relative path of the archive file.
     * 
     * @returns The directory name of the archive path specified by `this.archivePath`.
     */
    public get folderName() {
        return path.dirname(this.archivePath);
    }

    /**
     * Gets the full path of the file in the zip archive.
     * @see {@link archivePath}
     */
    public get fullPath() {
        return this.archivePath
    }

    constructor(
        componentProperties: SalesforcePackageComponent,
        fileProperties: FileProperties,
        private readonly contentFile?: ZipArchive.JSZipObject,
        private readonly metaFile?: ZipArchive.JSZipObject
    ) {
        this.componentName = componentProperties.componentName;
        this.componentType = componentProperties.componentType;
        this.archivePath = fileProperties.fileName;
        this.packagePath = fileProperties.fileName;
    }

    /**
     * Extracts and writes expanded metadata files to the specified target folder.
     *
     * This method uses the `MetadataExpander` to expand the current metadata object,
     * then writes each expanded file to the given target directory. The method returns
     * a list of the relative file paths that were written.
     *
     * @param targetFolder - The absolute or relative path to the folder where the expanded files will be written.
     * @returns A promise that resolves to an array of file paths representing the files that were written.
     */
    public async extractTo(targetFolder: string) {
        const result = await this.expandMetadataFiles();
        const filesWritten: string[] = []
        for (const [expandedFile, data] of Object.entries(result)) {
            const expandedFilePath = path.join(targetFolder, expandedFile);
            await fs.outputFile(expandedFilePath, data);
            filesWritten.push(expandedFilePath);
        }
        return filesWritten;
    }

    /**
     * Expand the metadata file into its constituent parts, such as content and metadata files.
     * This method uses the `MetadataExpander` to expand the metadata file and returns a
     * record of the expanded files.
     * @returns A record of expanded files where the keys are the file names and the values are the file contents as buffers.
     */
    public expandMetadataFiles() {
        const expander = container.get(MetadataExpander);
        return expander.expandMetadata(this);
    }

    /**
     * Gets a buffer of the file contents.
     * @returns {Promise<Buffer>} Buffer of the file contents.
     */
    public getBuffer(type?: 'content'): Promise<Buffer>;
    public getBuffer(type?: RetrieveResultFileType): Promise<Buffer> | undefined;
    public getBuffer(type?: RetrieveResultFileType) {
        return this.getSource(type)?.async('nodebuffer');
    }

    /**
     * Gets a readable stream of the file contents.
     * @returns {NodeJS.ReadableStream} Stream of the file contents.
     */
    public getStream(): NodeJS.ReadableStream {
        return this.getSource().nodeStream();
    }

    /**
     * @deprecated Use {@link content} instead to read the file contents or use {@link metadata} to get the file metadata as XML object.
     */
    public read(): Promise<Buffer> {
        return this.getBuffer();
    }

    /**
     * Returns the content of the file as a buffer.
     */
    public content(): Promise<Buffer> {
        return this.getBuffer();
    }

    /**
     * When metadata is split between content and meta files, this method returns the metadata associated to the content as (parsed) XML object.
     * - If there are XML attributes they are grouped under the `@attributes` property. 
     * - The type of the metadata is stored in the `@type` property.
     * 
     * **Note:** _This only returns metadata for components that have a separate content and metadata files._
     */
    public async metadata(): Promise<(object & { "@type": string }) | undefined> {
        const metadata = await this.getBuffer('metadata');
        if (!metadata) {
            return undefined;
        }

        try {
            const result = XML.parse(metadata, { attributeNode: '@attributes' });
            const typeNode = Object.keys(result).pop();
            if (!typeNode) {
                throw new Error(`No root node found in XML`);
            }
            return {
                ...result[typeNode],
            }
        } catch (error) {
            throw new Error(`Failed to parse metadata for ${this.componentType}/${this.componentName}: ${error.message}`);
        }
    }

    private getSource(type?: 'content'): ZipArchive.JSZipObject;
    private getSource(type?: RetrieveResultFileType): ZipArchive.JSZipObject | undefined;
    private getSource(type?: RetrieveResultFileType) {
        if (type === 'metadata') {
            // Allow undefined type to return the content file by default
            return this.metaFile;
        }
        
        if (!this.contentFile) {
            throw new Error(`Content file for ${this.componentType}/${this.componentName} not found in retrieve result package`);
        }
        return this.contentFile;
    }
}

/**
 * Wraps around a RetrieveResult Object and allows easy iteration over the files contained in it.
 */
export class RetrieveResultPackage {

    /**
     * Returns true if the retrieve was successful and an archive with the retriebe result is available.
     */
    public get success(): boolean {
        return this.archives !== undefined;
    }

    /**
     * Returns the number of files in the retrieve result package excluding `-meta.xml` files.
     */
    public get retrieveCount(): number {
        // Do not count package XML
        return this.result.fileProperties ? this.result.fileProperties.length - 1 : 0;
    }

    private files: RetrieveResultFile[] | undefined;
    private archives: ZipArchive[] | undefined;
    private manifest: PackageManifest | undefined;

    /**
     * Creates a new RetrieveResultPackage instance from a RetrieveResult object.
     * @param result The retrieve result object.
     * @param singlePackage If true the retrieve result is expected to contain only one package.
     * @param archive Optional zip archive to use instead of the one in the retrieve result.
     */
    constructor(
        private readonly result: RetrieveResult, 
        private readonly singlePackage: boolean, 
        archive?: ZipArchive
    ) {
        this.archives = archive ? [ archive ] : undefined;
    }

    /**
     * Merge another retrieve result package into this one.
     * @param other Other retrieve result package to merge into this one.
     * @returns A reference to this retrieve result package.
     */
    public merge(other: RetrieveResultPackage): this {
        // Merge file props
        this.result.fileProperties.push(...other.result.fileProperties);
        if (this.archives) {
            this.archives?.push(...other.archives!);
        } else {
            this.archives = other.archives;
        }
        this.files = undefined;
        this.manifest = undefined;
        return this;
    }

    /**
     * Get all component names in the retrieve result package that are not package.xml files.
     * @returns A list of all component names in the retrieve result package
     */
    public componentNames() {
        return [
            ...new Set(
                this.result.fileProperties
                    .filter(fi => fi.type != 'Package')
                    .map(fi => this.getComponentInfo(fi))
                    .map(info => `${info.componentType}/${info.componentName}`)
            )
        ];
    }

    /**
     * Get all components in the retrieve result package that are not package.xml files 
     * @returns A list of all components in the retrieve result package
     */
    public components(): Array<RetrieveResultComponent<RetrieveResultFile>> {
        const resultsByType = groupBy(
            this.getFiles().filter(fi => fi.componentType != 'Package'), 
            fi => `${fi.componentType}:${fi.componentName}`
        );
        return Object.entries(resultsByType).map( ([key, files]) => {
            const [componentType, componentName] = key.split(':');
            return {
                fullName: key,
                componentType,
                componentName,
                files: files
            };
        });
    }

    /**
     * Gets all files in the retrieve result package.
     * @returns A list of all files in the retrieve result package.
     */
    public getFiles(predicate?: (file: RetrieveResultFile, index: number) => boolean): Array<RetrieveResultFile> {
        if (this.files) {
            return this.files;
        }
        this.files = this.result.fileProperties.flatMap(
            fileProperties => {
                if (fileProperties.fileName === 'package.xml') {
                    // Skip package.xml file as it does not represent a component
                    return [];
                }

                const sourceFile = this.file(fileProperties.fileName) || undefined;
                const metaFile = this.file(`${fileProperties.fileName}-meta.xml`);
                const componentInfo = this.getComponentInfo(fileProperties);
                const files = [ new RetrieveResultFile(componentInfo, fileProperties, sourceFile, metaFile) ];

                if (metaFile) {
                    // Meta files are not returned by Salesforce, so we add them manually
                    // to the files list if they exist in the archive.
                    files.push(
                        new RetrieveResultFile(
                            componentInfo,
                            { ...fileProperties, fileName: `${fileProperties.fileName}-meta.xml` },
                            metaFile
                        )
                    );
                }

                return files;
            }
        );
        return predicate ? this.files.filter(predicate) : this.files;
    }

    /**
     * Gets the package manifest of the retrieve result package as a PackageManifest object parsed from the package.xml file.
     * @returns The package manifest of the retrieve result.
     */
    public async getManifest() {
        if (this.manifest) {
            return this.manifest;
        }
        const packageXmlSources = this.filterFiles(f => f.endsWith('package.xml'));
        if (!packageXmlSources.length) {
            throw new Error('Package.xml file mentioned in retrieve result was not found in zip archive');
        }
        const manifests = await Promise.all(packageXmlSources.map(async packageXmlSource => {
            return PackageManifest.fromPackageXml(await packageXmlSource.async('nodebuffer'));
        }));
        this.manifest = manifests.reduce((manifest, current) => manifest.merge(current));
        return this.manifest;
    }

    private getComponentInfo(fileProperties: FileProperties) {
        const metadataType = MetadataRegistry.getMetadataType(fileProperties.type);
        const componentProperties: SalesforcePackageComponent = {
            componentName: metadataType?.folderType 
                ? fileProperties.fullName 
                : substringBefore(fileProperties.fullName, '/'),
            componentType: fileProperties.type
        };
        return componentProperties;
    }

    private file(filter: string | ((file: string) => any)) : ZipArchive.JSZipObject | undefined {
        for (const archive of this.archives ?? []) {
            const file = typeof filter === 'string' 
                ? archive.file(filter)
                : archive.filter(filter)[0];
            if (file) {
                return file;
            }
        }
    }

    private filterFiles(filter: (file: string) => any) {
        const files = new Array<ZipArchive.JSZipObject>();
        for (const archive of this.archives ?? []) {
            files.push(...archive.filter(filter));
        }
        return files;
    }
}