/**
 * Simple timer class to tim operations.
 */
export class Timer {

    #start : number;
    #stop : number = 0;
    #elapsed : number = 0;

    public get elapsed(): number {
        return this.#elapsed + (!this.#stop ? (Date.now() - this.#start) : 0);
    }

    constructor() {
        this.#start = Date.now();
    }

    public toString(format?: 'ms' | 'seconds' | 'minutes') {
        if (format === 'seconds') {
            return `${(this.elapsed / 1000).toFixed(1)}s`;
        } else if (format === 'minutes') {
            return `${(this.elapsed / 60000).toFixed(0)}:${((this.elapsed % 1000) / 60).toFixed(0)} min`;
        }
        return `${this.elapsed}ms`;
    }

    public stop(): this {
        if (!this.#stop) {
            this.#stop = Date.now();
            this.#elapsed += this.#stop - this.#start;
        }
        return this;
    }

    public reset(): this {
        this.#start = Date.now();
        this.#stop = 0;
        this.#elapsed = 0;
        return this;
    }
}