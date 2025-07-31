
import * as path from 'path';
import * as fs from 'fs-extra';
import ZipArchive from 'jszip';
import { groupBy } from '@vlocode/util';
import { FileProperties, RetrieveResult } from '../connection';
import { PackageManifest } from './maifest';
import { SalesforcePackageComponentFile } from './package';
import { MetadataExpander } from './metadataExpander';
import { container } from '@vlocode/core';

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
        return this.file?._data?.uncompressedSize ?? -1;
    }

    /**
     * Compressed size of the file in bytes.
     */
    public get compressedSize() {
        return this.file?._data?.compressedSize ?? -1;
    }

    /**
     * CRC32 checksum of the file.
     */
    public get crc32() {
        return this.file?._data?.crc32
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
        properties: FileProperties,
        private readonly file?: ZipArchive.JSZipObject)
    {
        this.componentName = properties.fullName.split('/').shift()!;
        this.componentType = properties.type;
        this.archivePath = properties.fileName;
        this.packagePath = properties.fileName;
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
        const expander = container.get(MetadataExpander);
        const result = await expander.expandMetadata(this);
        const filesWritten: string[] = []
        for (const [expandedFile, data] of Object.entries(result)) {
            const expandedFilePath = path.join(targetFolder, expandedFile);
            await fs.outputFile(expandedFilePath, data);
            filesWritten.push(expandedFilePath);
        }
        return filesWritten;
    }

    /**
     * Gets a buffer of the file contents.
     * @returns {Promise<Buffer>} Buffer of the file contents.
     */
    public getBuffer(): Promise<Buffer>{
        return this.getFile().async('nodebuffer');
    }

    /**
     * Gets a readable stream of the file contents.
     * @returns {NodeJS.ReadableStream} Stream of the file contents.
     */
    public getStream(): NodeJS.ReadableStream {
        return this.getFile().nodeStream();
    }

    /**
     * Reads and returns the contents as a Buffer.
     * 
     * @returns A promise that resolves to a Buffer containing the data.
     */
    public read(): Promise<Buffer> {
        return this.getBuffer();
    }

    private getFile() {
        const file = this.file;
        if (!file) {
            throw new Error('RetrieveResultFile is not associated with a file in the zip archive; Salesforce did not return the file contents.');
        }
        return file;
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
        if (this.files) {
            this.files = undefined;
        }
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
                    .map(fi => `${fi.type}/${fi.fullName.split('/').shift()}`)
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
            fi => `${fi.componentType}/${fi.componentName}`
        );
        return Object.entries(resultsByType).map( ([key, files]) => {
            return {
                fullName: key,
                componentType: key.split('/')[0],
                componentName: key.split('/')[1],
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
                const files = [ new RetrieveResultFile(fileProperties, sourceFile) ];

                if (metaFile) {
                    // Meta files are not returned by Salesforce, so we add them manually
                    // to the files list if they exist in the archive.
                    files.push(
                        new RetrieveResultFile(
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
        const packageXmlSources = this.filterFiles(f => f.endsWith('package.xml'));
        if (!packageXmlSources.length) {
            throw new Error('Package.xml file mentioned in retrieve result was not found in zip archive');
        }
        const manifests = await Promise.all(packageXmlSources.map(async packageXmlSource => {
            return PackageManifest.fromPackageXml(await packageXmlSource.async('nodebuffer'));
        }));
        return manifests.reduce((manifest, current) => manifest.merge(current));
    }

    // /**
    //  * @deprecated Use {@link RetrieveResultFile.extractTo} instead.
    //  */
    // public async unpackFolder(packageFolder: string, targetPath: string) : Promise<void> {
    //     const files = await this.getFiles(file => file.folderName.endsWith(packageFolder.toLowerCase()));
    //     if (!files) {
    //         throw new Error(`The specified folder ${packageFolder} was not found in retrieved package or is empty`);
    //     }
    //     for (const file of files) {
    //         await file.extractTo(targetPath);
    //     }
    // }

    // /**
    //  * @deprecated Use {@link RetrieveResultFile.extractTo} instead.
    //  */
    // public unpackFile(packageFile: string, targetPath: string) : Promise<void> {
    //     const file = this.file(file => file.toLowerCase().endsWith(packageFile.toLowerCase()));
    //     if (!file) {
    //         throw new Error(`The specified file ${packageFile} was not found in retrieved package`);
    //     }
    //     return this.streamFileToDisk(file, targetPath);
    // }

    // /**
    //  * @deprecated Use {@link RetrieveResultFile.extractTo} instead.
    //  */
    // public unpackFileToFolder(packageFile: string, targetPath: string) : Promise<void> {
    //     const file = this.file(file => file.toLowerCase().endsWith(packageFile.toLowerCase()));
    //     if (!file) {
    //         throw new Error(`The specified file ${packageFile} was not found in retrieved package`);
    //     }
    //     return this.streamFileToDisk(file, path.join(targetPath, baseName(file.name)));
    // }

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

    private streamFileToDisk(file: ZipArchive.JSZipObject, targetPath: string) : Promise<void> {
        return new Promise((resolve, reject) => {
            fs.ensureDir(path.dirname(targetPath)).then(() => {
                file.nodeStream().pipe(fs.createWriteStream(targetPath, { flags: 'w' }))
                    .on('finish', resolve)
                    .on('error', reject);
            }).catch(reject);
        });
    }
}