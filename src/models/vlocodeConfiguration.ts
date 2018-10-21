import * as vscode from 'vscode';
import Constants from '../constants';
import * as s from '../singleton';
import * as l from '../loggers';

export default class VlocodeConfiguration {
    public verbose: Boolean;
    public sfdxUsername: String;
    public username: String;
    public password: String;
    public loginUrl: String;
    public instanceUrl: String;
    public httpProxy: String;
    public additionalOptions: any;

    public static load(configSectionName?: string) : VlocodeConfiguration {
        let vsconfig  = vscode.workspace.getConfiguration(configSectionName || Constants.CONFIG_SECTION);
        let config = new VlocodeConfiguration();
        Object.keys(vsconfig).forEach(function(key) {
            if (vsconfig.has(key)) {
                Object.defineProperty(config, key, {
                    get: () => vsconfig.get(key),
                    set: v => vsconfig.update(key, v, false)
                });   
            }   
        });
        return config;
    }
}