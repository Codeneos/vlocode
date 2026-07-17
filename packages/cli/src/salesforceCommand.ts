import { CachedFileSystemAdapter, container, LogManager, NodeFileSystem } from '@vlocode/core';
import { InteractiveConnectionProvider, SalesforceConnectionProvider, SfdxConnectionProvider, JsForceConnectionProvider, SalesforceConnection, ReplayTransport, SessionDataStore, HttpTransport, TransportRecorder } from '@vlocode/salesforce';
import { VlocityNamespaceService } from '@vlocode/vlocity';
import { MatchingKeyService } from '@vlocode/vlocity-deploy';
import { Command, Option } from './command';
import { loadDefaultExportDefinitions } from './datapackLoading';

/**
 * Base command for Vlocode CLI commands that require Salesforce connectivity.
 * 
 * Creates a local container for IoC and registers the connection provider and FS interface.
 */
export abstract class SalesforceCommand extends Command {

    static options = [
        new Option('-u, --user <username>', 'Salesforce username or alias of the org to deploy the datapacks to').makeOptionMandatory(false),
        new Option('-i, --instance <url>', 'Salesforce instance URL; for example: test.salesforce.com').default('test.salesforce.com'),
        new Option('--record-session', 'record the interaction with Salesforce to a session log which can be replayed later using the `--replay-session` command').conflicts('replay-session'),
        new Option('--replay-session <file>', 'load the specified session log previously recorded through the replay session option').conflicts('record-session'),
    ];

    /**
     * Option for commands that resolve matching keys (deploy and export) to load extra matching key files;
     * apply with {@link applyMatchingKeyOptions}.
     */
    static matchingKeysOption = new Option('--matching-keys <files...>',
        'one or more JSON or YAML files defining the matching key fields per SObject type, i.e: { "Product2": [ "ProductCode" ] }. ' +
        'Matching keys from these files take precedence over matching keys defined in the org and in export definitions. ' +
        'A matching-keys.json or matching-keys.yaml file in the current directory is always loaded when present.'
    );

    /**
     * Register the matching key files from the `--matching-keys` option on the {@link MatchingKeyService}.
     */
    protected applyMatchingKeyOptions(options: { matchingKeys?: string[] }) {
        if (options.matchingKeys?.length) {
            this.container.get(MatchingKeyService).setMatchingKeyFiles(...options.matchingKeys);
        }
    }

    protected getConnection() {
        return this.container.get(SalesforceConnectionProvider).getJsForceConnection();
    }

    protected container = container.create();

    protected async init(options: any) {
        // Prep dependencies
        if (options.recordSession) {
            HttpTransport.options.recorder = new TransportRecorder(undefined, 
                options.recordSession === true ? `vlocode-session-${Math.round(Date.now() / 1000)}.log` : options.recordSession);
        }

        const connectionProvider = options.replaySession
            ? new JsForceConnectionProvider(new SalesforceConnection({
                transport: new ReplayTransport(SessionDataStore.loadSession(options.replaySession))
            }))
            : options.user
                ? new SfdxConnectionProvider(options.user)
                : new InteractiveConnectionProvider(`https://${options.instance}`);

        this.container.add(connectionProvider, { provides: [ SalesforceConnectionProvider ] });

        // Setup Namespace replacer; also register it on the global container as property-injected
        // NamespaceService lookups from instances created outside a container (e.g. QueryParser)
        // fall back to the root container and would otherwise resolve an uninitialized instance
        const namespaceService = await this.container.get(VlocityNamespaceService).initialize(connectionProvider);
        this.container.add(namespaceService);
        container.add(namespaceService);

        // Setup a Cached file system for loading datapacks
        this.container.add(new CachedFileSystemAdapter(new NodeFileSystem()));

        // Load the export definitions from the working directory when present so datapacks and
        // matching keys resolve using the actual datapack type definitions of the project
        await loadDefaultExportDefinitions(this.container, LogManager.get(SalesforceCommand));
    }
}
