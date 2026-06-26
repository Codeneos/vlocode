import { Timer } from './timer';

export interface ProgressTrackerOptions {
    /**
     * Short label describing the operation, e.g. the name of the running task.
     */
    label?: string;
    /**
     * Lower bound for the total. The reported total never drops below this value, which keeps
     * derived figures honest when a source reports a total that is initially smaller than the work
     * known to be pending (for example a crawler that only counts items it has discovered so far).
     */
    minTotal?: number;
}

/**
 * Tracks the numbers behind a long-running operation and derives presentation-ready metrics from
 * them: completion ratio, percentage, throughput, ETA and elapsed time.
 *
 * The tracker is the model behind {@link ProgressBar} but is independent of any rendering: it can be
 * used on its own to compute progress figures, or shared with a bar so the bar and another consumer
 * (a logger, a status line, …) present identical numbers.
 *
 * It is built for sources whose total is discovered incrementally — `report(value, total)` simply
 * overwrites the latest reading, and `total` may grow over time. The visual ratio is always clamped
 * to `[0, 1]`, and {@link ProgressTrackerOptions.minTotal} provides a floor so the bar does not look
 * complete before the real amount of work is known.
 *
 * @example
 * ```typescript
 * const progress = new ProgressTracker({ label: 'Downloading', minTotal: 100 });
 * progress.report(40, 100);
 * progress.percent;   // 40
 * progress.summary(); // '40% (40/100) · 12/s · ETA 0:05'
 * ```
 */
export class ProgressTracker {

    /**
     * Short label describing the operation. Freely mutable so callers can relabel between phases.
     */
    public label: string;
    /**
     * Free-form trailing text, e.g. the item currently being processed.
     */
    public message = '';

    private currentValue = 0;
    private currentTotal = 0;
    private minTotal: number;
    private readonly timer = new Timer();

    constructor(options: ProgressTrackerOptions = {}) {
        this.label = options.label ?? '';
        this.minTotal = options.minTotal ?? 0;
    }

    /**
     * (Re)start the elapsed-time clock used for throughput and ETA.
     */
    public start() {
        this.timer.reset();
    }

    /**
     * Reset the gauge to zero for a fresh progression (e.g. a new phase of work): clears the counts,
     * applies a new lower bound for the total and restarts the clock so throughput and ETA are scoped
     * to the new progression.
     */
    public reset(minTotal = 0) {
        this.currentValue = 0;
        this.currentTotal = 0;
        this.minTotal = minTotal;
        this.message = '';
        this.timer.reset();
    }

    /**
     * Record the latest progress. Either argument may be omitted to leave it unchanged. The source is
     * expected to report a `total` that can grow as more work is discovered; the most recent reading
     * is always kept.
     */
    public report(value?: number, total?: number) {
        if (value !== undefined) {
            this.currentValue = value;
        }
        if (total !== undefined) {
            this.currentTotal = total;
        }
    }

    public get value() {
        return this.currentValue;
    }

    public get total() {
        return Math.max(this.currentTotal, this.minTotal);
    }

    /**
     * True while no meaningful total is known yet, in which case progress cannot be expressed as a
     * fraction and a renderer should fall back to an indeterminate animation.
     */
    public get indeterminate() {
        return this.total <= 0;
    }

    /**
     * Completion ratio in the `[0, 1]` range, clamped so a lagging total (the total can jump up as
     * new work is discovered) never produces a ratio above 1.
     */
    public get ratio() {
        return this.total > 0 ? Math.min(this.value / this.total, 1) : 0;
    }

    public get percent() {
        return Math.floor(this.ratio * 100);
    }

    /**
     * Elapsed time in milliseconds since construction or the last {@link reset}/{@link start}.
     */
    public get elapsed() {
        return this.timer.elapsed;
    }

    /**
     * Completed units per second since the clock started.
     */
    public get rate() {
        const seconds = this.elapsed / 1000;
        return seconds > 0 ? this.value / seconds : 0;
    }

    /**
     * Estimated seconds remaining based on the current rate, or `undefined` when it cannot be
     * computed yet (no rate, unknown total, or already complete). Self-corrects as the total grows.
     */
    public get eta() {
        const rate = this.rate;
        if (this.total <= 0 || rate <= 0 || this.value >= this.total) {
            return undefined;
        }
        return (this.total - this.value) / rate;
    }

    /**
     * Integer milestone index for throttling output, e.g. `milestone(10)` returns `0..10` as
     * progress passes each 10% mark.
     */
    public milestone(step: number) {
        return Math.floor(this.percent / step);
    }

    public get percentText() {
        return this.indeterminate ? '--%' : `${this.percent}%`;
    }

    public get countText() {
        return `${this.value}/${this.total || '?'}`;
    }

    public get rateText() {
        return `${formatRate(this.rate)}/s`;
    }

    /**
     * Time column for a gauge: the estimated time remaining while that is meaningful (at least a
     * second), otherwise the elapsed time. This avoids a stuck `ETA 0:00` near the end of a phase and
     * keeps a climbing `elapsed` visible while a finalizing tail runs.
     */
    public get timeText() {
        const eta = this.eta;
        if (eta !== undefined && eta >= 1) {
            return `ETA ${formatDuration(eta * 1000)}`;
        }
        return `${formatDuration(this.elapsed)} elapsed`;
    }

    /**
     * Plain, colourless one-line summary suitable for forward-printing output, e.g.
     * `62% (248/400) · 31/s · ETA 0:05`.
     */
    public summary() {
        return `${this.percentText} (${this.countText}) · ${this.rateText} · ${this.timeText}`;
    }
}

/**
 * Format an integer count with thousands separators, e.g. `1284` → `1,284`.
 */
export function formatCount(value: number): string {
    return Math.round(value).toLocaleString('en-US');
}

/**
 * Format a per-second rate compactly: one decimal below 10, whole numbers above.
 */
export function formatRate(rate: number): string {
    if (!Number.isFinite(rate) || rate <= 0) {
        return '0';
    }
    return rate >= 10 ? `${Math.round(rate)}` : rate.toFixed(1);
}

/**
 * Format a millisecond duration as `m:ss` or `h:mm:ss`.
 */
export function formatDuration(milliseconds: number): string {
    if (!Number.isFinite(milliseconds) || milliseconds < 0) {
        return '--:--';
    }
    const totalSeconds = Math.round(milliseconds / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);
    const pad = (value: number) => `${value}`.padStart(2, '0');
    if (hours > 0) {
        return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${minutes}:${pad(seconds)}`;
}
