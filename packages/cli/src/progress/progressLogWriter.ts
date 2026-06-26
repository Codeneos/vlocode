import { LogEntry, LogWriter } from '@vlocode/core';

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
