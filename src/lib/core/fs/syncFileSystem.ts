import * as fs from 'fs';
import * as globby from 'globby';
import { LifecyclePolicy } from '../container';
import { injectable } from '../inject';
import { FileSystem, StatsOptions } from './types';

/**
 * FileSystem implementation using sync `node:fs` for reading and resolving file information.
 */

@injectable({ provides: FileSystem, lifecycle: LifecyclePolicy.singleton })
export class SyncFileSystem extends FileSystem {
    public stat(path: string, options?: StatsOptions): Promise<fs.Stats | undefined> {
        try {
            return Promise.resolve(fs.statSync(path));
        } catch (err) {
            if (options?.throws) {
                throw err;
            }
        }
        return Promise.resolve(undefined);
    }

    public readFile(path: string): Promise<Buffer> {
        return Promise.resolve(fs.readFileSync(path));
    }

    public readDirectory(path: string): Promise<string[]> {
        return Promise.resolve(fs.readdirSync(path));
    }

    public findFiles(patterns: string | string[]): Promise<string[]> {
        return globby(patterns, { fs });
    }
}
