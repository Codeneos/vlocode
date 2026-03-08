import { Command as OclifCommand, Flags } from '@oclif/core';
import { CachedFileSystemAdapter, container, NodeFileSystem } from '@vlocode/core';
import {
    HttpTransport,
    InteractiveConnectionProvider,
    JsForceConnectionProvider,
    ReplayTransport,
    SalesforceConnection,
    SalesforceConnectionProvider,
    SfdxConnectionProvider,
    SessionDataStore,
    TransportRecorder
} from '@vlocode/salesforce';
import { VlocityNamespaceService } from '@vlocode/vlocity';

import { Command } from './command';

export abstract class SalesforceCommand<T extends typeof OclifCommand = typeof OclifCommand> extends Command<T> {
    public static flags = {
        ...Command.flags,
        user: Flags.string({
            name: 'user',
            char: 'u',
            summary: 'Salesforce username or alias of the org to deploy the datapacks to',
        }),
        instance: Flags.string({
            name: 'instance',
            char: 'i',
            default: 'test.salesforce.com',
            summary: 'Salesforce instance URL; for example: test.salesforce.com',
        }),
        recordSession: Flags.string({
            name: 'record-session',
            summary: 'record the interaction with Salesforce to a session log which can be replayed later using the `--replay-session` command',
            exclusive: ['replaySession'],
            multiple: false,
            parse: async (input) => input || `vlocode-session-${Math.round(Date.now() / 1000)}.log`,
        }),
        replaySession: Flags.string({
            name: 'replay-session',
            summary: 'load the specified session log previously recorded through the replay session option',
            exclusive: ['recordSession'],
        }),
    };

    protected container = container.create();

    protected getConnection() {
        return this.container.get(SalesforceConnectionProvider).getJsForceConnection();
    }

    public async init(): Promise<void> {
        await super.init();

        if (this.flags.recordSession) {
            HttpTransport.options.recorder = new TransportRecorder(undefined, this.flags.recordSession);
        }

        if (this.flags.replaySession) {
            this.container.add(new JsForceConnectionProvider(new SalesforceConnection({
                transport: new ReplayTransport(SessionDataStore.loadSession(this.flags.replaySession))
            })));
        } else if (this.flags.user) {
            this.container.add(new SfdxConnectionProvider(this.flags.user));
        } else {
            this.container.add(new InteractiveConnectionProvider(`https://${this.flags.instance}`));
        }

        this.container.add(
            await this.container.get(VlocityNamespaceService).initialize(this.container.get(SalesforceConnectionProvider))
        );
        this.container.add(new CachedFileSystemAdapter(new NodeFileSystem()));
    }
}
