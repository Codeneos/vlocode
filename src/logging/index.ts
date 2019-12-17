
import { default as LogManagerImpl } from './logManager';
import { asSingleton } from '@util';

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

/**
 * Instantiate log manager as singleton
 */
export const LogManager = asSingleton('LogManager', () => new LogManagerImpl(LogLevel.info));