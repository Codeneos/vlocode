import { getErrorMessage } from "@vlocode/util";
import { LogLevel } from "./logLevels";

const FORMAT_REGEX = /%([sdiS])(?::([0-9]+))?/g;

/**
 * Describes an entry inb the log
 */
export interface LogEntry {
    readonly level: LogLevel;
    readonly time: Date;
    readonly category: string;
    readonly message: string;
}

/**
 * Log entry implementation that formats the message on demand
 * @internal
 */
export class LoggerEntry implements LogEntry {

    public readonly time = new Date();
    private formattedMessage?: string;

    /**
     * Formatted message of the log entry (lazy)
     */
    public get message() {
        if (!this.formattedMessage) {
            this.formattedMessage = this.formatMessage(this.args);
        }
        return this.formattedMessage;
    }

    constructor(
        public readonly level: LogLevel,
        public readonly category: string,
        public readonly args: unknown[]) {
    }

    /**
     * Format the message from the arguments array
     * @returns Formatted message
     */
    private formatMessage(args: any[]) : string {
        if (args.length === 0) {
            return '';
        } else if (args.length === 1) {
            return this.formatArg(args[0], 0);
        }
        const stringArgs = args.map((arg, index) => this.formatArg(arg, index));
        const parts: string[] = [];
        for (let index = 0; index < stringArgs.length; index++) {
            parts.push(this.formatArgs(stringArgs, index));
        }
        return parts.join(' ');
    }

    /**
     * Format a single argument for the log message
     * @param arg Argument to format
     * @param index Index of the argument
     * @returns Formatted argument
     */
    private formatArg(arg: unknown, index: number) : string {
        if (arg instanceof Error) {
            const error = getErrorMessage(arg);
            return !index ? error : `\n${error}`;
        } else if (arg !== null && typeof arg === 'object') {
            try {
                return JSON.stringify(arg, undefined, 2);
            } catch(err) {
                return '[Object]';
            }
        } else if (typeof arg === 'function') {
            try {
                return this.formatArg(arg(), index);
            } catch(err) {
                return `(<function error> ${this.formatArg(err, index)})`;
            }
        } else if (typeof arg !== 'string') {
            return String(arg);
        }

        return arg;
    }

    private formatArgs(args: string[], index: number) : string {
        if (index + 1 >= args.length) {
            return args[index];
        }

        const offset = index;
        const formattedArg = args[index].replace(FORMAT_REGEX, (fullMatch, type, options) => {
            if (index + 1 >= args.length) {
                return fullMatch;
            }
            const formatted = this.formatArgs(args, ++index);
            if (type === 'S') { 
                return formatted.toUpperCase();
            } else if (type === 'd') { 
                return Number(formatted).toFixed(options ? Number(options) : 2);
            } else if (type === 'i') { 
                return Number(formatted).toFixed(0);
            }
            return formatted;
        });

        if (offset !== index) {
            args.splice(offset + 1, index - offset);
        }
        return formattedArg;
    }
}