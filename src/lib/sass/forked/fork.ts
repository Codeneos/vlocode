import * as sass from 'sass.js';
import * as globby from 'globby';
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

/**
 * Handle import request by SASS compiler
 * @param request Request from SASS compiler
 * @param done done callback
 */
async function importHandler(request, done) {
    // resolve file
    try {
        if (!request.path) {
            const matches = await globby(request.current.replace(/\\/g, '/'), { absolute: true, onlyFiles: true, suppressErrors: true });
            if (matches.length) {
                return done({ path: matches[0] });
            }
        }
    } catch(e) {
        // ignore glob errors
    }

    // always return 
    done();
}

/**
 * Async sass compiler script that is spawned as a fork; this ensures the main extension process does not crash or get lagy when
 * compiling sass into css
 */
void (async () => {
    try {
        // Compile sass as child process function/fork
        await new Promise(async (resolve, reject) => {
            process.on('message', async (msg: Message) => {
                if (msg.type == 'compile') {
                    try {
                        // Use custom import handler
                        sass.importer(importHandler);
                        sass.compile(msg.payload.data, msg.payload.options || {}, result => {
                            send({ type: 'result', payload: result });
                            resolve();
                        });
                    } catch(e) {
                        reject(e);
                    }
                } else {
                    reject(`Received unknown message type ${msg.type} from parent`);
                }
            });
        });
        process.exit(0);
    } catch(e) {
        send({ type: 'error', payload: e.message || e });
        process.exit(1);
    }
})();

