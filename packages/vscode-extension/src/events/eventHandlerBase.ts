import * as vscode from 'vscode';
import { LogManager, Logger } from '@vlocode/core';
import VlocodeService from '../lib/vlocodeService';

export abstract class EventHandlerBase<T> implements vscode.Disposable {
    private eventListner: vscode.Disposable | null;

    constructor(event: vscode.Event<T>, protected vloService: VlocodeService) {
        this.eventListner = event(this.handleEventAsync.bind(this));
    }

    public dispose() : void {
        if(this.eventListner != null) {
            this.eventListner.dispose();
            this.eventListner = null;
        }
    }

    protected get logger() : Logger {
        return LogManager.get('EventHandler');
    }

    private async handleEventAsync(eventObject: T) : Promise<void> {
        try {
            await Promise.resolve(this.handleEvent(eventObject));
        } catch (err) {
            this.logger.error(err);
        }
    }

    protected abstract handleEvent(eventObject: T) : void | Thenable<void>;
}
