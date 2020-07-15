import { fork } from 'child_process';
import * as path from 'path';
import { Logger } from 'lib/logging';
import { SassCompiler, SassCompileSuccessResult, SassCompileErrorResult } from 'lib/sass/compiler';
import { dependency } from 'lib/core/inject';

export interface Message {
    type: 'compile' | 'result' | 'error' | 'log';
    payload: any;
}

/**
 * A forked version of the SASS compiler running compilation of SASS in a separate thread;
 * This class is used by internally by the 
 */
@dependency()
export class ForkedSassCompiler implements SassCompiler {

    public constructor(public readonly logger: Logger) {
    }

    public compile(sass: string, options?: any): Promise<SassCompileSuccessResult | SassCompileErrorResult> {
        // Spawns new compiler and wait for it to complete
        return new Promise((resolve, reject) => {
            const sassCompilerPath = path.join(__dirname, 'sassCompiler.js');
            const sassCompiler = fork(sassCompilerPath);

            sassCompiler.on('message', (msg: Message) => {
                switch (msg.type) {
                    case 'error': reject(msg.payload); break;
                    case 'log': this.logger.log(msg.payload); break;
                    case 'result': resolve(msg.payload); break;
                }
                sassCompiler.kill();
            });

            sassCompiler.on('close', code => {
                if (code != 0) {
                    reject(`Sass Compiler exited with non-zero exit code (${code})`);
                }
            });

            sassCompiler.send({ type: 'compile', payload: { data: sass, options } });
        });
    }
}

