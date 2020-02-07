export type LazyInitializer<T> = () => Promise<T> | T;

/**
 * Lazy initializable value that follows a promise like pattern and thus can be awaited using then
 */
export default class Lazy<T> {

    constructor(private readonly initializer: LazyInitializer<T>, private innerPromise: Promise<T> = null) {
    }

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

    public then(onfulfilled?: (value: T) => T | Promise<T>, onrejected?: (reason: any) => void | Promise<void>): Promise<T | void> {
        return this.getInnerPromise().then(onfulfilled, onrejected);
    }

    public catch(onrejected?: (reason: any) => void | Promise<void>): Promise<T | void> {
        return this.innerPromise.catch(onrejected);
    }

    public finally(onfinally?: () => void): Promise<T> {
        return this.innerPromise.finally(onfinally);
    }
}