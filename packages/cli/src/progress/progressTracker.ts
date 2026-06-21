import { Timer } from '@vlocode/util';

export interface ProgressTrackerOptions {
    /**
     * Short label rendered in front of the bar, e.g. the name of the running operation.
     */
    label?: string;
    /**
     * Lower bound for the total. The reported total never drops below this value, which keeps the
     * bar honest when the source reports a total that is initially smaller than the work known to be
     * pending (e.g. an exporter that only counts records it has looked up so far).
     */
    minTotal?: number;
}

/**
 * Owns the numbers behind a progress display and all derived metrics (ratio, percent, rate, ETA).
 *
 * This is the single source of truth for progress math so that the interactive {@link ProgressBar}
 * and any forward-printing fallback present identical figures. Renderers should only read from the
 * tracker; they must not recompute these values themselves.
 *
 * The tracker is built for sources whose work is discovered incrementally: progress is reported per
 * batch and a batch's `total` may grow over time (e.g. as a dependency graph is walked). Reported
 * values simply overwrite the in-flight batch reading, and the running total is the sum of committed
 * batches plus the in-flight batch — floored at {@link ProgressTrackerOptions.minTotal}.
 */
export class ProgressTracker {

    public label: string;
    public message = '';

    private readonly minTotal: number;
    private readonly timer = new Timer();

    /** Progress/total accumulated from batches that have already been committed. */
    private committedValue = 0;
    private committedTotal = 0;

    /** Latest progress/total reported for the batch currently in flight. */
    private batchValue = 0;
    private batchTotal = 0;

    constructor(options: ProgressTrackerOptions = {}) {
        this.label = options.label ?? '';
        this.minTotal = options.minTotal ?? 0;
    }

    /**
     * (Re)start the elapsed-time clock used for rate and ETA.
     */
    public start() {
        this.timer.reset();
    }

    /**
     * Record the latest cumulative progress for the in-flight batch. Both values may be omitted to
     * leave them unchanged. The source is expected to report a `total` that can grow as more work is
     * discovered; the tracker always keeps the most recent reading.
     */
    public report(value?: number, total?: number) {
        if (value !== undefined) {
            this.batchValue = value;
        }
        if (total !== undefined) {
            this.batchTotal = total;
        }
    }

    /**
     * Fold the in-flight batch into the committed totals and reset the batch counters so a new batch
     * can be tracked on top of the running total.
     */
    public commitBatch() {
        this.committedValue += this.batchValue;
        this.committedTotal += this.batchTotal;
        this.batchValue = 0;
        this.batchTotal = 0;
    }

    public get value() {
        return this.committedValue + this.batchValue;
    }

    public get total() {
        return Math.max(this.committedTotal + this.batchTotal, this.minTotal);
    }

    /**
     * True while no meaningful total is known yet, in which case progress cannot be expressed as a
     * fraction and the renderer should fall back to an indeterminate animation.
     */
    public get indeterminate() {
        return this.total <= 0;
    }

    /**
     * Completion ratio in the `[0, 1]` range. Clamped so a momentarily lagging total (the total can
     * jump up as new work is discovered) never produces a ratio above 1.
     */
    public get ratio() {
        return this.total > 0 ? Math.min(this.value / this.total, 1) : 0;
    }

    public get percent() {
        return Math.floor(this.ratio * 100);
    }

    public get elapsed() {
        return this.timer.elapsed;
    }

    /**
     * Completed units per second since {@link start}.
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
     * Integer milestone index for throttling forward-printed output, e.g. `milestone(10)` returns
     * `0..10` as progress passes each 10% mark.
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

    public get etaText() {
        const eta = this.eta;
        return eta !== undefined ? `ETA ${formatDuration(eta * 1000)}` : undefined;
    }

    public get elapsedText() {
        return this.timer.toString('seconds');
    }

    /**
     * Plain, colourless one-line summary suitable for non-interactive/forward-printing output, e.g.
     * `62% (248/400) · 31/s · ETA 0:05`.
     */
    public summary() {
        return [`${this.percentText} (${this.countText})`, this.rateText, this.etaText]
            .filter(Boolean)
            .join(' · ');
    }
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
