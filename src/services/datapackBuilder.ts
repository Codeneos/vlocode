import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as jsforce from 'jsforce';
import * as path from 'path';
import * as process from 'process';
import * as yaml from 'yaml';
import ServiceContainer, { default as s } from 'serviceContainer';
import { isBuffer, isString, isObject, isError } from 'util';
import { getDocumentBodyAsString, readdirAsync, fstatAsync, getStackFrameDetails, forEachProperty, getProperties, readFileAsync, existsAsync, forEachAsync } from '../util';
import { LogManager, Logger } from 'loggers';
import { VlocityDatapack } from 'models/datapack';
import VlocodeConfiguration from 'models/vlocodeConfiguration';
import { FSWatcher, PathLike } from 'fs';
import { runInThisContext } from 'vm';
//import * as sass from 'sass';
import { VlocityDatapackImportRecord, VlocityDatapackData, VlocityDatapackRelationshipType, VlocityDatapackCollection } from 'models/datapackCollection';
import VlocityDatapackService from 'services/vlocityDatapackService';

export default class DatapackBuilder {  

    private compilers : { [fileExt: string] : (data: string) => Thenable<string> } = {
        'json': (data: string) => this.buildJson(JSON.parse(data)),
        //'sass': (data: string) => Promise.resolve(sass.renderSync({ data: data }).css.toString())
    };

    public async buildImportCollection(importRecords: VlocityDatapackImportRecord[]) : Promise<VlocityDatapackCollection> {
        const primaryImport = importRecords.find( rec => rec.VlocityDataPackRelationshipType == VlocityDatapackRelationshipType.primary );
        return { 
            useVlocityTriggers: true,
            status: 'Ready',
            processMultiple: true,
            primaryDataPackType: primaryImport.VlocityDataPackType,
            primaryDataPackKey: primaryImport.VlocityDataPackKey,
            maxDepth: -1,
            isChunked: false,
            ignoreAllErrors: false,
            forceQueueable: false,
            dataPacks: importRecords,
            dataPackId: null,
            alreadyExportedKeys: [],
            name: primaryImport.VlocityDataPackKey,
            version: 1,
        };
    }

    public async buildImportRecord(datapack : VlocityDatapack, relType: VlocityDatapackRelationshipType) : Promise<VlocityDatapackImportRecord> {
        let datapackData = await this.buildImportData(datapack, relType);
        let importRecord : VlocityDatapackImportRecord = {
            VlocityPrimarySourceId: null,
            VlocityPreviousPageKey: null,
            VlocityMultiPackParentKey: null,
            VlocityDataPackMessage: null,
            VlocityDepthFromPrimary: 0,
            VlocityDataPackType: datapack.datapackType,
            VlocityDataPackStatus: "Success",
            VlocityDataPackRelationshipType: datapackData.VlocityDataPackRelationshipType,
            VlocityDataPackRecords: [],
            VlocityDataPackParents: [],
            VlocityDataPackName: datapackData.Id,
            VlocityDataPackLabel: datapackData.VlocityDataPackLabel,
            VlocityDataPackKey: datapack.key,
            VlocityDataPackIsNotSupported: false,
            VlocityDataPackIsIncluded: true,
            VlocityDataPackAllRelationships: {},
            VlocityDataPackData: datapackData,
            DataPackAttachmentSize: 0,
            DataPackAttachmentParentId: null,
            DataPackAttachmentId: null,
            ActivationStatus: null
        };
        return importRecord;
    }

    public async buildImportData(datapack : VlocityDatapack, relType: VlocityDatapackRelationshipType) : Promise<VlocityDatapackData> {
        const datapackDefaultKeys = {
            VlocityDataPackIsIncluded: true
        };
        let datapackData : VlocityDatapackData = {
            VlocityDataPackRelationshipType: relType,
            VlocityDataPackKey: datapack.key,
            VlocityDataPackLabel: `${datapack.datapackType}: ${datapack.name}`,
            VlocityDataPackType: datapack.datapackType,
            VlocityDataPackIsIncluded: true,
            Id: datapack.name || datapack.key,
            [datapack.sobjectType]: [ Object.assign({}, datapackDefaultKeys, datapack.data) ]
        };
        return datapackData;
    }

    public async buildImport(datapackHeaderFile : string) : Promise<string> {
        return this.compileData(datapackHeaderFile);
    }

    private async buildJson(data : object) : Promise<string> {
        await forEachAsync(Object.keys(data), async key => {
            let fieldData = data[key];
            if (!fieldData) {
                // skip empty fields
                return; 
            }
            if (typeof fieldData === 'string') {
                try {
                    fieldData = await this.compileData(fieldData);
                } catch(err) {
                    // failed to compile field data
                    fieldData = null;
                }
            } else if (typeof fieldData === 'object') {
                fieldData = await this.buildJson(fieldData);
            }
            data[key] = fieldData;
        });
        return JSON.stringify(data);
    }

    private async compileData(data : string) : Promise<string> {
        const ext = path.extname(data).toLowerCase().replace('.','');
        if (ext) {
            const fileContent = await readFileAsync(data);
            if (this.compilers[ext]) {
                return this.compilers[ext](fileContent);
            }
            return fileContent;
        }
        return data;
    }
}