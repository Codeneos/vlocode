import { LogWriter, LogEntry, LogLevel } from '..';
import { DateTime } from 'luxon';

export class ConsoleWriter implements LogWriter {

    public static LOG_DATE_FORMAT = "HH:mm:ss.SSS";

    constructor(private readonly formatMessages: boolean = true) {
    }

    public write({ level, time, category, message } : LogEntry) : void {
        const timestamp = time ? DateTime.fromJSDate(time) : DateTime.now();
        const formattedMessage = this.formatMessages ? `${timestamp.toFormat(ConsoleWriter.LOG_DATE_FORMAT)}:: [${LogLevel[level]}] [${category}] ${message}` : message;
        switch(level) {
            case LogLevel.debug: return console.debug(formattedMessage);
            case LogLevel.warn: return console.warn(formattedMessage);
            case LogLevel.error: return console.error(formattedMessage);
            default: return console.info(formattedMessage);
        }
    }
}