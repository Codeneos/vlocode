import chalk from 'chalk';

import { LogEntry, LogLevel, LogWriter } from '@vlocode/core';

/**
 * A {@link LogWriter} that can also format an entry to the exact string it would write. Both core
 * console writers ({@link ConsoleWriter}, {@link FancyConsoleWriter}) satisfy this.
 */
export interface FormattingLogWriter extends LogWriter {
    format(entry: LogEntry): string;
}

/**
 * Intercepts a log entry on behalf of an in-progress operation. `format` lazily produces the fully
 * formatted line so an interceptor that only counts entries pays no formatting cost. Return `true`
 * to consume the entry (it is not written to the console), or `false` to let normal output proceed.
 */
export type LogInterceptor = (entry: LogEntry, format: () => string) => boolean;

let activeInterceptor: LogInterceptor | undefined;

/**
 * Install the interceptor consulted by {@link ProgressAwareLogWriter} for every log entry. Typically
 * set by {@link ExportProgressReporter} for the duration of an export so it can count and collect
 * warnings/errors and keep them out of the live progress view.
 */
export function setLogInterceptor(interceptor: LogInterceptor): void {
    activeInterceptor = interceptor;
}

export function clearLogInterceptor(interceptor: LogInterceptor): void {
    if (activeInterceptor === interceptor) {
        activeInterceptor = undefined;
    }
}

/**
 * Log-interceptor that tallies warnings/errors emitted while a live display (progress bar or
 * multi-stage renderer) owns the terminal, retaining a capped sample for an end-of-run dump.
 * When `consume` is set the intercepted entries are kept out of the console entirely (sibling
 * writers such as `--log-file` still receive them); otherwise entries print as usual and this
 * only counts problems.
 */
export class InterceptedProblems {

    /** Cap on how many problem messages are retained for the end-of-run dump. */
    private static readonly maxCollected = 20;

    public errorCount = 0;
    public warnCount = 0;
    public readonly problems: string[] = [];

    constructor(private readonly options: { consume: boolean; onProblem?: () => void }) {
    }

    private readonly interceptor: LogInterceptor = (entry, format) => {
        if (entry.level >= LogLevel.warn) {
            if (entry.level >= LogLevel.error) {
                this.errorCount++;
            } else {
                this.warnCount++;
            }
            if (this.problems.length < InterceptedProblems.maxCollected) {
                this.problems.push(format());
            }
            this.options.onProblem?.();
        }
        return this.options.consume;
    };

    public install(): this {
        setLogInterceptor(this.interceptor);
        return this;
    }

    public uninstall(): void {
        clearLogInterceptor(this.interceptor);
    }

    /** `['N errors', 'M warnings']` parts; empty when clean. */
    public tally(): string[] {
        const parts: string[] = [];
        if (this.errorCount) {
            parts.push(`${this.errorCount} error${this.errorCount === 1 ? '' : 's'}`);
        }
        if (this.warnCount) {
            parts.push(`${this.warnCount} warning${this.warnCount === 1 ? '' : 's'}`);
        }
        return parts;
    }

    /** ` · N errors, M warnings` suffix for summary lines; empty when clean. */
    public get suffix(): string {
        const tally = this.tally();
        return tally.length ? ` · ${tally.join(', ')}` : '';
    }

    /** Print the retained problem sample (used after the live display is torn down). */
    public dump(stream: NodeJS.WriteStream = process.stdout): void {
        if (!this.problems.length) {
            return;
        }
        const total = this.errorCount + this.warnCount;
        stream.write(`\n${chalk.yellow(`${total} problem${total === 1 ? '' : 's'} logged:`)}\n`);
        for (const problem of this.problems) {
            stream.write(`  ${problem}\n`);
        }
        if (total > this.problems.length) {
            stream.write(chalk.dim(`  … and ${total - this.problems.length} more (use --log-file to capture all)\n`));
        }
    }
}

/**
 * Decorates a console {@link LogWriter} so that, while a {@link LogInterceptor} is installed, log
 * output can be diverted from the console — keeping it from corrupting a live progress display.
 *
 * All CLI logging flows through the {@link LogManager} writer chain, so wrapping the console writer
 * here intercepts every entry, including logs emitted deep inside services. When the interceptor
 * consumes an entry nothing is printed; otherwise (or when no interceptor is installed) the inner
 * writer is used unchanged. Sibling writers in the chain (a `--log-file`, for instance) always
 * receive every entry regardless, so nothing intercepted here is ever lost.
 */
export class ProgressAwareLogWriter implements LogWriter {

    constructor(private readonly inner: FormattingLogWriter) {
    }

    public write(entry: LogEntry): void | Promise<void> {
        if (activeInterceptor) {
            let formatted: string | undefined;
            if (activeInterceptor(entry, () => (formatted ??= this.inner.format(entry)))) {
                return;
            }
        }
        return this.inner.write(entry);
    }

    public focus(): void | Promise<void> {
        return this.inner.focus?.();
    }
}
