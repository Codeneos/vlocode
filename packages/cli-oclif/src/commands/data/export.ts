import { createWriteStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Args, Flags } from '@oclif/core';

import { BulkClient } from '@vlocode/salesforce';

import { SalesforceCommand } from '../../salesforceCommand';

export default class DataExport extends SalesforceCommand<typeof DataExport> {

    static description = 'Export data from Salesforce using the Bulk API v2 and output as NDJSON';

    static args = {
        sobject: Args.string({
            description: 'SObject name to query (if no query / file is specified)',
            required: false,
        }),
    };

    static flags = {
        output: Flags.string({
            char: 'o',
            required: true,
            summary: 'path to the output NDJSON file',
        }),
        query: Flags.string({
            char: 'q',
            exclusive: ['file'],
            summary: 'SOQL query string to execute',
        }),
        file: Flags.string({
            char: 'f',
            exclusive: ['query'],
            summary: 'path to a file containing a SOQL query',
        }),
        limit: Flags.integer({
            char: 'l',
            summary: 'limit the number of records to export (only applies when providing an SObject name)',
        }),
        'include-deleted': Flags.boolean({
            default: false,
            summary: 'include deleted records in the query (queryAll)',
        }),
        'chunk-size': Flags.integer({
            default: 50000,
            summary: 'number of records to retrieve per API call',
        }),
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> Account -o accounts.ndjson -u my-org',
        '<%= config.bin %> <%= command.id %> -q "SELECT Id, Name FROM Account" -o accounts.ndjson -u my-org',
    ];

    public async run() {
        let query = '';

        if (this.flags.query) {
            query = this.flags.query;
        } else if (this.flags.file) {
            try {
                query = await readFile(this.flags.file, 'utf-8');
            } catch (err: any) {
                this.error(`Unable to read query file: ${err.message}`);
            }
        } else if (this.args.sobject) {
            query = `SELECT Id FROM ${this.args.sobject}`;
            if (this.flags.limit) {
                query += ` LIMIT ${this.flags.limit}`;
            }
        }

        if (!query || !query.trim()) {
            this.error('No SObject, query, or file specified. Please provide a data source to export.');
        }

        const outPath = resolve(process.cwd(), this.flags.output);
        const connection = this.getConnection();
        const bulkClient = new BulkClient(connection);

        this.logger.info(`Starting Bulk V2 Query: ${query}`);

        const job = await bulkClient.query(query, { includeDeletedRecords: this.flags['include-deleted'] });

        this.logger.info(`Bulk Job created with ID: ${job.id}`);
        this.logger.info('Waiting for job to complete...');

        const stream = createWriteStream(outPath, { flags: 'w' });

        try {
            let recordCount = 0;

            for await (const record of job.records(this.flags['chunk-size'])) {
                recordCount++;

                // Write as NDJSON and do not buffer locally
                stream.write(JSON.stringify(record) + '\n');

                if (recordCount % 10000 === 0) {
                    this.logger.info(`Exported ${recordCount} records...`);
                }
            }

            // Wait for everything to strictly flush to disk
            await new Promise<void>((resolve, reject) => {
                stream.end(() => resolve());
                stream.on('error', reject);
            });

            this.logger.info(`Successfully exported ${recordCount} records to ${outPath}`);
        } catch (err: any) {
            stream.destroy();
            this.error(`Error during bulk export: ${err.message}`);
        }
    }
}
