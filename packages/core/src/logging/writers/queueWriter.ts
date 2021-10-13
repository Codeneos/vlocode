import { LogWriter, LogEntry } from '..';

export class QueueWriter implements LogWriter {

    private queue = new Array<LogEntry>();

    public flush(writers: LogWriter[], clearQueue: boolean = true) {
        this.queue.forEach(entry => writers.forEach(w => w.write(entry)));
        if (clearQueue) {
            this.queue = [];
        }
    }

    public write(entry : LogEntry) : void {
        this.queue.push(entry);
    }
}