import * as fs from 'fs';
import globby = require('globby');
import * as path from 'path';
import { injectable, LifecyclePolicy } from '../index';
import { FileInfo, FileSystem, StatsOptions } from './types';

/**
 * Basic class that can wrap any API implementation the NodeJS FS API into a more reduced FileSystem interface.
 */
@injectable({ provides: FileSystem, lifecycle: LifecyclePolicy.singleton })
export class NodeFileSystem extends FileSystem {

    constructor(private readonly innerFs: typeof fs = fs) {
        super();
    }

    public async stat(path: string, options?: StatsOptions): Promise<fs.Stats | undefined> {
        return new Promise((resolve, reject) => this.innerFs.stat(path, (err, result) => {
            if (err) {
                if (options?.throws) {
                    reject(err);
                } else {
                    resolve(undefined);
                }
            } else {
                resolve(result);
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
