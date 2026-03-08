import { createWriteStream, WriteStream, readFileSync } from 'fs';
import { resolve } from 'path';
import { Logger, LogManager } from '@vlocode/core';
import { Argument, Option } from '../command';
import { SalesforceCommand } from '../salesforceCommand';
import { BulkClient } from '@vlocode/salesforce';

export default class extends SalesforceCommand {

    static description = 'Export data from Salesforce using the Bulk API v2 and output as NDJSON';

    static args = [
        new Argument('<sobject>', 'SObject name to query (if no query / file is specified)').argOptional()
    ];

    static options = [
        ...SalesforceCommand.options,
        new Option(
            '-o, --output <file>', 
            'path to the output NDJSON file'
        ).makeOptionMandatory(),
        new Option(
            '-q, --query <query>', 
            'SOQL query string to execute'
        ).conflicts('file'),
        new Option(
            '-f, --file <file>', 
            'path to a file containing a SOQL query'
        ).conflicts('query'),
        new Option(
            '-l, --limit <number>',
            'limit the number of records to export (only applies when providing an SObject name)'
        ),
        new Option(
            '--include-deleted',
            'include deleted records in the query (queryAll)'
        ).default(false),
        new Option(
            '--chunk-size <size>',
            'number of records to retrieve per API call'
        ).default(50000)
    ];

    constructor(private logger: Logger = LogManager.get('bulk-export')) {
        super();
    }

    public async run(sobject?: string) {
        let query = '';

        if (this.options.query) {
            query = this.options.query;
        } else if (this.options.file) {
            try {
                query = readFileSync(this.options.file, 'utf-8');
            } catch(e: any) {
                this.logger.error(`Unable to read query file: ${e.message}`);
                return process.exit(1);
            }
        } else if (sobject) {
            query = `SELECT Id FROM ${sobject}`;
            if (this.options.limit) {
                query += ` LIMIT ${this.options.limit}`;
            }
        }

        // Handle input query
        if (!query || !query.trim()) {
            this.logger.error('No SObject, query, or file specified. Please provide a data source to export.');
            return process.exit(1);
        }

        const outPath = resolve(process.cwd(), this.options.output);
        const connection = await this.getConnection();
        const bulkClient = new BulkClient(connection);

        this.logger.info(`Starting Bulk V2 Query: ${query}`);
        
        // Execute the job
        const job = await bulkClient.query(query, { includeDeletedRecords: this.options.includeDeleted });
        
        this.logger.info(`Bulk Job created with ID: ${job.id}`);
        this.logger.info('Waiting for job to complete...');

        // Setup the output stream
        const stream = createWriteStream(outPath, { flags: 'w' });
        
        try {
            let recordCount = 0;
            let currentLocator: string | undefined = undefined;

            // Stream results continuously as NDJSON
            for await (const record of job.records(Number(this.options.chunkSize))) {
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