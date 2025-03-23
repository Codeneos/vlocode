/**
 * Utility class for measuring and tracking elapsed time.
 * 
 * The Timer class provides functionality to measure elapsed time with millisecond precision.
 * It can be started, stopped, and reset, and supports different formatting options when converting
 * to a string representation.
 * 
 * @example
 * ```typescript
 * // Create and start a new timer
 * const timer = new Timer();
 * 
 * // Do some work...
 * 
 * // Get the elapsed time
 * console.log(`Operation took ${timer.elapsed}ms`);
 * 
 * // Stop the timer
 * timer.stop();
 * 
 * // Convert to formatted string
 * console.log(timer.toString('seconds')); // e.g., "2.5s"
 * 
 * // Reset and reuse
 * timer.reset();
 * ```
 * 
 * The Timer instance can be used directly in string contexts or arithmetic operations
 * through its implementation of Symbol.toPrimitive.
 */
export class Timer {

    #start : number;
    #stop : number = 0;
    #elapsed : number = 0;

    /**
     * Gets the elapsed time in milliseconds.
     * If the timer is running, returns the currently elapsed time; otherwise, returns the time
     * elapsed between the start and stop points.
     * @returns The elapsed time in milliseconds.
     */
    public get elapsed(): number {
        return this.#elapsed + (!this.#stop ? (Date.now() - this.#start) : 0);
    }

    /**
     * Creates a new instance of the Timer class.
     * Initializes the timer by setting the start time to the current timestamp.
     */
    constructor() {
        this.#start = Date.now();
    }

    /**
     * Returns a string representation of the elapsed time.
     * 
     * @param format - The time format to use for the output.
     *                 - 'ms': milliseconds (default)
     *                 - 'seconds': seconds with one decimal place
     *                 - 'minutes': minutes in MM:SS format
     * @returns A formatted string representing the elapsed time.
     */
    public toString(format?: 'ms' | 'seconds' | 'minutes') {
        if (format === 'seconds') {
            return `${(this.elapsed / 1000).toFixed(1)}s`;
        } else if (format === 'minutes') {
            return `${(this.elapsed / 60000).toFixed(0)}:${((this.elapsed % 1000) / 60).toFixed(0)} min`;
        }
        return `${this.elapsed}ms`;
    }

    public [Symbol.toPrimitive](hint: string) {
        if (hint === 'number') {
            return this.elapsed;
        }
        return this.toString();
    }

    /**
     * Stops the timer if it's running.
     * 
     * If the timer is already stopped, this method has no effect.
     * When stopped, the elapsed time is updated by adding the time since the timer was started.
     * 
     * @returns The timer instance for method chaining
     */
    public stop(): this {
        if (!this.#stop) {
            this.#stop = Date.now();
            this.#elapsed += this.#stop - this.#start;
        }
        return this;
    }

    /**
     * Resets the timer to its initial state.
     * Sets the start time to now, and clears the stop time and elapsed time.
     * @returns This timer instance, allowing for method chaining
     */
    public reset(): this {
        this.#start = Date.now();
        this.#stop = 0;
        this.#elapsed = 0;
        return this;
    }
}