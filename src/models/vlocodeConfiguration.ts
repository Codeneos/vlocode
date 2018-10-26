import * as vscode from 'vscode';
import Constants from '../constants';
import * as s from '../singleton';
import * as l from '../loggers';

export default class VlocodeConfiguration {
    public verbose?: Boolean;
    public sfdxUsername?: String;
    public username?: String;
    public password?: String;
    public loginUrl?: String;
    public instanceUrl?: String;
    public httpProxy?: String;
    public additionalOptions?: any;
    public projectPath?: String;
    public maxDepth?: Number;
    private vsconfig: vscode.WorkspaceConfiguration;

    private loadFrom(config: vscode.WorkspaceConfiguration) : void {
        this.vsconfig = config;
        Object.keys(config).forEach(key => {
            if (this.vsconfig.has(key)) {
                Object.defineProperty(this, key, {
                    get: () => this.vsconfig.get(key),
                    set: v => this.vsconfig.update(key, v, false)
                });   
            }   
        });
    }

    private listenForChanges(configSectionName?: string) {
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(Constants.CONFIG_SECTION)) {
                s.get(l.Logger).verbose(`Observed configiration change in ${Constants.CONFIG_SECTION}; reloading config...`);
                this.loadFrom(vscode.workspace.getConfiguration(configSectionName));
            }
        })
    }

    public static load(configSectionName?: string) : VlocodeConfiguration {
        let config = new VlocodeConfiguration();
        let vsconfig = vscode.workspace.getConfiguration(configSectionName || Constants.CONFIG_SECTION);        
        config.loadFrom(vsconfig);
        config.listenForChanges(configSectionName || Constants.CONFIG_SECTION);
        return config;
    }
}