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

    public toString() {
        return `${this.elapsed}ms`;
    }

    public stop(): string {
        if (!this.#stop) {
            this.#stop = Date.now();
            this.#elapsed += this.#stop - this.#start;
        }
        return this.toString();
    }

    public reset(): this {
        this.#start = Date.now();
        this.#stop = 0;
        this.#elapsed = 0;
        return this;
    }
}