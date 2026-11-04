import * as path from 'path';
import { spreadAsync } from '@vlocode/util';
import {
    CachedFileSystemAdapter, escapeGlobPath, FileSystem, FindType, fromGlobPath, MemoryFileSystem, toGlobPattern,
    type DeleteOptions, type FileInfo, type FileStat, type FindOptions, type StatsOptions, type WriteOptions
} from '../fs';

/** File system without native glob support that only implements the abstract members */
class DelegatingFileSystem extends FileSystem {
    constructor(private readonly inner: FileSystem) {
        super();
    }
    public stat(file: string, options?: StatsOptions): Promise<FileStat | undefined> { return this.inner.stat(file, options); }
    public readFile(file: string): Promise<Buffer> { return this.inner.readFile(file); }
    public readDirectory(dir: string): Promise<FileInfo[]> { return this.inner.readDirectory(dir); }
    public writeFile(file: string, data: Buffer, options?: WriteOptions): Promise<void> { return this.inner.writeFile(file, data, options); }
    public createDirectory(dir: string): Promise<void> { return this.inner.createDirectory(dir); }
    public delete(file: string, options?: DeleteOptions): Promise<void> { return this.inner.delete(file, options); }
}

const projectFiles = {
    '/project/a.json': 'a',
    '/project/B.JSON': 'b',
    '/project/sub/c.json': 'c',
    '/project/sub/d.txt': 'd',
    '/project/other/e.json': 'e',
    '/project/Account (Sales).layout-meta.xml': 'x',
    '/project/Account (Sales).layout': 'y',
    '/project/[draft].json': 'z'
};

describe('FileSystem', () => {
    const fileSystems: [string, () => FileSystem][] = [
        ['a native file system', () => new MemoryFileSystem(projectFiles)],
        ['a file system without native glob support', () => new DelegatingFileSystem(new MemoryFileSystem(projectFiles))],
        ['a cached file system', () => new CachedFileSystemAdapter(new MemoryFileSystem(projectFiles))]
    ];

    describe.each(fileSystems)('find on %s', (_name, create) => {
        const find = (patterns: string | string[], options?: FindOptions) => spreadAsync(create().find(patterns, options));

        it('finds only files by default', async () => {
            expect((await find('*', { cwd: '/project' })).sort()).toEqual([
                '/project/Account (Sales).layout',
                '/project/Account (Sales).layout-meta.xml',
                '/project/B.JSON',
                '/project/[draft].json',
                '/project/a.json'
            ]);
        });

        it.each([FindType.directory, 'directory' as const])('finds only directories for find type %s', async findType => {
            expect((await find('*', { cwd: '/project', findType })).sort()).toEqual(['/project/other', '/project/sub']);
        });

        it.each([FindType.file, 'file' as const])('finds only files for find type %s', async findType => {
            expect(await find('sub/*', { cwd: '/project', findType })).toEqual(['/project/sub/c.json', '/project/sub/d.txt']);
        });

        it('finds files and directories when both types are requested', async () => {
            expect((await find('[os]*', { cwd: '/project', findType: FindType.file | FindType.directory, noCase: false })).sort())
                .toEqual(['/project/other', '/project/sub']);
            expect((await find('{a.json,sub}', { cwd: '/project', findType: FindType.file | FindType.directory })).sort())
                .toEqual(['/project/a.json', '/project/sub']);
        });

        it('returns absolute paths for absolute patterns regardless of the working directory', async () => {
            expect(await find('/project/sub/*.json', { cwd: '/elsewhere' })).toEqual(['/project/sub/c.json']);
            expect(await find('/project/sub/*.json')).toEqual(['/project/sub/c.json']);
        });

        it('searches each working directory and returns each match once', async () => {
            expect((await find('**/*.json', { cwd: ['/project/sub', '/project/other', '/project/sub/'] })).sort())
                .toEqual(['/project/other/e.json', '/project/sub/c.json']);
            expect((await find(['sub/*.json', '**/c.json'], { cwd: '/project' }))).toEqual(['/project/sub/c.json']);
        });

        it('stops after the limit', async () => {
            expect(await find('**', { cwd: '/project', limit: 2 })).toHaveLength(2);
            expect(await find('**', { cwd: '/project', limit: 0 })).toEqual([]);
        });

        it('excludes matches of the exclude patterns', async () => {
            expect((await find('**/*.json', { cwd: '/project', exclude: ['sub/**', '**/[[]draft].json'] })).sort())
                .toEqual(['/project/B.JSON', '/project/a.json', '/project/other/e.json']);
        });

        it('limits the depth of the search', async () => {
            expect((await find('**/*.json', { cwd: '/project', depth: 1, noCase: false })).sort())
                .toEqual(['/project/[draft].json', '/project/a.json']);
        });

        it('matches case insensitive unless noCase is false', async () => {
            expect((await find('*.json', { cwd: '/project' })).sort()).toEqual(['/project/B.JSON', '/project/[draft].json', '/project/a.json']);
            expect((await find('*.json', { cwd: '/project', noCase: false })).sort()).toEqual(['/project/[draft].json', '/project/a.json']);
        });

        it('finds nothing in a working directory that does not exist', async () => {
            expect(await find('**', { cwd: '/missing' })).toEqual([]);
        });

        it('matches literal paths with glob characters when escaped', async () => {
            const fileSystem = create();
            expect([...await fileSystem.findFiles(`${escapeGlobPath('/project/Account (Sales)')}.*`)].sort()).toEqual([
                '/project/Account (Sales).layout',
                '/project/Account (Sales).layout-meta.xml'
            ]);
            expect(await fileSystem.findFiles(escapeGlobPath('/project/[draft].json'))).toEqual(['/project/[draft].json']);
        });
    });

    describe('glob paths', () => {
        it('converts Windows separators in patterns to forward slashes', () => {
            expect(toGlobPattern('C:\\project\\src\\**\\*.json', path.win32)).toBe('C:/project/src/**/*.json');
        });

        it('keeps escaped glob characters in Windows patterns', () => {
            const pattern = escapeGlobPath('C:\\project\\Account (Sales)[1].layout', path.win32);
            expect(pattern).toBe('C:/project/Account \\(Sales\\)\\[1\\].layout');
            expect(toGlobPattern(pattern, path.win32)).toBe(pattern);
        });

        it('keeps backslashes in POSIX patterns as escape characters', () => {
            expect(toGlobPattern('/project/\\[draft\\].json', path.posix)).toBe('/project/\\[draft\\].json');
            expect(escapeGlobPath('/project/Account (Sales).layout', path.posix)).toBe('/project/Account \\(Sales\\).layout');
        });

        it('converts results to platform paths', () => {
            expect(fromGlobPath('C:/project/a.json', 'D:\\other', path.win32)).toBe('C:\\project\\a.json');
            expect(fromGlobPath('src/a.json', 'C:\\project', path.win32)).toBe('C:\\project\\src\\a.json');
            expect(fromGlobPath('src/a.json', undefined, path.win32)).toBe('src\\a.json');
            expect(fromGlobPath('src/a.json', 'project', path.posix)).toBe('project/src/a.json');
        });
    });

    describe('outputFile', () => {
        it('creates missing parent directories', async () => {
            const fileSystem = new MemoryFileSystem();
            await fileSystem.outputFile('/a/b/c.txt', 'c');
            expect(await fileSystem.readFileAsString('/a/b/c.txt')).toBe('c');
        });

        it('does not overwrite an existing file when overwrite is false', async () => {
            const fileSystem = new MemoryFileSystem({ '/a.txt': 'old' });
            await expect(fileSystem.outputFile('/a.txt', 'new', { overwrite: false })).rejects.toThrow();
            expect(await fileSystem.readFileAsString('/a.txt')).toBe('old');
            await fileSystem.outputFile('/b.txt', 'new', { overwrite: false });
            expect(await fileSystem.readFileAsString('/b.txt')).toBe('new');
        });

        it('appends to an existing file', async () => {
            const fileSystem = new MemoryFileSystem({ '/a.txt': 'a' });
            await fileSystem.appendFile('/a.txt', 'b');
            expect(await fileSystem.readFileAsString('/a.txt')).toBe('ab');
        });
    });

    describe('stat', () => {
        it('returns the file name and type', async () => {
            const stat = await new MemoryFileSystem(projectFiles).stat('/project/sub/c.json');
            expect(stat?.name).toBe('c.json');
            expect(stat?.isFile()).toBe(true);
            expect(stat?.isDirectory()).toBe(false);
        });

        it('returns undefined for a missing path unless throws is set', async () => {
            const fileSystem = new MemoryFileSystem();
            await expect(fileSystem.stat('/missing')).resolves.toBeUndefined();
            await expect(fileSystem.stat('/missing', { throws: true })).rejects.toThrow();
        });
    });

    describe('emptyDirectory', () => {
        it('does not create a missing directory', async () => {
            const fileSystem = new MemoryFileSystem();
            await fileSystem.emptyDirectory('/missing');
            await expect(fileSystem.pathExists('/missing')).resolves.toBe(false);
        });

        it('deletes all entries', async () => {
            const fileSystem = new MemoryFileSystem({ '/dir/a.txt': 'a', '/dir/sub/b.txt': 'b' });
            const deleted = await fileSystem.emptyDirectory('/dir');
            expect(deleted.sort()).toEqual(['/dir/a.txt', '/dir/sub']);
            await expect(fileSystem.readDirectory('/dir')).resolves.toEqual([]);
        });

        it('keeps matching files and their folders and deletes emptied folders', async () => {
            const fileSystem = new MemoryFileSystem({
                '/dir/keep.txt': 'k',
                '/dir/sub/keep.txt': 'k',
                '/dir/sub/drop.txt': 'd',
                '/dir/empty/drop.txt': 'd'
            });
            const deleted = await fileSystem.emptyDirectory('/dir', { keep: file => file.endsWith('keep.txt') });
            expect(deleted.sort()).toEqual(['/dir/empty', '/dir/empty/drop.txt', '/dir/sub/drop.txt']);
            await expect(fileSystem.pathExists('/dir/keep.txt')).resolves.toBe(true);
            await expect(fileSystem.pathExists('/dir/sub/keep.txt')).resolves.toBe(true);
        });
    });
});

describe('CachedFileSystemAdapter', () => {
    it('reads the new content after writing a file', async () => {
        const fileSystem = new CachedFileSystemAdapter(new MemoryFileSystem({ '/a.txt': 'old' }));
        expect(await fileSystem.readFileAsString('/a.txt')).toBe('old');
        await fileSystem.outputFile('/a.txt', 'new');
        expect(await fileSystem.readFileAsString('/a.txt')).toBe('new');
    });

    it('sees files and directories created after a cached lookup', async () => {
        const fileSystem = new CachedFileSystemAdapter(new MemoryFileSystem({ '/dir/a.txt': 'a' }));
        expect(await fileSystem.isFile('/dir/b.txt')).toBe(false);
        expect(await fileSystem.findFiles('/dir/*')).toEqual(['/dir/a.txt']);
        await fileSystem.outputFile('/dir/b.txt', 'b');
        await fileSystem.createDirectory('/dir/sub');
        expect(await fileSystem.isFile('/dir/b.txt')).toBe(true);
        expect(await fileSystem.isDirectory('/dir/sub')).toBe(true);
        expect(await fileSystem.findFiles('/dir/*')).toEqual(['/dir/a.txt', '/dir/b.txt']);
    });

    it('does not see a deleted file', async () => {
        const fileSystem = new CachedFileSystemAdapter(new MemoryFileSystem({ '/a.txt': 'a' }));
        expect(await fileSystem.isFile('/a.txt')).toBe(true);
        await fileSystem.delete('/a.txt');
        expect(await fileSystem.isFile('/a.txt')).toBe(false);
    });
});

describe('MemoryFileSystem', () => {
    it('restores binary files and empty directories from a buffer', async () => {
        const original = new MemoryFileSystem({ '/bin/data.bin': Buffer.from([0xff, 0x00, 0xfe]), '/text.txt': 'täxt', '/empty': null });
        const restored = MemoryFileSystem.fromBuffer(original.getBuffer());
        expect([...await restored.readFile('/bin/data.bin')]).toEqual([0xff, 0x00, 0xfe]);
        expect(await restored.readFileAsString('/text.txt')).toBe('täxt');
        expect(await restored.isDirectory('/empty')).toBe(true);
    });

    it('restores a buffer in the format of earlier versions', async () => {
        const restored = MemoryFileSystem.fromBuffer(Buffer.from(JSON.stringify({ '/a.txt': 'a' })));
        expect(await restored.readFileAsString('/a.txt')).toBe('a');
    });
});
