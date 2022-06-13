import { decorate } from "@vlocode/util";
import { LogEntry, Logger } from "./logger";

export class DistinctLogger extends decorate(Logger) {
    private  uniqueMessages = new Set<String>();    
    public writeEntry(entry: LogEntry) : void {
        if (this.uniqueMessages.has(entry.message)) {
            return;
        }
        this.uniqueMessages.add(entry.message);
        this.inner.writeEntry(entry);
    }
}