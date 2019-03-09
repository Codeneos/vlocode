import * as vscode from 'vscode';
import * as path from 'path';

import VlocityDatapackService from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import datapackViewTemplate from '../views/datapack.view.html';
import webviewMessage from '../models/webviewMessage';
import VlocodeService from '../services/vlocodeService';
import { Logger, LogManager } from 'loggers';
import { container } from 'serviceContainer';

export default class ViewDatapackCommand extends DatapackCommand {
    
    constructor(name : string) {
        super(name, args => this.viewDatapack(args[0]));
    }

    protected async viewDatapack(selectedFile: vscode.Uri) {
        let viewsRoot = vscode.Uri.file(path.join(this.extensionContext.extensionPath, 'out', 'views'));
        let html = datapackViewTemplate.replace(/(vscode-resource:)/ig, `${viewsRoot.with({ scheme: 'vscode-resource' })}`);
        const panel = vscode.window.createWebviewPanel(
            'viewDatapackGeneric', // Identifies the type of the webview. Used internally
            'Datapack View', // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            { 
                enableScripts: true, 
                localResourceRoots : [ viewsRoot ] 
            }
        );        
        panel.webview.html = html;

        let datapackView = new DatapackView(panel.webview);
        datapackView.onReady(async view => {
            datapackView.updateSate({ datapack: (await this.datapackService.loadDatapack(selectedFile)).data });
        });        
    }

    protected handleWebviewPostMessage(message : webviewMessage) {
        switch(message.command) {
            case 'log': {
                return this.logger.log(message.data);
            }
            case 'ready': {
                return this.logger.log(message.data);
            }
        }
        this.logger.verbose('Unhanlded message: ' + JSON.stringify(message));
    }
}

class DatapackView {
    
    private webview: vscode.Webview;
    private readonly _onReadyEmitter = new vscode.EventEmitter<DatapackView>();
    public readonly onReady : vscode.Event<DatapackView> = this._onReadyEmitter.event;

    constructor(webview: vscode.Webview){
        this.webview = webview;
        this.webview.onDidReceiveMessage(this.handleWebviewPostMessage, this, this.extensionContext.subscriptions);
    }

    public updateSate(state : any) : Thenable<Boolean> {
        return this.postMessage({ 
            command: 'updateState', 
            data: state 
        });
    }

    protected postMessage(msg : webviewMessage) : Thenable<Boolean> {
        this.logger.verbose('DatapackView.postMessage: ' + JSON.stringify(msg));
        return this.webview.postMessage(msg);
    }

    protected get extensionContext() : vscode.ExtensionContext {
        return container.get(VlocodeService).getContext();
    }

    protected get logger() : Logger {
        return LogManager.get(DatapackView);
    }

    protected handleWebviewPostMessage(message : webviewMessage) {
        switch(message.command) {
            case 'log': {
                this.logger.log(message.data);
            } break;
            case 'ready': {
                this._onReadyEmitter.fire(this);
            } break;
            default: {
                this.logger.verbose('Unhanlded message: ' + JSON.stringify(message));
            }
        }
    }
}


