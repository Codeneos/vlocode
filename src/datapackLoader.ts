import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as constants from './constants';
import ServiceContainer from 'serviceContainer';
import VlocodeService from './services/vlocodeService';
import VlocityDatapackService, { ObjectEntry } from './services/vlocityDatapackService';
import SObjectRecord from './models/sobjectRecord';
import ExportDatapackCommand from './commands/exportDatapackCommand';
import CommandRouter from './services/commandRouter';
import { LogManager, Logger } from 'loggers';
import DatapackUtil, { getDatapackManifestKey, getExportProjectFolder } from 'datapackUtil';
import { groupBy, evalExpr, getDocumentBodyAsString } from './util';

import * as exportQueryDefinitions from 'exportQueryDefinitions.yaml';
import { createRecordProxy } from 'salesforceUtil';
import { VlocityDatapack } from 'models/datapack';

type DatapackLoaderRule = { rule: RegExp, load: (fileName: string) => Promise<any> };

export default class DatapackLoader {    

    private loaders : DatapackLoaderRule[] = [
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
                datapack[key] = await this.loadProperty(baseDir, datapack[key]);
            } catch(err) {
                this.logger.info(`Failed to load datapack property ${key}: ${err}`);
            }
        }));

        return datapack;
    }

    public loadRaw(fileName : string) : Promise<any> {
        return getDocumentBodyAsString(fileName);
    }

    public loadProperty(baseDir: string, fieldValue: any) : Promise<any> {
        if (typeof fieldValue === 'string') {
            let fileName = fieldValue.split(/\\|\//i).pop();
            let loader = this.loaders.find(loader => loader.rule.test(fileName));
            if (loader) {
                return loader.load.call(this, path.join(baseDir, fileName));
            }            
        }
        return Promise.resolve(fieldValue);
    }
}