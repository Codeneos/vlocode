import { Logger, injectable } from '@vlocode/core';
import { deepCompare, sfdx, SfdxConfig } from '@vlocode/util';
import * as vscode from 'vscode';

/**
 * Manages the SFDX configuration for multiple workspace folders in a Visual Studio Code environment.
 * This class listens for changes to the SFDX configuration files and emits events when configurations are updated.
 * It also provides methods to initialize and update the SFDX configuration across all workspace folders.
 * 
 * @extends `EventEmitter`
 * @implements `vscode.Disposable`
 * 
 * @event `changed` - Emitted when the SFDX configuration changes. Provides the updated configuration, 
 *                  the changes made, and the associated workspace folder.
 */
@injectable.singleton()
export class SfdxConfigManager<T extends object = SfdxConfig> implements vscode.Disposable {

    private watcher: vscode.FileSystemWatcher | undefined;
    private configs = new Map<string, { config: T, path: string }>();
    private events = {
        change: new vscode.EventEmitter<{ 
                config: T | undefined, 
                changes: Partial<T>, 
                workspace: vscode.WorkspaceFolder 
        }>()
    };

    public get onChange() {
        return this.events.change.event;
    }

    constructor(private logger: Logger) {
        this.watcher = vscode.workspace.createFileSystemWatcher(`**/${sfdx.defaultConfigPath}`);
        this.watcher.onDidChange((e) => this.handleSfdxConfigChange(e));
    }

    public dispose() {
        this.watcher?.dispose();
        this.events.change.dispose();
        this.configs.clear();
        this.watcher = undefined;
    }

    /**
     * Initializes the SFDX configuration for all workspace folders.
     * Iterates through the available workspace folders, retrieves the SFDX configuration
     * for each folder, and stores it in the internal configuration map if found.
     * 
     * @return {Promise<SfdxConfigManager>} A promise that resolves to the SfdxConfigManager instance.
     */
    public async initialize() {
        for (const workspace of vscode.workspace.workspaceFolders ?? []) {       
            const sfdxConfig = await sfdx.getConfig<T>(workspace.uri.fsPath);
            if (sfdxConfig) {
                this.configs.set(workspace.uri.fsPath, sfdxConfig);
                this.events.change.fire({
                    config: sfdxConfig.config,
                    changes: sfdxConfig.config,
                    workspace
                });
            }
        }
        return this;
    }

    /**
     * Retrieves the value of a specified setting from the SFDX configuration.
     *
     * @template K - The key of the setting to retrieve, constrained to the keys of `SfdxConfig`.
     * @param setting - The key of the setting to retrieve.
     * @returns The value of the specified setting if it exists, or `undefined` if not found.
     */
    public get<K extends keyof T>(setting: K): T[K] | undefined {
        for (const config of this.configs.values()) {
            return config.config[setting];
        }
    }

    /**
     * Update the SFDX config with the Vlocode SFDX username for all workspaces.
     */
    public async update(config: Partial<T>) {
        for (const workspace of vscode.workspace.workspaceFolders ?? []) {
            await sfdx.setConfig(workspace.uri.fsPath, config);
        }
    }

    /**
     * Handle a change to the SFDX config file by updating the Vlocode config when the SFDX default username changes.
     * @param uri Path to the SFDX config file that changed
     */
    private async handleSfdxConfigChange(uri: vscode.Uri) {
        this.logger.verbose(`SFDX config changed: ${uri.fsPath}`);

        try {
            const workspace = vscode.workspace.getWorkspaceFolder(uri);
            if (!workspace) {
                this.logger.warn(`SFDX config change detected outside of a workspace: ${uri.fsPath}`);
                return;
            }

            const newConfig = await sfdx.getConfig<T>(uri.fsPath.slice(0, -sfdx.defaultConfigPath.length));
            const currentConfig = this.configs.get(workspace.uri.fsPath);
            const path = currentConfig?.path ?? currentConfig?.path;
            
            if (!path) {
                // This should not happen, but if it does, we log a warning and return
                return;
            }

            // Check if the config has changed
            const changedConfig = this.getChangedProperties(currentConfig?.config, newConfig?.config);
            if (Object.keys(changedConfig).length === 0) {
                this.logger.verbose(`SFDX config unchanged: ${uri.fsPath}`);
                return; // No changes detected
            }
            
            // If the config was deleted, remove it from the other wise update it
            if (!newConfig) {
                this.logger.verbose('SFDX config updated: %s', uri.fsPath);
                this.configs.delete(workspace.uri.fsPath);
            } else if (!currentConfig) {
                this.logger.verbose('SFDX config updated: %s', uri.fsPath);
                this.configs.set(workspace.uri.fsPath, newConfig);
            } else {
                this.logger.verbose('SFDX config [%s] changed: %s', () => Object.keys(changedConfig).join(', '), uri.fsPath);
                Object.assign(currentConfig.config, newConfig.config);
            }

            // Emit the changed event with the new configuration
            this.events.change.fire({
                config: newConfig?.config,
                changes: changedConfig,
                workspace
            });
        } catch (err) {
            this.logger.error('Unable to process SFDX config file change in: %s', uri.fsPath, err);
        }
    }

    private getChangedProperties(oldConfig: T | undefined, newConfig: T | undefined): Partial<T> {
        const changes: Partial<T> = {};
        const keys = new Set([ ...Object.keys(oldConfig ?? {}), ...Object.keys(newConfig?? {}) ]);
        for (const key of keys) {
            if (!deepCompare(oldConfig?.[key], newConfig?.[key])) {
                changes[key] = newConfig?.[key];
            }
        }
        return changes;
    }
}