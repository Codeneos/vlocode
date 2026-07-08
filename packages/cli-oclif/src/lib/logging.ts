import { FancyConsoleWriter, ConsoleWriter, FileWriter, LogLevel, LogManager } from '@vlocode/core';

import { ProgressAwareLogWriter } from './progress/progressLogWriter';

export interface LoggingOptions {
    verbose?: boolean;
    debug?: boolean;
    logFile?: string;
    logLevel?: string;
}

let writersRegistered = false;

/**
 * Resolve a {@link LogLevel} from its enum key (e.g. `"verbose"`), or `undefined` when the value is
 * missing or not a valid level name.
 */
export function parseLogLevel(level: string | undefined): LogLevel | undefined {
    if (!level) {
        return undefined;
    }
    const parsed = LogLevel[level as keyof typeof LogLevel];
    return typeof parsed === 'number' ? parsed : undefined;
}

/**
 * Available `--log-level` choices (the string keys of the {@link LogLevel} enum).
 */
export function logLevelChoices(): string[] {
    return Object.keys(LogLevel).filter(key => isNaN(Number(key)));
}

/**
 * Configure the global {@link LogManager} writers and level for the CLI.
 *
 * Called from {@link BaseCommand.init} using the log-related global flags read directly from argv
 * (before oclif parses them, so flag/argument validation errors are still logged). The console
 * writer — and the optional `--log-file` writer — are registered exactly once; the
 * `writersRegistered` guard makes the call idempotent for multi-command processes. The console
 * writer is wrapped in a {@link ProgressAwareLogWriter} so log output is diverted while an
 * interactive progress bar is rendering.
 */
export function configureLogging(options: LoggingOptions): void {
    if (!writersRegistered) {
        writersRegistered = true;
        if (options.verbose || options.debug) {
            LogManager.registerWriter(new ProgressAwareLogWriter(new FancyConsoleWriter()));
        } else {
            // Non-verbose: print just the message, without the timestamp/level/category prefix.
            LogManager.registerWriter(new ProgressAwareLogWriter(new ConsoleWriter(false)));
        }
        if (options.logFile) {
            LogManager.registerWriter(new FileWriter(options.logFile));
        }
    }

    // An explicit --log-level always wins over the -v/--debug derived level.
    LogManager.setGlobalLogLevel(
        parseLogLevel(options.logLevel) ??
            (options.debug ? LogLevel.debug : options.verbose ? LogLevel.verbose : LogLevel.info)
    );
}
