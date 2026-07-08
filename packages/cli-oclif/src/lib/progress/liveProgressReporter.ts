import { Logger } from '@vlocode/core';
import { ProgressBar, ProgressTracker } from '@vlocode/util';

import { InterceptedProblems } from './progressLogWriter';
import { detectInteractive } from './exportProgressReporter';

export interface LiveProgressOptions {
    /** Logger used for the non-interactive (forward-printing) fallback. */
    logger: Logger;
    /** Label shown on the bar / fallback lines, e.g. "Deploying datapacks". */
    label: string;
    /** Force interactive (`true`) or forward-printing (`false`); auto-detected when omitted. */
    enabled?: boolean;
    /** Stream the bar renders to; defaults to `process.stdout`. */
    stream?: NodeJS.WriteStream;
}

/**
 * Generic single-gauge live progress display for long-running operations.
 *
 * Interactive terminals get a redrawing {@link ProgressBar}; while it renders, the
 * {@link InterceptedProblems} collector keeps engine output from corrupting the bar — warnings and
 * errors are tallied live and a capped sample is dumped once the operation finishes (sibling
 * writers such as `--log-file` still receive every entry). Non-interactive/CI runs forward-print a
 * throttled progress line per 10% milestone.
 *
 * Used by `datapack deploy`; deploy lifecycles with distinct phases use {@link MultiStageProgress}.
 */
export class LiveProgressReporter {

    private readonly logger: Logger;
    private readonly stream: NodeJS.WriteStream;
    private readonly tracker: ProgressTracker;
    private readonly bar?: ProgressBar;
    private readonly problems: InterceptedProblems;
    private finished = false;

    /** Forward-printing throttle state for non-interactive output. */
    private lastLoggedMilestone = -1;
    private lastLogTime = 0;

    constructor(options: LiveProgressOptions) {
        this.logger = options.logger;
        this.stream = options.stream ?? process.stdout;
        this.tracker = new ProgressTracker({ label: options.label });
        if (options.enabled ?? detectInteractive(options.stream)) {
            this.bar = new ProgressBar({ stream: options.stream, tracker: this.tracker });
        }
        this.problems = new InterceptedProblems({
            consume: this.isInteractive,
            onProblem: () => this.bar?.update({}),
        });
    }

    public get isInteractive(): boolean {
        return this.bar !== undefined;
    }

    public start(): void {
        this.problems.install();
        if (this.bar) {
            this.bar.start({ details: () => this.composeDetails() });
        } else {
            this.tracker.start();
        }
    }

    public report(progress: number, total: number, message?: string): void {
        this.tracker.report(progress, total);
        if (this.bar) {
            this.bar.update({ message: message ?? '' });
        } else {
            this.logProgress();
        }
    }

    /**
     * Tear down the bar (restoring the terminal), dump collected problems, and optionally print a
     * final summary line. Safe to call multiple times; also safe on failure paths (no summary).
     */
    public stop(summary?: string): void {
        if (this.finished) {
            return;
        }
        this.finished = true;
        this.problems.uninstall();
        if (this.bar) {
            this.bar.stop(summary);
            this.problems.dump(this.stream);
        } else if (summary) {
            this.logger.info(summary);
        }
    }

    /** ` · N errors, M warnings` suffix for summary lines; empty when clean. */
    public get problemSuffix(): string {
        return this.problems.suffix;
    }

    private composeDetails(): string[] {
        const tally = this.problems.tally();
        return tally.length ? [tally.join('  ·  ')] : [];
    }

    private logProgress(): void {
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
