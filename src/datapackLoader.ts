import * as path from 'path';
import { LogManager, Logger } from 'loggers';
import { getDatapackManifestKey, getExportProjectFolder } from 'datapackUtil';
import { getDocumentBodyAsString } from './util';

import { VlocityDatapack } from 'models/datapack';
import { isObject } from 'util';

type DatapackLoaderRule = { rule: RegExp, load: (fileName: string) => Promise<any> };

export default class DatapackLoader {    

    private readonly loaders : DatapackLoaderRule[] = [
        { rule: /\.json$/i, load: this.loadJson },
        { rule: /.*/, load: this.loadRaw }
    ];

    private get logger() : Logger {
        return LogManager.get(DatapackLoader);
    }

    public async loadFrom(datapackHeader : string) : Promise<VlocityDatapack> {
        this.logger.log(`Loading datapack: ${datapackHeader}`);
        const manifestEntry = getDatapackManifestKey(datapackHeader);
        const datapackJson = await this.loadJson(datapackHeader);
        return new VlocityDatapack(
            datapackHeader, manifestEntry.datapackType, manifestEntry.key, 
            getExportProjectFolder(datapackHeader), datapackJson);
    }

    private async loadJson(fileName : string) : Promise<any> {
        const datapackJson = await getDocumentBodyAsString(fileName);
        const baseDir = path.dirname(fileName);
        let datapack = JSON.parse(datapackJson.toString());

        await Promise.all(Object.keys(datapack).map(async key => {
            try {
                datapack[key] = await this.loadProperty(baseDir, key, datapack[key]);
            } catch(err) {
                this.logger.error(`Failed to load datapack property ${key}: ${err}`);
            }
        }));

        return datapack;
    }

    private loadRaw(fileName : string) : Promise<any> {
        return getDocumentBodyAsString(fileName);
    }

    private async loadProperty(baseDir: string, propertyName: string, fieldValue: any) : Promise<any> {
        if (typeof fieldValue === 'string') {
            let fileName = fieldValue.split(/\\|\//i).pop();
            let loader = this.loaders.find(loader => loader.rule.test(fileName));
            if (loader) {
                try {
                    const value = await loader.load.call(this, path.join(baseDir, fileName));
                    //this.logger.verbose(`Load ${propertyName} using ${loader.load.name} (rule: ${loader.rule})`);
                    return value;
                } catch(err) { 
                    return fieldValue;
                }                
            }
        } else if (Array.isArray(fieldValue)) {
            return Promise.all(fieldValue.map((value, i) => this.loadProperty(baseDir, `${propertyName}|${i}`, value)));
        } else if (isObject(fieldValue)) {
            await Promise.all(Object.keys(fieldValue).map(
                async key => fieldValue[key] = await this.loadProperty(baseDir, key, fieldValue[key])));
        }
        return Promise.resolve(fieldValue);
    }
}