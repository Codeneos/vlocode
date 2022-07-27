import { singleton } from '@vlocode/util';
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
export * from './distinctLogger';
export * from './logManager';

export function withLogger<T extends { new (...args: any[]): any }>(constructor: T) {
    return class extends constructor {
        readonly logger = LogManager.get(constructor);
    };
}

/**
 * Instantiate log manager as singleton
 */
export const LogManager = singleton(LogManagerImpl, LogLevel.info);