import path from 'path';
import { FileSystem, injectable, Logger, LogManager } from '@vlocode/core';
import { VlocityDatapack } from './datapack';
import { getDatapackSource } from './datapackSource';

@injectable()
export class DatapackFileWriter {

    constructor(
        private readonly fileSystem: FileSystem,
        private readonly logger: Logger = LogManager.get(DatapackFileWriter)
    ) {
    }

    public async saveDatapack(datapack: VlocityDatapack): Promise<void> {
        const source = getDatapackSource(datapack.data);
        const headerFile = source?.fileName || datapack.headerFile;
        if (!headerFile) {
            throw new Error(`Unable to save datapack ${datapack.key}; no source header file is known`);
        }
        await this.writeValue(datapack.data, headerFile);
    }

    private async writeValue(value: unknown, fileName: string): Promise<void> {
        this.logger.verbose(`Write datapack file ${fileName}`);
        await this.fileSystem.outputFile(fileName, `${JSON.stringify(await this.serializeValue(value, fileName), undefined, 4)}\n`);
    }

    private async serializeValue(value: unknown, currentFile: string): Promise<unknown> {
        if (Buffer.isBuffer(value)) {
            return value.toString('base64');
        }
        if (Array.isArray(value)) {
            return Promise.all(value.map(item => this.serializeArrayItem(item, currentFile)));
        }
        if (value && typeof value === 'object') {
            const source = getDatapackSource(value);
            const result: Record<string, unknown> = {};
            for (const [key, child] of Object.entries(value)) {
                if (child === undefined) {
                    continue;
                }
                const childSource = getDatapackSource(child);
                const childFile = source?.fieldFiles?.[key] || (childSource?.external ? childSource.fileName : undefined);
                if (childFile) {
                    await this.writeValue(child, childFile);
                    result[key] = this.relativeReference(currentFile, childFile);
                } else {
                    result[key] = await this.serializeValue(child, currentFile);
                }
            }
            return result;
        }
        return value;
    }

    private async serializeArrayItem(value: unknown, currentFile: string): Promise<unknown> {
        const source = getDatapackSource(value);
        if (source?.external) {
            await this.writeValue(value, source.fileName);
            return this.relativeReference(currentFile, source.fileName);
        }
        return this.serializeValue(value, currentFile);
    }

    private relativeReference(fromFile: string, toFile: string) {
        return path.relative(path.dirname(fromFile), toFile) || path.basename(toFile);
    }
}
