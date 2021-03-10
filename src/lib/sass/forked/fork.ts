import * as path from 'path';
import * as sass from 'sass.js';
import * as fs from 'fs-extra';
import type { SassCompilerOptions, SassImportRequest, SassImportResponse } from '../compiler';
import type { Message } from './compiler';
import { DeferredPromise } from 'lib/util/deferred';

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

/**
 * Create import handler that scans the specified include paths
 * @param includePaths Paths to consider
 */
function getImportHandler(includePaths: string[]) {
    // Map include paths to absolute paths when required
    const cwd = process.cwd();
    const paths = includePaths.map(includePath => path.isAbsolute(includePath) ? includePath : path.relative(cwd, includePath));

    // Session cache to speed-up lookups
    const includeCache = new Map<string, string>();
    const readFile = (file: string) => {
        if (includeCache.has(file)) {
            return includeCache.get(file);
        }
        const data = fs.readFileSync(file).toString("utf-8");
        includeCache.set(file, data);
        return data;
    };

    return (request: SassImportRequest, done: (response?: SassImportResponse) => void) => {

        // resolve file
        if (!request.path && request.current) {
            const requestedPath = `${request.current.replace(/\\/g, '/')}/${request.current.replace(/\\/g, '/')}.scss`;
            for (const checkPath of paths.map(includePath => path.join(includePath, requestedPath))) {
                try {
                    if (fs.existsSync(checkPath)) {
                        return done({ content: readFile(checkPath) });
                    }
                } catch (e) {
                    // ignore errors in fs.existsSync
                    // just try the next path and continue
                }
            }
        }

        // unable to resolve file
        done();
    };
}

/**
 * Compile SASS source code in CSS
 * @param data SASS source
 * @param options SASS options
 */
export async function compile(data: string, options?: SassCompilerOptions) : Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            // Use custom import handler
            sass.importer(getImportHandler(options?.importer?.includePaths || [ process.cwd() ]));
            sass.compile(data, options, resolve);
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
    const signal = new DeferredPromise<Boolean>();

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
 * @param message Message parts
 */
function log(...message: any[]) {
    send({ type: 'log', payload: message.join(' ') });
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

