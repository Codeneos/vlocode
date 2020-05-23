export type LazyInitializer<T> = () => Promise<T> | T;

/**
 * Lazy initializable value that follows a promise like pattern and thus can be awaited using then
 */
export default class Lazy<T> implements Promise<T> {

    constructor(private readonly initializer: LazyInitializer<T>, private innerPromise: Promise<T> = null) {
    }

    readonly [Symbol.toStringTag] = 'Lazy';

    private getInnerPromise() : Promise<T> {
        if (!this.innerPromise) {
            this.innerPromise = new Promise((resolve, reject) => {
                try {
                    Promise.resolve(this.initializer()).then(resolve).catch(reject);
                } catch(err) {
                    reject(err);
                }
            });
        }
        return this.innerPromise;
    }

    public then<TResult1 = T, TResult2 = void>(onfulfilled?: (value: T) => TResult1 | Promise<TResult1>, onrejected?: (reason: any) => TResult2 | Promise<TResult2>): Promise<TResult1 | TResult2> {
        return this.getInnerPromise().then(onfulfilled, onrejected);
    }

    public catch<TResult1 = void>(onrejected?: (reason: any) => TResult1 | Promise<TResult1>): Promise<T | TResult1> {
        return this.innerPromise.catch(onrejected);
    }

    public finally(onfinally?: () => void): Promise<T> {
        return this.innerPromise.finally(onfinally);
    }
}