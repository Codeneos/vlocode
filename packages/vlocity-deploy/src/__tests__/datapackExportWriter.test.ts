import 'jest';
import * as path from 'path';

import { Logger, MemoryFileSystem } from '@vlocode/core';

import type { DatapackExpandResult } from '../export/datapackExpander';
import { DatapackExportWriter } from '../export/datapackExportWriter';

describe('DatapackExportWriter', () => {
    const root = path.resolve('/out');
    const folder = path.join(root, 'Product2', 'A');

    function expanded(sourceKey: string, files: Record<string, string>): DatapackExpandResult {
        return { sourceKey, folder: path.join('Product2', 'A'), files } as unknown as DatapackExpandResult;
    }

    async function folderContents(fileSystem: MemoryFileSystem, target = folder) {
        return (await fileSystem.readDirectory(target)).map(entry => entry.name).sort();
    }

    it('keeps an existing file with the same content in another order untouched', async () => {
        const existing = '{\n  "Name": "A",\n  "Code": "1"\n}\n';
        const fileSystem = new MemoryFileSystem({ [path.join(folder, 'A_DataPack.json')]: existing });
        const outputFile = jest.spyOn(fileSystem, 'outputFile');

        await new DatapackExportWriter(Logger.null, { fileSystem })
            .writeExpanded(expanded('Product2/A', { 'A_DataPack.json': '{"Code":"1","Name":"A"}' }), root);

        expect(outputFile).not.toHaveBeenCalled();
        expect(await fileSystem.readFileAsString(path.join(folder, 'A_DataPack.json'))).toBe(existing);
    });

    it('removes files from an earlier export that are no longer exported', async () => {
        const fileSystem = new MemoryFileSystem({ [path.join(folder, 'A_Old.json')]: '{}' });

        await new DatapackExportWriter(Logger.null, { fileSystem })
            .writeExpanded(expanded('Product2/A', { 'A_DataPack.json': '{}' }), root);

        expect(await folderContents(fileSystem)).toEqual(['A_DataPack.json']);
    });

    it.each([true, false])('keeps files of datapacks that share a folder in the same export run (stable: %s)', async stable => {
        const fileSystem = new MemoryFileSystem({ [path.join(folder, 'Old.json')]: '{}' });
        const writer = new DatapackExportWriter(Logger.null, { fileSystem, stable });

        await writer.writeExpanded(expanded('Product2/A', { 'A_DataPack.json': '{}' }), root);
        await writer.writeExpanded(expanded('Product2/B', { 'B_DataPack.json': '{}' }), root);

        expect(await folderContents(fileSystem)).toEqual(['A_DataPack.json', 'B_DataPack.json']);
    });

    it('rewrites all files when not stable', async () => {
        const fileSystem = new MemoryFileSystem({ [path.join(folder, 'A_DataPack.json')]: '{\n  "Name": "A"\n}' });

        await new DatapackExportWriter(Logger.null, { fileSystem, stable: false })
            .writeExpanded(expanded('Product2/A', { 'A_DataPack.json': '{"Name":"A"}' }), root);

        expect(await fileSystem.readFileAsString(path.join(folder, 'A_DataPack.json'))).toBe('{"Name":"A"}');
    });

    it('rejects two datapacks that write the same file', async () => {
        const writer = new DatapackExportWriter(Logger.null, { fileSystem: new MemoryFileSystem() });

        await writer.writeExpanded(expanded('Product2/A', { 'Shared.json': '{}' }), root);

        await expect(writer.writeExpanded(expanded('Product2/B', { 'Shared.json': '{}' }), root))
            .rejects.toThrow('Export path collision');
    });

    it('writes a consolidated datapack as formatted JSON', async () => {
        const fileSystem = new MemoryFileSystem();
        const result = { sourceKey: 'Product2/A', datapack: { Name: 'A' } };

        await new DatapackExportWriter(Logger.null, { fileSystem }).writeConsolidated(result as any, root);

        expect(await fileSystem.readFileAsString(path.join(root, 'Product2_A', 'A_DataPack.json'))).toBe('{\n    "Name": "A"\n}\n');
    });
});
