import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import { CONFIG_FILE } from '../../constants';
import { LogManager, Logger } from '@vlocode/core';

export interface WorkspaceOverrideConfigurationChangeEvent extends vscode.ConfigurationChangeEvent {
    getAffectedConfigurationProperties(): ReadonlySet<string>;
}

export class WorkspaceOverrideConfiguration {

    private readonly overrideConfigs: {
        [workspace: string]: {
            values: object;
            watcher: vscode.FileSystemWatcher;
            fsPath: string;
        };
    } = {};
    private workspaceFolderChangeListner: vscode.Disposable;
    private readonly configurationChangedEmitter = new vscode.EventEmitter<WorkspaceOverrideConfigurationChangeEvent>();

    public get onDidConfigurationChange(){
        return this.configurationChangedEmitter.event;
    }

    private get logger(): Logger {
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
        this.configurationChangedEmitter.dispose();
    }

    public setValue(propertyPath: string, value: any) {
        const firstWorkspaceFolder = vscode.workspace.workspaceFolders?.find(ws => ws.index == 0);
        if (firstWorkspaceFolder) {
            const overrideConfig = this.overrideConfigs[firstWorkspaceFolder.uri.fsPath];
            const propertyPathParts = propertyPath.split('.');
            const lastProperty = propertyPathParts.pop();
            if (!lastProperty) {
                throw new Error('propertyPath is empty');
            }
            const target = propertyPathParts.reduce((values, prop) => values[prop] ?? (values[prop] = {}),
                overrideConfig.values ?? (overrideConfig.values = {}));
            target[lastProperty] = value;
            fs.outputJSONSync(overrideConfig.fsPath, overrideConfig.values);
        }
    }

    public getKeys() {
        const firstWorkspaceFolder = vscode.workspace.workspaceFolders?.find(ws => ws.index == 0);
        if (firstWorkspaceFolder) {
            return Object.keys(this.overrideConfigs[firstWorkspaceFolder.uri.fsPath]?.values ?? {});
        }
        return [];
    }

    public getValue(propertyPath: string) {
        const firstWorkspaceFolder = vscode.workspace.workspaceFolders?.find(ws => ws.index == 0);
        if (firstWorkspaceFolder) {
            return propertyPath.split('.').reduce((values, prop) => values && values[prop],
                this.overrideConfigs[firstWorkspaceFolder.uri.fsPath]?.values);
        }
    }

    public isSet(propertyPath: string) {
        return this.getValue(propertyPath) !== undefined;
    }

    public getFilePath() {
        const firstWorkspaceFolder = vscode.workspace.workspaceFolders?.find(ws => ws.index == 0);
        if (firstWorkspaceFolder) {
            return this.overrideConfigs[firstWorkspaceFolder.uri.fsPath].fsPath;
        }
        return undefined;
    }

    public initializeFromWorkspace() {
        for (const workspacePath of vscode.workspace.workspaceFolders ?? []) {
            this.load(workspacePath.uri.fsPath, vscode.Uri.joinPath(workspacePath.uri, CONFIG_FILE));
        }

        if (!this.workspaceFolderChangeListner) {
            this.workspaceFolderChangeListner = vscode.workspace.onDidChangeWorkspaceFolders(event => {
                event.removed.forEach(ws => this.unload(ws.uri.path));
                event.added.forEach(ws => this.load(ws.uri.path, vscode.Uri.joinPath(ws.uri, CONFIG_FILE)));
            });
        }
    }

    private unload(workspace: string) {
        if (this.overrideConfigs[workspace]) {
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

            const oldValues = config.values;
            const newValues = fs.existsSync(configPath.fsPath) ? fs.readJsonSync(configPath.fsPath) : {};
            const changedProperties = new Set(this.getChangedProperties(oldValues, newValues));
            config.values = newValues;

            // Trigger event so that actios can be triggered once a config in the overrides changes
            this.configurationChangedEmitter.fire({
                affectsConfiguration: section => changedProperties.has(section),
                getAffectedConfigurationProperties: () => changedProperties
            });
        } catch (err) {
            this.logger.error(`Error while reading override config from ${configPath.fsPath}:`, err.message);
        }
    }

    private getChangedProperties(oldConfig: object, newConfig: object, propertyPrefix?: string) : string[] {
        const changedProps = new Array<string>();
        const configKeys = new Set([...Object.keys(oldConfig || {}), ...Object.keys(newConfig || {})]);

        for (const key of configKeys) {
            const configProperty = propertyPrefix ? `${propertyPrefix}.${key}` : key;
            const oldValue = oldConfig?.[key];
            const newValue = newConfig?.[key];

            if (typeof newValue === 'object') {
                changedProps.push(...this.getChangedProperties(oldValue, newValue, configProperty));
            } else if (oldValue != newValue) {
                changedProps.push(configProperty);
            }
        }

        return changedProps;
    }

    private initializeWatcher(workspace: string, configPath: vscode.Uri) {
        const configFileWatcher = vscode.workspace.createFileSystemWatcher(configPath.fsPath, false, false, false);
        configFileWatcher.onDidChange(() => this.load(workspace, configPath));
        configFileWatcher.onDidCreate(() => this.load(workspace, configPath));
        configFileWatcher.onDidDelete(() => this.overrideConfigs[workspace].values = {});
        return configFileWatcher;
    }
}
