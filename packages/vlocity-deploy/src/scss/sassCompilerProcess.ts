import { DeferredPromise } from '@vlocode/util';
import { LogLevel } from '@vlocode/core';

import type { SassCompileOptions } from './interface';
import { SassCompilerImpl } from './sassCompilerImpl';
import { Message } from './sassCompilerThreaded';

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
 * Compile SASS source code in CSS
 * @param data SASS source
 * @param options SASS options
 */
function compile(data: string, options?: SassCompileOptions) {
    return new SassCompilerImpl({
        warn: (message) => {
            log(LogLevel.warn, ...message);
        }
    }).compile(data, options);
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

