import * as vscode from 'vscode';
import ServiceContainer from 'serviceContainer';
import VlocodeService from 'services/vlocodeService';
import { LogManager, Logger } from 'logging';

export abstract class EventHandlerBase<T> implements vscode.Disposable {
    private eventListner : vscode.Disposable;

    constructor(event: vscode.Event<T>, protected readonly container: ServiceContainer) {
        this.eventListner = event(this.handleEventAsync, this);
    }

    public dispose() : void {
        if(this.eventListner != null) {
            this.eventListner.dispose();
            this.eventListner = null;
        }
    }

    protected get vloService() : VlocodeService {
        return this.container.get(VlocodeService);
    }

    protected get logger() : Logger {
        return LogManager.get(this.constructor.name);
    }

    private async handleEventAsync(eventObject: T) : Promise<void> {
        this.logger.info(`Handle event: ${this.constructor.name}`);
        try {
            await Promise.resolve(this.handleEvent(eventObject));
        } catch (err) {
            this.logger.error(err);
        }
    }

    protected abstract handleEvent(eventObject: T) : void | Thenable<void>;
}
