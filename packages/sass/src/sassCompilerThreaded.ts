import { ChildProcess, fork } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { Logger, injectable, LifecyclePolicy } from '@vlocode/core';
import { randomUUID } from 'crypto';
import { SassCompiler, type SassCompileResult } from './interface';

export interface Message {
    id?: string;
    type: 'compile' | 'result' | 'error' | 'log';
    payload: any;
}

interface SassCompileRequest {
    reject(response: string | Error): void;
    resolve(response: SassCompileResult): void;
}

/**
 * A forked version of the SASS compiler running compilation of SASS in a separate thread;
 * This class is used by internally by the
 */
@injectable({ provides: SassCompiler, lifecycle: LifecyclePolicy.singleton })
export class SassCompilerThreaded implements SassCompiler {

    private sassCompiler?: ChildProcess;
    private compilerPath?: string;
    private lastMessageTime = 0;
    private compilerIdleWatch: any;
    private readonly maxIdleTime = 60; // in seconds
    private readonly pendingRequests = new Map<string, SassCompileRequest>();

    public constructor(
        private readonly logger: Logger
    ) {
    }

    public initialize(options?: { paths?: string[] }): boolean {
        try {
            this.compilerPath = this.getSassCompilerPath(options?.paths);
        } catch (error) {
            this.logger.error('Failed to initialize external SASS compiler process %s', error);
            return false;
        }
        return true;
    }

    public compile(sass: string, options?: any): Promise<SassCompileResult> {
        const compilerPath = this.compilerPath;
        if (!compilerPath) {
            throw new Error('SASS compiler path is not set, initialize the SASS compiler before use.');
        }
        return new Promise((resolve, reject) => {
            const payload = { data: sass, options };
            const message = { id: randomUUID(), type: 'compile', payload };
            this.getCompilerProcess(compilerPath).send(message);
            this.pendingRequests.set(message.id, { resolve, reject });
        });
    }

    private handleCompilerMessages(msg: Message) {
        // store last message time to avoid killing the compiler
        this.lastMessageTime = Date.now();

        // Handle log messages from child
        switch (msg.type) {
            case 'log': {
                this.logger.write(msg.payload.severity, msg.payload.message);
            } return;
        }

        // handle specific messages
        const pendingRequest = msg.id && this.pendingRequests.get(msg.id);

        if (!pendingRequest) {
            this.logger.error('Received error for unknown request', msg);
            return;
        } else {
            // @ts-expect-error msg.id will not be null
            this.pendingRequests.delete(msg.id);
        }

        switch (msg.type) {
            case 'error': {
                this.logger.debug('Error during SASS compilation');
                pendingRequest.reject(msg.payload);
            } break;
            case 'result': {
                this.logger.debug('SASS compiled to CSS without errors');
                pendingRequest.resolve(msg.payload);
            } break;
        }
    }

    private handleCompilerExit(code: number) {
        if (code) {
            this.logger.warn(`Sass Compiler exited with non-zero exit code (${code})`);
        }

        // inform pending requests that the compiler exited
        for (const request of this.pendingRequests.values()) {
            request.reject('Sass Compiler exited unexpectedly');
        }

        this.pendingRequests.clear();
        delete this.sassCompiler;
        clearInterval(this.compilerIdleWatch);
    }

    private getCompilerProcess(compilerPath: string): ChildProcess {
        if (this.sassCompiler && this.sassCompiler.connected) {
            return this.sassCompiler;
        }

        if (!compilerPath) {
            throw new Error('SASS compiler path is not set, initialize the SASS compiler before use.');
        }

        this.logger.verbose(`Starting new SASS compiler: ${compilerPath}`);
        this.sassCompiler = fork(compilerPath);
        this.sassCompiler.on('message', this.handleCompilerMessages.bind(this));
        this.sassCompiler.on('close', this.handleCompilerExit.bind(this));

        this.compilerIdleWatch = setTimeout(() => {
            if (this.sassCompiler && this.lastMessageTime + this.maxIdleTime < Date.now()) {
                // kill compiler; idle too long
                this.logger.verbose(`Killing SASS compiler; no requests received for ${this.maxIdleTime}s`);
                this.sassCompiler?.kill();
            }
        }, this.maxIdleTime * 1000);

        return this.sassCompiler;
    }

    private getSassCompilerPath(extraPaths?: string[]): string {
        const compilerPaths = [
            ...(extraPaths ?? []),
            path.join(__dirname, 'sass-compiler.js'),
            path.join(__dirname, 'bin.js'),
            path.join(__dirname, 'bin.ts')
        ];
        for (const path of compilerPaths) {
            if (fs.existsSync(path)) {
                return path;
            }
        }
        throw new Error('SASS compiler JS-file not found, verify bundle integrity or recompile from source.');
    }
}

