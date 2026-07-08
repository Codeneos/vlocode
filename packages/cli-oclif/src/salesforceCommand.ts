import { Command, Flags } from '@oclif/core';

import { container } from '@vlocode/core';
import {
    HttpTransport,
    InteractiveConnectionProvider,
    JsForceConnectionProvider,
    ReplayTransport,
    SalesforceConnection,
    SalesforceConnectionProvider,
    SalesforceService,
    SessionDataStore,
    SfdxConnectionProvider,
    TransportRecorder,
} from '@vlocode/salesforce';
import { VlocityNamespaceService } from '@vlocode/vlocity';

import { BaseCommand } from './baseCommand';
import { OrgSettingsStore } from './lib/orgSettings';

export interface OrganizationDetails {
    id: string;
    name: string;
    isSandbox: boolean;
    instanceName: string;
    organizationType: string;
    namespacePrefix: string;
}

interface OrganizationQueryRecord {
    Id: string;
    Name: string;
    IsSandbox: boolean;
    InstanceName: string;
    OrganizationType: string;
    NamespacePrefix: string;
}

/**
 * Base command for Vlocode CLI commands that require Salesforce connectivity.
 *
 * Builds a connection provider from the auth flags (SFDX `--user`, interactive OAuth against
 * `--instance`, or offline `--replay-session`) and registers it — plus the
 * {@link VlocityNamespaceService} — on the container so every `@vlocode/*` service shares the
 * connection. Commands work against the native services via {@link salesforce},
 * {@link getConnection} and {@link query}.
 */
export abstract class SalesforceCommand<T extends typeof Command = typeof Command> extends BaseCommand<T> {

    static baseFlags = {
        ...BaseCommand.baseFlags,
        user: Flags.string({
            char: 'u',
            helpValue: 'username@example.com',
            summary: 'Salesforce username or alias of the org to connect to',
        }),
        instance: Flags.string({
            char: 'i',
            default: 'test.salesforce.com',
            summary: 'Salesforce instance URL used for interactive OAuth; for example: test.salesforce.com',
        }),
        'api-version': Flags.string({
            helpValue: '<version>',
            summary: 'Salesforce API version to use; defaults to the latest version supported by the org',
            parse: async value => {
                if (!/^\d+(\.\d+)?$/.test(value)) {
                    throw new Error('API version must be numeric, for example: 62.0');
                }
                return value;
            },
        }),
        'record-session': Flags.boolean({
            default: false,
            exclusive: ['replay-session'],
            summary: 'record the interaction with Salesforce to a session log that can be replayed later',
        }),
        'replay-session': Flags.string({
            helpValue: '<file>',
            exclusive: ['record-session'],
            summary: 'replay a previously recorded session log instead of connecting to an org',
        }),
    };

    protected connectionProvider!: SalesforceConnectionProvider;
    protected connection!: SalesforceConnection;
    private salesforceService?: SalesforceService;

    public async init(): Promise<void> {
        await super.init();

        if (this.flags['record-session']) {
            HttpTransport.options.recorder = new TransportRecorder(
                undefined,
                `vlocode-session-${Math.round(Date.now() / 1000)}.log`
            );
        }

        this.connectionProvider = this.flags['replay-session']
            ? new JsForceConnectionProvider(new SalesforceConnection({
                transport: new ReplayTransport(SessionDataStore.loadSession(this.flags['replay-session']))
            }))
            : this.flags.user
                ? new SfdxConnectionProvider(this.flags.user)
                : new InteractiveConnectionProvider(`https://${this.flags.instance}`);

        // Register on the global container so every service resolved anywhere shares this
        // connection; the per-command `this.container` is a child and inherits these.
        container.add(this.connectionProvider, { provides: [SalesforceConnectionProvider] });

        // Namespace replacer (resolves the org's Vlocity namespace, defaulting to vlocity_cmt).
        container.add(await container.get(VlocityNamespaceService).initialize(this.connectionProvider));

        this.connection = await this.connectionProvider.getJsForceConnection();

        if (this.flags['api-version']) {
            this.connection.version = Number(this.flags['api-version']).toFixed(1);
        } else if (!this.flags['replay-session']) {
            // Default to the org's latest supported API version. Skipped for replay sessions,
            // which must stick to the API version the session was recorded with.
            await this.connection.useLatestApiVersion();
        }
        this.verbose(`Using Salesforce API version ${this.connection.version}`);
    }

    /** Cached organization details, loaded on demand by {@link getOrganizationDetails}. */
    protected orgDetails?: OrganizationDetails;

    /**
     * Query and cache the connected org's details; populates the `isSandbox`/`isProduction`/
     * `sandboxName` predicates used for pipeline `when` conditions.
     */
    public async getOrganizationDetails(): Promise<OrganizationDetails> {
        if (!this.orgDetails) {
            const [org] = await this.query<OrganizationQueryRecord>(
                'SELECT Id, Name, IsSandbox, InstanceName, OrganizationType, NamespacePrefix FROM Organization'
            );
            this.orgDetails = {
                id: org.Id,
                name: org.Name,
                isSandbox: org.IsSandbox,
                instanceName: org.InstanceName,
                organizationType: org.OrganizationType,
                namespacePrefix: org.NamespacePrefix,
            };
        }
        return this.orgDetails;
    }

    public get isSandbox(): boolean {
        return this.orgDetails?.isSandbox ?? false;
    }

    public get isProduction(): boolean {
        return !this.isSandbox;
    }

    public get sandboxName(): string | null {
        if (this.isProduction) {
            return null;
        }
        const match = this.connection.instanceUrl.match(/https:\/\/[^.]+--([^.]*)\.sandbox\.my\.salesforce\.com/);
        return match ? match[1] : null;
    }

    /**
     * A simple string key/value store backed by the org's `OrgSetting__c` custom setting, used to
     * persist delta-deployment state (deployed branch/revision). The setting object is deployed to
     * the org automatically when it does not exist yet.
     */
    public getSettingsStore(prefix?: string): OrgSettingsStore {
        return new OrgSettingsStore(this.connection, prefix);
    }

    public get salesforce(): SalesforceService {
        return this.salesforceService ??= this.container.get(SalesforceService);
    }

    public getConnection(): SalesforceConnection {
        return this.connection;
    }

    public get apiVersion(): string {
        return this.connection.version;
    }

    /**
     * Execute a SOQL query, following pagination until all records are retrieved.
     */
    public async query<TRecord = any>(soql: string): Promise<TRecord[]> {
        let result = await this.connection.query<TRecord>(soql);
        const records = [...result.records];
        while (!result.done && result.nextRecordsUrl) {
            result = await this.connection.queryMore<TRecord>(result.nextRecordsUrl);
            records.push(...result.records);
        }
        return records;
    }
}
