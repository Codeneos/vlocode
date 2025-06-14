import { cache, clearCache } from '@vlocode/util';
import { type FileInfo, type FileStat, FileSystem, type StatsOptions, type WriteOptions } from './fileSystem';

/**
 * Decorate any existing file system with caching functionality; caches the write and stat operations towards the target file system.
 * The methods `readDirectory` and `findFiles` are not cached and will be redirected to the base file system.
 */
export class CachedFileSystemAdapter extends FileSystem {
    constructor(private readonly innerFs: FileSystem) {
        super();
    }

    public async readFileAsString(fileName: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
        return (await this.readFile(fileName)).toString(encoding);
    }

    public clearCache() {
        clearCache(this);
    }

    @cache({ unwrapPromise: true })
    public readFile(fileName: string): Promise<Buffer> {
        return this.innerFs.readFile(fileName);
    }

    @cache({ unwrapPromise: true, immutable: true })
    public stat(path: string, options?: StatsOptions): Promise<FileStat | undefined> {
        return this.innerFs.stat(path, options);
    }

    @cache({ unwrapPromise: true, immutable: true })
    public readDirectory(path: string): Promise<FileInfo[]> {
        return this.innerFs.readDirectory(path);
    }

    @cache({ unwrapPromise: true, immutable: true })
    public findFiles(patterns: string | string[]): Promise<string[]> {
        return this.innerFs.findFiles(patterns);
    }

    public writeFile(path: string, data: Buffer, options?: WriteOptions | undefined): Promise<void> {
        return this.innerFs.writeFile(path, data, options);
    }

    public createDirectory(path: string): Promise<void> {
        return this.innerFs.createDirectory(path);
    }
}
