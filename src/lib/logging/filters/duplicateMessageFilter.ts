import { LogFilter } from "../logger";
import { LogLevel } from "../logLevels";

/**
 * Filter already reported messages of type Warning and Error from the log for a certain time (5 seconds by default) before reporting them again. This keeps the log clean and avoids to much clutter.
 */
export class DuplicateMessageFilter {

    private readonly displayedMessages = new Set<string>();
    private resetTimeout: NodeJS.Timeout;

    constructor(private readonly appliesTo: LogLevel[] = [ LogLevel.error, LogLevel.warn ], private readonly resetTime = 5000) {
    }

    public filter(...[ { entry } ]: Parameters<LogFilter>) : ReturnType<LogFilter> {
        if (!this.appliesTo.includes(entry.level)) {
            return true;
        }

        if (this.displayedMessages.has(entry.message)) {
            return false;
        }

        if (!this.resetTimeout) {
            clearTimeout(this.resetTimeout);
        }

        this.displayedMessages.add(entry.message);
        if (this.resetTime > 0) {
            this.resetTimeout = setTimeout(() => this.clear(), this.resetTime);
        }
        return true;
    }

    public clear() {
        this.displayedMessages.clear();
    }
}