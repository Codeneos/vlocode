
type TaskArgs<T> = T extends (...args: infer U) => any ? U : never;

export interface TaskPromise<T = any> extends Promise<T> {
    readonly isRunning : boolean;
    readonly isFinished : boolean;
    readonly hasError : boolean;
}

/**
 * Promise like object but tracks promise state and has explicit start method looking more like a task class
 */
export default class Task<T extends (...args: any[]) => Promise<R>, R = any> implements TaskPromise<R> {

    private innerPromise : Promise<R> = null;
    private _isRunning : boolean = false;
    private _isFinished : boolean = false;
    private _hasError : boolean = false;
    
    public get isRunning() : boolean {
        return this._isRunning;
    }

    public get isFinished() : boolean {
        return this._isFinished;
    }

    public get hasError() : boolean {
        return this._hasError;
    }

    constructor(private readonly task: T, private readonly thisArg: any = null, private readonly options?: { bubbleExceptions?: boolean }) {
    }

    readonly [Symbol.toStringTag] = 'Task';

    public start(...args: TaskArgs<T>) : this {
        this._hasError = false;
        this._isFinished = false;
        this._isRunning = false;
        this.innerPromise = (async () => {
            try {
                this._isRunning = true;
                const result = await this.task.apply(this.thisArg, args);
                return result;
            } catch (e) {
                this._hasError = true;
                if (this.options?.bubbleExceptions) {
                    throw e;
                }     
                return null;
            } finally {
                this._isRunning = false;
                this._isFinished = true;
            }
        })();    
        return this;    
    }

    public then<TResult1, TResult2>(onfulfilled?: (value: R) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | Promise<TResult2>): Promise<TResult1 | TResult2> {
        return this.innerPromise.then(onfulfilled, onrejected);
    }

    public catch<TResult1>(onrejected?: (reason: any) => TResult1 | Promise<TResult1>): Promise<R | TResult1> {
        return this.innerPromise.catch(onrejected);
    }

    public finally(onfinally?: () => void): Promise<R> {
        return this.innerPromise.finally(onfinally);
    }
}