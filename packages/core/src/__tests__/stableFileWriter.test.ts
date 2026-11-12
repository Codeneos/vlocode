import 'jest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { MemoryFileSystem } from '../fs/memoryFileSystem';
import { NodeFileSystem } from '../fs/nodeFileSystem';
import { StableFileWriter } from '../fs/stableFileWriter';

describe('StableFileWriter', () => {
    const existingJson = '{\n    "b": 1,\n    "a": 1\n}\n';

    describe('writeFile', () => {
        it('should create a file that does not exist', async () => {
            const fs = new MemoryFileSystem();
            const result = await new StableFileWriter(fs).writeFile('/pack/new.json', '{"a":1}');
            expect(result).toEqual({ file: '/pack/new.json', status: 'created', changes: [] });
            expect(await fs.readFileAsString('/pack/new.json')).toBe('{"a":1}');
        });

        it('should not write a JSON file with equal content', async () => {
            const fs = new MemoryFileSystem({ '/pack/file.json': existingJson });
            const outputFile = jest.spyOn(fs, 'outputFile');
            const result = await new StableFileWriter(fs).writeFile('/pack/file.json', '{"a":1,"b":1}');
            expect(result.status).toBe('unchanged');
            expect(outputFile).not.toHaveBeenCalled();
        });

        it('should merge a changed JSON file into the existing file', async () => {
            const fs = new MemoryFileSystem({ '/pack/file.json': existingJson });
            const result = await new StableFileWriter(fs).writeFile('/pack/file.json', '{"a":2,"b":1}');
            expect(result).toMatchObject({ status: 'updated', changes: [{ path: 'a', type: 'changed' }] });
            expect(await fs.readFileAsString('/pack/file.json')).toBe('{\n    "b": 1,\n    "a": 2\n}\n');
        });

        it('should use the merge options for JSON files', async () => {
            const fs = new MemoryFileSystem({ '/pack/file.json': '[{"a":1,"b":1}]' });
            const result = await new StableFileWriter(fs, { similarity: false }).writeFile('/pack/file.json', '[{"a":1,"b":2}]');
            expect(result.changes.map(change => change.type)).toEqual(['removed', 'added']);
        });

        it('should only write other files when their content changed', async () => {
            const fs = new MemoryFileSystem({ '/pack/script.js': 'x' });
            const writer = new StableFileWriter(fs);
            expect((await writer.writeFile('/pack/script.js', Buffer.from('x'))).status).toBe('unchanged');
            expect((await writer.writeFile('/pack/script.js', 'y')).status).toBe('updated');
            expect(await fs.readFileAsString('/pack/script.js')).toBe('y');
        });
    });

    describe('writeFolder', () => {
        it('should write the files and remove all other files and emptied folders', async () => {
            const fs = new MemoryFileSystem({
                '/pack/file.json': existingJson,
                '/pack/stale.json': '{}',
                '/pack/sub/stale.txt': 'x'
            });
            const result = await new StableFileWriter(fs).writeFolder('/pack', [['file.json', '{"a":1,"b":1}'], ['new.txt', 'n']]);
            expect(result.files.map(file => [file.file, file.status])).toEqual([
                ['/pack/file.json', 'unchanged'],
                ['/pack/new.txt', 'created']
            ]);
            expect(result.removed.sort()).toEqual(['/pack/stale.json', '/pack/sub', '/pack/sub/stale.txt']);
            expect(await fs.pathExists('/pack/sub')).toBe(false);
        });

        it('should keep a file that is renamed only in case', async () => {
            // Case-insensitive file systems (macOS, Windows) write the renamed file to the existing file
            const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'stable-writer-'));
            try {
                fs.writeFileSync(path.join(folder, 'Name_DataPack.json'), '{"Name":"Name"}');
                await new StableFileWriter(new NodeFileSystem()).writeFolder(folder, [['name_DataPack.json', '{"Name":"name"}']]);
                expect(fs.readdirSync(folder)).toEqual(['name_DataPack.json']);
                expect(fs.readFileSync(path.join(folder, 'name_DataPack.json'), 'utf-8')).toBe('{"Name":"name"}');
            } finally {
                fs.rmSync(folder, { recursive: true, force: true });
            }
        });

        it('should not remove kept files', async () => {
            const fs = new MemoryFileSystem({ '/pack/keep.json': '{}', '/pack/sub/keep.txt': 'x', '/pack/stale.json': '{}' });
            const result = await new StableFileWriter(fs).writeFolder('/pack', [], { keep: file => file.includes('keep') });
            expect(result.removed).toEqual(['/pack/stale.json']);
            expect(await fs.pathExists('/pack/sub/keep.txt')).toBe(true);
        });
    });
});
