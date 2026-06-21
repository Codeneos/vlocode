import { LogEntry, LogWriter } from '@vlocode/core';

import { getActiveProgressBar } from './progressBar';

/**
 * A {@link LogWriter} that can also format an entry to the exact string it would write. Both core
 * console writers ({@link ConsoleWriter}, {@link FancyConsoleWriter}) satisfy this.
 */
export interface FormattingLogWriter extends LogWriter {
    format(entry: LogEntry): string;
}

/**
 * Decorates a console {@link LogWriter} so that, whenever a {@link ProgressBar} is rendering, every
 * log entry is printed *above* the bar instead of going straight to the console.
 *
 * This is the generic catch-all that keeps an interactive progress bar pinned to the bottom of the
 * terminal: all logging in the CLI flows through the {@link LogManager} writer chain, so wrapping
 * the console writer here intercepts info, verbose, warning and error output alike — including logs
 * emitted deep inside services such as the exporter. When no bar is active the inner writer is used
 * unchanged, preserving normal console behaviour (stdout/stderr routing, colours, etc.).
 */
export class ProgressAwareLogWriter implements LogWriter {

    constructor(private readonly inner: FormattingLogWriter) {
    }

    public write(entry: LogEntry): void | Promise<void> {
        const bar = getActiveProgressBar();
        if (bar?.isActive) {
            bar.log(this.inner.format(entry));
            return;
        }
        return this.inner.write(entry);
    }

    public focus(): void | Promise<void> {
        return this.inner.focus?.();
    }
}
