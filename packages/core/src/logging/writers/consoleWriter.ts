import { LogWriter, LogEntry, LogLevel } from '..';
import * as moment from 'moment';

export class ConsoleWriter implements LogWriter {

    public static LOG_DATE_FORMAT = "HH:mm:ss.SS";

    public write({ level, time, category, message } : LogEntry) : void {
        const formattedMessage = `${moment(time).format(ConsoleWriter.LOG_DATE_FORMAT)}:: [${LogLevel[level]}] [${category}]: ${message}`;
        switch(level) {
            case LogLevel.warn: return console.warn(formattedMessage);
            case LogLevel.error: return console.error(formattedMessage);
            default: return console.info(formattedMessage);
        }
    }
}