import { injectable, Logger } from '@vlocode/core';
import { cache, CancellationToken } from '@vlocode/util';
import type { SuccessResult } from 'jsforce';

import { SalesforceConnectionProvider } from './connection';
import { DeveloperLog, DeveloperLogRecord } from './developerLog';
import { QueryBuilder } from './queryBuilder';
import { QueryService } from './queryService';
import { SalesforceDebugLevel, SalesforceDebugLevelRecord } from './salesforceDebugLevel';

@injectable()
export class DeveloperLogs {

    public constructor(
        private readonly connectionProvider: SalesforceConnectionProvider,
        private readonly queryService: QueryService,
        private readonly logger: Logger) {
    }

    /**
     * Retrieves developer logs from the server
     * @param from Since date
     * @param currentUserOnly true if to only query the logs fro the current user otherwise retiree all logs 
     */
    public async getDeveloperLogs(from?: Date, currentUserOnly: boolean = false): Promise<DeveloperLog[]> {
        const selectFields = ['Id', 'Application', 'DurationMilliseconds', 'Location', 'LogLength', 'LogUser.Name', 'Operation', 'Request', 'StartTime', 'Status' ];
        const filters = new Array<string>();
        if (from) {
            filters.push(`SystemModstamp >= ${from.toISOString()}`);
        }
        if (currentUserOnly) {
            const currentUser = await this.getConnectedUserInfo();
            filters.push(`LogUserId = '${currentUser.id}'`);
        }
        const toolingQuery = `Select ${selectFields.join(',')} From ApexLog ${filters.length ? `where ${filters.join(' and ')}` : ''}`;
        const entries = await this.queryService.query<DeveloperLogRecord>(toolingQuery);
        return entries.map(entry => new DeveloperLog(entry, this.connectionProvider));
    }

    /**
     * Deletes all Developers for All users from the server and returns te number of delete log entries as number.
     * @param reportProgress Reports the progress of the delete operations
     * @param token Cancellation token
     * @returns 
     */
    public async clearDeveloperLogs(reportProgress?: (progress: { progress: number, total: number }) => any, token?: CancellationToken) {
        const [ { logCount } ] = (await new QueryBuilder('ApexLog', [ 'count(Id) logCount' ]).executeTooling(this.queryService));
        if (!logCount) {
            return 0;
        }

        const connection = await this.getJsForceConnection();
        let deletedCount = 0;

        while (token?.isCancellationRequested != true) {
            // Query and delete logs in chunks to avoid overloading the server
            const apexLogs = await new QueryBuilder('ApexLog', [ 'Id' ]).limit(100).executeTooling(this.queryService);
            const ids = apexLogs.map(log => log.Id);
            if (!ids.length) {
                break;
            }

            deletedCount += ids.length;
            this.logger.info(`Deleting ${deletedCount}/${logCount} debug logs from the server...`);
            if (reportProgress) {
                reportProgress({ progress: deletedCount, total: logCount });
            }

            try {
                await connection.tooling.delete('ApexLog', ids, { allOrNone: false });
            } catch {
                // Ignore deletion errors
                this.logger.warn(`Failed to delete some logs from the server; logs might already be cleared`);
            }
        }

        return deletedCount;
    }

    /**
     * Gets a list of the currently configured logging levels in Salesforce
     */
    public async getDebugLevels(): Promise<Array<SalesforceDebugLevel>> {
        const selectFields = ['Id', 'DeveloperName', 'ApexCode', 'ApexProfiling', 'Callout', 'Database', 'System', 'Validation', 'Visualforce', 'Workflow' ];
        const toolingQuery = `Select ${selectFields.join(',')} From DebugLevel`;
        const entries = await this.queryService.query<SalesforceDebugLevel>(toolingQuery);
        return entries;
    }

    public async createDebugLevel(developerName: string, debugLevel: SalesforceDebugLevel): Promise<SalesforceDebugLevelRecord> {
        if (developerName !== developerName.replace(/[^0-9a-z_]+/ig, '_').replace(/^_+|_+$/, '')) {
            throw new Error(`Developer name "${developerName}" is invalid; only alphanumeric characters and underscores are allowed`);
        }

        // Create base trace flag object
        const debugLevelObject = {
            DeveloperName: developerName,
            MasterLabel: developerName
        } as any;

        // Set log levels per category based on the specified log levels
        const normalizedDebugLevels = new Map(Object.keys(debugLevel).map(key => ([key.toLowerCase(), debugLevel[key]])));
        const traceFlagFields = [ 'ApexCode', 'ApexProfiling', 'Callout', 'Database', 'System', 'Validation', 'Visualforce', 'Workflow' ];
        for (const field of traceFlagFields) {
            debugLevelObject[field] = normalizedDebugLevels.get(field.toLocaleLowerCase());
        }

        // get existing levels object and update that
        const connection = await this.getJsForceConnection();
        const existing = await connection.tooling.query<{ Id: string}>(`Select Id From DebugLevel where DeveloperName = '${developerName}' limit 1`);
        if (existing.totalSize > 0) {
            debugLevelObject.Id = existing.records[0].Id;
        }

        // Save log levels
        if (!debugLevelObject.Id) {
            const result = await connection.tooling.create('DebugLevel', debugLevelObject) as SuccessResult;
            debugLevelObject.Id = result.id;
        } else {
            await connection.tooling.update('DebugLevel', debugLevelObject);
        }

        return { ...debugLevel, developerName, id: debugLevelObject.Id };
    }

    /**
     * Set the trace flags based on the specified details.
     * @param debugLevel Logging level to set
     * @param type Type of logging to set
     * @param trackedEntityId Optionally the tracked entity; required for class and use debugging
     * @param durationInSeconds Duration of the logging sessions; default is 1 hour or 3600 seconds
     * @returns Trace flag instance id which can be used to extend or clear
     */
    public async setTraceFlags(debugLevel: string | { id: string }, type: 'DEVELOPER_LOG' | 'USER_DEBUG', trackedEntityId?: undefined, durationInSeconds?: number): Promise<string>;
    public async setTraceFlags(debugLevel: string | { id: string }, type: 'USER_DEBUG' | 'CLASS_TRACING', trackedEntityId: string, durationInSeconds?: number): Promise<string>;
    public async setTraceFlags(debugLevel: string | { id: string }, type: 'USER_DEBUG' | 'DEVELOPER_LOG' | 'CLASS_TRACING', trackedEntityId?: string, durationInSeconds: number = 3600): Promise<string> {
        // Create base trace flag object
        const traceFlag = {
            DebugLevelId: typeof debugLevel === 'string' ? debugLevel : debugLevel.id,
            LogType: type,
            TracedEntityId: trackedEntityId,
            StartDate: new Date(),
            ExpirationDate: new Date(Date.now() + durationInSeconds * 1000),
        } as any;

        // Default to current user id when no id is set
        if (type === 'USER_DEBUG' && !trackedEntityId) {
            traceFlag.TracedEntityId = (await this.getConnectedUserInfo()).id;
        }

        // Save log levels
        const connection = await this.getJsForceConnection();
        const result = await connection.tooling.create('TraceFlag', traceFlag) as SuccessResult;
        return result.id;
    }

    /**
     * Extends/refresh the trace flag with the specified ID
     * @param traceFlagsId Id of the trace flags to extend
     * @param durationInSeconds Number of seconds starting now by which to extend the trace flag
     */
    public async extendTraceFlags(traceFlagsId: string, durationInSeconds: number = 3600) {
        // Create base trace flag object
        const traceFlag = {
            Id: traceFlagsId,
            StartDate: new Date(),
            ExpirationDate: new Date(Date.now() + durationInSeconds * 1000),
        } as any;
        const connection = await this.getJsForceConnection();
        await connection.tooling.update('TraceFlag', traceFlag);
    }

    /**
     * Clears the specified trace flags from the server
     * @param traceFlagsId Id of the trace flags to clear
     */
    public async clearTraceFlags(traceFlagsId: string) {
        const connection = await this.getJsForceConnection();
        try {
            await connection.tooling.delete('TraceFlag', [ traceFlagsId ]);
        } catch(e) {
            this.logger.error(`TraceFlag with id ${traceFlagsId} could not be cleared.`);
        }
    }

    /**
     * Removes all active and expired trace flags for the current Salesforce instance.
     */
    public async clearAllTraceFlags() {
        return this.deleteToolingRecords('Select Id From TraceFlag');
    }

    /**
     * Clear all trace flags for the currently connected user; deletes TraceFlag where TracedEntityId is set to the id of the current user
     */
    public async clearUserTraceFlags() {
        const userId = (await this.getConnectedUserInfo()).id;
        return this.deleteToolingRecords(`Select Id From TraceFlag where TracedEntityId = '${userId}'`);
    }

    /**
     * Gets basic details about the user for the current connection
     */
    @cache()
    private async getConnectedUserInfo() {
        const connection = await this.getJsForceConnection();
        const identity = await connection.identity();
        // Only return a subset of user details/ do not expose the rest as they might be more sensitive details there
        return {
            id: identity.user_id,
            username: identity.username,
            type: identity.user_type,
        };
    }

    private getJsForceConnection() {
        return this.connectionProvider.getJsForceConnection();
    }

    private async deleteToolingRecords(query: string) {
        const objectType = query.match(/from (?<objectType>[a-z_0-9]+)/i)?.groups?.objectType;
        if (!objectType) {
            throw new Error(`No object type found in query: ${query}`);
        }
        const connection = await this.getJsForceConnection();
        let result = (await connection.tooling.query<{Id: string}>(query));
        do{
            const ids = result.records.map(rec => rec.Id);
            if (ids.length > 0) {
                await connection.tooling.delete(`${objectType}`, ids);
            }
            if (!result.nextRecordsUrl) {
                break;
            }
            result = await connection.tooling.queryMore(result.nextRecordsUrl);
        } while(result.nextRecordsUrl);
    }
}