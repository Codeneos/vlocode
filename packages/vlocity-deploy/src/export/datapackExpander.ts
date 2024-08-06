import { injectable, Logger } from "@vlocode/core";
import { formatString, Timer } from "@vlocode/util";
import { VlocityDatapackSObject } from "@vlocode/vlocity";
import { DatapackExportDefinitionStore } from "./exportDefinitionStore";

export interface DatapackExpandResult {
    folder?: string;
    objectType: string;
    sourceKey: string;
    files: Record<string, Buffer | string>;
}

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
        this.logger.info(`Expanding: ${datapack.VlocityRecordSourceKey}`);
        const timer = new Timer();

        const itemRef = {
            objectType: datapack.VlocityRecordSObjectType,
            scope: context?.scope
        };

        const data: Record<string, unknown> = {};
        const files: Record<string, Buffer | string> = {};

        for (const field of Object.keys(datapack).sort()) {
            if (this.datapackStandardFields.includes(field)) {
                continue;
            }

            const fieldSettings = this.definitions.getFieldConfig(itemRef, field);
            let value = datapack[field];

            if (fieldSettings?.fileName) {
                const fileNameFormat = fieldSettings.fileName;
                const defaultExt = 'json';

                if (Array.isArray(value) && fieldSettings.expandArray) {
                    value = value.map(item => {
                        const fileName = this.evalFileName(fileNameFormat, { context: item ?? datapack, defaultExt });
                        this.logger.verbose(`Write ${fileName}`);
                        files[fileName] = this.getFileData(item);
                        return fileName;
                    });
                } else {
                    const fileName = this.evalFileName(fileNameFormat, { context: value, defaultExt });
                    this.logger.verbose(`Write ${fileName}`);
                    files[fileName] = this.getFileData(value);
                    value = fileName;
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

        const fileNameFormat = this.definitions.getFileName(itemRef) ?? '{VlocityRecordSourceKey}';
        const datapackFileName = `${this.evalFileName(fileNameFormat, { context: datapack })}_DataPack.json`;
        files[datapackFileName] = this.getFileData(data);

        this.logger.info(`Expanded ${datapack.VlocityRecordSourceKey} - ${timer.toString("ms")}`);

        return {
            objectType: datapack.VlocityRecordSObjectType,
            sourceKey: datapack.VlocityRecordSourceKey,
            files
        };
    }

    private getFileData(value: any) {
        if (Buffer.isBuffer(value)) {
            return value;
        }
        return Buffer.from(JSON.stringify(value, null, 4));
    }

    private evalFileName(format: string | string[], options?: { context?: object; defaultExt?: string; }) {
        const name = Array.isArray(format) 
            ? format.map(f => f.startsWith('_') ? f.substring(1) : options?.context?.[f] ?? f).join('_')
            : (options?.context ? formatString(format, options?.context) : format);
        return this.normalizePath(name, options?.defaultExt);
    }

    private normalizePath(path: string, extension?: string) {
        if (!path.includes('.') && extension) {
            path += `.${extension}`;
        }
        return path.trim().replace(/[^\w\\-\\.]+/g, '_').replace(/_+/g, '_');
    }
}
