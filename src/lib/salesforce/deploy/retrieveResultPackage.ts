
import type * as jsforce from 'jsforce';
import * as ZipArchive from 'jszip';
import * as fs from 'fs-extra';

interface ExtendedFileProperties extends jsforce.FileProperties { 
    packageName: string;
    hasMetaFile: boolean;
    getBuffer(): Promise<Buffer>;
    getStream(): NodeJS.ReadableStream;
    getMetaBuffer(): Promise<Buffer>;
    getMetaStream(): NodeJS.ReadableStream;
}

/**
 * Wraps arround a RetrieveResult Object and allows easy iteration over the files contained in it.
 */
export class RetrieveResultPackage {

    public get success() : boolean {
        return !!this.result.zipFile;
    }
    
    constructor(private readonly result: jsforce.RetrieveResult, private readonly singlePackage: boolean, private readonly zip : ZipArchive) {
    }

    public getFiles() : Array<ExtendedFileProperties> {
        return this.result.fileProperties.map(file => {
            const fullFileName = file.fileName;
            const fileName = this.singlePackage ? file.fileName : file.fileName.split('/').slice(1).join('/');
            const packageName = this.singlePackage ? file.fileName.split('/').shift() : undefined;
            const metaFileName = `${file.fileName}-meta.xml`;
            return Object.assign(file, {
                packageName: packageName,
                fullFileName: fullFileName,
                fileName: fileName,
                hasMetaFile: this.zip.file(metaFileName) !== null,
                getBuffer: () => this.zip.file(fullFileName).async('nodebuffer'),
                getStream: () => this.zip.file(fullFileName).nodeStream(),
                getMetaBuffer: () => this.zip.file(metaFileName)?.async('nodebuffer'),
                getMetaStream: () => this.zip.file(metaFileName)?.nodeStream(),
            });
        });
    }

    public getFileProperties(packageFile: string) : ExtendedFileProperties {
        return this.getFiles().find(f => f.fileName.toLowerCase().endsWith(packageFile.toLowerCase()));
    }

    public async unpackFile(packageFile: string, targetPath: string) : Promise<void> {
        const [ file ] = this.zip.filter(file => file.toLowerCase().endsWith(packageFile.toLowerCase()));
        if (!file) {
            throw new Error(`The specified file ${packageFile} was not found in retrieved package`);
        }
        return new Promise((resolve, reject) => {
            file.nodeStream().pipe(fs.createWriteStream(targetPath, { flags: 'w' }))
                .on('finish', () => resolve())
                .on('error', e => reject(e));
        });        
    }
}