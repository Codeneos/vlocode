import * as fs from 'fs';
import { cache, clearCache } from '@vlocode/util';
import { FileInfo, FileSystem, StatsOptions } from './types';

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

    @cache()
    public readFile(fileName: string): Promise<Buffer> {
        return this.innerFs.readFile(fileName);
    }

    @cache()
    public stat(path: string, options?: StatsOptions): Promise<fs.Stats | undefined> {
        return this.innerFs.stat(path, options);
    }

    public readDirectory(path: string): Promise<FileInfo[]> {
        return this.innerFs.readDirectory(path);
    }

    public findFiles(patterns: string | string[]): Promise<string[]> {
        return this.innerFs.findFiles(patterns);
    }
}
