import * as vscode from 'vscode';
import Constants from '../constants';

export interface IVlocodeConfiguration {
    verbose: Boolean;
    sfdxUsername: String;
    username: String;
    password: String;
    loginUrl: String;
    instanceUrl: String;
    httpProxy: String;
    additionalOptions: any;
}

/**
 * Model that represents the VS Code configuration for Vlocode
 */
export default class VlocodeConfiguration implements IVlocodeConfiguration {
    private config : vscode.WorkspaceConfiguration; 

    get verbose(): Boolean { return this.config.get('verbose'); }
    get sfdxUsername(): String { return this.config.get('sfdxUsername'); }
    get username(): String { return this.config.get('username'); }
    get password(): String { return this.config.get('password'); }
    get loginUrl(): String { return this.config.get('loginUrl'); }
    get instanceUrl(): String { return this.config.get('instanceUrl'); }
    get httpProxy(): String { return this.config.get('httpProxy'); }
    get additionalOptions(): any { return this.config.get('additionalOptions', {}); }

    constructor();
    constructor(configSectionName?: string){
        this.config = vscode.workspace.getConfiguration(configSectionName || Constants.CONFIG_SECTION);
    }

    public toObject() : IVlocodeConfiguration {
        return <IVlocodeConfiguration> this.deepClone(this);
    }

    private deepClone(source : any, target?: any) : any {
        target = target || {};
        for (let key in source) {
            if(source[key] !== null && typeof source[key] === 'object')  {
                this.deepClone(source[key], target[key] = {});
            } else {
                target[key] = source[key];
            }            
        }
        return target;
    }
}