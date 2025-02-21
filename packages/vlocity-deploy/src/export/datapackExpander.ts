import path from "path/posix";

import { injectable, Logger } from "@vlocode/core";
import { formatString, normalizeName, substringAfter } from "@vlocode/util";
import { VlocityDatapackSObject } from "@vlocode/vlocity";
import { DatapackExportDefinitionStore } from "./exportDefinitionStore";
import { ObjectRef } from "./datapackExporter";

export interface DatapackExpandResult {
    baseName: string;
    folder: string;
    objectType: string;
    sourceKey: string;
    parentKeys: string[];	
    files: Record<string, Buffer | string>;
}

type FieldRef = ObjectRef & { field: string };

/**
 * Represents a Datapack Expander that expand an exported datapack into a list of files that can be written to the file system or a zip archive.
 * The expander can be used to expand a single datapack or a list of datapacks.
 *
 * @usage
 * ```typescript
 * const expander = container.create(DatapackExpander);
 * const result = expander.expandDatapack(datapack);
 * 
 * for (const [fileName, fileData] of Object.entries(result.files)) {
 *    await fs.writeFile(fileName, fileData);
 * }
 * ```
 */
@injectable()
export class DatapackExpander {

    private static datapackFileName = 'DataPack.json';

    private fieldTypeExtension = {
        json: 'json',
        array: 'json',
        binary: 'bin'
    };

    private datapackStandardFields = [
        'VlocityRecordSObjectType',
        'VlocityRecordSourceKey',
        'VlocityDataPackType'
    ]

    constructor(
        /**
         * Configuration for the Datapack Exporter instance.
         */
        public readonly definitions: DatapackExportDefinitionStore,
        private readonly logger: Logger
    ) {
    }

    /**
     * Generate a datapack export for an object by the object id.
     * @param datapack The VlocityDatapackSObject to export.
     * @param context Optional context for the export.
     * @returns The DatapackExapndResult containing the exported datapack.
     */
    public expandDatapack(
        datapack: VlocityDatapackSObject,
        context?: {
            scope?: string;
        }
    ): DatapackExpandResult {
        this.logger.verbose(`Expand ${datapack.VlocityRecordSourceKey}`);
        
        const itemRef = {
            objectType: datapack.VlocityRecordSObjectType,
            scope: context?.scope
        };

        const baseSourceKey = substringAfter(datapack.VlocityRecordSourceKey, '/');
        const fileNameFormat = this.definitions.getFileName(itemRef) ?? baseSourceKey;
        const baseName = this.evalPathFormat(fileNameFormat, { context: datapack });
        
        const folderFormat = this.definitions.getFolder(itemRef) ?? baseSourceKey;
        const folder = path.join(
            this.normalizeFileName(itemRef.scope ?? itemRef.objectType),
            this.evalPathFormat(folderFormat, { context: datapack })
        );
        
        const data: Record<string, unknown> = {};
        const files = new DatapackFiles(baseName, folder, this.logger);

        for (const field of Object.keys(datapack).sort()) {
            if (this.datapackStandardFields.includes(field)) {
                continue;
            }

            const fileNameFormat = this.definitions.getFileName(itemRef, field);
            let value = datapack[field];

            if (fileNameFormat) {
                const defaultExt = 'json';
                if (this.expandFieldArray({ ...itemRef, field }, value)) {
                    value = value.map(item => {
                        const fileName = this.evalPathFormat(fileNameFormat, { context: item ?? datapack, defaultExt });
                        return files.addFile(fileName, item);
                    });
                } else {
                    const fileName = this.evalPathFormat(fileNameFormat, { context: value, defaultExt });
                    value = files.addFile(fileName, value);
                }
            }

            if (Buffer.isBuffer(value)) {
                value = value.toString('base64');
            }

            data[field] = value;
        }

        for (const standardField of this.datapackStandardFields) {
            if (standardField in datapack) {
                data[standardField] = datapack[standardField];
            }
        }

        files.addFile(DatapackExpander.datapackFileName, data);
        this.logger.info(`Expanded ${datapack.VlocityRecordSourceKey} (${files.count})`);

        return {
            objectType: datapack.VlocityRecordSObjectType,
            sourceKey: datapack.VlocityRecordSourceKey,
            parentKeys: [...this.collectParentKeys(datapack)],
            files: files.getFiles({ withFolder: false }),
            folder,
            baseName
        };
    }

    private collectParentKeys(datapack: object, parentKeys: Set<string> = new Set()): Set<string> {
        for (const [key, value] of Object.entries(datapack)) {
            if (key === 'VlocityDataPackType' && value === 'VlocityLookupMatchingKeyObject') {
                parentKeys.add(datapack['VlocityLookupRecordSourceKey']);
            }
            if (typeof value === 'object' && value !== null) {
                this.collectParentKeys(value, parentKeys);
            }
        }
        return parentKeys;
    }

    private expandFieldArray(ref: FieldRef, value: unknown): value is unknown[] {
        if (Array.isArray(value)) {
            return false;
        }
        const shouldExpand = this.definitions.getFieldConfig(ref, ref.field, 'expandArray');
        if (typeof shouldExpand === 'boolean') {
            return shouldExpand;
        }
        return false;
    }

    private evalPathFormat(format: string | string[], options?: { context?: object; defaultExt?: string; }) {
        const name = Array.isArray(format) 
            ? format.map(f => f.startsWith('_') ? f.substring(1) : options?.context?.[f] ?? '').join('_')
            : (options?.context ? formatString(format, options?.context) : format);
        return this.normalizeFileName(name, options?.defaultExt);
    }

    private normalizeFileName(path: string, extension?: string) {
        const normalized = normalizeName(path);
        if (extension) {
            return `${normalized}.${extension}`;
        }
        return normalized;
    }
}

class DatapackFiles {
    private files: Record<string, Buffer | string> = {};

    public get count() {
        return Object.keys(this.files).length;
    }

    public get size() {
        return Object.values(this.files).reduce((size, data) => size + (Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data)), 0);
    }

    constructor(
        public readonly filePrefix: string, 
        public readonly folder: string, 
        private readonly logger: Logger
    ) { }

    public addFile(fileName: string, value: unknown) {
        const data = this.getFileData(value);
        this.logger.verbose(`Write ${fileName} (${data.length} bytes)`);
        this.files[fileName] = data;
        return this.getFileName(fileName, { withFolder: false });
    }

    public getFiles(options?: { withFolder?: boolean }): Record<string, Buffer | string> {
        const files: Record<string, Buffer | string> = {};
        for (const [name, data] of Object.entries(this.files)) {
            files[this.getFileName(name, options)] = data;
        }
        return files;
    }

    private getFileName(name: string, options?: { withFolder?: boolean }): string {
        const fileName = this.filePrefix ? `${this.filePrefix}_${name}` : name;
        return options?.withFolder ? path.join(this.folder, fileName) : fileName;
    }

    private getFileData(value: unknown): Buffer | string {
        if (Buffer.isBuffer(value)) {
            return value;
        }
        return Buffer.from(JSON.stringify(value, null, 4));
    }
}
