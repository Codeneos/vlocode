import { workspace, WorkspaceConfiguration, Disposable, Uri } from 'vscode';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import { CONFIG_FILE } from '@constants';
import { singleton } from './util/singleton';
import { LogManager, Logger } from './logging';
import { arrayMapPush } from './util/collection';
import { lazy } from './util/lazy';

interface ConfigurationManagerWatchOptions {
    /**
     * Trigger watcher on initial value
     */
    initial?: boolean;
}

interface VscodeWorkspaceConfigProvider {
    getVscodeConfiguration(section: string): WorkspaceConfiguration;
}

const sectionNameSymbol = Symbol();

class ConfigProxyHandler<T extends object> implements ProxyHandler<T> {

    public constructor(
        private readonly configSectionName: string,
        private readonly overrides: WorkspaceOverrideConfiguration,
        private readonly configProvider: VscodeWorkspaceConfigProvider) {
    }

    public get(target: T, key: string | symbol) {
        if (key == sectionNameSymbol) {
            return this.configSectionName;
        }
        if (typeof key === 'symbol' || typeof target[key] === 'function') {
            return target[key];
        }
        const value = this.getWorkspaceConfiguration().get(key.toString());
        if (typeof value === 'object' && value !== null) {
            return this.wrapInProxy(key, value);
        }
        const override = this.overrides.getValue(key);
        if (override !== undefined) {
            return override;
        }
        return value;
    }

    public set(target: any | T, key: string | symbol, value: any) {
        if (typeof key === 'symbol') {
            target[key] = value;
        } else {
            void this.getWorkspaceConfiguration().update(key.toString(), value, false);
        }
        return true;
    }

    public ownKeys() {
        return Object.getOwnPropertyNames(this.getWorkspaceConfiguration());
    }

    private getWorkspaceConfiguration() {
        return this.configProvider.getVscodeConfiguration(this.configSectionName);
    }

    private wrapInProxy<T extends Object>(propertyPath: string | symbol | number, value: T) : T {
        return new Proxy(value, {
            get: (target, key) => {
                const value = target[key];
                const fullPropertyPath = `${propertyPath.toString()}.${key.toString()}`;
                if (typeof value === 'object' && value !== null) {
                    return this.wrapInProxy(fullPropertyPath, value);
                }
                const override = this.overrides.getValue(fullPropertyPath);
                if (override !== undefined) {
                    return override;
                }
                return value;
            },
            set: (target, key, newValue) => {
                return this.set(value, `${propertyPath.toString()}.${key.toString()}`, newValue);
            }
        });
    }
}

class WorkspaceOverrideConfiguration {

    private readonly overrideConfigs: {
        [workspace: string]: {
            values: object;
            watcher: vscode.FileSystemWatcher;
            fsPath: string;
        };
    } = {};
    private workspaceFolderChangeListner: Disposable;

    private get logger() : Logger {
        return LogManager.get('WorkspaceOverrideConfiguration');
    }

    constructor() {
        this.initializeFromWorkspace();
    }

    public dispose() {
        for (const override of Object.values(this.overrideConfigs)) {
            override.watcher.dispose();
        }
        this.workspaceFolderChangeListner.dispose();
    }

    public getValue(propertyPath: string) {
        const firstWorkspaceFolder = workspace.workspaceFolders?.find(ws => ws.index == 0);
        if (firstWorkspaceFolder) {
            return propertyPath.split('.').reduce((values, prop) => values && values[prop],
                this.overrideConfigs[firstWorkspaceFolder.uri.fsPath]?.values);
        }
    }

    public initializeFromWorkspace() {
        for (const workspacePath of workspace.workspaceFolders ?? []) {
            this.load(workspacePath.uri.fsPath, Uri.joinPath(workspacePath.uri, CONFIG_FILE));
        }

        if (!this.workspaceFolderChangeListner) {
            this.workspaceFolderChangeListner = workspace.onDidChangeWorkspaceFolders(event => {
                event.removed.forEach(ws => this.unload(ws.uri.path));
                event.added.forEach(ws => this.load(ws.uri.path, Uri.joinPath(ws.uri, CONFIG_FILE)));
            });
        }
    }

    private unload(workspace: string) {
        if(this.overrideConfigs[workspace]) {
            this.overrideConfigs[workspace].watcher.dispose();
            // eslint-disable-next-line @typescript-eslint/tslint/config
            delete this.overrideConfigs[workspace];
        }
    }

    private load(workspace: string, configPath: vscode.Uri) {
        // Init config struct
        const config = this.overrideConfigs[workspace] ?? (this.overrideConfigs[workspace] = {
            values: {},
            fsPath: configPath.fsPath,
            watcher: this.initializeWatcher(workspace, configPath),
        });

        // load
        try {
            this.logger.verbose(`Loading workspace overrides from: ${configPath.fsPath}`);
            config.values = fs.existsSync(configPath.fsPath) ? fs.readJsonSync(configPath.fsPath) : {};
        } catch(err) {
            this.logger.error(`Error while reading override config from ${configPath.fsPath}:`, err.message);
        }
    }

    private initializeWatcher(workspace: string, configPath: vscode.Uri) {
        const configFileWatcher = vscode.workspace.createFileSystemWatcher(configPath.fsPath, false, false, false);
        configFileWatcher.onDidChange(() => this.load(workspace, configPath));
        configFileWatcher.onDidCreate(() => this.load(workspace, configPath));
        configFileWatcher.onDidDelete(() => this.overrideConfigs[workspace].values = {});
        return configFileWatcher;
    }
}

export const ConfigurationManager = singleton(class ConfigurationManager implements VscodeWorkspaceConfigProvider {

    private readonly overrideConfig = lazy(() => new WorkspaceOverrideConfiguration());
    private readonly loadedConfigSections = new Map<string, WorkspaceConfiguration>();
    private readonly watchers = new Map<string, ((config: any) => any | Promise<any>)[]>();
    private disposables: Array<{ dispose() : any }> = [];

    protected get logger() : Logger {
        return LogManager.get('ConfigurationManager');
    }

    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];
        this.watchers.clear();
        this.loadedConfigSections.clear();
        this.overrideConfig.dispose();
    }

    /**
     * Load a configuration section into a concrete object of type T. Allows update and retrieval as if the config was a native NodeJS object
     * @param configSectionName Section name to load
     */
    public load<T extends Object>(configSectionName: string): T {
        return new Proxy({} as T, new ConfigProxyHandler<T>(configSectionName, this.overrideConfig, this));
    }

    public getVscodeConfiguration(configSectionName: string) {
        let workspaceConfig = this.loadedConfigSections.get(configSectionName);
        if (!workspaceConfig) {
            // Init config in cache
            workspaceConfig = workspace.getConfiguration(configSectionName);
            this.loadedConfigSections.set(configSectionName, workspaceConfig);
            // Reload config when it changes so that all underlying objects use new update config
            this.disposables.push(workspace.onDidChangeConfiguration(changeEvent => {
                if (changeEvent.affectsConfiguration(configSectionName)) {
                    // Update config
                    const newConfig = workspace.getConfiguration(configSectionName);
                    const oldConfig = this.loadedConfigSections.get(configSectionName);
                    this.loadedConfigSections.set(configSectionName, newConfig);
                    // Invoke watchers
                    const changes = this.getPropertiesChanges(oldConfig, newConfig);
                    this.invokeWatchers(configSectionName, newConfig, changes);
                }
            }));
        }
        return workspaceConfig;
    }

    /**
     * Get the changed between the new and old config
     * @param oldConfig Old config
     * @param newConfig Newly loaded config
     */
    private getPropertiesChanges(oldConfig: WorkspaceConfiguration | undefined, newConfig: WorkspaceConfiguration | undefined) : string[] {
        const changedProps = new Array<string>();
        const configKeys = new Set([...Object.keys(newConfig || {}), ...Object.keys(oldConfig || {})]);
        for (const key of configKeys) {
            const oldValue = oldConfig && oldConfig[key];
            const newValue = newConfig && newConfig[key];

            // DO not compare symbols and function
            if (typeof oldValue === 'function' || typeof oldValue === 'symbol') {
                continue;
            }

            // deep compare on object property
            if (typeof oldValue === 'object') {
                changedProps.push(...this.getPropertiesChanges(oldValue, newValue).map(p => `${key}.${p}`));
            }  else if(newValue != oldValue) {
                changedProps.push(key);
            }
        }
        return changedProps;
    }

    private invokeWatchers(sectionName: string, newConfig: WorkspaceConfiguration, properties: string[]) {
        // property watcher
        for (const property of properties) {
            const watchers = this.watchers.get(`${sectionName}.${property}`) || [];
            this.logger.verbose(`Detected property change for: ${sectionName}.${property} (watcher-size: ${watchers.length})`);
            for (const watcher of watchers) {
                Promise.resolve(watcher(newConfig)).catch(err => {
                    this.logger.error(`Error in config watcher for property ${property}:`, err);
                });
            }
        }
        // Section watchers
        for (const watcher of this.watchers.get(`${sectionName}`) || []) {
            this.logger.verbose(`Invoke section watcher for config change in: ${sectionName}`);
            Promise.resolve(watcher(newConfig)).catch(err => {
                this.logger.error(`Error in config watcher for section ${sectionName}:`, err);
            });
        }
    }

    public watchProperties<T extends Object>(config: string | T, properties: Array<(keyof T) | string>, watcher: (config: T) => any | Promise<any>, options?: ConfigurationManagerWatchOptions) : Disposable {
        const sectionName = typeof config === 'string' ? config : config[sectionNameSymbol] as string;
        return this.registerWatcher(properties.map(property => `${sectionName}.${property}`), watcher, options);
    }

    public watch<T extends Object>(config: string | T, watcher: (config: T) => any | Promise<any>) : Disposable {
        const sectionName = typeof config === 'string' ? config : config[sectionNameSymbol] as string;
        return this.registerWatcher([ sectionName ], watcher);
    }

    private registerWatcher<T extends Object>(watchKeys: string[], watcher: (config: T) => any | Promise<any>, options?: ConfigurationManagerWatchOptions) : Disposable {
        for (const property of watchKeys) {
            this.logger.verbose(`Register config watcher for: ${property}`);
            arrayMapPush(this.watchers, property, watcher);
        }

        // trigger for existing
        if (options?.initial) {
            const sections = new Set(watchKeys.map(prop => prop.split('.')[0]));
            for (const section of sections) {
                for (const config of this.loadedConfigSections.values()) {
                    const properties = watchKeys.filter(prop => prop.startsWith(`${section}.`)).map(prop => prop.split('.').slice(1).join('.'));
                    setTimeout(() => this.invokeWatchers(section, config, properties), 0);
                }
            }
        }

        // Delete all watchers on dispose
        return {
            dispose: () => {
                for (const property of watchKeys) {
                    const watchers = this.watchers.get(property);
                    if (watchers) {
                        const index = watchers.indexOf(watcher);
                        if (index != -1) {
                            watchers.splice(index, 1);
                        }
                    }
                }
            }
        };
    }
});