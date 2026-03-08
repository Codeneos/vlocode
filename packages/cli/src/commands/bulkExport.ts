import { Args, Flags } from '@oclif/core';
import { createWriteStream, readFileSync } from 'fs';
import { resolve } from 'path';
import { Logger, LogManager } from '@vlocode/core';
import { SalesforceCommand } from '../salesforceCommand';
import { BulkClient } from '@vlocode/salesforce';

export default class BulkExport extends SalesforceCommand<typeof BulkExport> {

    static description = 'Export data from Salesforce using the Bulk API v2 and output as NDJSON';

    static args = {
        sobject: Args.string({
            required: false,
            description: 'SObject name to query (if no query / file is specified)',
        }),
    };

    static flags = {
        ...SalesforceCommand.flags,
        output: Flags.file({
            char: 'o',
            required: true,
            summary: 'path to the output NDJSON file',
        }),
        query: Flags.string({
            char: 'q',
            exclusive: ['file'],
            summary: 'SOQL query string to execute',
        }),
        file: Flags.file({
            char: 'f',
            exists: true,
            exclusive: ['query'],
            summary: 'path to a file containing a SOQL query',
        }),
        limit: Flags.string({
            char: 'l',
            summary: 'limit the number of records to export (only applies when providing an SObject name)',
        }),
        includeDeleted: Flags.boolean({
            name: 'include-deleted',
            default: false,
            summary: 'include deleted records in the query (queryAll)',
        }),
        chunkSize: Flags.integer({
            name: 'chunk-size',
            default: 50000,
            summary: 'number of records to retrieve per API call',
        }),
    };

    protected readonly logger: Logger = LogManager.get('bulk-export');

    protected async execute() {
        const sobject = this.args.sobject;
        let query = '';

        if (this.flags.query) {
            query = this.flags.query;
        } else if (this.flags.file) {
            try {
                query = readFileSync(this.flags.file, 'utf-8');
            } catch(e: any) {
                this.logger.error(`Unable to read query file: ${e.message}`);
                return process.exit(1);
            }
        } else if (sobject) {
            query = `SELECT Id FROM ${sobject}`;
            if (this.flags.limit) {
                query += ` LIMIT ${this.flags.limit}`;
            }
        }

        // Handle input query
        if (!query || !query.trim()) {
            this.logger.error('No SObject, query, or file specified. Please provide a data source to export.');
            return process.exit(1);
        }

        const outPath = resolve(process.cwd(), this.flags.output);
        const connection = await this.getConnection();
        const bulkClient = new BulkClient(connection);

        this.logger.info(`Starting Bulk V2 Query: ${query}`);
        
        // Execute the job
        const job = await bulkClient.query(query, { includeDeletedRecords: this.flags.includeDeleted });
        
        this.logger.info(`Bulk Job created with ID: ${job.id}`);
        this.logger.info('Waiting for job to complete...');

        // Setup the output stream
        const stream = createWriteStream(outPath, { flags: 'w' });
        
        try {
            let recordCount = 0;
            // Stream results continuously as NDJSON
            for await (const record of job.records(this.flags.chunkSize)) {
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
            this.logger.error(`Error during bulk export: ${err.message}`);
            stream.destroy();
            throw err;
        }
    }
}
