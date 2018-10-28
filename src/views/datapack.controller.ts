
import WebviewMessage from '../models/webviewMessage';
import { debug } from 'util';

declare var acquireVsCodeApi: () => IVsCodeApi;

interface IVsCodeApi {
    postMessage(msg: WebviewMessage);
}

export default class DatapackController implements ng.IComponentController {
    private _vscode;
    private scope;

    constructor($scope: ng.IScope) {
        console.log('CTOR DatapackController');
        console.log(Array.from(arguments));  
        this._vscode = acquireVsCodeApi();
        this.scope = $scope;
        this.scope.datapack = {name: 'a'};
    }  

    private listenForStateUpdates(){
        window.addEventListener('message', event => { 
            this.log('receiveMessage: ' + JSON.stringify(event.data));
            this.handleMessage(<WebviewMessage>event.data);
        });
    }

    private handleMessage(msg: WebviewMessage){
        switch(msg.command) {
            case 'updateState': {
                this.log('Updating view state...');
                Object.keys(msg.data).forEach(key => { this.scope[key] = msg.data[key];});
                this.scope.$digest();
            } break;
            default: {
                this.log('Unhandled WebviewMessage received from host: ' + msg.command);
            } break;
        }
    }

    private reportInitialize(){
        this._vscode.postMessage({ 
            command: 'ready'
        });
    }

    private log(...args){
        this._vscode.postMessage({ 
            command: 'log',
            data: args
        });
    }

    public $onInit () {
        this.log('$onInit: DatapackController');    
        this.listenForStateUpdates();    
        this.reportInitialize();
    }
}