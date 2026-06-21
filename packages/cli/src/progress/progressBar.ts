import chalk from 'chalk';

import { ProgressTracker } from './progressTracker';

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const HIDE_CURSOR = '\x1B[?25l';
const SHOW_CURSOR = '\x1B[?25h';
const CLEAR_LINE = '\r\x1B[K';
// eslint-disable-next-line no-control-regex -- matching the ANSI escape (ESC) is the point
const ANSI_PATTERN = /\x1B\[[0-9;]*m/g;

/**
 * The progress bar currently rendering to the terminal, if any. A single bar owns the bottom line
 * at a time; {@link getActiveProgressBar} lets log writers route their output through it so log
 * lines appear cleanly above the bar instead of corrupting it. See {@link ProgressAwareLogWriter}.
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
     * Short label rendered in front of the bar, e.g. the name of the running operation.
     */
    label?: string;
    /**
     * Free-form trailing text (e.g. the item currently being processed). Truncated to fit the
     * terminal width.
     */
    message?: string;
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
     * Width of the bar gauge in characters. Defaults to 24.
     */
    barWidth?: number;
    /**
     * Interval in milliseconds at which the spinner and elapsed/ETA are refreshed even when no
     * progress updates arrive. Defaults to 120ms.
     */
    refreshIntervalMs?: number;
}

/**
 * Renders an animated single-line progress bar that sticks to the bottom of the terminal.
 *
 * While active, the bar registers itself as {@link getActiveProgressBar the active bar}; a
 * {@link ProgressAwareLogWriter} installed on the logging framework then funnels every log entry
 * through {@link ProgressBar.log}, so all logger output (info, warnings, errors) is printed cleanly
 * *above* the bar and the bar is redrawn beneath it. The rest of the code keeps logging normally.
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

    private spinnerFrame = 0;
    private active = false;
    private barOnScreen = false;

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
    }

    public get isActive() {
        return this.active;
    }

    /**
     * Show the bar and start animating. Hides the cursor and registers as the active bar so log
     * output is routed above it.
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
     * Update the underlying tracker and redraw. No-op when the bar is not active.
     */
    public update(state: ProgressBarState) {
        if (!this.active) {
            return;
        }
        this.applyState(state);
        this.render();
    }

    /**
     * Redraw from the current tracker state. Use this after mutating a shared tracker directly.
     */
    public refresh() {
        this.render();
    }

    /**
     * Print a line above the live bar, then redraw the bar beneath it. When the bar is not active
     * the line is written as-is. This is the entry point used by {@link ProgressAwareLogWriter}.
     */
    public log(line: string) {
        if (!this.active) {
            this.stream.write(`${line}\n`);
            return;
        }
        this.eraseBar();
        this.writeRaw(`${line}\n`);
        this.render();
    }

    /**
     * Stop animating, erase the bar and restore the terminal. Optionally prints a final line in the
     * place where the bar was.
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
        this.eraseBar();
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
    }

    private tick() {
        this.spinnerFrame = (this.spinnerFrame + 1) % SPINNER_FRAMES.length;
        this.render();
    }

    private render() {
        if (!this.active) {
            return;
        }
        this.writeRaw(CLEAR_LINE + this.compose());
        this.barOnScreen = true;
    }

    private eraseBar() {
        if (this.barOnScreen) {
            this.writeRaw(CLEAR_LINE);
            this.barOnScreen = false;
        }
    }

    private compose(): string {
        const columns = this.stream.columns ?? 80;
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
