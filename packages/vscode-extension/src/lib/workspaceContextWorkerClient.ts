import * as path from 'path';
import { existsSync } from 'fs';
import { Worker } from 'worker_threads';
import { Logger } from '@vlocode/core';

export type WorkspaceContextScanKind = 'datapacks' | 'metadata';

interface WorkspaceContextWorkerRequest {
    id: number;
    kind: WorkspaceContextScanKind;
    folder: string;
}

interface WorkspaceContextWorkerResponse {
    id: number;
    files?: string[];
    error?: string;
}

export class WorkspaceContextWorkerClient {
    private requestId = 0;
    private worker?: Worker;
    private readonly pending = new Map<number, {
        resolve(files: string[]): void;
        reject(error: Error): void;
    }>();

    private constructor(
        private readonly kind: WorkspaceContextScanKind,
        private readonly logger: Logger) {
    }

    public static create(editorContextKey: string, logger: Logger) {
        if (editorContextKey == 'datapacks' || editorContextKey == 'metadata') {
            return new WorkspaceContextWorkerClient(editorContextKey, logger);
        }
    }

    public getApplicableFiles(folder: string): Promise<string[]> {
        const worker = this.getWorker();
        const id = ++this.requestId;

        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            worker.postMessage({ id, kind: this.kind, folder } satisfies WorkspaceContextWorkerRequest);
        });
    }

    public dispose() {
        this.rejectAll(new Error('Workspace context worker disposed'));
        void this.worker?.terminate();
        this.worker = undefined;
    }

    private getWorker() {
        if (!this.worker) {
            const workerPath = this.getWorkerPath();
            this.worker = new Worker(workerPath);
            this.worker.on('message', message => this.handleMessage(message));
            this.worker.on('error', error => this.handleWorkerFailure(error));
            this.worker.on('exit', code => {
                if (code !== 0) {
                    this.handleWorkerFailure(new Error(`Workspace context worker exited with code ${code}`));
                }
                this.worker = undefined;
            });
        }
        return this.worker;
    }

    private getWorkerPath() {
        const workerPath = path.join(__dirname, 'ws-ctx-worker.mjs');
        return existsSync(workerPath) ? workerPath : path.join(__dirname, 'ws-ctx-worker.js');
    }

    private handleMessage(message: WorkspaceContextWorkerResponse) {
        const request = this.pending.get(message.id);
        if (!request) {
            return;
        }
        this.pending.delete(message.id);

        if (message.error) {
            request.reject(new Error(message.error));
        } else {
            request.resolve(message.files ?? []);
        }
    }

    private handleWorkerFailure(error: Error) {
        this.logger.warn(`Workspace context worker stopped: ${error.message}`);
        this.rejectAll(error);
        this.worker = undefined;
    }

    private rejectAll(error: Error) {
        for (const request of this.pending.values()) {
            request.reject(error);
        }
        this.pending.clear();
    }
}
