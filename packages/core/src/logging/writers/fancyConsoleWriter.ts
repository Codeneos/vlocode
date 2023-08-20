import { LogWriter, LogEntry, LogLevel } from '..';
import chalk from 'chalk';
import { DateTime } from 'luxon';

export class FancyConsoleWriterOptions { 
    formatMessage: boolean; 
    useColor: boolean; 
    dateFormat: string;
    terminalEol: string;
}

export class FancyConsoleWriter implements LogWriter {

    private readonly options: FancyConsoleWriterOptions;
    private readonly chalk = new chalk.Instance({ level: 2 });
    private readonly colors = {
        [LogLevel.debug]: this.chalk.magenta,
        [LogLevel.verbose]: this.chalk.dim,
        [LogLevel.info]: this.chalk.green,
        [LogLevel.warn]: this.chalk.yellowBright,
        [LogLevel.error]: this.chalk.bold.redBright,
        [LogLevel.fatal]: this.chalk.bold.redBright,
    };

    constructor(options?: FancyConsoleWriterOptions) {
        this.options = {
            formatMessage: true,
            useColor: true,
            dateFormat: 'HH:mm:ss.SSS',
            terminalEol: '\n',
            ...options ?? {}
        };
    }

    public write(entry : LogEntry) : void {
        const formattedMessage = this.options.formatMessage ? this.format(entry) : entry.message;
        switch(entry.level) {
            case LogLevel.debug: return console.debug(formattedMessage);
            case LogLevel.warn: return console.warn(formattedMessage);
            case LogLevel.error: return console.error(formattedMessage);
            default: return console.info(formattedMessage);
        }
    }

    public format(entry: LogEntry) {
        const levelColor = (this.colors[entry.level] || this.chalk.grey);
        const logLevelName = levelColor(`[${LogLevel[entry.level]}]`);
        const timestamp = this.chalk.white(`[${this.chalk.dim(`${DateTime.fromJSDate(entry.time).toFormat(this.options.dateFormat)}`)}]`);
        const category = this.chalk.white(`[${entry.category}]`);

        let messageBody = entry.message.replace(/\r/g,'').replace(/\n/g, this.options.terminalEol);
        if (entry.level >= LogLevel.warn) {
            messageBody = levelColor(messageBody);
        } else if (entry.level == LogLevel.verbose) {
            messageBody = levelColor(messageBody);
        }
        
        return `${timestamp} ${category} ${logLevelName} ${messageBody}`;
    }
}