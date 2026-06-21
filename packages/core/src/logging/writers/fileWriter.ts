import { appendFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { LogWriter, LogEntry, LogLevel } from '..';

/**
 * Log writer that appends each entry to a file as a single line of JSON (NDJSON).
 * Writes are synchronous (`appendFileSync`) so entries are durable even when the
 * process exits hard via `process.exit()`. The parent directory is created on demand.
 */
export class FileWriter implements LogWriter {

    private directoryEnsured = false;

    constructor(private readonly fileName: string) {
    }

    public format({ level, time, category, message } : LogEntry) : string {
        return JSON.stringify({
            time: (time ?? new Date()).toISOString(),
            level: LogLevel[level],
            category,
            message
        });
    }

    public write(entry : LogEntry) : void {
        if (!this.directoryEnsured) {
            mkdirSync(dirname(this.fileName), { recursive: true });
            this.directoryEnsured = true;
        }
        appendFileSync(this.fileName, this.format(entry) + '\n');
    }
}
