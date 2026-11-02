import { Worker } from 'node:worker_threads';
import type { DatapackLintRequest, DatapackLintResult } from './datapackLintProtocol';

/** One persistent worker for the extension's serial lint queue and workspace caches. */
export class DatapackLintWorker {
    private readonly worker: Worker;
    private stopping = false;
    private closed = false;
    private failure?: Error;
    private pending?: {
        resolve: (result: DatapackLintResult | undefined) => void;
        reject: (error: Error) => void;
    };

    public readonly exited: Promise<void>;

    public get isAvailable(): boolean {
        return !this.stopping && !this.closed && !this.failure;
    }

    constructor(workerPath: string) {
        this.worker = new Worker(workerPath);
        this.worker.on('message', (result: DatapackLintResult) => {
            if (!this.stopping) {
                this.pending?.resolve(result);
                this.pending = undefined;
            }
        });
        this.worker.once('error', error => {
            this.failure = error;
        });
        this.exited = new Promise(resolve => {
            this.worker.once('exit', code => {
                this.closed = true;
                if (this.stopping) {
                    this.pending?.resolve(undefined);
                } else {
                    this.pending?.reject(this.failure ?? new Error(`Lint worker exited unexpectedly (code ${code})`));
                }
                this.pending = undefined;
                resolve();
            });
        });
    }

    public lint(cwd: string, files?: string[]): Promise<DatapackLintResult | undefined> {
        return new Promise((resolve, reject) => {
            this.pending = { resolve, reject };
            this.send({ type: 'lint', cwd, files });
        });
    }

    public release(cwd: string): void {
        if (this.isAvailable) {
            this.send({ type: 'release', cwd });
        }
    }

    public dispose(): void {
        if (!this.stopping && !this.closed) {
            this.stopping = true;
            // The pending request settles on exit, keeping cancellation serial with the next scan.
            void this.worker.terminate();
        }
    }

    private send(request: DatapackLintRequest): void {
        this.worker.postMessage(request);
    }
}
