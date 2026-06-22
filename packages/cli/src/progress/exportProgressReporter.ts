import chalk from 'chalk';
import logSymbols from 'log-symbols';

import { Logger, LogEntry, LogLevel, LogManager } from '@vlocode/core';
import type { DatapackExportProgress } from '@vlocode/vlocity-deploy';

import { ProgressBar } from './progressBar';
import { formatCount, ProgressTracker } from './progressTracker';
import { clearProgressLogSink, setProgressLogSink } from './progressLogWriter';

export interface ExportProgressOptions {
    /**
     * Logger used for the non-interactive (forward-printing) fallback and the final summary in CI.
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
    /**
     * Returns the cumulative number of Salesforce API calls made so far (e.g.
     * `HttpTransport.requestCount`). When provided, the reporter shows the delta since the export
     * started as a live "API calls" figure. Omit to hide the figure.
     */
    apiCalls?: () => number;
}

/** Cap on how many problem messages are retained for the end-of-run dump. */
const MAX_COLLECTED_PROBLEMS = 20;

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
 * Bridges the {@link DatapackExporter} progress callbacks to a user-facing progress display and
 * keeps the live view compact.
 *
 * In interactive mode it renders a multi-line {@link ProgressBar} (a gauge plus a live stats line)
 * and installs a {@link ProgressLogSink} that intercepts log output: warnings and errors are
 * *counted* and surfaced as a running tally on the bar instead of scrolling past, then summarised —
 * with a capped list of messages — once the export finishes. Routine logs are dropped from the live
 * view entirely. Nothing is lost: sibling writers (e.g. a `--log-file`) still receive every entry.
 *
 * In non-interactive mode it forward-prints throttled progress and lets log output through as usual,
 * while still tallying problems for the final summary.
 */
export class ExportProgressReporter {

    private readonly logger: Logger;
    private readonly stream: NodeJS.WriteStream;
    private readonly totalBatches: number;
    private readonly rootDatapacks: number;
    private readonly tracker: ProgressTracker;
    private readonly bar?: ProgressBar;
    private readonly apiCalls?: () => number;

    private apiCallBaseline = 0;
    private batchIndex = 0;
    private batchType?: string;
    private lastSourceKey?: string;
    private finished = false;

    private errorCount = 0;
    private warnCount = 0;
    private readonly problems: string[] = [];

    /** Forward-printing throttle state for non-interactive output. */
    private lastLoggedMilestone = -1;
    private lastLogTime = 0;

    constructor(options: ExportProgressOptions) {
        this.logger = options.logger;
        this.stream = options.stream ?? process.stdout;
        this.totalBatches = options.totalBatches;
        this.rootDatapacks = options.rootDatapacks;
        this.apiCalls = options.apiCalls;
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
        setProgressLogSink(this.handleLog);
        this.apiCallBaseline = this.apiCalls?.() ?? 0;
        if (this.bar) {
            // Pass a thunk so the block (incl. the live API-call count) re-evaluates on every redraw.
            this.bar.start({ details: () => this.composeDetails() });
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

        if (this.bar) {
            this.refreshBar();
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
        if (progress.sourceKey) {
            this.lastSourceKey = progress.sourceKey;
        }
        this.tracker.report(progress.progress, progress.total);

        if (this.bar) {
            this.refreshBar();
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
     * Print the success summary, tear down the bar and dump any collected problems.
     */
    public succeed() {
        if (this.finished) {
            return;
        }
        this.finished = true;
        clearProgressLogSink(this.handleLog);

        const count = this.tracker.value;
        const apiCalls = this.apiCallsMade();
        const summary = `Exported ${count} datapack${count === 1 ? '' : 's'} in ${this.tracker.elapsedText}` +
            (apiCalls ? ` · ${formatCount(apiCalls)} API calls` : '') +
            this.problemSuffix();
        if (this.bar) {
            this.bar.stop(`${chalk.green(logSymbols.success)} ${summary}`);
            this.dumpProblems();
        } else {
            this.logger.info(`${logSymbols.success} ${summary}`);
        }
    }

    /**
     * Tear down the bar without printing a success summary; still surfaces collected problems. Safe
     * to call multiple times. Used to restore the terminal when the export fails (the caller reports
     * the error itself).
     */
    public stop() {
        if (this.finished) {
            return;
        }
        this.finished = true;
        clearProgressLogSink(this.handleLog);
        if (this.bar) {
            this.bar.stop();
            this.dumpProblems();
        }
    }

    /**
     * Sink for the {@link ProgressAwareLogWriter}: tally warnings/errors, retain a capped sample of
     * messages and keep them out of the live view. Returns `true` (consumed) only while a bar is
     * rendering — in non-interactive mode it counts but lets the console writer print as usual.
     */
    private handleLog = (entry: LogEntry, format: () => string): boolean => {
        const isProblem = entry.level >= LogLevel.warn;
        if (isProblem) {
            if (entry.level >= LogLevel.error) {
                this.errorCount++;
            } else {
                this.warnCount++;
            }
            if (this.problems.length < MAX_COLLECTED_PROBLEMS) {
                this.problems.push(format());
            }
        }

        if (!this.bar) {
            return false;
        }
        if (isProblem) {
            this.refreshBar();
        }
        return true;
    };

    private refreshBar() {
        // Details are supplied to the bar as a thunk, so only the trailing item needs pushing here;
        // the stats line re-evaluates itself on the next redraw.
        this.bar?.update({ message: this.lastSourceKey ?? '' });
    }

    private composeDetails(): string[] {
        const stats = [`${this.tracker.value} datapacks`];
        if (this.totalBatches > 1) {
            stats.push(`batch ${this.batchIndex + 1}/${this.totalBatches}`);
        }
        stats.push(`${this.rootDatapacks} records`);
        if (this.apiCalls) {
            stats.push(`${formatCount(this.apiCallsMade())} API calls`);
        }

        const lines = [stats.join('  ·  ')];
        if (this.errorCount || this.warnCount) {
            lines.push(this.problemTally().join('  ·  '));
        }
        return lines;
    }

    private apiCallsMade(): number {
        return this.apiCalls ? this.apiCalls() - this.apiCallBaseline : 0;
    }

    private problemTally(): string[] {
        const parts: string[] = [];
        if (this.errorCount) {
            parts.push(`${this.errorCount} error${this.errorCount === 1 ? '' : 's'}`);
        }
        if (this.warnCount) {
            parts.push(`${this.warnCount} warning${this.warnCount === 1 ? '' : 's'}`);
        }
        return parts;
    }

    private problemSuffix(): string {
        const tally = this.problemTally();
        return tally.length ? ` · ${tally.join(', ')}` : '';
    }

    private dumpProblems() {
        if (!this.problems.length) {
            return;
        }
        const total = this.errorCount + this.warnCount;
        this.stream.write(`\n${chalk.yellow(`${total} problem${total === 1 ? '' : 's'} logged during export:`)}\n`);
        for (const problem of this.problems) {
            this.stream.write(`  ${problem}\n`);
        }
        if (total > this.problems.length) {
            this.stream.write(chalk.dim(`  … and ${total - this.problems.length} more (use --log-file to capture all)\n`));
        }
    }

    private logProgress() {
        const milestone = this.tracker.milestone(10);
        const now = Date.now();
        // Forward-only consoles can't redraw, so throttle to one line per 10% milestone (or after a
        // period of silence) to stay informative without flooding CI logs.
        if (milestone === this.lastLoggedMilestone && now - this.lastLogTime < 15000) {
            return;
        }
        this.lastLoggedMilestone = milestone;
        this.lastLogTime = now;

        const batchInfo = this.totalBatches > 1 ? ` [batch ${this.batchIndex + 1}/${this.totalBatches}]` : '';
        this.logger.info(`Export progress${batchInfo}: ${this.tracker.summary()}`);
    }
}
