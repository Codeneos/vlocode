import * as vscode from 'vscode';
import VlocodeService from 'lib/vlocodeService';
import { DeveloperLog } from 'lib/salesforce/developerLog';
import moment = require('moment');
import { ConfigurationManager } from 'lib/configurationManager';
import { VlocodeCommand } from '@constants';
import { DebugLogViewer } from 'lib/salesforce/debugLogViewer';
import { Logger } from 'lib/logging';
import { dependency } from 'lib/core/inject';
import BaseDataProvider from './baseDataProvider';

/**
 * Provides a list of recently executed or executing activities 
 */
@dependency()
export default class DeveloperLogDataProvider extends BaseDataProvider<DeveloperLog> implements vscode.Disposable {

    private logs: Array<DeveloperLog> = [];
    private lastRefresh?: Date;
    private autoRefreshScheduledId?: any;
    private autoRefreshingPaused: boolean = true;
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
        ConfigurationManager.watchProperties(this.vlocode.config, [ 'salesforce.developerLogsVisible' ], config => {
            service.enableDeveloperLogsPanel(config.salesforce.developerLogsVisible);
        }, { initial: true });
        ConfigurationManager.watchProperties(this.vlocode.config, [ 'salesforce.developerLogsAutoRefresh' ], config => {
            this.enableAutoRefresh(!!config.salesforce.developerLogsAutoRefresh);
        }, { initial: true });
    }

    dispose() {
        this.enableAutoRefresh(false);
    }

    protected getCommands() {
        return {
            'vlocity.developerLogs.refresh': this.refresh.bind(this),
            'vlocity.developerLogs.setLogLevel': async () => {
                await this.executeCommand(VlocodeCommand.setTraceFlags);
            },
            'vlocity.developerLogs.deleteAll': async () => {
                await this.executeCommand(VlocodeCommand.clearDeveloperLogs);
                await this.vlocode.salesforceService.clearApexTestResults();
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
            tooltip: log.operation,
            iconPath: this.getItemIconPath(this.getIcon(log)),
            collapsibleState: vscode.TreeItemCollapsibleState.None,
        };
    }

    public getIcon(node: DeveloperLog): { light: string; dark: string } | undefined {
        return {
            light: 'resources/light/log.svg',
            dark: 'resources/dark/log.svg'
        };
        // switch (node.status) {
        //     case VlocodeActivityStatus.InProgress: return {
        //         light: 'resources/light/loading.svg',
        //         dark: 'resources/dark/loading.svg'
        //     };
        //     case VlocodeActivityStatus.Completed: return {
        //         light: 'resources/light/checked.svg',
        //         dark: 'resources/dark/checked.svg'
        //     };
        //     case VlocodeActivityStatus.Cancelled: return {
        //         light: 'resources/light/error.svg',
        //         dark: 'resources/dark/error.svg'
        //     };
        //     case VlocodeActivityStatus.Failed: return {
        //         light: 'resources/light/warning.svg',
        //         dark: 'resources/dark/warning.svg'
        //     };
        //     default: return undefined;
        // }
        return undefined;
    }

    public getTooltip(log: DeveloperLog): string {
        return `${log.user}; ${log.status} - ${moment(log.startTime).format('M/D/YYYY HH:mm:ss')}`;
    }

    public getStatusLabel(log: DeveloperLog): string {
        return `${moment(log.startTime).format('M/D/YYYY HH:mm:ss')} - ${Math.floor(log.size / 102.4) / 10}KB`;
    }

    public getLabel(log: DeveloperLog): string {
        const labelValue = `${log.operation} (${log.request})`;
        return labelValue;
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
        const latestLogs = await this.vlocode.salesforceService.getDeveloperLogs(this.lastRefresh);
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