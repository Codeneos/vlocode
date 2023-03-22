import { CachedFileSystemAdapter, container, NodeFileSystem, FileSystem } from '@vlocode/core';
import { InteractiveConnectionProvider, SalesforceConnectionProvider, NamespaceService, SfdxConnectionProvider, JsForceConnectionProvider, SalesforceConnection, ReplayTransport, SessionDataStore, HttpTransport, TransportRecorder } from '@vlocode/salesforce';
import { VlocityNamespaceService } from '@vlocode/vlocity-deploy';
import { Command, Option } from './command';

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

    protected container = container.new();

    protected async init(options: any) {
        // Prep dependencies
        if (options.recordSession) {
            HttpTransport.options.recorder = new TransportRecorder(undefined, 
                options.recordSession === true ? `vlocode-session-${Math.round(Date.now() / 1000)}.log` : options.recordSession);
        }

        if (options.replaySession) {
            this.container.registerAs(new JsForceConnectionProvider(new SalesforceConnection({
                transport: new ReplayTransport(SessionDataStore.loadSession(options.replaySession))
            })), SalesforceConnectionProvider);
        } else if (options.user) {
            this.container.registerAs(new SfdxConnectionProvider(options.user), SalesforceConnectionProvider);
        } else {
            this.container.registerAs(new InteractiveConnectionProvider(`https://${options.instance}`), SalesforceConnectionProvider);
        }

        // Setup Namespace replacer
        this.container.registerAs(await this.container.get(VlocityNamespaceService).initialize(this.container.get(SalesforceConnectionProvider)), NamespaceService);

        // Setup a Cached file system for loading datapacks
        this.container.registerAs(new CachedFileSystemAdapter(new NodeFileSystem()), FileSystem);
    }
}
