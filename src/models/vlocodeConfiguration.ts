import { workspace, WorkspaceConfiguration, Disposable } from 'vscode';
import { JobOptions } from 'vlocity';

export default class VlocodeConfiguration implements JobOptions {
    constructor(
        public readonly sectionName?: string,
        public verbose?: boolean,
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
        public customJobOptionsYaml?: string,
        public deployOnSave?: boolean,
        public autoActivate?: boolean,
        public compileOnBuild?: boolean
    ) {
        return this.load(this.sectionName);
    }

    public load(configSectionName?: string) : VlocodeConfiguration {
        const vsconfig = workspace.getConfiguration(configSectionName);
        Object.keys(this).filter(key => !key.startsWith('_')).forEach(key => {    
            if (key == 'sectionName') { 
                return; 
            }
            Object.defineProperty(this, key, {
                get: () => vsconfig.get(key),
                set: v => vsconfig.update(key, v, false)
            });
        });
        return this;
    }

    public reload() : VlocodeConfiguration {
        return this.load(this.sectionName);
    }

    public watch(watcher: (config: VlocodeConfiguration) => void, thisArg?: any) : Disposable {
        const configListner = workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(this.sectionName)) {
                watcher.call(thisArg, this.reload());
            }
        });
        return configListner;
    }
}