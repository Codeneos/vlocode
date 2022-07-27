import * as vscode from 'vscode';
import VlocodeService from '@lib/vlocodeService';
import { DeveloperLog } from '@vlocode/salesforce';
import * as moment from 'moment';
import { ConfigurationManager } from '@lib/config';
import { VlocodeCommand } from '@constants';
import { Logger , injectable } from '@vlocode/core';
import BaseDataProvider from './baseDataProvider';
import { DebugLogViewer } from '@lib/salesforce/debugLogViewer';

/**
 * Provides a list of recently executed or executing activities 
 */
@injectable()
export default class DeveloperLogDataProvider extends BaseDataProvider<DeveloperLog> implements vscode.Disposable {

    private logs: Array<DeveloperLog> = [];
    private lastRefresh?: Date;
    private autoRefreshScheduledId?: any;
    private autoRefreshingPaused: boolean = true;
    private currentUserOnly: boolean = false;
    private readonly autoRefreshInterval: number = 3000;

    constructor(service: VlocodeService, private readonly logger: Logger) {
        super(service);
        ConfigurationManager.watchProperties(this.vlocode.config, ['sfdxUsername'], config => {
            this.lastRefresh = undefined;
            this.logs.splice(0);
            if (config.sfdxUsername) {
                this.refresh();
            }
        });
        ConfigurationManager.watchProperties(this.vlocode.config.salesforce, [ 'developerLogsVisible' ], config => {
            service.enableDeveloperLogsPanel(config.developerLogsVisible);
        }, { initial: true });
        ConfigurationManager.watchProperties(this.vlocode.config.salesforce, [ 'developerLogsAutoRefresh' ], config => {
            this.enableAutoRefresh(!!config.developerLogsAutoRefresh);
        }, { initial: true });
        ConfigurationManager.watchProperties(this.vlocode.config.salesforce, [ 'developerLogsVisibility' ], config => {
            this.currentUserOnly = config.developerLogsVisibility != 'all';
            this.lastRefresh = undefined;
            this.logs.splice(0);
            this.refresh();
        }, { initial: true });
    }

    dispose() {
        this.enableAutoRefresh(false);
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

    public enableAutoRefresh(enabled: boolean) {
        if (enabled) {
            this.scheduleRefresh(3000);
        } else if (this.autoRefreshScheduledId) {
            clearTimeout(this.autoRefreshScheduledId);
        }
    }

    /**
     * Pauses any refresh calls to the UI and avoids polling the server for new Logs when the log panel is not focused.
     * @param paused Whether or not the auto refresh loop is running or paused
     */
    public pauseAutoRefresh(paused: boolean) {
        this.autoRefreshingPaused = paused;
    }

    public scheduleRefresh(timeout: number) {
        // Prevent a double refresh schedules
        if (this.autoRefreshScheduledId) {
            clearTimeout(this.autoRefreshScheduledId);
        }
        this.autoRefreshScheduledId = setTimeout(this.refreshTask.bind(this), timeout);
    }

    private async refreshTask() {
        this.autoRefreshScheduledId = null;
        try {
            if (!this.autoRefreshingPaused && await this.refreshLogs()) {
                this.refresh();
            }
        } catch(err) {
            this.logger.error(err);
        } finally {
            this.scheduleRefresh(this.autoRefreshInterval);
        }
    }

    public async onClick(log: DeveloperLog) {
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
        return `${log.status} - ${moment(log.startTime).format('M/D/YYYY HH:mm:ss')}`;
    }

    public getStatusLabel(log: DeveloperLog): string {
        return `${moment(log.startTime).format('M/D/YYYY HH:mm:ss')} (${(log.durationMilliseconds / 1000).toFixed(2)}s) - ${Math.floor(log.size / 102.4) / 10}KB`;
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
     * Refreshes the logs from the server and returns true when new logs are available - otherwise false.
     */
    private async refreshLogs() {
        await this.vlocode.validateAll(true);

        // Load logs since last refresh
        const refreshDate = new Date();
        const latestLogs = await this.vlocode.salesforceService.logs.getDeveloperLogs(this.lastRefresh, this.currentUserOnly);
        this.lastRefresh = refreshDate;
        const uniqueLogEntries = new Map<string, DeveloperLog>(this.logs.concat(latestLogs).map(item => ([item.id, item])));
        let newLogs = Array.from(uniqueLogEntries.values());

        if (newLogs.length == this.logs.length) {
            return false;
        }

        // Remove empty logs and small logs
        newLogs = newLogs.filter(log => log.operation != '<empty>' || log.size > 1024 * 5);

        // Only display last 100 log entries
        this.logs = newLogs.sort((a,b) => b.startTime.getTime() - a.startTime.getTime());
        this.logs.splice(100);
        return true;
    }
}