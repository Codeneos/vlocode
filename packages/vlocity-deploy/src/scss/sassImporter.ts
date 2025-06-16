import fs from 'fs';
import path from 'path';
import type * as sass from 'sass';

interface SassImporterOptions {
    workingDirectory?: string;
}

interface CachedFileInfo {
    path: string;
    contents?: sass.ImporterResult;
}

export class SassImporter implements sass.Importer<"sync"> {
    private readonly canonicalizedUrls = new Map<string, CachedFileInfo>();
    private readonly importerPrefix = 'sass:///';
    private readonly includePaths: string[];
    private readonly cwd: string;

    constructor(includePaths: string[], options?: SassImporterOptions) {
        this.cwd = options?.workingDirectory ?? process.cwd();
        this.includePaths = includePaths.map(includePath => 
            path.isAbsolute(includePath) ? includePath : path.relative(this.cwd, includePath)
        );
    }

    public load(canonicalUrl: URL): sass.ImporterResult | null {
        const fileInfo = this.canonicalizedUrls.get(canonicalUrl.href);
        if (!fileInfo) {
            return null;
        }
        if (!fileInfo.contents) {
            fileInfo.contents = {
                syntax: 'scss',
                contents: fs.readFileSync(fileInfo.path).toString('utf-8'),
                sourceMapUrl: new URL(`file:///${fileInfo.path.replace(/\\/g, '/')}`)
            };
        }
        return fileInfo.contents;
    }

    public canonicalize(url: string): URL | null {
        if (this.canonicalizedUrls.has(url)) {
            return new URL(url);
        }
        if (url.startsWith(this.importerPrefix)) {
            url = url.substring(this.importerPrefix.length);
        }
        const normalizedUrl = `${url.replace(/\\/g, '/')}/${url.replace(/\\/g, '/')}.scss`;
        for (const checkPath of this.includePaths.map(includePath => path.join(includePath, normalizedUrl))) {
            try {
                if (fs.existsSync(checkPath)) {
                    const canonicalizedUrl = `${this.importerPrefix}${url}`;
                    this.canonicalizedUrls.set(canonicalizedUrl, { path: checkPath });
                    return new URL(canonicalizedUrl);
                }
            } catch {
                // ignore errors in fs.existsSync
                // just try the next path and continue
            }
        }
        return null;
    }
}