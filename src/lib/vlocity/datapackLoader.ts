import * as nodeFs from 'fs';
import * as path from 'path';
import { FileSystem } from 'interfaces/fileSystem';
import { Logger, LogManager } from 'lib/logging';
import { mapAsyncParallel } from 'lib/util/collection';
import { VlocityDatapack } from 'lib/vlocity/datapack';
import { getDatapackManifestKey, getExportProjectFolder } from 'lib/vlocity/datapackUtil';
import { substringAfterLast } from 'lib/util/string';

/**
 * Basic file system using NodeJS fs module.
 */
export const directFileSystem : FileSystem = {
    readFile: nodeFs.promises.readFile,
    readdir: nodeFs.promises.readdir,
    pathExists: path => Promise.resolve(nodeFs.existsSync(path))
};

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

    protected readonly loaders : { test?: RegExp; load: DatapackLoaderFunc }[] = [
        { test: /\.json$/i, load: file => this.loadJson(file) },
        { test: /\.\S+$/i, load: file => this.loadRaw(file) }
    ];

    constructor(
        protected readonly fileSystem: FileSystem = directFileSystem,
        protected readonly logger: Logger = LogManager.get(DatapackLoader)) {
    }

    public addLoader(test: RegExp, loader: DatapackLoaderFunc) {
        this.loaders.push({ test, load: loader });
    }

    public async loadFrom(datapackHeader: string) : Promise<VlocityDatapack> {
        const manifestEntry = getDatapackManifestKey(datapackHeader);
        this.logger.info(`Loading datapack: ${manifestEntry.key}`);
        const datapackJson = await this.loadJson(datapackHeader);
        return new VlocityDatapack(datapackHeader,
            manifestEntry.datapackType,
            manifestEntry.key,
            getExportProjectFolder(datapackHeader),
            datapackJson
        );
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
        if (await this.fileSystem.pathExists(fileName)) {
            return (await this.fileSystem.readFile(fileName)).toString();
        }
        throw new Error('Cannot load invalid file');
    }

    protected async resolveValue(baseDir: string, fieldValue: any) : Promise<any> {
        if (typeof fieldValue === 'string') {
            const fileName = substringAfterLast(fieldValue, /\\|\//i);
            const loader = this.loaders.find(candidateLoader => !candidateLoader.test || candidateLoader.test.test(fileName));
            if (loader) {
                try {
                    return await loader.load(path.join(baseDir, fileName));
                } catch(err) {
                    // Ignore loader errors; if the loader fails it will return the default value
                }
            }
        } else if (Array.isArray(fieldValue)) {
            return Promise.all(fieldValue.map(value => this.resolveValue(baseDir, value)));
        } else if (fieldValue !== null && typeof fieldValue === 'object') {
            await Promise.all(Object.keys(fieldValue).map(
                async key => fieldValue[key] = await this.resolveValue(baseDir, fieldValue[key])));
        }
        return fieldValue;
    }
}