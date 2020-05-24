import { Logger } from 'lib/logging';
import * as util from 'lib/util/callStack';
import * as vlocityPackageManifest from 'vlocity/package.json';
import 'vlocity';

// Import VlocityUtils as global from Vlocity NodeJS module
declare let VlocityUtils: {
    [key: string]: any;
    silence?: boolean;
    output(loggingMethod: string, color: string, args: IArguments): void;
    fatal(...args: any[]): void;
};

const loggerMapping = {
    report: Logger.prototype.info,
    success: Logger.prototype.info,
    warn: Logger.prototype.warn,
    error: Logger.prototype.error,
    verbose: Logger.prototype.verbose
};

/**
 * Intercept calls to `VlocityUtils` logging methods and redirect them to the specified logger instance.
 * @param logger Logger to use by Vlocity NodeJS package
 * @param includeCallerDetails Include filename and line number from where the logging call originated
 */
export function setLogger(logger : Logger, includeCallerDetails: boolean = false){
    const vlocityLogFn = (logFn: (...args: any[]) => void, args: any[]) : void => {
        if (VlocityUtils.silence) {
            return;
        }
        if (includeCallerDetails) {
            const callerFrame = util.getStackFrameDetails(2);
            if (callerFrame) {
                args.push(`(${callerFrame.fileName}:${callerFrame.lineNumber})`);
            }
        }
        logFn.apply(logger, args);
    };

    // Override all methods
    for (const [key, value] of Object.entries(loggerMapping)) {
        VlocityUtils[key] = (...args: any[]) => vlocityLogFn(value, args);
    }
    VlocityUtils.output = (_loggingMethod, _color: string, args: IArguments) => vlocityLogFn(logger.log, Array.from(args));
    VlocityUtils.fatal = (...args: any[]) => {
        vlocityLogFn(logger.error, Array.from(args));
        throw new Error(Array.from(args).join(' '));
    };
}