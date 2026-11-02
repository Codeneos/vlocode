import chalk from 'chalk';
import logSymbols from 'log-symbols';

import { Logger, LogEntry, LogLevel } from '@vlocode/core';
import { DatapackComparisonProgress, DatapackComparisonResult } from '@vlocode/vlocity-deploy';
import { formatCount, ProgressBar, ProgressTracker, Timer } from '@vlocode/util';

import { detectInteractive } from './exportProgressReporter';
import { clearLogInterceptor, setLogInterceptor } from './progressLogWriter';

const PHASE_LABELS: Record<DatapackComparisonProgress['phase'], string> = {
    extract: 'Extracting org data',
    resolve: 'Resolving org records',
    compare: 'Comparing records'
};

/** Cap on how many problem messages are retained for the end-of-run dump. */
const MAX_COLLECTED_PROBLEMS = 20;

export interface CompareProgressOptions {
    /**
     * Logger used for the non-interactive (forward-printing) fallback and the final summary in CI.
     */
    logger: Logger;
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
     * Returns the cumulative number of Salesforce API calls made so far; when provided the reporter
     * shows the delta since the comparison started as a live "API calls" figure.
     */
    apiCalls?: () => number;
}

/**
 * Bridges {@link DatapackComparisonProgress} events from the {@link DatapackComparer} to a user-facing
 * progress display: an interactive redrawing bar on TTYs and throttled forward-printing lines in CI.
 * Warnings and errors logged while the bar renders are counted, surfaced as a live tally and dumped
 * (capped) once the comparison finishes instead of corrupting the bar.
 */
export class CompareProgressReporter {

    private readonly logger: Logger;
    private readonly stream: NodeJS.WriteStream;
    private readonly tracker: ProgressTracker;
    private readonly bar?: ProgressBar;
    private readonly apiCalls?: () => number;
    private readonly runTimer = new Timer();

    private currentPhase?: DatapackComparisonProgress['phase'];
    private finished = false;
    private apiCallBaseline = 0;
    private errorCount = 0;
    private warnCount = 0;
    private readonly problems: string[] = [];

    /** Forward-printing throttle state for non-interactive output. */
    private lastLoggedMilestone = -1;
    private lastLogTime = 0;

    constructor(options: CompareProgressOptions) {
        this.logger = options.logger;
        this.stream = options.stream ?? process.stdout;
        this.apiCalls = options.apiCalls;
        this.tracker = new ProgressTracker({ label: 'Preparing records' });
        const interactive = options.enabled ?? detectInteractive(options.stream);
        if (interactive) {
            this.bar = new ProgressBar({ stream: options.stream, tracker: this.tracker });
        }
    }

    public get isInteractive() {
        return this.bar !== undefined;
    }

    public start() {
        setLogInterceptor(this.handleLog);
        this.apiCallBaseline = this.apiCalls?.() ?? 0;
        this.runTimer.reset();
        if (this.bar) {
            this.bar.start({ details: () => this.composeDetails() });
        } else {
            this.tracker.start();
        }
    }

    /**
     * Consume a progress event from the comparer.
     */
    public report(event: DatapackComparisonProgress) {
        if (this.currentPhase !== event.phase) {
            this.currentPhase = event.phase;
            this.tracker.reset(event.total);
            this.tracker.label = PHASE_LABELS[event.phase];
            this.lastLoggedMilestone = -1;
            if (!this.bar) {
                this.logger.info(`${this.tracker.label}: ${formatCount(event.total)} record(s)`);
            }
        }

        this.tracker.report(event.progress, event.total);
        if (this.bar) {
            this.bar.update({});
        } else {
            this.logProgress();
        }
    }

    /**
     * Print the comparison summary, tear down the bar and dump any collected problems.
     */
    public succeed(result: DatapackComparisonResult) {
        if (this.finished) {
            return;
        }
        this.finished = true;
        clearLogInterceptor(this.handleLog);

        const apiCalls = this.apiCallsMade();
        const summary = `Compared ${formatCount(result.total)} datapacks in ${this.runTimer.toString('seconds')}` +
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
     * Tear down the bar without printing a summary; still surfaces collected problems. Safe to call
     * multiple times. Used to restore the terminal when the comparison fails.
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
            this.bar.update({});
        }
        return true;
    };

    private composeDetails(): string[] {
        const stats = new Array<string>();
        if (this.apiCalls) {
            stats.push(`${formatCount(this.apiCallsMade())} API calls`);
        }
        if (this.errorCount || this.warnCount) {
            stats.push(...this.problemTally());
        }
        return stats.length ? [ stats.join('  ·  ') ] : [];
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
        this.stream.write(`\n${chalk.yellow(`${total} problem${total === 1 ? '' : 's'} logged during comparison:`)}\n`);
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
        this.logger.info(`${this.tracker.label}: ${this.tracker.summary()}`);
    }
}
