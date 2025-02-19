import { CharStream, Token, Interval } from 'antlr4ng';

/**
 * Implementation of the {@link CharStream} interface that uses a  {@link Buffer} as the underlying data source.
 */
export class BufferStream implements CharStream {

    public readonly size: number;
    public get index() { return this.#index; }

    #strData: string;
    #index = 0;

    constructor(
        private data: Buffer,
        public readonly name: string = '<unknown>'
    ) {
        this.size = this.data.length;
    }

    getSourceName(): string {
        return this.name;
    }

    /**
     * Reset the stream so that it's in the same state it was
     * when the object was created *except* the data array is not
     * touched.
     */
    public reset() {
        this.#index = 0;
    }

    public consume() {
        if (this.#index >= this.size) {
            // assert this.LA(1) == Token.EOF
            throw ("cannot consume EOF");
        }
        this.#index += 1;
    }

    public LA(offset: number): number {
        if (offset === 0) {
            return 0; // undefined
        }
        if (offset < 0) {
            offset += 1; // e.g., translate LA(-1) to use offset=0
        }
        const pos = this.index + offset - 1;
        if (pos < 0 || pos >= this.size) { // invalid
            return Token.EOF;
        }
        return this.data[pos];
    }

    public LT(offset: number): number {
        return this.LA(offset);
    }

    public mark(): number {
        return -1;
    }

    public release(): void {
        // no resources to release
    }

    /**
     * consume() ahead until p==index; can't just set p=index as we must
     * update line and column. If we seek backwards, just set p
     */
    public seek(index: number) {
        if (index <= this.index) {
            this.#index = index; // just jump; don't update stream state (line, ...)
            return;
        }
        // seek forward
        this.#index = Math.min(index, this.size);
    }

    public getTextFromRange(start: number, stop: number): string {
        return this.getText(Interval.of(start, stop));
    }

    public getTextFromInterval(interval: Interval): string {
        return this.getText(interval);
    }

    public getText(interval: number | Interval, stop?: number) {
        const start = typeof interval === 'number' ? interval : interval.start;
        stop = typeof interval === 'number' ? stop! : interval.stop;

        if (stop >= this.size) {
            stop = this.size - 1;
        }
        if (start >= this.size) {
            return '';
        }
        return this.data.subarray(start, stop + 1).toString();
    }

    public toString() {
        if (!this.#strData) {
            this.#strData = this.data.toString();
        }
        return this.#strData;
    }
}

/**
 * Case insensitive Decorator for a `CharStream` implementation, this will make the `LA` method return the lower case
 * character code for any character that is not `Token.EOF`.
 */
export class CaseInsensitiveCharStream implements CharStream {
    public get name() { return this.stream.name; }
    public get index() { return this.stream.index; }
    public get size() { return this.stream.size; }

    /**
     * Implementation of the `CharStream` interface that is case insensitive.
     * @param input Original input stream to decorate as case insensitive
     */
    constructor(private stream: CharStream) {
    }

    public LA(offset: number): number {
        const c = this.stream.LA(offset);
        return c === Token.EOF ? c : this.toLower(c);
    }

    private toLower(c: number): number {
        return (c >= 65 && c <= 90) ? c+32 : c;
    }

    public getTextFromRange(start: number, stop: number): string {
        return this.stream.getTextFromRange(start, stop);
    }

    public getTextFromInterval(interval: Interval): string {
        return this.stream.getTextFromInterval(interval);
    }

    public reset(): void { this.stream.reset(); }
    public consume(): void { this.stream.consume(); }
    public mark(): number { return this.stream.mark(); }
    public release(marker: number): void { this.stream.release(marker);  }
    public seek(index: number): void { this.stream.seek(index); }
    public toString(): string { return this.stream.toString(); }
    public getSourceName(): string { return this.stream.getSourceName(); }
}