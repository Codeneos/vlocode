import * as path from 'path';
import { FileSystem , Logger, LogManager , injectable } from '@vlocode/core';
import { mapAsyncParallel, filterUndefined, CancellationToken } from '@vlocode/util';
import { VlocityDatapack } from './datapack';
import { getDatapackManifestKey, getExportProjectFolder } from './datapackUtil';
import { join } from 'path/posix';

type DatapackLoaderFunc = (fileName: string) => (Promise<string | Object> | string | Object);

@injectable()
export default class DatapackLoader {

    private readonly loaders : { test?: RegExp; load: DatapackLoaderFunc }[] = [
        { test: /\.json$/i, load: file => this.loadJson(file) },
        { test: /\.png|jpeg|jpg|doc|docx|xls|xlsx|zip$/i, load: file => this.loadBinary(file) },
        { test: /\.js|html|csv|txt|css|scss|sass\S+$/i, load: file => this.loadText(file) },
        { test: /\.\S+$/i, load: file => this.loadText(file) }
    ];

    constructor(
        private readonly fileSystem: FileSystem,
        private readonly logger: Logger = LogManager.get(DatapackLoader)) {
    }

    public addLoader(test: RegExp, loader: DatapackLoaderFunc) {
        this.loaders.push({ test, load: loader });
    }

    public async loadDatapacksFromFolder(datapackFolder: string, cancellationToken?: CancellationToken) {
        const datapackHeaders = await this.fileSystem.findFiles(join(datapackFolder, '**/*_DataPack.json'));
        return this.loadDatapacks(datapackHeaders, cancellationToken);
    }

    public async loadDatapack(datapackHeader: string): Promise<VlocityDatapack>;
    public async loadDatapack(datapackHeader: string, bubbleExceptions: true) : Promise<VlocityDatapack>;
    public async loadDatapack(datapackHeader: string, bubbleExceptions: false) : Promise<VlocityDatapack | undefined>;
    public async loadDatapack(datapackHeader: string, bubbleExceptions = true) : Promise<VlocityDatapack | undefined> {
        try {
            const manifestEntry = getDatapackManifestKey(datapackHeader);
            this.logger.info(`Loading datapack: ${manifestEntry.key}`);
            const datapackJson = await this.loadJson(datapackHeader);
            return new VlocityDatapack(datapackHeader,
                manifestEntry.datapackType,
                manifestEntry.key,
                getExportProjectFolder(datapackHeader),
                datapackJson
            );
        } catch(err) {
            this.logger.error(`Error loading datapack: ${path.basename(datapackHeader)} -- ${err.message || err}`);
            if (bubbleExceptions) {
                throw err;
            }
        }
    }

    public async loadDatapacks(datapackHeaders : string[], cancellationToken?: CancellationToken) : Promise<VlocityDatapack[]> {
        const datapacks = await mapAsyncParallel(datapackHeaders, async header => {
            if (cancellationToken?.isCancellationRequested) {
                return undefined;
            }
            return this.loadDatapack(header, false);
        }, 4);
        return filterUndefined(datapacks);
    }

    protected async loadJson(fileName : string) : Promise<any> {
        if (!await this.fileSystem.pathExists(fileName)) {
            return undefined;
        }

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

    private async loadText(fileName: string) : Promise<any> {
        if (!await this.fileSystem.pathExists(fileName)) {
            return undefined;
        }
        return (await this.fileSystem.readFile(fileName)).toString('utf-8');
    }

    private async loadBinary(fileName: string) : Promise<any> {
        if (!await this.fileSystem.pathExists(fileName)) {
            return undefined;
        }
        return this.fileSystem.readFile(fileName);
    }

    private async resolveValue(baseDir: string, fieldValue: any) : Promise<any> {
        if (typeof fieldValue === 'string') {
            const loader = this.loaders.find(candidateLoader => !candidateLoader.test || candidateLoader.test.test(fieldValue));
            if (loader) {
                try {
                    const value = await loader.load(path.join(baseDir, fieldValue));
                    if (value !== undefined) {
                        return value;
                    }
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