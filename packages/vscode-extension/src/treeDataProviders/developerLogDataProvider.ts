import * as vscode from 'vscode';
import VlocodeService from '../lib/vlocodeService';
import { DeveloperLog } from '@vlocode/salesforce';
import { DateTime } from 'luxon';
import { ConfigurationManager } from '../lib/config';
import { VlocodeCommand } from '../constants';
import { Logger, injectable } from '@vlocode/core';
import BaseDataProvider from './baseDataProvider';
import { DebugLogViewer } from '../lib/salesforce/debugLogViewer';

/**
 * A Tree Data Provider for managing and displaying Salesforce Developer Logs in a VS Code extension.
 * This class extends the `BaseDataProvider` and implements `vscode.Disposable` to provide functionality
 * for fetching, displaying, and managing developer logs, including features like auto-refresh, filtering,
 * and log visibility settings.
 *
 * @template DeveloperLog - The type of the developer log objects managed by this provider.
 */
@injectable.singleton()
export default class DeveloperLogDataProvider extends BaseDataProvider<DeveloperLog> implements vscode.Disposable {

    private logs: Array<DeveloperLog> = [];
    private lastRefresh?: Date;
    private autoRefreshScheduledId?: any;
    private autoRefreshPaused: boolean = true;
    private autoRefreshEnabled: boolean = false;
    private currentUserOnly: boolean = false;
    private readonly autoRefreshInterval: number = 3000;

    constructor(service: VlocodeService, private readonly logger: Logger) {
        super(service);
        this.registerConfigListener();
    }

    dispose() {
        this.setAutoRefresh(false);
    }

    private registerConfigListener() {
        this.vlocode.onUsernameChanged(username => {
            this.lastRefresh = undefined;
            this.logs.splice(0);
            this.refresh();
            if (username) {
                void this.refreshLogs({ refreshView: true });
            }
        });
        ConfigurationManager.onConfigChange(this.vlocode.config.salesforce, [ 'developerLogsVisible' ], config => {
            this.vlocode.enableDeveloperLogsPanel(config.developerLogsVisible);
        }, { initial: true });
        ConfigurationManager.onConfigChange(this.vlocode.config.salesforce, [ 'developerLogsAutoRefresh' ], config => {
            this.setAutoRefresh(!!config.developerLogsAutoRefresh);
        }, { initial: true });
        ConfigurationManager.onConfigChange(this.vlocode.config.salesforce, [ 'developerLogsVisibility' ], config => {
            this.currentUserOnly = config.developerLogsVisibility != 'all';
            this.lastRefresh = undefined;
            this.logs.splice(0);
            this.refresh();
        }, { initial: true });
    }

    protected getCommands() {
        return {
            'vlocode.developerLogs.refresh': this.refresh.bind(this),
            'vlocode.developerLogs.setLogLevel': async () => {
                await this.executeCommand(VlocodeCommand.setTraceFlags);
            },
            'vlocode.developerLogs.setLogVisibility': async () => {
                await this.executeCommand(VlocodeCommand.setLogVisibility);
            },
            'vlocode.developerLogs.deleteAll': async () => {
                await this.executeCommand(VlocodeCommand.clearDeveloperLogs);
                this.logs.splice(0);
                this.refresh();
            }
        };
    }

    /**
     * Enable or disable auto refresh of the logs
     * @param enabled True to enable auto refresh, false to disable
     * @param options Options to control the refresh behavior
     */
    public setAutoRefresh(enabled: boolean, options?: { timeout?: number }) {
        this.autoRefreshEnabled = enabled;
        if (enabled) {
            this.scheduleRefresh(options?.timeout ?? 3000);
        } else if (this.autoRefreshScheduledId) {
            clearTimeout(this.autoRefreshScheduledId);
            this.autoRefreshScheduledId = null;
        }
    }

    /**
     * Pauses any refresh calls to the UI and avoids polling the server for new Logs when the log panel is not focused.
     * @param paused Whether or not the auto refresh loop is running or paused
     */
    public pauseAutoRefresh(paused: boolean) {
        this.autoRefreshPaused = paused;
    }

    private scheduleRefresh(timeout: number) {
        // Prevent a double refresh schedules
        if (this.autoRefreshScheduledId) {
            clearTimeout(this.autoRefreshScheduledId);
        }
        this.autoRefreshScheduledId = setTimeout(this.refreshTask.bind(this), timeout);
    }

    private async refreshTask() {
        this.autoRefreshScheduledId = null;
        if (!this.autoRefreshEnabled) {
            return;
        }
        try {
            if (!this.autoRefreshPaused) {
                await this.refreshLogs({ refreshView: true });
            }
        } catch(err) {
            this.logger.error(err);
        } finally {
            this.scheduleRefresh(this.autoRefreshInterval);
        }
    }

    public onClick(log: DeveloperLog) {
        void new DebugLogViewer().showDeveloperLog(log);
    }

    public toTreeItem(log: DeveloperLog): vscode.TreeItem {
        return {
            id: log.id,
            label: this.getLabel(log),
            description: this.getStatusLabel(log),
            contextValue: 'salesforce:developerLog',
            tooltip: this.getTooltip(log),
            iconPath: this.getItemIconPath({
                light: 'resources/light/log.svg',
                dark: 'resources/dark/log.svg'
            }),
            collapsibleState: vscode.TreeItemCollapsibleState.None,
        };
    }

    public getTooltip(log: DeveloperLog): string {
        return `${log.status} - ${DateTime.fromJSDate(log.startTime).toFormat('M/d/yyyy HH:mm:ss')}`;
    }

    public getStatusLabel(log: DeveloperLog): string {
        return `${DateTime.fromJSDate(log.startTime).toFormat('M/d/yyyy HH:mm:ss')} (${(log.durationMilliseconds / 1000).toFixed(2)}s) - ${Math.floor(log.size / 102.4) / 10}KB`;
    }

    public getLabel(log: DeveloperLog): string {
        if (this.currentUserOnly) {
            return `${log.request}: ${log.operation}`;
        }
        return `${log.request}: ${log.operation} <${log.user}>`;
    }

    public async getChildren(node?: DeveloperLog) {
        if (node) {
            return;
        }

        if (this.lastRefresh && (Date.now() - this.lastRefresh.getTime()) < 500)  {
            // avoid refreshing if we just had a refresh
            return this.logs;
        }

        await this.refreshLogs();
        return this.logs;
    }

    /**
     * Refresh the logs from the server and optionally refresh the view to reflect the changes in the UI.
     * @param options Options to control the refresh behavior
     * @param options.refreshView Whether or not to refresh the view after the logs have been refreshed
     * @throws {CustomError} When the refresh fails
     */
    public async refreshLogs(options?: { refreshView?: boolean, }) {
        await this.vlocode.validateAll(true);

        // Load logs since last refresh
        const refreshDate = new Date();
        const latestLogs = await this.vlocode.salesforceService.logs.getDeveloperLogs(this.lastRefresh, this.currentUserOnly);
        this.lastRefresh = refreshDate;
        const uniqueLogEntries = new Map<string, DeveloperLog>(this.logs.concat(latestLogs).map(item => ([item.id, item])));
        let newLogs = Array.from(uniqueLogEntries.values());

        if (newLogs.length == this.logs.length) {
            return;
        }

        // Remove empty logs and small logs
        newLogs = newLogs.filter(log => log.operation != '<empty>' || log.size > 1024 * 5);

        // Only display last 100 log entries
        this.logs = newLogs.sort((a,b) => b.startTime.getTime() - a.startTime.getTime());
        this.logs.splice(100);

        if (options?.refreshView) {
            this.refresh();
        }
    }
}