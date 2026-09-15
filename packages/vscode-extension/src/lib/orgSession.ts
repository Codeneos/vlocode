import { Container } from '@vlocode/core';
import { SalesforceConnectionProvider, SalesforceSchemaService, SalesforceService, SfdxConnectionProvider } from '@vlocode/salesforce';
import { VlocityNamespaceService } from '@vlocode/vlocity';
import { DatapackExportDefinitionStore, MatchingKeyService } from '@vlocode/vlocity-deploy';
import VlocityDatapackService from './vlocity/vlocityDatapackService';

/**
 * Prevents the extension root from constructing services that require an org connection.
 *
 * The container permits unresolved constructor dependencies to be injected as `undefined`.
 * This factory makes an incorrect root lookup fail at resolution time. Org containers
 * override it with their own connection provider.
 *
 * @param root - The extension's shared container, configured before services are resolved.
 */
export function configureOrgSessionRoot(root: Container): void {
    root.registerFactory(SalesforceConnectionProvider, () => {
        throw new Error('Salesforce services must be resolved through an org session');
    });
}

/**
 * Creates a child container whose Salesforce services use the supplied connection provider.
 *
 * Shared instances, such as configuration and the file system, resolve from the parent.
 * Services registered locally own their org state and are disposed with the child.
 * The provider may reject connection requests when the child is used by offline editors.
 *
 * @param root - The extension container that owns shared resources and service registrations.
 * @param connector - The connection provider to use for the child's lifetime.
 * @returns A child container owned by the caller.
 */
export function createOrgServices(root: Container, connector: SalesforceConnectionProvider): Container {
    const services = root.create({ isolated: false });
    services.add(connector, { provides: [SalesforceConnectionProvider] });
    services.add(SalesforceService);
    services.add(SalesforceSchemaService);
    // Namespace and definition services can also exist in the parent without a connection.
    // Register them locally so parent instances cannot share their mutable state across orgs.
    services.add(VlocityNamespaceService);
    services.add(DatapackExportDefinitionStore);
    return services;
}

/**
 * Identifies the authenticated user and API version whose services and caches can be reused.
 * Users in the same org remain separate because their metadata access may differ.
 */
export interface OrgSessionIdentity {
    readonly orgId: string;
    /**
     * The authenticated username returned by Salesforce, with any local alias resolved.
     */
    readonly username: string;
    readonly apiVersion: string;
}

/**
 * Owns the connection, service instances and caches for one authenticated user and API version.
 *
 * A session remains bound to its identity when the selected org changes. The session manager
 * retains it for reuse and disposes its child container when it is no longer needed.
 */
export class OrgSession {
    public readonly services: Container;
    public readonly namespace: VlocityNamespaceService;
    public readonly salesforce: SalesforceService;
    public readonly datapacks: VlocityDatapackService;
    public readonly connector: SalesforceConnectionProvider;
    public isNativeOmniStudioAvailable = false;

    constructor(
        public readonly identity: OrgSessionIdentity,
        root: Container,
        connector: SalesforceConnectionProvider = new SfdxConnectionProvider(identity.username, { version: identity.apiVersion })
    ) {
        this.connector = connector;
        this.services = createOrgServices(root, connector);
        this.namespace = this.services.get(VlocityNamespaceService);
        this.salesforce = this.services.get(SalesforceService);
        this.datapacks = this.services.get(VlocityDatapackService);
    }

    public get isVlocityAvailable() {
        return /vlocity/i.test(this.namespace.getNamespace());
    }

    public get isManagedOmniStudioAvailable() {
        return this.isVlocityAvailable || /omnistudio/i.test(this.namespace.getNamespace());
    }

    /**
     * Loads the org namespace and available OmniStudio capabilities, then initializes
     * Industries services when the managed package is present.
     *
     * @returns This session after its org services are ready for use.
     */
    public async initialize(): Promise<this> {
        await this.namespace.initialize(this.connector);
        for (const type of ['OmniProcess', 'OmniDataTransform']) {
            if (await this.salesforce.schema.describeSObject(type, false)) {
                this.isNativeOmniStudioAvailable = true;
                break;
            }
        }
        if (this.isVlocityAvailable) {
            await this.datapacks.initialize();
            await this.services.get(MatchingKeyService).initialize();
        }
        return this;
    }

    /**
     * Releases services owned by this session. Shared parent instances remain available.
     */
    public dispose() {
        this.services.dispose();
    }
}
