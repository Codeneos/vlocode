import { decorate } from "@vlocode/util";
import { Logger, LogEntry } from '.';

export class DistinctLogger extends decorate(Logger) {
    private  uniqueMessages = new Set<string>();    
    public writeEntry(entry: LogEntry) : void {
        if (this.uniqueMessages.has(entry.message)) {
            return;
        }
        this.uniqueMessages.add(entry.message);
        this.inner.writeEntry(entry);
    }
}