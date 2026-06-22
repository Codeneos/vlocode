import chalk from 'chalk';

import { ProgressTracker } from './progressTracker';

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const HIDE_CURSOR = '\x1B[?25l';
const SHOW_CURSOR = '\x1B[?25h';
const CLEAR_DOWN = '\x1B[0J';
// eslint-disable-next-line no-control-regex -- matching the ANSI escape (ESC) is the point
const ANSI_PATTERN = /\x1B\[[0-9;]*m/g;

/**
 * The progress bar currently rendering to the terminal, if any. A single bar owns the bottom of the
 * screen at a time; {@link getActiveProgressBar} lets log writers route their output through it so
 * the live display stays intact. See {@link ProgressAwareLogWriter}.
 */
let activeProgressBar: ProgressBar | undefined;

export function getActiveProgressBar(): ProgressBar | undefined {
    return activeProgressBar;
}

function setActiveProgressBar(bar: ProgressBar): void {
    activeProgressBar = bar;
}

function clearActiveProgressBar(bar: ProgressBar): void {
    if (activeProgressBar === bar) {
        activeProgressBar = undefined;
    }
}

export interface ProgressBarState {
    /**
     * Number of completed units of work.
     */
    value?: number;
    /**
     * Total number of units of work. May grow over time when the total is not known up-front; the
     * underlying {@link ProgressTracker} treats the total as a moving target and clamps the visual
     * ratio to 100%.
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
     * Stream to render to; defaults to `process.stdout`. The stream is expected to be a TTY; the
     * caller is responsible for deciding whether interactive rendering is appropriate.
     */
    stream?: NodeJS.WriteStream;
    /**
     * Tracker to render. When omitted a standalone tracker is created from the seed state. Pass an
     * existing tracker to share one model between the bar and another consumer (e.g. a reporter).
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
 * Renders an animated, multi-line progress block that sticks to the bottom of the terminal: a gauge
 * line plus any number of caller-supplied summary lines. The whole block is redrawn in place on each
 * tick, so the summary lines act as a live, compact dashboard rather than scrolling output.
 *
 * While active, the bar registers itself as {@link getActiveProgressBar the active bar} so a
 * {@link ProgressAwareLogWriter} can keep ordinary log output from corrupting the display.
 *
 * The bar is a pure renderer: all progress figures come from its {@link ProgressTracker}. Deciding
 * whether a terminal is interactive enough to show a bar is left to the caller (see
 * {@link ExportProgressReporter}).
 */
export class ProgressBar {

    private readonly stream: NodeJS.WriteStream;
    private readonly tracker: ProgressTracker;
    private readonly barWidth: number;
    private readonly refreshIntervalMs: number;

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
     * Show the bar and start animating. Hides the cursor and registers as the active bar.
     */
    public start(state?: ProgressBarState) {
        if (this.active) {
            return;
        }
        this.applyState(state);
        this.tracker.start();
        this.active = true;
        setActiveProgressBar(this);
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
        clearActiveProgressBar(this);
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
        return `\x1B[${this.renderedLines - 1}A\r`;
    }

    private composeBlock(): string[] {
        const columns = this.stream.columns ?? 80;
        const block = [this.composeGauge(columns)];
        const details = typeof this.details === 'function' ? this.details() : this.details;
        for (const detail of details) {
            block.push(`   ${chalk.dim(truncate(detail, Math.max(0, columns - 3)))}`);
        }
        return block;
    }

    private composeGauge(columns: number): string {
        const spinner = chalk.cyan(SPINNER_FRAMES[this.spinnerFrame]);
        const gauge = this.tracker.indeterminate ? this.renderIndeterminate() : this.renderGauge(this.tracker.ratio);

        const segments = [
            spinner,
            this.tracker.label && chalk.bold(this.tracker.label),
            gauge,
            chalk.green(this.tracker.percentText.padStart(4)),
            chalk.white(this.tracker.countText),
            chalk.dim(this.tracker.rateText),
            this.tracker.etaText && chalk.dim(this.tracker.etaText)
        ].filter(Boolean) as string[];

        let line = segments.join('  ');
        if (this.tracker.message) {
            const room = columns - visibleLength(line) - 3;
            if (room > 4) {
                line += `${chalk.dim('  · ')}${chalk.gray(truncate(this.tracker.message, room))}`;
            }
        }
        return line;
    }

    private renderGauge(ratio: number): string {
        const filled = Math.round(ratio * this.barWidth);
        return chalk.dim('▕') +
            chalk.cyan('█'.repeat(filled)) +
            chalk.gray('░'.repeat(this.barWidth - filled)) +
            chalk.dim('▏');
    }

    private renderIndeterminate(): string {
        const position = this.spinnerFrame % this.barWidth;
        const cells = Array.from({ length: this.barWidth }, (_, index) =>
            index === position ? chalk.cyan('█') : chalk.gray('░'));
        return `${chalk.dim('▕')}${cells.join('')}${chalk.dim('▏')}`;
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
        clearActiveProgressBar(this);
        this.stream.write(SHOW_CURSOR);
    }

    private writeRaw(text: string) {
        this.stream.write(text);
    }
}

/**
 * Visible length of a string, ignoring ANSI color escape codes.
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
