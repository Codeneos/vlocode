
import { default as LogManagerImpl } from './logManager';

/**
 * Describes the log levels supported by the logging framework
 */
export enum LogLevel {    
    debug,
    verbose,
    info,
    warn,
    error,
    fatal
}

export * from './logger';
export * from './logManager';

export const LogManager = new LogManagerImpl(LogLevel.info);