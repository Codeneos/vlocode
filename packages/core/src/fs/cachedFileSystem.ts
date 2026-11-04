import { cache, clearCache } from '@vlocode/util';
import { type DeleteOptions, type FileInfo, type FileStat, FileSystem, type StatsOptions, type WriteOptions } from './fileSystem';
import { inject } from '../di/inject.decorator';

/**
 * Decorate any existing file system with caching functionality; caches reading files, stats, directories and
 * found files. The cache is cleared when this adapter writes, creates or deletes, so it only stays valid
 * while changes to the underlying file system go through this adapter.
 */
export class CachedFileSystemAdapter extends FileSystem {
    constructor(@inject(FileSystem) private readonly innerFs: FileSystem) {
        super();
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

    public writeFile(path: string, data: Buffer, options?: WriteOptions): Promise<void> {
        return this.clearCacheAfter(this.innerFs.writeFile(path, data, options));
    }

    public createDirectory(path: string): Promise<void> {
        return this.clearCacheAfter(this.innerFs.createDirectory(path));
    }

    public delete(path: string, options?: DeleteOptions): Promise<void> {
        return this.clearCacheAfter(this.innerFs.delete(path, options));
    }

    /** Clear the cache once a change completes, also when it fails as it may have partially succeeded */
    private async clearCacheAfter(change: Promise<void>): Promise<void> {
        try {
            await change;
        } finally {
            this.clearCache();
        }
    }
}
