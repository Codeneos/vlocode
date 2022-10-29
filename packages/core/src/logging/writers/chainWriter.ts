import { LogWriter, LogEntry } from '..';

export class ChainWriter implements LogWriter {
    private readonly chain: LogWriter[];

    constructor(...args: LogWriter[]) {
        this.chain = args || [];
    }

    public append(...writers: LogWriter[]) {
        this.chain.push(...writers);
    }

    public write(entry : LogEntry): void {
        this.chain.map(writer => writer.write(entry));
    }
}
