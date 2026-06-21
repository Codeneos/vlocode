import chalk from 'chalk';
import logSymbols from 'log-symbols';

import { Logger, LogLevel, LogManager } from '@vlocode/core';
import type { DatapackExportProgress } from '@vlocode/vlocity-deploy';

import { ProgressBar } from './progressBar';
import { ProgressTracker } from './progressTracker';

export interface ExportProgressOptions {
    /**
     * Logger used for the non-interactive (forward-printing) fallback and as the destination for
     * the final summary line in CI.
     */
    logger: Logger;
    /**
     * Total number of export batches (requests) that will be processed.
     */
    totalBatches: number;
    /**
     * Number of top-level datapacks requested. Used as a lower bound for the total since the
     * exporter discovers additional dependencies while running.
     */
    rootDatapacks: number;
    /**
     * Force interactive (`true`) or forward-printing (`false`) mode. When omitted the mode is
     * auto-detected from the stream and environment.
     */
    enabled?: boolean;
    /**
     * Stream the bar renders to; defaults to `process.stdout`.
     */
    stream?: NodeJS.WriteStream;
}

/** Emit a forward-printed progress line at most once per 10% gained or 15s of silence. */
const FORWARD_MILESTONE_STEP = 10;
const FORWARD_SILENCE_MS = 15000;

/**
 * Determine whether the given stream supports an interactive, redrawing progress bar.
 *
 * Interactive rendering is only used when the stream is a TTY, the process is not running in a CI
 * environment, the terminal is not `dumb`, and verbose/debug logging is off (a redrawing bar fights
 * with a flood of log lines, so we fall back to forward printing in that case).
 */
export function detectInteractive(stream: NodeJS.WriteStream = process.stdout): boolean {
    return stream.isTTY === true &&
        !process.env.CI &&
        process.env.TERM !== 'dumb' &&
        LogManager.getGlobalLogLevel() >= LogLevel.info;
}

/**
 * Bridges the {@link DatapackExporter} progress callbacks to a user-facing progress display.
 *
 * This reporter is a thin adapter: it owns no progress math. All figures live in a single
 * {@link ProgressTracker} that is shared with the {@link ProgressBar} (interactive) and read back
 * for the forward-printing fallback (CI/CD, piped output, verbose logging), so both modes show
 * identical numbers. The reporter only translates export events — batch boundaries, the running
 * datapack type and source key — into tracker updates and decides *when* to emit.
 *
 * The exporter reports progress per batch with a `total` that grows as dependencies are discovered;
 * the tracker accumulates committed batches and floors the total at the known root count.
 */
export class ExportProgressReporter {

    private readonly logger: Logger;
    private readonly totalBatches: number;
    private readonly tracker: ProgressTracker;
    private readonly bar?: ProgressBar;

    private batchIndex = 0;
    private batchType?: string;
    private lastSourceKey?: string;
    private failures = 0;
    private finished = false;

    /** Forward-printing throttle state for non-interactive output. */
    private lastLoggedMilestone = -1;
    private lastLogTime = 0;

    constructor(options: ExportProgressOptions) {
        this.logger = options.logger;
        this.totalBatches = options.totalBatches;
        this.tracker = new ProgressTracker({ label: 'Exporting', minTotal: options.rootDatapacks });
        const interactive = options.enabled ?? detectInteractive(options.stream);
        if (interactive) {
            this.bar = new ProgressBar({ stream: options.stream, tracker: this.tracker });
        }
    }

    public get isInteractive() {
        return this.bar !== undefined;
    }

    /**
     * Number of datapacks exported so far, including dependencies discovered during the export.
     */
    public get exportedCount() {
        return this.tracker.value;
    }

    public start() {
        if (this.bar) {
            this.bar.start();
        } else {
            this.tracker.start();
        }
    }

    /**
     * Mark the start of a new export batch. `datapackType` and `idCount` are used for labelling.
     */
    public beginBatch(index: number, datapackType: string | undefined, idCount: number) {
        this.batchIndex = index;
        this.batchType = datapackType;
        this.lastSourceKey = undefined;
        this.tracker.label = datapackType ? `Exporting ${datapackType}` : 'Exporting';
        this.tracker.message = this.batchIndicator();

        if (this.bar) {
            this.bar.refresh();
        } else if (this.totalBatches > 1) {
            this.logger.info(
                `Exporting batch ${index + 1}/${this.totalBatches}: ${idCount} ` +
                `${datapackType ?? 'datapack'}${idCount === 1 ? '' : 's'}`
            );
        }
    }

    /**
     * Consume a progress event emitted by the exporter for the current batch.
     */
    public report(progress: DatapackExportProgress) {
        if (progress.status === 'failed') {
            this.failures++;
        }
        if (progress.sourceKey) {
            this.lastSourceKey = progress.sourceKey;
        }

        this.tracker.report(progress.progress, progress.total);
        this.tracker.message = this.batchIndicator();

        if (this.bar) {
            this.bar.refresh();
        } else {
            this.logProgress();
        }
    }

    /**
     * Commit the current batch's progress into the running totals.
     */
    public endBatch() {
        this.tracker.commitBatch();
    }

    /**
     * Print the success summary and tear down the bar.
     */
    public succeed() {
        if (this.finished) {
            return;
        }
        this.finished = true;
        const count = this.tracker.value;
        const summary = `Exported ${count} datapack${count === 1 ? '' : 's'} in ${this.tracker.elapsedText}` +
            (this.failures ? `, ${this.failures} failed` : '');
        if (this.bar) {
            this.bar.stop(`${chalk.green(logSymbols.success)} ${summary}`);
        } else {
            this.logger.info(`${logSymbols.success} ${summary}`);
        }
    }

    /**
     * Tear down the bar without printing a summary. Safe to call multiple times; used to restore the
     * terminal when the export fails (the caller reports the error itself).
     */
    public stop() {
        if (this.finished) {
            return;
        }
        this.finished = true;
        this.bar?.stop();
    }

    private batchIndicator(): string {
        const parts: string[] = [];
        if (this.totalBatches > 1) {
            parts.push(`batch ${this.batchIndex + 1}/${this.totalBatches}`);
        }
        if (this.lastSourceKey) {
            parts.push(this.lastSourceKey);
        }
        return parts.join(' · ');
    }

    private logProgress() {
        // Forward-only consoles can't redraw, so throttle to one line per milestone (or after a
        // period of silence) to stay informative without flooding CI logs.
        const milestone = this.tracker.milestone(FORWARD_MILESTONE_STEP);
        const now = Date.now();
        if (milestone === this.lastLoggedMilestone && now - this.lastLogTime < FORWARD_SILENCE_MS) {
            return;
        }
        this.lastLoggedMilestone = milestone;
        this.lastLogTime = now;

        const batchInfo = this.totalBatches > 1 ? ` [batch ${this.batchIndex + 1}/${this.totalBatches}]` : '';
        this.logger.info(`Export progress${batchInfo}: ${this.tracker.summary()}`);
    }
}
