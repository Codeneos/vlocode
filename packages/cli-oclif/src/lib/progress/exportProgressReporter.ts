import chalk from 'chalk';
import logSymbols from 'log-symbols';

import { Logger, LogEntry, LogLevel, LogManager } from '@vlocode/core';
import { formatCount, ProgressBar, ProgressTracker, Timer } from '@vlocode/util';

import { clearLogInterceptor, setLogInterceptor } from './progressLogWriter';

/**
 * Pipeline phase a progress update belongs to. `export`/`expand` are reported by the exporter;
 * `write` is reported by the command as it writes datapacks to disk.
 */
export type ExportProgressPhase = 'export' | 'expand' | 'write';

const PHASE_LABELS: Record<ExportProgressPhase, string> = {
    export: 'Exporting',
    expand: 'Expanding',
    write: 'Writing'
};

/** Verb used for the finalizing sub-counter shown on the detail line. */
const FINALIZING_VERB: Record<'expand' | 'write', string> = {
    expand: 'expanding',
    write: 'writing'
};

/**
 * A progress update for the reporter. The exporter's `DatapackExportProgress` (phase `export`/
 * `expand`) is assignable to this; the command additionally emits `write` updates.
 */
export interface ExportProgressEvent {
    phase: ExportProgressPhase;
    progress: number;
    total: number;
    sourceKey?: string;
    status?: 'completed' | 'failed';
    id?: string;
}

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
     * Number of top-level datapacks requested. Used as a lower bound for the export-phase total
     * since the exporter discovers additional dependencies while running.
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
 * Bridges the {@link DatapackExporter} progress callbacks (and the command's write loop) to a
 * user-facing progress display, and keeps the live view compact.
 *
 * A single {@link ProgressBar} is driven by the **export** phase — the network-bound bulk of the
 * work — so the gauge and ETA reflect that. Export's progress accounting can drift slightly below
 * 100% at the very end (the exporter discovers dependencies it then dedupes), so the moment the
 * first non-export (`expand`/`write`) update arrives the gauge is snapped to 100%: it never sticks
 * just under the line. The follow-on expand/write phases — which would otherwise leave the bar
 * looking done while it churns — are surfaced as a moving sub-counter on the detail line
 * (`writing 380/412`) plus a phase label, so the tail clearly keeps moving.
 *
 * It also installs a {@link LogInterceptor}: warnings and errors are counted, surfaced as a live
 * tally (interactive) and summarised — with a capped list of messages — once the export finishes,
 * instead of scrolling past. While the bar renders, intercepted logs are kept out of the live view;
 * nothing is lost, sibling writers (e.g. a `--log-file`) still receive every entry.
 */
export class ExportProgressReporter {

    private readonly logger: Logger;
    private readonly stream: NodeJS.WriteStream;
    private readonly totalBatches: number;
    private readonly rootDatapacks: number;
    private readonly tracker: ProgressTracker;
    private readonly bar?: ProgressBar;
    private readonly apiCalls?: () => number;
    private readonly runTimer = new Timer();

    private currentPhase: ExportProgressPhase = 'export';
    private finalizing?: { phase: 'expand' | 'write'; progress: number; total: number };
    private currentBatchType?: string;
    private batchIndex = 0;
    private lastSourceKey?: string;
    private finished = false;

    /** Cumulative number of datapacks exported across all batches (committed at end of each export phase). */
    private exportedTotal = 0;
    private exportCommitted = false;

    private apiCallBaseline = 0;
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
        this.tracker = new ProgressTracker({ label: 'Exporting' });
        const interactive = options.enabled ?? detectInteractive(options.stream);
        if (interactive) {
            this.bar = new ProgressBar({ stream: options.stream, tracker: this.tracker });
        }
    }

    public get isInteractive() {
        return this.bar !== undefined;
    }

    /**
     * Number of datapacks exported so far, including dependencies discovered during the export and
     * the export phase currently in flight.
     */
    public get exportedCount() {
        const inFlight = this.currentPhase === 'export' && !this.exportCommitted ? this.tracker.value : 0;
        return this.exportedTotal + inFlight;
    }

    public start() {
        setLogInterceptor(this.handleLog);
        this.apiCallBaseline = this.apiCalls?.() ?? 0;
        this.runTimer.reset();
        if (this.bar) {
            // Pass a thunk so the block (incl. the live API-call count) re-evaluates on every redraw.
            this.bar.start({ details: () => this.composeDetails() });
        } else {
            this.tracker.start();
        }
    }

    /**
     * Mark the start of a new export batch and re-seed the gauge for its export phase. `datapackType`
     * and `idCount` are used for labelling and as the export-phase lower bound.
     */
    public beginBatch(index: number, datapackType: string | undefined, idCount: number) {
        this.batchIndex = index;
        this.currentBatchType = datapackType;
        this.currentPhase = 'export';
        this.finalizing = undefined;
        this.exportCommitted = false;
        this.lastSourceKey = undefined;
        this.lastLoggedMilestone = -1;
        this.tracker.reset(idCount);
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
     * Consume a progress event for the current batch.
     */
    public report(event: ExportProgressEvent) {
        if (event.sourceKey) {
            this.lastSourceKey = event.sourceKey;
        }
        if (event.phase === 'export') {
            this.tracker.report(event.progress, event.total);
        } else {
            this.enterFinalizing(event.phase, event.progress, event.total);
        }

        if (this.bar) {
            this.refreshBar();
        } else {
            this.logProgress();
        }
    }

    /**
     * Commit the current batch's export count into the running total.
     */
    public endBatch() {
        this.commitExportCount();
    }

    /**
     * Print the success summary, tear down the bar and dump any collected problems.
     */
    public succeed() {
        if (this.finished) {
            return;
        }
        this.finished = true;
        clearLogInterceptor(this.handleLog);
        this.commitExportCount();

        const count = this.exportedTotal;
        const apiCalls = this.apiCallsMade();
        const summary = `Exported ${formatCount(count)} datapack${count === 1 ? '' : 's'} in ${this.runTimer.toString('seconds')}` +
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
        clearLogInterceptor(this.handleLog);
        if (this.bar) {
            this.bar.stop();
            this.dumpProblems();
        }
    }

    /**
     * Handle the first (and subsequent) non-export updates: snap the gauge to 100% on the transition
     * out of `export` (so it never sticks just below the line), relabel, and record the sub-counter.
     */
    private enterFinalizing(phase: 'expand' | 'write', progress: number, total: number) {
        if (this.currentPhase === 'export') {
            this.commitExportCount();
            const completeTotal = this.tracker.total;
            this.tracker.report(completeTotal, completeTotal);
        }
        if (this.currentPhase !== phase) {
            this.currentPhase = phase;
            this.tracker.label = this.currentBatchType ? `${PHASE_LABELS[phase]} ${this.currentBatchType}` : PHASE_LABELS[phase];
            if (!this.bar) {
                this.logger.info(`${this.tracker.label}: ${formatCount(total)} datapack${total === 1 ? '' : 's'}`);
            }
        }
        this.finalizing = { phase, progress, total };
    }

    private commitExportCount() {
        if (this.currentPhase === 'export' && !this.exportCommitted) {
            this.exportedTotal += this.tracker.value;
            this.exportCommitted = true;
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
        const stats = [`${formatCount(this.exportedCount)} datapacks`];
        if (this.totalBatches > 1) {
            stats.push(`batch ${this.batchIndex + 1}/${this.totalBatches}`);
        }
        stats.push(`${formatCount(this.rootDatapacks)} records`);
        if (this.apiCalls) {
            stats.push(`${formatCount(this.apiCallsMade())} API calls`);
        }

        const lines = [stats.join('  ·  ')];
        if (this.finalizing) {
            lines.push(`${FINALIZING_VERB[this.finalizing.phase]} ${formatCount(this.finalizing.progress)}/${formatCount(this.finalizing.total)}`);
        }
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
        // Finalizing phases are announced once in enterFinalizing; only the export gauge is throttled.
        if (this.currentPhase !== 'export') {
            return;
        }
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
        this.logger.info(`${this.tracker.label}${batchInfo}: ${this.tracker.summary()}`);
    }
}
