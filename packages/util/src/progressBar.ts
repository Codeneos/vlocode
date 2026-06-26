import { ProgressTracker } from './progressTracker';

const ESC = '\x1B';
const HIDE_CURSOR = `${ESC}[?25l`;
const SHOW_CURSOR = `${ESC}[?25h`;
const CLEAR_DOWN = `${ESC}[0J`;
const RESET = `${ESC}[0m`;
// eslint-disable-next-line no-control-regex -- matching the ANSI escape (ESC) is the point
const ANSI_PATTERN = /\x1B\[[0-9;]*m/g;
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/**
 * Decide whether ANSI colour should be emitted for a stream, honouring the de-facto `NO_COLOR` and
 * `FORCE_COLOR` conventions and otherwise falling back to whether the stream is a TTY.
 */
function colorSupported(stream: NodeJS.WriteStream): boolean {
    const { FORCE_COLOR, NO_COLOR } = process.env;
    if (FORCE_COLOR !== undefined && FORCE_COLOR !== '0' && FORCE_COLOR !== '') {
        return true;
    }
    if (NO_COLOR !== undefined && NO_COLOR !== '') {
        return false;
    }
    return stream.isTTY === true;
}

/** Minimal, dependency-free ANSI colouring; a no-op when colour is disabled. */
class AnsiPainter {
    constructor(private readonly enabled: boolean) { }
    private paint(code: number, text: string) {
        return this.enabled ? `${ESC}[${code}m${text}${RESET}` : text;
    }
    public readonly bold = (text: string) => this.paint(1, text);
    public readonly dim = (text: string) => this.paint(2, text);
    public readonly cyan = (text: string) => this.paint(36, text);
    public readonly green = (text: string) => this.paint(32, text);
    public readonly white = (text: string) => this.paint(37, text);
    public readonly gray = (text: string) => this.paint(90, text);
}

export interface ProgressBarState {
    /**
     * Number of completed units of work.
     */
    value?: number;
    /**
     * Total number of units of work. May grow over time when the total is not known up-front; the
     * underlying {@link ProgressTracker} treats the total as a moving target and clamps the ratio.
     */
    total?: number;
    /**
     * Short label rendered in front of the gauge, e.g. the name of the running operation.
     */
    label?: string;
    /**
     * Free-form trailing text on the gauge line (e.g. the item currently being processed). Truncated
     * to fit the terminal width.
     */
    message?: string;
    /**
     * Extra summary lines rendered, indented, beneath the gauge. The whole block is redrawn in place,
     * so these can be updated freely. Each line is truncated to one terminal row. Pass a function to
     * have it re-evaluated on every redraw (e.g. to surface a continuously-changing counter).
     */
    details?: string[] | (() => string[]);
}

export interface ProgressBarOptions extends ProgressBarState {
    /**
     * Stream to render to; defaults to `process.stdout`. The stream is expected to be a TTY — the
     * caller is responsible for deciding whether interactive rendering is appropriate (see
     * {@link ProgressBar.isInteractive}).
     */
    stream?: NodeJS.WriteStream;
    /**
     * Tracker to render. When omitted a standalone tracker is created from the seed state. Pass an
     * existing tracker to share one model between the bar and another consumer.
     */
    tracker?: ProgressTracker;
    /**
     * Width of the gauge in characters. Defaults to 24.
     */
    barWidth?: number;
    /**
     * Interval in milliseconds at which the spinner and elapsed/ETA are refreshed even when no
     * progress updates arrive. Defaults to 120ms.
     */
    refreshIntervalMs?: number;
}

/**
 * An animated, multi-line progress bar that sticks to the bottom of a terminal: a gauge line (with
 * spinner, percentage, count, throughput and ETA/elapsed) plus any number of caller-supplied summary
 * lines. The whole block is redrawn in place on each tick, so the summary lines act as a live, compact
 * dashboard rather than scrolling output.
 *
 * The bar is a pure renderer over a {@link ProgressTracker} — it carries no global state, so multiple
 * independent bars can exist (though only one should own a given stream at a time). It uses raw ANSI
 * escapes and has no third-party dependencies; colour is auto-detected from the stream and honours
 * `NO_COLOR`/`FORCE_COLOR`.
 *
 * @example
 * ```typescript
 * const bar = new ProgressBar({ label: 'Building', total: files.length });
 * bar.start();
 * for (const [i, file] of files.entries()) {
 *     await build(file);
 *     bar.update({ value: i + 1, message: file });
 * }
 * bar.stop('✔ Build complete');
 * ```
 */
export class ProgressBar {

    private readonly stream: NodeJS.WriteStream;
    private readonly tracker: ProgressTracker;
    private readonly barWidth: number;
    private readonly refreshIntervalMs: number;
    private readonly paint: AnsiPainter;

    private details: string[] | (() => string[]) = [];
    private spinnerFrame = 0;
    private active = false;
    private barOnScreen = false;
    private renderedLines = 0;

    private timer?: ReturnType<typeof setInterval>;
    private readonly restoreOnExit = () => this.restoreCursor();

    constructor(options: ProgressBarOptions = {}) {
        this.stream = options.stream ?? process.stdout;
        this.barWidth = options.barWidth ?? 24;
        this.refreshIntervalMs = options.refreshIntervalMs ?? 120;
        this.paint = new AnsiPainter(colorSupported(this.stream));
        this.tracker = options.tracker ?? new ProgressTracker({ label: options.label });
        if (!options.tracker) {
            this.tracker.report(options.value, options.total);
            if (options.message !== undefined) {
                this.tracker.message = options.message;
            }
        }
        if (options.details !== undefined) {
            this.details = options.details;
        }
    }

    public get isActive() {
        return this.active;
    }

    /**
     * Whether the target stream is a TTY, i.e. whether an animated bar makes sense at all. Callers
     * typically also consider CI/verbose-logging conditions before choosing to render one.
     */
    public get isInteractive() {
        return this.stream.isTTY === true;
    }

    /**
     * Show the bar and start animating. Hides the cursor and begins the refresh loop.
     */
    public start(state?: ProgressBarState) {
        if (this.active) {
            return;
        }
        this.applyState(state);
        this.tracker.start();
        this.active = true;
        this.writeRaw(HIDE_CURSOR);
        process.once('exit', this.restoreOnExit);
        this.timer = setInterval(() => this.tick(), this.refreshIntervalMs);
        this.timer.unref?.();
        this.render();
    }

    /**
     * Update the underlying tracker/details and redraw. No-op when the bar is not active.
     */
    public update(state: ProgressBarState) {
        if (!this.active) {
            return;
        }
        this.applyState(state);
        this.render();
    }

    /**
     * Redraw from the current tracker/details state. Use this after mutating a shared tracker.
     */
    public refresh() {
        this.render();
    }

    /**
     * Print a line above the live block, then redraw the block beneath it. When the bar is not active
     * the line is written as-is.
     */
    public log(line: string) {
        if (!this.active) {
            this.stream.write(`${line}\n`);
            return;
        }
        this.eraseBlock();
        this.writeRaw(`${line}\n`);
        this.render();
    }

    /**
     * Stop animating, erase the block and restore the terminal. Optionally prints a final line where
     * the block was.
     */
    public stop(finalLine?: string) {
        if (!this.active) {
            if (finalLine) {
                this.stream.write(`${finalLine}\n`);
            }
            return;
        }
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
        this.eraseBlock();
        this.active = false;
        process.removeListener('exit', this.restoreOnExit);
        if (finalLine) {
            this.stream.write(`${finalLine}\n`);
        }
        this.stream.write(SHOW_CURSOR);
    }

    private applyState(state?: ProgressBarState) {
        if (!state) {
            return;
        }
        this.tracker.report(state.value, state.total);
        if (state.label !== undefined) {
            this.tracker.label = state.label;
        }
        if (state.message !== undefined) {
            this.tracker.message = state.message;
        }
        if (state.details !== undefined) {
            this.details = state.details;
        }
    }

    private tick() {
        this.spinnerFrame = (this.spinnerFrame + 1) % SPINNER_FRAMES.length;
        this.render();
    }

    private render() {
        if (!this.active) {
            return;
        }
        const block = this.composeBlock();
        this.writeRaw(this.cursorToBlockStart() + CLEAR_DOWN + block.join('\n'));
        this.renderedLines = block.length;
        this.barOnScreen = true;
    }

    private eraseBlock() {
        if (!this.barOnScreen) {
            return;
        }
        this.writeRaw(this.cursorToBlockStart() + CLEAR_DOWN);
        this.barOnScreen = false;
        this.renderedLines = 0;
    }

    /**
     * Escape sequence that returns the cursor from the end of the last rendered line back to column 0
     * of the block's first line, ready for a clear-and-redraw.
     */
    private cursorToBlockStart(): string {
        if (!this.barOnScreen || this.renderedLines <= 1) {
            return '\r';
        }
        return `${ESC}[${this.renderedLines - 1}A\r`;
    }

    private composeBlock(): string[] {
        const columns = this.stream.columns ?? 80;
        const block = [this.composeGauge(columns)];
        const details = typeof this.details === 'function' ? this.details() : this.details;
        for (const detail of details) {
            block.push(`   ${this.paint.dim(truncate(detail, Math.max(0, columns - 3)))}`);
        }
        return block;
    }

    private composeGauge(columns: number): string {
        const spinner = this.paint.cyan(SPINNER_FRAMES[this.spinnerFrame]);
        const gauge = this.tracker.indeterminate ? this.renderIndeterminate() : this.renderGauge(this.tracker.ratio);

        const segments = [
            spinner,
            this.tracker.label && this.paint.bold(this.tracker.label),
            gauge,
            this.paint.green(this.tracker.percentText.padStart(4)),
            this.paint.white(this.tracker.countText),
            this.paint.dim(this.tracker.rateText),
            this.paint.dim(this.tracker.timeText)
        ].filter(Boolean) as string[];

        let line = segments.join('  ');
        if (this.tracker.message) {
            const room = columns - visibleLength(line) - 3;
            if (room > 4) {
                line += `${this.paint.dim('  · ')}${this.paint.gray(truncate(this.tracker.message, room))}`;
            }
        }
        return line;
    }

    private renderGauge(ratio: number): string {
        const filled = Math.round(ratio * this.barWidth);
        return this.paint.dim('▕') +
            this.paint.cyan('█'.repeat(filled)) +
            this.paint.gray('░'.repeat(this.barWidth - filled)) +
            this.paint.dim('▏');
    }

    private renderIndeterminate(): string {
        const position = this.spinnerFrame % this.barWidth;
        const cells = Array.from({ length: this.barWidth }, (_, index) =>
            index === position ? this.paint.cyan('█') : this.paint.gray('░'));
        return `${this.paint.dim('▕')}${cells.join('')}${this.paint.dim('▏')}`;
    }

    /**
     * Restore the cursor on abrupt process exit (e.g. Ctrl-C) so the terminal is not left without a
     * cursor when the bar never got a chance to stop cleanly.
     */
    private restoreCursor() {
        if (!this.active) {
            return;
        }
        this.active = false;
        this.stream.write(SHOW_CURSOR);
    }

    private writeRaw(text: string) {
        this.stream.write(text);
    }
}

/**
 * Visible length of a string, ignoring ANSI colour escape codes.
 */
function visibleLength(text: string): number {
    return text.replace(ANSI_PATTERN, '').length;
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }
    return `${text.slice(0, Math.max(0, maxLength - 1))}…`;
}
