import * as constants from '@constants'
import { LogWriter, LogEntry, LogLevel } from "logging";
import moment = require('moment');

export class ConsoleWriter implements LogWriter {
    public write({ level, time, category, message } : LogEntry) : void {
        const formatedMessage = `${moment(time).format(constants.LOG_DATE_FORMAT)}:: [${LogLevel[level]}] [${category}]: ${message}`;
        switch(level) {
            case LogLevel.warn: return console.warn(formatedMessage);
            case LogLevel.error: return console.error(formatedMessage);
            default: return console.info(formatedMessage);
        }
    }
}