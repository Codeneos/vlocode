import EventEmitter from 'events';
import { CancellationToken, CancellationTokenSource } from './cancellationToken';

export interface ProgressReporter<T> {
    (progress: T): unknown;
}


type TaskEvents<TResult, TProgress> = {
    progress: [TProgress],
    error: [Error],
    done: [TResult]
};

export interface TaskPromise<TResult, TProgress = unknown> extends Promise<TResult> {
    readonly isRunning: boolean;
    readonly isFinished: boolean;
    readonly hasError: boolean;
    
    on<K extends keyof TaskEvents<TResult, TProgress>>(event: K, listener: (...args: TaskEvents<TResult, TProgress>[K]) => void): this;
    cancel(): Promise<this>;
}

enum TaskStatus {
    executing = 'executing',
    done = 'done',
    error = 'error'
}

/**
 * Represents a Promise that supports progress reporting and cancellation.
 *
 * `ProgressablePromise` extends the standard Promise pattern by allowing consumers to:
 * - Subscribe to progress updates via an event emitter.
 * - Cancel the underlying asynchronous operation using a cancellation token.
 * - Chain with `then`, `catch`, and `finally` methods, returning a new `ProgressablePromise`.
 *
 * @typeParam TResult - The type of the resolved value of the promise.
 * @typeParam TProgress - The type of the progress update values (defaults to `TResult`).
 *
 * @example
 * ```typescript
 * const progressable = new ProgressablePromise<number>((progress, token) => {
 *   return new Promise<number>((resolve, reject) => {
 *     let count = 0;
 *     const interval = setInterval(() => {
 *       if (token?.isCancellationRequested) {
 *         clearInterval(interval);
 *         reject(new Error('Cancelled'));
 *         return;
 *       }
 *       progress?.(++count);
 *       if (count === 10) {
 *         clearInterval(interval);
 *         resolve(count);
 *       }
 *     }, 100);
 *   });
 * });
 *
 * progressable.on('progress', (value) => console.log('Progress:', value));
 * ```
 */
export class Task<TResult, TProgress = unknown> implements TaskPromise<TResult, TProgress> {

    private events = new EventEmitter();
    private cancellationTokenSource = new CancellationTokenSource();
    private taskPromise: Promise<unknown>;
    private taskStatus: TaskStatus = TaskStatus.executing;

    public get isRunning() : boolean {
        return this.taskStatus === TaskStatus.executing;
    }

    public get isFinished() : boolean {
         return this.taskStatus === TaskStatus.done || this.taskStatus === TaskStatus.error;
    }

    public get hasError() : boolean {
        return this.taskStatus === TaskStatus.error;
    }
    
    public readonly [Symbol.toStringTag] = 'Task<T>';

    constructor(task: (progress?: ProgressReporter<TProgress>, cancellationToken?: CancellationToken) => Promise<TResult>) {
        this.taskPromise = task(
            (data) => this.events.emit('progress', data),
            this.cancellationTokenSource.token
        ).then((result) => {
            this.taskStatus = TaskStatus.done;
            this.events.emit('done', result);
            return result;
        }).catch((error) => {
            this.taskStatus = TaskStatus.error;
            this.events.emit('error', error);
            throw error;
        }).finally(() => {
            this.events.removeAllListeners();
            this.cancellationTokenSource.dispose();
        });
    }

    public async cancel() {
        await this.cancellationTokenSource.cancel();
        return this;
    }

    public then<TResult1 = TResult, TResult2 = never>(
        onfulfilled?: ((value: TResult) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
    ): Task<TResult1 | TResult2, TProgress> {
        this.taskPromise = this.taskPromise.then(onfulfilled, onrejected);
        return this as unknown as Task<TResult1 | TResult2, TProgress>;
    }

    public catch<TResult1 = never>(
        onrejected?: ((reason: any) => TResult1 | PromiseLike<TResult1>) | null | undefined
    ): Task<TResult1, TProgress> {
        this.taskPromise = this.taskPromise.catch(onrejected);
        return this as unknown as Task<TResult1, TProgress>;
    }

    public finally(onfinally?: (() => void) | null | undefined): this {
        this.taskPromise = this.taskPromise.finally(onfinally);
        return this;
    }

    public on<K extends keyof TaskEvents<TResult, TProgress>>(event: K, listener: (...args: TaskEvents<TResult, TProgress>[K]) => void): this {
        this.events.on(event, listener);
        return this;
    }
}