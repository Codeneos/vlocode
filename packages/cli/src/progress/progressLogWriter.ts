import { LogEntry, LogLevel, LogWriter } from '@vlocode/core';

import { getActiveProgressBar } from './progressBar';

/**
 * A {@link LogWriter} that can also format an entry to the exact string it would write. Both core
 * console writers ({@link ConsoleWriter}, {@link FancyConsoleWriter}) satisfy this.
 */
export interface FormattingLogWriter extends LogWriter {
    format(entry: LogEntry): string;
}

/**
 * Consumes a log entry on behalf of an active progress display. `format` lazily produces the fully
 * formatted line so a sink that only counts entries pays no formatting cost. Return `true` if the
 * entry was handled (and must not be printed to the console), or `false` to let normal console
 * output proceed.
 */
export type ProgressLogSink = (entry: LogEntry, format: () => string) => boolean;

let activeSink: ProgressLogSink | undefined;

/**
 * Install a sink that intercepts log entries while a progress display is running. Typically set by
 * {@link ExportProgressReporter} so it can count/collect warnings and errors and keep them out of
 * the live view.
 */
export function setProgressLogSink(sink: ProgressLogSink): void {
    activeSink = sink;
}

export function clearProgressLogSink(sink: ProgressLogSink): void {
    if (activeSink === sink) {
        activeSink = undefined;
    }
}

export interface ProgressAwareLogWriterOptions {
    /**
     * Lowest level still printed above the bar when no {@link ProgressLogSink} is installed. Used as
     * a fallback for standalone bars; the reporter normally installs a sink that captures everything.
     * Defaults to {@link LogLevel.warn}.
     */
    minLevelWhileActive?: LogLevel;
}

/**
 * Decorates a console {@link LogWriter} so log output cooperates with an active {@link ProgressBar}
 * instead of corrupting it.
 *
 * All CLI logging flows through the {@link LogManager} writer chain, so wrapping the console writer
 * here intercepts every entry — including logs emitted deep inside services such as the exporter.
 * Resolution order while writing:
 *  1. If a {@link ProgressLogSink} is installed and consumes the entry, nothing is printed (the sink
 *     — e.g. the reporter — counts/collects it for an end-of-run summary).
 *  2. Otherwise, if a bar is rendering, entries at/above the fallback level are printed above it.
 *  3. Otherwise the inner writer is used unchanged.
 *
 * Sibling writers in the chain (a `--log-file`, for instance) always receive every entry regardless,
 * so nothing intercepted here is ever lost.
 */
export class ProgressAwareLogWriter implements LogWriter {

    private readonly minLevelWhileActive: LogLevel;

    constructor(private readonly inner: FormattingLogWriter, options: ProgressAwareLogWriterOptions = {}) {
        this.minLevelWhileActive = options.minLevelWhileActive ?? LogLevel.warn;
    }

    public write(entry: LogEntry): void | Promise<void> {
        let formatted: string | undefined;
        const format = () => (formatted ??= this.inner.format(entry));

        if (activeSink?.(entry, format)) {
            return;
        }

        const bar = getActiveProgressBar();
        if (bar?.isActive) {
            if (entry.level >= this.minLevelWhileActive) {
                bar.log(format());
            }
            return;
        }

        return this.inner.write(entry);
    }

    public focus(): void | Promise<void> {
        return this.inner.focus?.();
    }
}
