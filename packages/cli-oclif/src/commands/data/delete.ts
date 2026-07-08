import { Args, Flags } from '@oclif/core';

import { SalesforceCommand } from '../../salesforceCommand';

interface QueryRecord {
    attributes?: {
        type?: string;
    };
    Id?: string;
}

interface DeleteResult {
    errors?: unknown[];
    id?: string;
    success: boolean;
}

function chunk<T>(values: T[], size: number) {
    const chunks: T[][] = [];
    for (let index = 0; index < values.length; index += size) {
        chunks.push(values.slice(index, index + size));
    }
    return chunks;
}

function normalizeDeleteResults(result: DeleteResult | DeleteResult[]) {
    return Array.isArray(result) ? result : [result];
}

export default class DataDelete extends SalesforceCommand<typeof DataDelete> {

    static description = 'Delete Salesforce records returned by a SOQL query, in batches';

    static args = {
        soql: Args.string({
            description: 'SOQL query selecting the records to delete. The query must select Id.',
            required: true,
        }),
    };

    static flags = {
        batchSize: Flags.integer({
            default: 200,
            max: 200,
            min: 1,
            summary: 'number of records to delete per API call',
        }),
        dryRun: Flags.boolean({
            default: false,
            summary: 'count matching records without deleting them',
        }),
        object: Flags.string({
            summary: 'SObject API name to delete from when it cannot be inferred from query results',
        }),
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> "SELECT Id FROM Account WHERE Name LIKE \'Test%\'" -u my-org',
        '<%= config.bin %> <%= command.id %> "SELECT Id FROM Account WHERE CreatedDate = TODAY" --dryRun -u my-org',
    ];

    async run() {
        const { soql } = this.args;
        let result = await this.connection.query<QueryRecord>(soql);
        let objectName = this.flags.object;
        let deletedCount = 0;
        let matchedCount = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            matchedCount += result.records.length;

            if (!objectName && result.records.length > 0) {
                objectName = result.records[0]?.attributes?.type;
            }

            if (!this.flags.dryRun && result.records.length > 0) {
                if (!objectName) {
                    this.error('Unable to infer SObject type from query results. Pass --object explicitly.');
                }

                const ids = result.records.map(record => record.Id).filter((id): id is string => typeof id === 'string');
                if (ids.length !== result.records.length) {
                    this.error('The SOQL query must select Id for every record.');
                }

                for (const idsToDelete of chunk(ids, this.flags.batchSize)) {
                    const deleteResults = normalizeDeleteResults(await this.connection.delete(objectName, idsToDelete));
                    const failed = deleteResults.filter(deleteResult => !deleteResult.success);
                    if (failed.length > 0) {
                        throw new Error(`Failed to delete ${failed.length} record(s): ${JSON.stringify(failed[0]?.errors ?? failed[0])}`);
                    }

                    deletedCount += deleteResults.length;
                    this.log(`Deleted ${deletedCount} record(s)...`);
                }
            }

            if (result.done || !result.nextRecordsUrl) {
                break;
            }

            result = await this.connection.queryMore<QueryRecord>(result.nextRecordsUrl);
        }

        if (this.flags.dryRun) {
            this.log(`Matched ${matchedCount} record(s). No records were deleted.`);
            return;
        }

        this.log(`Deleted ${deletedCount} record(s).`);
    }
}
