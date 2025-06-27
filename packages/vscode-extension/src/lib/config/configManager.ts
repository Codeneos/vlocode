import * as vscode from 'vscode';

import { CONFIG_FILE } from '../../constants';
import { LogManager, Logger } from '@vlocode/core';
import { arrayMapPush, asArray, groupBy, isPromise, lazy } from '@vlocode/util';
import { WorkspaceOverrideConfiguration } from './overrideConfiguration';
import { VscodeWorkspaceConfigProvider } from './workspaceConfigProvider';
import { ConfigProxyHandler } from './proxyHandler';
import { BaseConfiguration, configurationSection } from './configBase';

export interface ConfigurationManagerWatchOptions {
    /**
     * Trigger watcher on initial value
     */
    initial?: boolean;
    /**
     * Do not use set-timeout for triggering the watchers
     */
    noInitialTimeout?: boolean;
}

export class ConfigurationManager implements VscodeWorkspaceConfigProvider {

    private readonly overrideConfig = lazy(() => this.loadOverrideConfig());
    private readonly loadedConfigSections = new Map<string, vscode.WorkspaceConfiguration>();
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

    private loadOverrideConfig() {
        const overrides = new WorkspaceOverrideConfiguration();
        overrides.onDidConfigurationChange(event => {
            const propertiesBySection = groupBy(event.getAffectedConfigurationProperties(), item => item.split('.').shift());
            for (const [section, properties] of Object.entries(propertiesBySection)) {
                this.invokeWatchers(this.load(section), properties);
            }
        });
        return overrides;
    }

    /**
     * Load a configuration section into a concrete object of type T. Allows update and retrieval as if the config was a native NodeJS object
     * @param configSectionName Section name to load
     */
    public load<T extends BaseConfiguration>(configSectionName: string): T {
        return new Proxy({} as T, new ConfigProxyHandler<T>(configSectionName, this.overrideConfig, this));
    }

    /**
     * Retrieves the VS Code workspace configuration for a specified configuration section.
     * If the configuration is not already cached, it initializes and caches it.
     * Automatically reloads the configuration when it changes and invokes watchers for updated properties.
     *
     * @param configSectionName - The name of the configuration section to retrieve.
     * @returns The workspace configuration for the specified section.
     */
    public getVscodeConfiguration(configSectionName: string) {
        let workspaceConfig = this.loadedConfigSections.get(configSectionName);
        if (!workspaceConfig) {
            // Init config in cache
            workspaceConfig = vscode.workspace.getConfiguration(configSectionName);
            this.loadedConfigSections.set(configSectionName, workspaceConfig);

            // Reload config when it changes so that all underlying objects use new update config
            this.disposables.push(vscode.workspace.onDidChangeConfiguration(changeEvent => {
                if (changeEvent.affectsConfiguration(configSectionName)) {
                    // Update config
                    this.loadedConfigSections.set(configSectionName, vscode.workspace.getConfiguration(configSectionName));
                    const config = this.load(configSectionName);

                    // Invoke watchers
                    const changedProperties = this.getChangedProperties(config, configSectionName, changeEvent);
                    const overridenProperties = changedProperties.filter(prop => this.overrideConfig.isSet(prop));

                    if (overridenProperties.length) {
                        const overridesPath = this.overrideConfig.getFilePath();
                        void vscode.window.showErrorMessage(
                            `Config hange of ${overridenProperties[0]} is ignored, a value for this is already defined in ${CONFIG_FILE}`,
                            `Open ${CONFIG_FILE}`).then(value => value && overridesPath && void vscode.window.showTextDocument(vscode.Uri.file(overridesPath)));
                    }

                    this.invokeWatchers(config, changedProperties.filter(prop => !overridenProperties.includes(prop)));
                }
            }));
        }
        return workspaceConfig;
    }

    /**
     * Get the changed between the new and old config
     * @param oldConfig Old config
     */
    private getChangedProperties(config: object, sectionPrefix: string, changeEvent: vscode.ConfigurationChangeEvent) : string[] {
        const changedProps = new Array<string>();
        const configKeys = new Set(Object.keys(config || {}));

        for (const key of configKeys) {
            const value = config?.[key];
            const configProperty = `${sectionPrefix}.${key}`;

            // Do not compare symbols and function
            if (typeof value === 'function' || typeof value === 'symbol') {
                continue;
            }

            if (changeEvent.affectsConfiguration(configProperty)) {
                changedProps.push(configProperty);
                if (typeof value === 'object') {
                    changedProps.push(...this.getChangedProperties(value, configProperty, changeEvent));
                }
            }
        }

        return changedProps;
    }

    private invokeWatchers(newConfig: BaseConfiguration, properties: Iterable<string>) {
        // property watcher
        for (const property of properties) {
            const sectionName = property.split('.').shift()!;
            let watchers = this.watchers.get(property) ?? [];
            if (sectionName != property) {
                watchers = (this.watchers.get(sectionName) ?? []).concat(watchers);
            }
            const affectedConfig = property.split('.').slice(1, -1).reduce((config, section) => config[section], newConfig);
            this.logger.verbose(`Detected property change for: ${property} (watcher-size: ${watchers.length})`);
            for (const watcher of watchers) {
                void Promise.resolve(watcher(affectedConfig)).catch(err => {
                    this.logger.error(`Error in config watcher for property ${property}:`, err);
                });
            }
        }
    }

    public onConfigChange<T extends BaseConfiguration>(config: string | T, properties: keyof T, watcher: (config: T) => any | Promise<any>, options?: ConfigurationManagerWatchOptions) : vscode.Disposable;
    public onConfigChange<T extends BaseConfiguration>(config: string | T, properties: Array<keyof T>, watcher: (config: T) => any | Promise<any>, options?: ConfigurationManagerWatchOptions) : vscode.Disposable;
    public onConfigChange<T extends BaseConfiguration>(config: string | T, properties: Array<keyof T> | keyof T, watcher: (config: T) => any | Promise<any>, options?: ConfigurationManagerWatchOptions) : vscode.Disposable {
        const sectionName = typeof config === 'string' ? config : config[configurationSection] as string;
        return this.registerWatcher(asArray(properties).map(property => `${sectionName}.${String(property)}`), watcher, options);
    }

    public watch<T extends BaseConfiguration>(config: string | T, watcher: (config: T) => any | Promise<any>) : vscode.Disposable {
        const sectionName = typeof config === 'string' ? config : config[configurationSection] as string;
        return this.registerWatcher([ sectionName ], watcher);
    }

    private registerWatcher<T extends BaseConfiguration>(watchKeys: string[], watcher: (config: T) => any | Promise<any>, options?: ConfigurationManagerWatchOptions) : vscode.Disposable {
        for (const property of watchKeys) {
            this.logger.verbose(`Register config watcher for: ${property}`);
            arrayMapPush(this.watchers, property, watcher);
        }

        // trigger for existing
        if (options?.initial) {
            const sections = new Set(watchKeys.map(prop => prop.split('.')[0]));
            for (const section of sections) {
                const properties = watchKeys.filter(prop => prop.startsWith(`${section}.`));
                if (properties.length) {
                    options.noInitialTimeout ? this.invokeWatchers(this.load(section), properties)
                        : setImmediate(() => this.invokeWatchers(this.load(section), properties));
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
};