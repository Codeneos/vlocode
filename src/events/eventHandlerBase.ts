import * as vscode from 'vscode';
import VlocodeService from 'lib/vlocodeService';
import { LogManager, Logger } from 'lib/logging';

export abstract class EventHandlerBase<T> implements vscode.Disposable {
    private eventListner: vscode.Disposable | null;

    constructor(event: vscode.Event<T>, protected vloService: VlocodeService) {
        this.eventListner = event(this.handleEventAsync, this);
    }

    public dispose() : void {
        if(this.eventListner != null) {
            this.eventListner.dispose();
            this.eventListner = null;
        }
    }

    protected get logger() : Logger {
        return LogManager.get(this.constructor.name);
    }

    private async handleEventAsync(eventObject: T) : Promise<void> {
        this.logger.debug(`Handle event: ${this.constructor.name}`);
        try {
            await Promise.resolve(this.handleEvent(eventObject));
        } catch (err) {
            this.logger.error(err);
        }
    }

    protected abstract handleEvent(eventObject: T) : void | Thenable<void>;
}
