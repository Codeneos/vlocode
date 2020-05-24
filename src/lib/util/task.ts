
type TaskArgs<T> = T extends (...args: infer U) => any ? U : never;

export interface TaskPromise<T = any> extends Promise<T> {
    readonly isRunning: boolean;
    readonly isFinished: boolean;
    readonly hasError: boolean;
}

/**
 * Promise like object but tracks promise state and has explicit start method looking more like a task class
 */
export default class Task<T extends (...args: any[]) => Promise<R>, R = any> implements TaskPromise<R> {

    #innerPromise?: Promise<R>;
    #isRunning: boolean = false;
    #isFinished: boolean = false;
    #hasError: boolean = false;

    public get isRunning() : boolean {
        return this.#isRunning;
    }

    public get isFinished() : boolean {
        return this.#isFinished;
    }

    public get hasError() : boolean {
        return this.#hasError;
    }

    constructor(private readonly task: T, private readonly thisArg: any = null, private readonly options?: { bubbleExceptions?: boolean }) {
    }

    readonly [Symbol.toStringTag] = 'Task';

    public start(...args: TaskArgs<T>): this {
        this.#hasError = false;
        this.#isFinished = false;
        this.#isRunning = false;
        this.#innerPromise = (async () => {
            try {
                this.#isRunning = true;
                const result = await this.task.apply(this.thisArg, args);
                return result;
            } catch (e) {
                this.#hasError = true;
                if (this.options?.bubbleExceptions) {
                    throw e;
                }
                return null;
            } finally {
                this.#isRunning = false;
                this.#isFinished = true;
            }
        })();
        return this;
    }

    public then<TResult1, TResult2>(onfulfilled?: (value: R) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | Promise<TResult2>): Promise<TResult1 | TResult2> {
        if (!this.#innerPromise) {
            throw new Error('Cannot then before calling start');
        }
        return this.#innerPromise.then(onfulfilled, onrejected);
    }

    public catch<TResult1>(onrejected?: (reason: any) => TResult1 | Promise<TResult1>): Promise<R | TResult1> {
        if (!this.#innerPromise) {
            throw new Error('Cannot catch before calling start');
        }
        return this.#innerPromise.catch(onrejected);
    }

    public finally(onfinally?: () => void): Promise<R> {
        if (!this.#innerPromise) {
            throw new Error('Cannot finally before calling start');
        }
        return this.#innerPromise.finally(onfinally);
    }
}