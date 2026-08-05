import path from 'path';

import { FileSystem, injectable, Logger, LogManager } from '@vlocode/core';
import { normalizeSObjectTypeName } from '@vlocode/util';
import {
    getExportProjectFolder,
    isDatapackRecord,
    type VlocityDatapack,
    type VlocityDatapackSObject
} from '@vlocode/vlocity';

import { DatapackExpander, type DatapackExpandResult } from './export/datapackExpander';
import { DatapackExportDefinitionStore } from './export/exportDefinitionStore';
import { DatapackExportDefinitions, type DatapackExportDefinitionFile } from './exportDefinitions';

const bundledDefinitionFiles: readonly DatapackExportDefinitionFile[] = [
    DatapackExportDefinitions.omniStudioStandard,
    DatapackExportDefinitions.omniStudioManaged,
    DatapackExportDefinitions.industries
];

export interface DatapackWritePlan {
    readonly expectedFolder: string;
    readonly expectedHeader: string;
    readonly targetFolder: string;
    readonly targetHeader: string;
    readonly files: ReadonlyMap<string, Buffer | string>;
}

@injectable()
export class DatapackWriter {

    private readonly expander: DatapackExpander;
    private readonly fallbackDefinitions = new DatapackExportDefinitionStore();
    private readonly fallbackExpander: DatapackExpander;

    public constructor(
        private readonly fileSystem: FileSystem,
        private readonly definitions: DatapackExportDefinitionStore,
        logger: Logger = LogManager.get(DatapackWriter)
    ) {
        this.expander = new DatapackExpander(this.definitions, logger);
        this.fallbackExpander = new DatapackExpander(this.fallbackDefinitions, logger);
        for (const file of bundledDefinitionFiles) {
            this.fallbackDefinitions.load(file.definitions, { scope: file.id });
        }
    }

    public getWritePlan(datapack: VlocityDatapack): DatapackWritePlan {
        const expanded = this.expand(datapack);
        const expectedFolder = path.join(this.projectFolder(datapack), expanded.folder);
        const generatedHeader = this.generatedHeader(datapack, expanded);
        const expectedHeader = path.join(expectedFolder, generatedHeader);

        // A loaded datapack owns its current folder and main file name. Expansion may change
        // its internal file layout, but it must not silently create a second datapack location.
        const targetFolder = datapack.headerFile ? path.dirname(datapack.headerFile) : expectedFolder;
        const targetHeader = datapack.headerFile ?? path.join(targetFolder, generatedHeader);
        const files = new Map<string, Buffer | string>();

        for (const [fileName, data] of Object.entries(expanded.files)) {
            const targetName = fileName === generatedHeader ? path.basename(targetHeader) : fileName;
            const targetFile = path.join(targetFolder, targetName);
            if (files.has(targetFile)) {
                throw new Error(`Unable to expand datapack ${datapack.key}; multiple files map to ${targetName}`);
            }
            files.set(targetFile, data);
        }

        return {
            expectedFolder,
            expectedHeader,
            targetFolder,
            targetHeader,
            files
        };
    }

    public async write(datapack: VlocityDatapack): Promise<void> {
        const plan = this.getWritePlan(datapack);
        await this.fileSystem.emptyDirectory(plan.targetFolder);
        for (const [fileName, data] of plan.files) {
            await this.fileSystem.outputFile(fileName, data);
        }
    }

    private expand(datapack: VlocityDatapack): DatapackExpandResult {
        const root = this.rootRecord(datapack);
        const sharedScope = this.definitionScope(this.definitions, datapack);
        if (sharedScope.found) {
            return this.expander.expandDatapack(root, {
                datapackType: datapack.datapackType,
                scope: sharedScope.scope
            });
        }

        const fallbackScope = this.definitionScope(this.fallbackDefinitions, datapack);
        if (fallbackScope.found) {
            return this.fallbackExpander.expandDatapack(root, {
                datapackType: datapack.datapackType,
                scope: fallbackScope.scope
            });
        }

        return this.expander.expandDatapack(root, { datapackType: datapack.datapackType });
    }

    private definitionScope(
        definitions: DatapackExportDefinitionStore,
        datapack: VlocityDatapack
    ): { found: boolean; scope?: string } {
        const objectType = normalizeSObjectTypeName(datapack.sobjectType);
        const definition = definitions.objectDefinitions().find(candidate =>
            candidate.datapackType === datapack.datapackType &&
            !!candidate.objectType &&
            normalizeSObjectTypeName(candidate.objectType) === objectType
        );
        return definition ? { found: true, scope: definition.scope } : { found: false };
    }

    private generatedHeader(datapack: VlocityDatapack, expanded: DatapackExpandResult): string {
        const headers = Object.keys(expanded.files).filter(fileName => /(?:^|_)DataPack\.json$/i.test(fileName));
        if (headers.length !== 1) {
            throw new Error(`Expected one datapack header from expansion of ${datapack.key}, found ${headers.length}`);
        }
        return headers[0];
    }

    private projectFolder(datapack: VlocityDatapack): string {
        if (datapack.projectFolder) {
            return datapack.projectFolder;
        }
        if (datapack.headerFile) {
            return getExportProjectFolder(datapack.headerFile);
        }
        throw new Error(`Unable to expand datapack ${datapack.key}; no project folder or source header file is known.`);
    }

    private rootRecord(datapack: VlocityDatapack): VlocityDatapackSObject {
        if (isDatapackRecord(datapack.data) && datapack.data.VlocityDataPackType === 'SObject') {
            return datapack.data;
        }
        throw new Error(`Datapack ${datapack.key} does not contain a valid SObject datapack root.`);
    }
}
