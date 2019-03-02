import * as vscode from 'vscode';
import { container } from 'serviceContainer';
import CommandRouter from 'services/commandRouter';
import { VlocodeCommand } from 'commands';
import VlocodeService from 'services/vlocodeService';
import { LogManager, Logger } from 'loggers';

export abstract class EventHandlerBase<T> implements vscode.Disposable {
    private eventListner : vscode.Disposable;

    constructor(event: vscode.Event<T>) {
        this.eventListner = event(this.handleEvent, this);
    }

    public dispose() : void {
        if(this.eventListner != null) {
            this.eventListner.dispose();
            this.eventListner = null;
        }
    }

    protected get vloService() : VlocodeService {
        return container.get(VlocodeService);
    }

    protected get extensionContext() : vscode.ExtensionContext {
        return this.vloService.getContext();
    }

    protected get logger() : Logger {
        return LogManager.get(this.constructor.name);
    }

    private async _handleEvent(eventObject: T) : Promise<void> {
        this.logger.info(`Handle event: ${this.constructor.name}`);
        try {
            await Promise.resolve(this.handleEvent(eventObject));
        } catch (err) {
            this.logger.error(err);
        }
    }

    protected abstract handleEvent(eventObject: T) : void | Thenable<void>;
}
