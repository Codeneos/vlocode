import { groupBy, substringBefore } from '@vlocode/util';
import { DatapackDeploymentRecord } from './datapackDeploymentRecord';
import { DatapackDeploymentRecordGroup } from './datapackDeploymentRecordGroup';
import { DatapackDeploymentError } from './datapackDeploymentError';
import { DatapackDeploymentDatapackStatus, DatapackDeploymentMessage, DatapackDeploymentState, DatapackDeploymentStatus } from './datapackDeploymentStatus';

export interface DatapackDeploymentRecordMessage {
    record?: DatapackDeploymentRecord;
    datapackKey: string;
    type: 'error' | 'warn' | 'info';
    code?: string;
    message: string;
}

/**
 * Builds the external status- and message-reports for a {@link DatapackDeployment} from its
 * internal record state.
 *
 * This logic was extracted from `DatapackDeployment` to keep deployment orchestration separate
 * from result reporting. The reporter holds references to the deployment's live record
 * collections so it always reflects the current deployment state, and contains no orchestration
 * logic of its own which makes it straightforward to unit-test in isolation.
 */
export class DatapackDeploymentStatusReporter {

    constructor(
        private readonly records: ReadonlyMap<string, DatapackDeploymentRecord>,
        private readonly recordGroups: ReadonlyMap<string, DatapackDeploymentRecordGroup>,
        private readonly recordGroupsErrors: ReadonlyMap<string, DatapackDeploymentError[]>
    ) {
    }

    /**
     * Build the aggregated {@link DatapackDeploymentStatus} for the whole deployment, combining
     * per-record errors and warnings with any datapack-level errors that are not tied to a record.
     */
    public getStatus(): DatapackDeploymentStatus {
        const datapacks = new Map<string, DatapackDeploymentDatapackStatus>();

        for (const [datapackKey, group] of this.recordGroups) {
            // Transform errors to the format expected in DatapackDeploymentStatus
            const messages: DatapackDeploymentMessage[] = [];

            // Add record-level errors
            for (const record of group) {
                if (record.isFailed && !record.isCascadeFailure) {
                    messages.push({
                        type: 'error',
                        message: this.formatDeployError(record),
                        code: record.errorCode ?? 'UNKNOWN_ERROR'
                    });
                } else if (record.hasWarnings) {
                    for (const warning of record.warnings) {
                        messages.push({ message: warning, type: 'warn' });
                    }
                }
            }

            // Create and add the status object to results
            datapacks.set(datapackKey, {
                datapack: datapackKey,
                type: group.datapackType,
                status: group.status,
                recordCount: group.size,
                failedCount: group.failedCount,
                messages
            });
        }

        // Add any errors that are not related to a specific record
        for (const [datapackKey, errors] of this.recordGroupsErrors) {
            const messages = errors.map<DatapackDeploymentMessage>(error => ({
                type: 'error',
                message: error.message,
                code: error.errorCode as string
            }));

            const datapackStatus = datapacks.get(datapackKey)
            if (!datapackStatus) {
                datapacks.set(datapackKey, {
                    datapack: datapackKey,
                    type: substringBefore(datapackKey, '/'),
                    status: DatapackDeploymentState.Error,
                    recordCount: 1,
                    failedCount: 1,
                    messages
                });
            } else {
                Object.assign(datapackStatus, {
                    messages: [...datapackStatus.messages, ...messages]
                });
            }
        }

        const datapackValues = [...datapacks.values()];
        return {
            total: datapackValues.length,
            status: DatapackDeploymentState.summarize(datapackValues.map(result => result.status)),
            datapacks: datapackValues,
        };
    }

    /**
     * Retrieves the deployment messages for the datapack deployment.
     *
     * @param options - An optional object that specifies additional options for retrieving the messages.
     * @param options.includeCascadeFailures - A boolean indicating whether to include cascade failures in the messages. Default is false.
     *
     * @returns An array of `DatapackDeploymentRecordMessage` objects representing the deployment messages.
     */
    public getMessages(options?: { includeCascadeFailures?: boolean }): Array<DatapackDeploymentRecordMessage> {
        const messages = new Array<DatapackDeploymentRecordMessage>();
        for (const record of this.records.values()) {
            if (!options?.includeCascadeFailures && record.isCascadeFailure) {
                continue;
            }
            const datapackKey = record.datapackKey;
            if (record.isFailed && record.statusMessage) {
                messages.push({ datapackKey, record, type: 'error', code: record.errorCode, message: this.formatDeployError(record) });
            }
            for (const message of record.warnings) {
                messages.push({ datapackKey, record, type: 'warn', message });
            }
        }

        for (const [datapackKey, errors] of this.recordGroupsErrors) {
            for (const error of errors) {
                messages.push({ datapackKey, type: 'error', code: error.errorCode, message: error.message });
            }
        }

        return messages;
    }

    public getMessagesByDatapack(options?: { includeCascadeFailures?: boolean }): { [datapackKey: string]: Array<DatapackDeploymentRecordMessage> } {
        return groupBy(this.getMessages(options), m => m.datapackKey);
    }

    /**
     * Format the status message of a failed record into a human readable error message; detects
     * common APEX trigger exceptions and rewrites them into actionable guidance.
     */
    public formatDeployError(record: DatapackDeploymentRecord): string {
        const message = record.statusMessage;
        if (!message) {
            return 'No error message';
        }

        if (message.includes('Script-thrown exception')) {
            const triggerTypeMatch = message.match(/execution of ([\w\d_-]+)/);
            const causedByMatch = message.match(/caused by: ([\w\d_.-]+)/);
            if (triggerTypeMatch) {
                const triggerType = triggerTypeMatch[1];
                return `APEX ${triggerType} trigger caused exception; try inserting this datapack with triggers disabled`;
            } else if (causedByMatch) {
                return `APEX exception caused by (${causedByMatch[1]}); try inserting this datapack with triggers disabled`;
            }
        }

        return message.split(/\n|\r/g).filter(line => line.trim().length > 0).join('\n');
    }
}
