import { readFile } from 'node:fs/promises';

import { Args, Flags } from '@oclif/core';
import * as yaml from 'js-yaml';

import { SalesforceSchemaService } from '@vlocode/salesforce';

import { SalesforceCommand } from '../../salesforceCommand';

interface RecordYaml {
    data?: Record<string, unknown>;
    fields?: Record<string, unknown>;
    match?: string;
    matchingKey?: string;
    object?: string;
    record?: Record<string, unknown>;
    type?: string;
}

interface SaveResult {
    errors?: unknown[];
    id?: string;
    success: boolean;
}

const RESERVED_TOP_LEVEL_KEYS = new Set(['data', 'fields', 'match', 'matchingKey', 'object', 'record', 'type']);

function assertIdentifier(value: string, label: string) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
        throw new Error(`${label} must be a Salesforce API name, received: ${value}`);
    }
}

function assertRecordYaml(value: unknown): asserts value is RecordYaml {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Input must be a YAML object.');
    }
}

function assertRecordValue(value: unknown, label: string): asserts value is Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${label} must be a YAML object.`);
    }
}

function optionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function firstRecordField(input: RecordYaml) {
    return input.record ?? input.fields ?? input.data;
}

function getDirectRecord(input: RecordYaml) {
    const directEntries = Object.entries(input).filter(([key]) => !RESERVED_TOP_LEVEL_KEYS.has(key));
    return Object.fromEntries(directEntries);
}

function normalizeSaveResult(result: SaveResult | SaveResult[]) {
    return Array.isArray(result) ? result[0] : result;
}

function soqlLiteral(value: unknown) {
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (value === null || value === undefined) {
        return 'null';
    }
    return `'${String(value).replaceAll('\\', '\\\\').replaceAll('\'', String.raw`\'`)}'`;
}

export default class DataCreate extends SalesforceCommand<typeof DataCreate> {

    static description = 'Create or update a single Salesforce record from YAML';

    static args = {
        input: Args.string({
            description: 'YAML file containing record fields, or "-" to read YAML from stdin',
            required: true,
        }),
    };

    static flags = {
        dryRun: Flags.boolean({
            default: false,
            summary: 'show the normalized record without writing to Salesforce',
        }),
        match: Flags.string({
            summary: 'field API name used to find and update an existing record',
        }),
        object: Flags.string({
            char: 's',
            summary: 'SObject API name to create or update',
        }),
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> ./account.yml --object Account -u my-org',
        '<%= config.bin %> <%= command.id %> ./account.yml --object Account --match External_Id__c -u my-org',
    ];

    async run() {
        const input = await this.loadInput();
        assertRecordYaml(input);

        const objectName = optionalString(this.flags.object) ?? input.object ?? input.type;
        const matchingKey = optionalString(this.flags.match) ?? input.match ?? input.matchingKey;
        const rawRecord = firstRecordField(input) ?? getDirectRecord(input);

        if (!objectName) {
            this.error('No SObject API name provided. Pass --object or include object/type in the YAML file.');
        }

        assertIdentifier(objectName, 'Object');

        if (matchingKey) {
            assertIdentifier(matchingKey, 'Matching key');
        }

        assertRecordValue(rawRecord, 'Record');

        if (Object.keys(rawRecord).length === 0) {
            this.error('The YAML input does not contain any record fields.');
        }

        const record = await this.normalizeRecord(objectName, rawRecord);

        if (this.flags.dryRun) {
            this.info(`Would ${matchingKey ? 'upsert' : 'create'} ${objectName}: ${JSON.stringify(record)}`);
            return;
        }

        const existingId = matchingKey ? await this.findExistingRecordId(objectName, matchingKey, record[matchingKey]) : undefined;
        const result = existingId
            ? normalizeSaveResult(await this.connection.update(objectName, { ...record, Id: existingId }))
            : normalizeSaveResult(await this.connection.insert(objectName, record));

        if (!result?.success) {
            throw new Error(`Failed to ${existingId ? 'update' : 'create'} ${objectName}: ${JSON.stringify(result?.errors ?? result)}`);
        }

        this.info(`${existingId ? 'Updated' : 'Created'} ${objectName} ${result.id ?? existingId}`);
    }

    private async findExistingRecordId(objectName: string, matchingKey: string, value: unknown) {
        if (value === undefined || value === null) {
            throw new Error(`Matching key ${matchingKey} is not present on the normalized record.`);
        }

        const records = await this.query<{ Id: string }>(
            `SELECT Id FROM ${objectName} WHERE ${matchingKey} = ${soqlLiteral(value)} LIMIT 2`,
        );

        if (records.length > 1) {
            throw new Error(`Matching key ${matchingKey} is not unique for ${objectName}; found ${records.length} records.`);
        }

        return records[0]?.Id;
    }

    /**
     * Resolve every YAML key to its Salesforce field API name (case/namespace tolerant) using the
     * native schema service, e.g. `value` -> `Value__c`, `accountName` -> `Account.Name`.
     */
    private async normalizeRecord(objectName: string, rawRecord: Record<string, unknown>): Promise<Record<string, unknown>> {
        const schema = this.container.get(SalesforceSchemaService);
        const record: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(rawRecord)) {
            record[await schema.toSalesforceField(objectName, key)] = value;
        }
        return record;
    }

    private async loadInput(): Promise<RecordYaml> {
        if (this.args.input === '-') {
            const chunks: Buffer[] = [];
            for await (const chunk of process.stdin) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            return yaml.load(Buffer.concat(chunks).toString('utf8')) as RecordYaml;
        }

        return yaml.load(await readFile(this.args.input, 'utf8')) as RecordYaml;
    }
}
