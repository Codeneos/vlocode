import { Logger } from "loggers";
import * as util from "./util";
import * as vlocityPackageManifest from "vlocity/package.json";
import 'vlocity';

// Import VlocityUtils as global from Vlocity NodeJS module
declare var VlocityUtils: any;

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
export function setVlocityLogger(logger : Logger, includeCallerDetails: boolean = false){
    const vlocityLogFn = (logFn: (...args: any[]) => void, args: any[]) : void => {
        if (includeCallerDetails) {
            let callerFrame = util.getStackFrameDetails(2);
            args.push(`(${callerFrame.fileName}:${callerFrame.lineNumber})`);
        }
        logFn.apply(logger, args);
    };

    // Override all methods
    util.getProperties(loggerMapping).forEach(kvp => VlocityUtils[kvp.key] = (...args: any[]) => vlocityLogFn(kvp.value, args));
    VlocityUtils.output = (_loggingMethod, _color: string, args: IArguments) => vlocityLogFn(logger.log, Array.from(args));
    VlocityUtils.fatal = (...args: any[]) => { 
        vlocityLogFn(logger.error, Array.from(args));
        throw new Error(Array.from(args).join(' ')); 
    };
}

/**
 * Gets the version of the NodeJS module used by the current Vlocode extension
 */
export function getBuildToolsVersion() {
    return vlocityPackageManifest.version;
}