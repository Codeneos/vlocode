
import * as path from 'path';
import * as fs from 'fs-extra';
import * as ZipArchive from 'jszip';
import { directoryName, fileName as baseName , groupBy } from '@vlocode/util';
import { FileProperties, RetrieveResult } from '../connection';

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
 * Wraps arround a RetrieveResult Object and allows easy iteration over the files contained in it.
 */
export class RetrieveResultPackage {

    public get success(): boolean {
        return !!this.result.zipFile;
    }

    public get retrieveCount(): number {
        // Do not count package XML
        return this.result.fileProperties ? this.result.fileProperties.length - 1 : 0;
    }

    constructor(private readonly result: RetrieveResult, private readonly singlePackage: boolean, private readonly zip?: ZipArchive) {
    }

    public componentNames() {
        return [...new Set(this.result.fileProperties.filter(fi => fi.type != 'Package').map(fi => `${fi.type}/${fi.fullName.split('/').shift()}`))];
    }

    public components() {
        const resultsByType = groupBy(this.getFiles().filter(fi => fi.type != 'Package'), fi => `${fi.type}/${fi.componentName}`);
        return Object.entries(resultsByType).map( ([key, files]) => {
            return {
                fullName: key,
                componentType: key.split('/')[0],
                componentName: key.split('/')[1],
                files: files
            };
        });
    }

    public getFiles(): Array<ExtendedFileProperties> {
        return this.result.fileProperties.map(file => {
            const fullFileName = file.fileName;
            const fileName = this.singlePackage ? file.fileName : file.fileName.split('/').slice(1).join('/');
            const componentName = file.fullName.split('/').shift();
            const metaFileName = `${file.fileName}-meta.xml`;
            const metaFile = this.zip?.file(metaFileName);
            const sourceFile = this.zip?.file(fullFileName);
            return {...file,
                componentName,
                fileName,
                fullFileName,
                hasMetaFile: !!metaFile,
                metaFileName: metaFile ? metaFileName : undefined,
                fullMetaFileName: metaFile ? `${fullFileName}-meta.xml` : undefined,
                unpackToFolder: async (targetFolder: string, fileOnly: boolean) => {
                    if (sourceFile) {
                        await this.streamFileToDisk(sourceFile, path.join(targetFolder, fileOnly ? path.basename(fileName) : fileName));
                    }
                    if (metaFile) {
                        await this.streamFileToDisk(metaFile, path.join(targetFolder, fileOnly ? path.basename(metaFileName) : metaFileName));
                    }
                },
                getBuffer: () => sourceFile?.async('nodebuffer'),
                getStream: () => sourceFile?.nodeStream(),
                getMetaBuffer: () => metaFile?.async('nodebuffer'),
                getMetaStream: () => metaFile?.nodeStream()
            };
        });
    }

    public getFileProperties(packageFile: string): ExtendedFileProperties | undefined {
        return this.getFiles().find(f => f.fileName.toLowerCase().endsWith(packageFile.toLowerCase()));
    }

    public async unpackFolder(packageFolder: string, targetPath: string) : Promise<void> {
        const files = this.zip?.filter(file => directoryName(file).endsWith(packageFolder.toLowerCase()));
        if (!files) {
            throw new Error(`The specified folder ${packageFolder} was not found in retrieved package or is empty`);
        }
        for (const file of files) {
            await this.streamFileToDisk(file, path.join(targetPath, baseName(file.name)));
        }
    }

    public unpackFile(packageFile: string, targetPath: string) : Promise<void> {
        const file = this.zip?.filter(file => file.toLowerCase().endsWith(packageFile.toLowerCase()))[0];
        if (!file) {
            throw new Error(`The specified file ${packageFile} was not found in retrieved package`);
        }
        return this.streamFileToDisk(file, targetPath);
    }

    public unpackFileToFolder(packageFile: string, targetPath: string) : Promise<void> {
        const file = this.zip?.filter(file => file.toLowerCase().endsWith(packageFile.toLowerCase()))[0];
        if (!file) {
            throw new Error(`The specified file ${packageFile} was not found in retrieved package`);
        }
        return this.streamFileToDisk(file, path.join(targetPath, baseName(file.name)));
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