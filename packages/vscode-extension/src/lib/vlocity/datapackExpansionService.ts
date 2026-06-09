import path from 'path';

import { injectable, LogManager } from '@vlocode/core';
import {
    getExportProjectFolder,
    isDatapackRecord,
    type VlocityDatapack,
    type VlocityDatapackSObject
} from '@vlocode/vlocity';
import {
    DatapackExpander,
    DatapackExportDefinitions,
    DatapackExportDefinitionStore,
    type DatapackExpandResult,
    type DatapackExportDefinitionFile
} from '@vlocode/vlocity-deploy';

const bundledDefinitionFiles: readonly DatapackExportDefinitionFile[] = [
    DatapackExportDefinitions.omniStudioStandard,
    DatapackExportDefinitions.omniStudioManaged,
    DatapackExportDefinitions.industries
];

@injectable()
export class DatapackExpansionService {

    private readonly definitions = new DatapackExportDefinitionStore();
    private readonly expander = new DatapackExpander(this.definitions, LogManager.get(DatapackExpander));

    public constructor() {
        this.loadBundledDefinitions();
    }

    public sourceFiles(datapack: VlocityDatapack): string[] {
        const expanded = this.expand(datapack);
        return Object.keys(expanded.files).map(fileName => this.sourceFileName(datapack, expanded, fileName));
    }

    public sourceTexts(datapack: VlocityDatapack): Map<string, string> {
        const expanded = this.expand(datapack);
        return new Map(Object.entries(expanded.files).map(([fileName, data]) => [
            this.sourceFileName(datapack, expanded, fileName),
            this.fileDataToText(data)
        ]));
    }

    public async saveDatapack(datapack: VlocityDatapack): Promise<void> {
        const expanded = this.expand(datapack);
        await expanded.writeToFilesystem(this.projectFolder(datapack));
    }

    private expand(datapack: VlocityDatapack): DatapackExpandResult {
        const root = this.rootRecord(datapack);
        const scope = this.definitionScope(datapack);
        return this.expander.expandDatapack(root, { datapackType: datapack.datapackType, scope });
    }

    private definitionScope(datapack: VlocityDatapack): string | undefined {
        return this.definitions.getAvailableScopes({
            datapackType: datapack.datapackType,
            objectType: datapack.sobjectType
        })[0];
    }

    private loadBundledDefinitions(): void {
        for (const file of bundledDefinitionFiles) {
            this.definitions.load(file.definitions, { scope: file.id });
        }
    }

    private rootRecord(datapack: VlocityDatapack): VlocityDatapackSObject {
        if (isDatapackRecord(datapack.data) && datapack.data.VlocityDataPackType === 'SObject') {
            return datapack.data;
        }
        throw new Error(`Datapack ${datapack.key} does not contain a valid SObject datapack root.`);
    }

    private sourceFileName(datapack: VlocityDatapack, expanded: DatapackExpandResult, fileName: string): string {
        return path.join(this.projectFolder(datapack), expanded.folder, fileName);
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

    private fileDataToText(data: Buffer | string): string {
        return Buffer.isBuffer(data) ? data.toString('utf8') : data;
    }
}
