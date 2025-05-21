import * as path from 'path';
import { FileSystem , Logger, LogManager , injectable } from '@vlocode/core';
import { mapAsyncParallel, filterUndefined, CancellationToken, OptionalPromise, CustomError, getErrorMessage, directoryName, cache, fileName } from '@vlocode/util';
import { VlocityDatapack } from './datapack';
import { getExportProjectFolder } from './datapackUtil';
import { DatapackInfoService } from './datapackInfoService';

type DatapackLoaderFunc = (fileName: string) => OptionalPromise<string | object>;

@injectable()
export class DatapackLoader {

    private readonly loaders : { test?: RegExp; load: DatapackLoaderFunc }[] = [
        { test: /\.json$/i, load: file => this.loadJson(file) },
        { test: /\.(png|jpeg|jpg|doc|docx|xls|xlsx|zip|pdf)$/i, load: file => this.loadBinary(file) },
        { test: /\.(js|html|csv|txt|css|scss|sass)$/i, load: file => this.loadText(file) },
        { test: /\.(\S+)$/i, load: file => this.loadText(file) }
    ];

    constructor(
        private readonly fileSystem: FileSystem,
        private readonly datapackInfo: DatapackInfoService,
        private readonly logger: Logger = LogManager.get(DatapackLoader)) {
    }

    public addLoader(test: RegExp, loader: DatapackLoaderFunc) {
        this.loaders.push({ test, load: loader });
    }

    public async loadDatapacksFromFolder(datapackFolder: string, cancellationToken?: CancellationToken) {
        const datapackHeaders = await this.fileSystem.findFiles(path.join(datapackFolder, '**/*_DataPack.json'));
        return this.loadDatapacks(datapackHeaders, cancellationToken);
    }

    public async loadDatapack(datapackHeader: string): Promise<VlocityDatapack>;
    public async loadDatapack(datapackHeader: string, bubbleExceptions: true) : Promise<VlocityDatapack>;
    public async loadDatapack(datapackHeader: string, bubbleExceptions: false) : Promise<VlocityDatapack | undefined>;
    public async loadDatapack(datapackHeader: string, bubbleExceptions = true) : Promise<VlocityDatapack | undefined> {
        try {
            const [ datapackName ] = datapackHeader.split(/[\\|/]+/).slice(-2, -1);
            const datapackJson = await this.loadJson(datapackHeader);

            if (!datapackJson) {
                throw new Error(`No such file: ${datapackHeader}`);
            }

            if (typeof datapackJson['VlocityDataPackType'] !== 'string') {
                throw new Error(`Missing "VlocityDataPackType" property in JSON`);
            }

            const datapackType = await this.getDatapackType(datapackHeader, datapackJson);
            const datapackKey = `${datapackType}/${datapackName}`;

            this.logger.verbose(`Loaded datapack ${datapackKey} from "${datapackHeader}"`);

            return new VlocityDatapack(datapackType, datapackJson, {
                key: datapackKey,
                headerFile: datapackHeader,
                projectFolder: getExportProjectFolder(datapackHeader)
            });
        } catch(error) {
            if (bubbleExceptions) {
                throw new CustomError(`Error loading datapack ${fileName(datapackHeader)}: ${getErrorMessage(error, { includeStack: false })}`, error);
            }
            this.logger.error(`Error loading datapack ${fileName(datapackHeader)} -- ${getErrorMessage(error)}`);
        }
    }

    private async getDatapackType(datapackHeaderFile: string, datapackJson: object): Promise<string> {
        const [ datapackTypeFolder ] = datapackHeaderFile.split(/[\\|/]+/).slice(-3, -1);
        const objectType = datapackJson['VlocityRecordSObjectType'];

        if (typeof datapackJson['VlocityDataPackType'] !== 'string' || typeof objectType !== 'string') {
            throw new Error(`Datapack missing "VlocityDataPackType" or "VlocityRecordSObjectType" property of type string`);
        }

        const datapackDef = 
            await this.datapackInfo.getDatapackInfo(objectType, datapackTypeFolder) ||
            await this.datapackInfo.getDatapackInfo(objectType);

        return datapackDef?.datapackType ?? 'SObject';
    }

    public async loadDatapacks(datapackHeaders: string[], cancellationToken?: CancellationToken) : Promise<VlocityDatapack[]> {
        const datapacks = await mapAsyncParallel(datapackHeaders, async header => {
            if (cancellationToken?.isCancellationRequested) {
                return undefined;
            }
            return this.loadDatapack(header, false);
        }, 4);
        return filterUndefined(datapacks);
    }

    protected async loadJson(fileName : string) : Promise<any> {
        if (!await this.fileExists(fileName)) {
            return undefined;
        }

        const datapackJson = await this.fileSystem.readFile(fileName);
        const baseDir = directoryName(fileName);
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
        if (!await this.fileExists(fileName)) {
            return undefined;
        }
        return (await this.fileSystem.readFile(fileName)).toString('utf-8');
    }

    private async loadBinary(fileName: string) : Promise<any> {
        if (!await this.fileExists(fileName)) {
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
                } catch {
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

    private async fileExists(fileName: string) : Promise<boolean> {
        const files = await this.readDirFiles(directoryName(fileName));
        return files.has(fileName);
    }

    @cache({ ttl: 2, unwrapPromise: true })
    private async readDirFiles(dir: string){
        const filePaths = new Set<string>();
        for (const file of await this.fileSystem.readDirectory(dir)) {
            if (file.isFile()) {
                filePaths.add(path.join(dir, file.name));
            }
        }
        return filePaths;
    }
}