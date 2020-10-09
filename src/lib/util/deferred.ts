/**
 * Deferred promise implementation.
 */
export class DeferredPromise<T> implements Promise<T> {
    #innerPromise: Promise<T>;
    #reject: (err: any) => void;
    #resolve: (result: T) => void;
    #isResolved = false;

    public get [Symbol.toStringTag]() {
        return this.#innerPromise[Symbol.toStringTag];
    }

    public get isResolved() {
        return this.#isResolved;
    }

    /**
     * Create a new deferrable promise which supports resolving it outside of the context of the promise.
     * @param promise Optionally a promise to wrap.
     */
    constructor(promise?: Promise<T>) {
        this.reset();
        if (promise) {
            void promise.then(this.resolve.bind(this));
            promise.catch(this.reject.bind(this));
        }
    }

    public reset() {
        this.#innerPromise = new Promise((resolve, reject) => {
            this.#reject = reject;
            this.#resolve = resolve;
            this.#isResolved = false;
        });
    }

    public reject(err: any) {
        if (this.#isResolved) {
            throw new Error('Promise is already resolved or rejected, cannot reject or resolve a promise twice.');
        }
        this.#isResolved = true;
        this.#reject(err);
    }

    public resolve(result: T) {
        if (this.#isResolved) {
            throw new Error('Promise is already resolved or rejected, cannot reject or resolve a promise twice.');
        }
        this.#isResolved = true;
        this.#resolve(result);
    }

    public then<TResult1 = T, TResult2 = never>(onfulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>): Promise<TResult1 | TResult2> {
        return this.#innerPromise.then(onfulfilled, onrejected);
    }

    public catch<TResult = never>(onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promise<T | TResult> {
        return this.#innerPromise.catch(onrejected);
    }

    public finally(onFinally?: () => void): Promise<T> {
        return this.#innerPromise.finally(onFinally);
    }
}