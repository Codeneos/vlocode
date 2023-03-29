import * as path from 'path';
import * as sass from 'sass';
import * as fs from 'fs-extra';
import { DeferredPromise } from '@vlocode/util';
import { LogLevel } from '@vlocode/core';
import type { SassCompileOptions, SassCompileResult } from '../compiler';
import type { Message } from './compiler';

/**
 * Send a message from the fork the parent process
 * @param payload Message payload to send
 */
function send(payload: Message) {
    if (!process.send) {
        throw new Error('Process send not defined, is this process');
    }
    process.send(payload);
}

function DartSassImporter(
    this: void,
    includePaths: string[], 
    options?: { workingDirectory?: string }): sass.Importer<"sync">
{
    const canonicalizedUrls = new Map<string, { path: string, contents?: sass.ImporterResult }>();
    const importerPrefix = 'sass:///';
    const cwd = options?.workingDirectory ?? process.cwd();
    includePaths = includePaths.map(includePath => path.isAbsolute(includePath) ? includePath : path.relative(cwd, includePath));

    return {
        load(this: void, canonicalUrl: URL): sass.ImporterResult | null {
            const fileInfo = canonicalizedUrls.get(canonicalUrl.href);
            if (!fileInfo) {
                return null;
            }
            if (!fileInfo.contents) {
                fileInfo.contents = {
                    syntax: 'scss',
                    contents: fs.readFileSync(fileInfo.path).toString('utf-8'),
                    sourceMapUrl: new URL(`file:///${fileInfo.path.replace(/\\/g, '/')}`)
                }
            }
            return fileInfo.contents;
        },
        canonicalize(this: void, url: string) {
            if (canonicalizedUrls.has(url)) {
                return new URL(url);
            }
            if (url.startsWith(importerPrefix)) {
                url = url.substring(importerPrefix.length);
            }
            const normalizedUrl = `${url.replace(/\\/g, '/')}/${url.replace(/\\/g, '/')}.scss`;
            for (const checkPath of includePaths.map(includePath => path.join(includePath, normalizedUrl))) {
                try {
                    if (fs.existsSync(checkPath)) {
                        const canonicalizedUrl = `${importerPrefix}${url}`;
                        canonicalizedUrls.set(`${canonicalizedUrl}`, { path: checkPath });
                        return new URL(`${canonicalizedUrl}`);
                    }
                } catch (e) {
                    // ignore errors in fs.existsSync
                    // just try the next path and continue
                }
            }
            return null;
        }
    }
}

/**
 * Compile SASS source code in CSS
 * @param data SASS source
 * @param options SASS options
 */
export async function compile(data: string, options?: SassCompileOptions) : Promise<SassCompileResult> {
    return new Promise((resolve, reject) => {
        try {
            // Use custom import handler
            const result = sass.compileString(data, {
                style: options?.style === 'compressed' ? 'compressed' : 'expanded',
                verbose: false,
                sourceMap: false,
                logger: {
                    warn: (message: string) => {
                        log(LogLevel.warn, message.split('\n').shift());
                    }
                },
                importers: [
                    DartSassImporter(options?.importer?.includePaths ?? [ '.' ])
                ]
            });
            resolve({
                status: 0,
                css: result.css,
                loadedUrls: result.loadedUrls.map(url => url.href),
                sourceMap: result.sourceMap
            } as SassCompileResult);
        } catch(e) {
            reject(e);
        }
    });
}

/**
 * Wait for a message from the parent process.
 */
async function * getMessageLoop() : AsyncGenerator<Message> {
    const messageQueue = new Array<any>();
    const signal = new DeferredPromise<boolean>();

    process.on('message', msg => {
        messageQueue.push(msg);
        if (!signal.isResolved) {
            signal.resolve(true);
        }
    });

    while(await signal) {
        while (messageQueue.length > 0) {
            yield messageQueue.shift();
        }
        signal.reset();
    }
}

/**
 * Log a message to the parent/host process
 * @param severity Severity of the message
 * @param message Message parts
 */
function log(severity: LogLevel, ...message: any[]) {
    send({ type: 'log', payload: { message: message.join(' '), severity } });
}

/**
 * Handle messages from the parent
 * @param type Message type
 * @param data Message payload
 */
async function handleMessage(type: string, data: any) {
    switch(type) {
        case 'compile': {
            // Compile sass as child process function/fork
            return compile(data.data, data.options);
        }
        case 'exit': {
            process.exit();
        }
        // eslint-disable-next-line no-fallthrough -- `process.exit` never returns therefore a fallthrough is impossible
        default: {
            throw new Error(`Received unknown message type ${type} from host`);
        }
    }
}

/**
 * Async sass compiler script that is spawned as a fork; this ensures the main extension process does not crash or get lagy when
 * compiling sass into css
 */
void (async () => {
    for await (const message of getMessageLoop()) {
        try {
            const result = await handleMessage(message.type, message.payload);
            send({ id: message.id, type: 'result', payload: result });
        } catch(err) {
            send({ id: message.id, type: 'error', payload: `${err}` });
        }
    }
})();

