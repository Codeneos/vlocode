import * as path from 'path';
import { LogManager, Logger } from 'logging';
import { getDatapackManifestKey, getExportProjectFolder } from 'datapackUtil';
import { mapAsyncParallel } from '@util';
import { VlocityDatapack } from 'models/datapack';
import * as nodeFs from 'fs';
import { FileSystem } from 'interfaces/fileSystem';

/**
 * Basic file system using NodeJS fs module.
 */
export const directFileSystem : FileSystem = {
    readFile: nodeFs.promises.readFile,
    readdir: nodeFs.promises.readdir,
    pathExists: path => nodeFs.promises.access(path).catch(() => false).then(() => true)
}

/**
 * File system that cached directory contents to provide a faster pathExists response
 */
export class CachedFileSystem implements FileSystem {

    protected directoryCache = new Map<string, string[]>();

    constructor (protected readonly fileSystem: FileSystem = directFileSystem) {        
    }

    public async pathExists(filePath: string): Promise<boolean> {
        try {
            const fileName = path.basename(filePath);
            const files = await this.readdir(path.dirname(filePath));
            return files.includes(fileName);
        } catch(e) {
            return false;
        }
    }

    public readFile(path: string){
        return this.fileSystem.readFile(path);
    }

    public async readdir(filePath: string): Promise<string[]> {
        let files = this.directoryCache.get(filePath);
        if (!files) {
            files = await this.fileSystem.readdir(filePath);
            this.directoryCache.set(filePath, files);
        }
        return files;
    }
}

type DatapackLoaderFunc = (fileName: string) => (Promise<string | Object> | string | Object);

export default class DatapackLoader {    

    protected readonly loaders : { test?: RegExp, load: DatapackLoaderFunc }[] = [
        { test: /\.json$/i, load: file => this.loadJson(file) },
        { test: /\.\S+$/i, load: file => this.loadRaw(file) }
    ];

    constructor(
        protected readonly logger: Logger = LogManager.get(DatapackLoader), 
        protected readonly fileSystem: FileSystem = directFileSystem) {        
    }    

    public addLoader(test: RegExp, loader: DatapackLoaderFunc) {
        this.loaders.push({
            test: test,
            load: loader
        });
    }

    public async loadFrom(datapackHeader : string) : Promise<VlocityDatapack> {
        this.logger?.verbose(`Loading datapack: ${datapackHeader}`);
        const manifestEntry = getDatapackManifestKey(datapackHeader);
        const datapackJson = await this.loadJson(datapackHeader);
        return new VlocityDatapack(
            datapackHeader, manifestEntry.datapackType, manifestEntry.key, 
            getExportProjectFolder(datapackHeader), datapackJson);
    }

    public loadAll(datapackHeaders : string[]) : Promise<VlocityDatapack[]> {
        return mapAsyncParallel(datapackHeaders, this.loadFrom.bind(this), 4);
    }

    protected async loadJson(fileName : string) : Promise<any> {
        const datapackJson = await this.fileSystem.readFile(fileName);
        const baseDir = path.dirname(fileName);
        const datapack = JSON.parse(datapackJson.toString());

        for (const [key, value] of Object.entries(datapack)) {
            try {
                datapack[key] = await this.resolveValue(baseDir, value);
            } catch(err) {
                this.logger.error(`Failed to load datapack property ${key}: ${err}`);
            }
        }

        return datapack;
    }

    protected async loadRaw(fileName : string) : Promise<any> {
        if (this.fileSystem.pathExists(fileName)) {
            return (await this.fileSystem.readFile(fileName)).toString();
        }
        return fileName;
    }

    protected async resolveValue(baseDir: string, fieldValue: any) : Promise<any> {
        if (typeof fieldValue === 'string') {
            const fileName = fieldValue.split(/\\|\//i).pop();
            const loader = this.loaders.find(loader => !loader.test || loader.test.test(fileName));            
            if (loader) {
                try {
                    return await loader.load(path.join(baseDir, fileName));
                } catch(err) { 
                    // ignore loader errors; if the loader fails it will return the default value
                }
            }
        } else if (Array.isArray(fieldValue)) {
            return Promise.all(fieldValue.map((value, i) => this.resolveValue(baseDir, value)));
        } else if (fieldValue !== null && typeof fieldValue === 'object') {
            await Promise.all(Object.keys(fieldValue).map(
                async key => fieldValue[key] = await this.resolveValue(baseDir, fieldValue[key])));
        }
        return fieldValue;
    }
}