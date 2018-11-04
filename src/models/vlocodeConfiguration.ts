import * as vscode from 'vscode';

export default class VlocodeConfiguration {

    private _onChangeEmitter: vscode.EventEmitter<VlocodeConfiguration> = new vscode.EventEmitter<VlocodeConfiguration>();
    private _onDispose: (VlocodeConfiguration) => void;

    constructor(
        public verbose?: Boolean,
        public sfdxUsername?: String,
        public username?: String,
        public password?: String,
        public loginUrl?: String,
        public instanceUrl?: String,
        public httpProxy?: String,
        public additionalOptions?: any,
        public projectPath?: String,
        public maxDepth?: Number
    ) { }

    public dispose() {
        if(this._onChangeEmitter != null) {
            this._onChangeEmitter.dispose();
            this._onChangeEmitter = null;
        }
        !this._onDispose || this._onDispose(this);
    }

    public static fromWorkspaceConfiguration(configSectionName: string, assingTo?: VlocodeConfiguration) : VlocodeConfiguration {
        const vloConfig = assingTo || new VlocodeConfiguration();
        const vsconfig = vscode.workspace.getConfiguration(configSectionName);
        Object.keys(vloConfig).filter(key => !key.startsWith('_')).forEach(key => {            
            Object.defineProperty(vloConfig, key, {
                get: () => {
                    return vsconfig.get(key);
                },
                set: v => {
                    vsconfig.update(key, v, false);
                    vloConfig._onChangeEmitter.fire(vloConfig);
                }
            });
        });
        const configListner = vscode.workspace.onDidChangeConfiguration(e => { 
            if(e.affectsConfiguration(configSectionName)) {
                vloConfig._onChangeEmitter.fire(vloConfig);
            }
        });
        vloConfig._onDispose = () => configListner.dispose();
        return vloConfig;
    }
}