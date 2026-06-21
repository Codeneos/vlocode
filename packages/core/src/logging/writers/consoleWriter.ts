import { LogWriter, LogEntry, LogLevel } from '..';
import { DateTime } from 'luxon';

export class ConsoleWriter implements LogWriter {

    public static LOG_DATE_FORMAT = "HH:mm:ss.SSS";

    constructor(private readonly formatMessages: boolean = true) {
    }

    public format({ level, time, category, message } : LogEntry) : string {
        if (!this.formatMessages) {
            return message;
        }
        const timestamp = time ? DateTime.fromJSDate(time) : DateTime.now();
        return `${timestamp.toFormat(ConsoleWriter.LOG_DATE_FORMAT)}:: [${LogLevel[level]}] [${category}]: ${message}`;
    }

    public write(entry : LogEntry) : void {
        const formattedMessage = this.format(entry);
        switch(entry.level) {
            case LogLevel.debug: return console.debug(formattedMessage);
            case LogLevel.warn: return console.warn(formattedMessage);
            case LogLevel.error: return console.error(formattedMessage);
            default: return console.info(formattedMessage);
        }
    }
}