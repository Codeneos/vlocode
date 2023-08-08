import { Logger, FileSystem, injectable } from '@vlocode/core';
import { SfdxConfig, sfdx } from '@vlocode/util';
import * as vscode from 'vscode';
import VlocodeConfiguration from './vlocodeConfiguration';
import { ConfigurationManager } from './config';

/**
 * Class that watches for changes to the SFDX config file and updates the default username in the Vlocode configuration
 */
@injectable()
export class SfdxConfigWatcher implements vscode.Disposable {
    private watcher: vscode.FileSystemWatcher | undefined;

    constructor(
        private vlocodeConfig: VlocodeConfiguration, 
        private fs: FileSystem, 
        private logger: Logger
    ) {
        this.watcher = vscode.workspace.createFileSystemWatcher(`**/${sfdx.defaultConfigPath}`);
        this.watcher.onDidChange((e) => this.handleSfdxConfigChange(e));
        ConfigurationManager.onConfigChange(this.vlocodeConfig, 'sfdxUsername', c => this.handleVlocodeConfigChange(c));
    }

    public dispose() {
        this.watcher?.dispose();
        this.watcher = undefined;
    }

    /**
     * Initialize the SFDX config watcher. If the Vlocode config has a SFDX username set, update the SFDX config file with the new username.
     * @returns This instance
     */
    public async initialize(): Promise<this> {
        if (this.vlocodeConfig.sfdxUsername) {
            await this.updateSfdxUsernames();
        } else {
            await this.syncWithSfdxUsernames();
        }
        return this;
    }

    /**
     * Sync the Vlocode config with the SFDX config. Set the vlocde SFDX
     * username to the default username as specified in SFDX.
     */
    private async syncWithSfdxUsernames() {
        for (const workspace of vscode.workspace.workspaceFolders ?? []) {
            const sfdxConfig = await sfdx.getConfig(workspace.uri.fsPath);
            if (sfdxConfig?.config.defaultusername) {
                this.vlocodeConfig.sfdxUsername = sfdxConfig.config.defaultusername;
            }
        }
    }

    /**
     * Update the SFDX config with the Vlocode SFDX username for all workspaces.
     */
    private async updateSfdxUsernames() {
        for (const workspace of vscode.workspace.workspaceFolders ?? []) {
            sfdx.setConfig(workspace.uri.fsPath, { 
                defaultusername: this.vlocodeConfig.sfdxUsername && await sfdx.resolveAlias(this.vlocodeConfig.sfdxUsername) 
            });
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
            const sfdxConfig = await sfdx.getConfig(uri.fsPath.slice(0, -sfdx.defaultConfigPath.length));
            if (!sfdxConfig?.config.defaultusername) {
                return;
            }
            const sfdxUsername = await this.resolveUsername(sfdxConfig?.config.defaultusername);
            const vlocodeUsername = await this.resolveUsername(this.vlocodeConfig.sfdxUsername);
            if (sfdxUsername !== vlocodeUsername) {
                this.logger.info(`SFDX default username set to "%s" for workspace "%s"`, sfdxUsername, workspace?.name ?? `unknown`);
                this.vlocodeConfig.sfdxUsername = sfdxUsername;
            }
        } catch (err) {
            this.logger.error(`Unable to read SFDX config file ${uri.fsPath}`, err);
        }
    }

    /**
     * Handle a change to the Vlocode config by updating the SFDX config file with the new default username.
     * @param config Vlocode configuration
     */
    private async handleVlocodeConfigChange(config: VlocodeConfiguration) {
        for (const workspace of vscode.workspace.workspaceFolders ?? []) {
            const sfdxConfig = await sfdx.getConfig(workspace.uri.fsPath);
            const sfdxUsername = await this.resolveUsername(sfdxConfig?.config.defaultusername);
            const vlocodeUsername = await this.resolveUsername(config.sfdxUsername);
            if (sfdxUsername !== vlocodeUsername) {
                this.logger.verbose(`Update SFDX default username for workspace %s to %s`, workspace.name, vlocodeUsername);
                sfdx.setConfig(workspace.uri.fsPath, { 
                    defaultusername: vlocodeUsername && await sfdx.resolveAlias(vlocodeUsername) 
                });
            }
        }
    }

    private async resolveUsername(username: string | undefined) {
        return (username && await sfdx.resolveUsername(username)) ?? username;
    }
}