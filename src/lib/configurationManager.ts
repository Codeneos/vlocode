import { workspace, WorkspaceConfiguration, Disposable, EventEmitter, Event } from 'vscode';
import { singleton } from './util/singleton';
import { LogManager, Logger } from './logging';
import { arrayMapPush } from './util/collection';

export const ConfigurationManager = singleton(class ConfigurationManager {

    private readonly loadedConfigSections = new Map<string, WorkspaceConfiguration>();
    private readonly watchers = new Map<string, ((config: any) => void | Promise<void>)[]>();
    private disposables: {dispose() : any}[] = [];
    private readonly sectionNameSymbol = Symbol();

    protected get logger() : Logger {
        return LogManager.get('ConfigurationManager');
    }

    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];
        this.watchers.clear();
        this.loadedConfigSections.clear();
    }

    /**
     * Load a configuration section into a concrete object of type T. Allows update adn retrieval as if the config was a native NodeJS object
     * @param configSectionName Section name to load
     */
    public load<T extends Object>(configSectionName: string): T {
        const proxyConfig = new Proxy({} as T, {
            get: (target, key, receiver) => {
                if (key == this.sectionNameSymbol) {
                    return configSectionName;
                }
                const workspaceConfig = this.getWorkspaceConfiguration(configSectionName);
                const value = workspaceConfig.get(key.toString());
                if (typeof value === 'object' && value !== null) {
                    return this.wrapInProxy(proxyConfig, key, value);
                }
                return value;
            },
            set: (target, key, value, receiver) => {
                const workspaceConfig = this.getWorkspaceConfiguration(configSectionName);
                void workspaceConfig.update(key.toString(), value, false);
                return true;
            },
            ownKeys: target => {
                return Object.getOwnPropertyNames(this.getWorkspaceConfiguration(configSectionName));
            }
        });
        return proxyConfig;
    }

    private wrapInProxy<T extends Object>(parent: any, propertyName: string | symbol | number, value: T) : T {
        const wrapInProxy = this.wrapInProxy.bind(this);
        return new Proxy(value, {
            get(target, key) {
                const value = target[key];
                if (typeof value === 'object') {
                    return wrapInProxy(this, key, value);
                }
                return value;
            },
            set(target, key, value, receiver) {
                // const parentUpdate = { ...target, [key]: value };
                parent[`${propertyName.toString()}.${key.toString()}`] = value;
                return true;
            }
        });
    }

    private getWorkspaceConfiguration(configSectionName: string ) {
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

    public watchProperties<T extends Object>(config: string | T, properties: string[], watcher: (config: T) => void | Promise<void>) : Disposable {
        const sectionName = typeof config === 'string' ? config : config[this.sectionNameSymbol] as string;
        return this.registerWatcher(properties.map(property => `${sectionName}.${property}`), watcher);
    }

    public watch<T extends Object>(config: string | T, watcher: (config: T) => void | Promise<void>) : Disposable {
        const sectionName = typeof config === 'string' ? config : config[this.sectionNameSymbol] as string;
        return this.registerWatcher([ sectionName ], watcher);
    }

    private registerWatcher<T extends Object>(watchKeys: string[], watcher: (config: T) => void | Promise<void>) : Disposable {
        for (const property of watchKeys) {
            this.logger.verbose(`Register config watcher for: ${property}`);
            arrayMapPush(this.watchers, property, watcher);
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