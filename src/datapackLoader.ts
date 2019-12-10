import * as path from 'path';
import { LogManager, Logger } from 'logging';
import { getDatapackManifestKey, getExportProjectFolder } from 'datapackUtil';
import { getDocumentBodyAsString, mapAsyncParallel } from './util';

import { VlocityDatapack } from 'models/datapack';
import { isObject } from 'util';
import * as fs from 'fs-extra';

type DatapackLoaderRule = { rule: RegExp, load: (fileName: string) => Promise<any> };

export default class DatapackLoader {    

    private readonly loaders : DatapackLoaderRule[] = [
        { rule: /\.json$/i, load: file => this.loadJson(file) },
        { rule: /\..*$/, load: file => this.loadRaw(file) }
    ];

    constructor(private logger: Logger = LogManager.get(DatapackLoader)) {        
    }

    public async loadFrom(datapackHeader : string) : Promise<VlocityDatapack> {
        this.logger.verbose(`Loading datapack: ${datapackHeader}`);
        const manifestEntry = getDatapackManifestKey(datapackHeader);
        const datapackJson = await this.loadJson(datapackHeader);
        return new VlocityDatapack(
            datapackHeader, manifestEntry.datapackType, manifestEntry.key, 
            getExportProjectFolder(datapackHeader), datapackJson);
    }

    public loadAll(datapackHeaders : string[]) : Promise<VlocityDatapack[]> {
        return mapAsyncParallel(datapackHeaders, this.loadFrom.bind(this), 4);
    }

    private async loadJson(fileName : string) : Promise<any> {
        const datapackJson = await fs.readFile(fileName);
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

    private async loadRaw(fileName : string) : Promise<any> {
        if (fs.existsSync(fileName)) {
            return (await fs.readFile(fileName)).toString();
        }
        return fileName;
    }

    private async resolveValue(baseDir: string, fieldValue: any) : Promise<any> {
        if (typeof fieldValue === 'string') {
            const fileName = fieldValue.split(/\\|\//i).pop();
            const loader = this.loaders.find(loader => loader.rule.test(fileName));            
            if (loader) {
                try {
                    return await loader.load(path.join(baseDir, fileName));
                } catch(err) { 
                    // ingore loader errors; if the loader fails it will return teh default value
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