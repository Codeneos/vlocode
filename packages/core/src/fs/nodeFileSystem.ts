import * as fs from 'fs';
import * as path from 'path';
import globby from 'globby';
import { injectable } from '../index';
import { FileInfo, FileStat, FileSystem, StatsOptions, WriteOptions } from './fileSystem';

/**
 * Basic class that can wrap any API implementation the NodeJS FS API into a more reduced FileSystem interface.
 */
@injectable.singleton({ provides: FileSystem })
export class NodeFileSystem extends FileSystem {

    constructor(protected readonly innerFs: typeof fs = fs) {
        super();
    }

    public stat(path: string, options?: { throws: true }): Promise<FileStat>;
    public stat(path: string, options?: StatsOptions): Promise<FileStat | undefined>;
    public stat(path: string, options?: StatsOptions): Promise<FileStat | undefined> {
        return new Promise((resolve, reject) => this.innerFs.stat(path, (err, result) => {
            if (err) {
                if (options?.throws) {
                    reject(err);
                } else {
                    resolve(undefined);
                }
            } else {
                resolve(new FsStatsAdapter(path, result));
            }
        }));
    }

    public readFile(path: string): Promise<Buffer> {
        return new Promise((resolve, reject) => this.innerFs.readFile(path, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        }));
    }

    public readDirectory(path: string): Promise<FileInfo[]> {
        return new Promise((resolve, reject) => this.innerFs.readdir(path, { withFileTypes: true }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        }));
    }

    public createDirectory(path: string): Promise<void> {
        return new Promise((resolve, reject) => this.innerFs.mkdir(path, { recursive: true }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        }));
    }

    public writeFile(path: string, data?: Buffer | string, options?: WriteOptions): Promise<void> {
        return new Promise((resolve, reject) => this.innerFs.writeFile(path, data ?? '', { flag: options?.append ? 'a' : 'w' }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        }));
    }

    public findFiles(patterns: string | string[]): Promise<string[]> {
        return globby(this.normalizeGlobPatterns(patterns), {
            fs: {
                lstat: this.innerFs.lstat.bind(this.innerFs),
                stat: this.innerFs.stat.bind(this.innerFs),
                lstatSync: this.innerFs.lstatSync.bind(this.innerFs),
                statSync: this.innerFs.statSync.bind(this.innerFs),
                readdir: this.innerFs.readdir.bind(this.innerFs),
                readdirSync: this.innerFs.readdirSync.bind(this.innerFs)
            }
        });
    }

    protected normalizeGlobPatterns(patterns: string | string[]) {
        // Normalize windows path separator to posix for globby
        return typeof patterns == 'string' ?
            patterns.replace(/[/\\]+/g, path.posix.sep) :
            patterns.map(this.normalizeGlobPatterns, this);
    }
}

class FsStatsAdapter implements FileStat {
    get ctime() { return this.stats.ctimeMs; }
    get mtime() { return this.stats.mtimeMs; }
    get size() { return this.stats.size; }

    constructor(readonly name: string, readonly stats: fs.Stats) { 
    }

    isFile(): boolean {
        return this.stats.isFile();
    }

    isDirectory(): boolean {
        return this.stats.isDirectory();
    }
}

