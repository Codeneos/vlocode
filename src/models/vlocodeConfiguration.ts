import { workspace, WorkspaceConfiguration, Disposable } from 'vscode';
import { JobOptions } from 'vlocity';

export default class VlocodeConfiguration implements JobOptions {
    constructor(
        public readonly sectionName?: string,
        public verbose?: boolean,
        public activate?: boolean,
        public debug?: boolean,
        public sfdxUsername?: string,
        public username?: string,
        public password?: string,
        public loginUrl?: string,
        public instanceUrl?: string,
        public httpProxy?: string,
        public additionalOptions?: any,
        public projectPath?: string,
        public maxDepth?: number,
        public customJobOptionsYaml?: string
    ) { }

    public static load(configSectionName: string, assingTo?: VlocodeConfiguration) : VlocodeConfiguration {
        const vloConfig = assingTo || new VlocodeConfiguration(configSectionName);
        const vsconfig = workspace.getConfiguration(configSectionName);
        Object.keys(vloConfig).filter(key => !key.startsWith('_')).forEach(key => {    
            if (key == 'sectionName') { 
                return; 
            }
            Object.defineProperty(vloConfig, key, {
                get: () => vsconfig.get(key),
                set: v => vsconfig.update(key, v, false)
            });
        });
        return vloConfig;
    }

    public static watch(config: VlocodeConfiguration, watcher: (config: VlocodeConfiguration) => void, thisArg?: any) : Disposable {
        const vloConfig = VlocodeConfiguration.load(config.sectionName, config);
        const configListner = workspace.onDidChangeConfiguration(e => { 
            if (e.affectsConfiguration(config.sectionName)) {
                watcher.call(thisArg, VlocodeConfiguration.load(config.sectionName, config));
            }
        });
        return configListner;
    }
}