
import * as path from 'path';
import * as fs from 'fs-extra';
import type * as jsforce from 'jsforce';
import * as ZipArchive from 'jszip';

interface ExtendedFileProperties extends jsforce.FileProperties {
    fullFileName: string,
    packageName?: string;
    hasMetaFile: boolean;
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

    constructor(private readonly result: jsforce.RetrieveResult, private readonly singlePackage: boolean, private readonly zip?: ZipArchive) {
    }

    public getFiles(): Array<ExtendedFileProperties> {
        return this.result.fileProperties.map(file => {
            const fullFileName = file.fileName;
            const fileName = this.singlePackage ? file.fileName : file.fileName.split('/').slice(1).join('/');
            const packageName = this.singlePackage ? file.fileName.split('/').shift() : undefined;
            const metaFileName = `${file.fileName}-meta.xml`;
            const zippedFile = this.zip?.file(metaFileName);
            return {...file,
                packageName: packageName,
                fullFileName: fullFileName,
                fileName: fileName,
                hasMetaFile: zippedFile !== null,
                getBuffer: () => this.zip?.file(fullFileName)?.async('nodebuffer'),
                getStream: () => this.zip?.file(fullFileName)?.nodeStream(),
                getMetaBuffer: () => this.zip?.file(metaFileName)?.async('nodebuffer'),
                getMetaStream: () => this.zip?.file(metaFileName)?.nodeStream()};
        });
    }

    public getFileProperties(packageFile: string): ExtendedFileProperties | undefined {
        return this.getFiles().find(f => f.fileName.toLowerCase().endsWith(packageFile.toLowerCase()));
    }

    public async unpackFile(packageFile: string, targetPath: string) : Promise<void> {
        const file = this.zip?.filter(file => file.toLowerCase().endsWith(packageFile.toLowerCase()))[0];
        if (!file) {
            throw new Error(`The specified file ${packageFile} was not found in retrieved package`);
        }
        return new Promise((resolve, reject) => {
            fs.ensureDir(path.dirname(targetPath)).then(() => {
                file.nodeStream().pipe(fs.createWriteStream(targetPath, { flags: 'w' }))
                    .on('finish', resolve)
                    .on('error', reject);
            }).catch(reject);
        });
    }
}