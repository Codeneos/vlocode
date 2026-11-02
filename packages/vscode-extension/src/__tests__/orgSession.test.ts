import { container, FileSystem, Logger, LogManager, MemoryFileSystem } from '@vlocode/core';
import { NamespaceService, SalesforceConnectionProvider, SalesforceSchemaService, SalesforceService } from '@vlocode/salesforce';
import { DatapackInfoService, VlocityNamespaceService } from '@vlocode/vlocity';
import { DatapackExportDefinitionStore } from '@vlocode/vlocity-deploy';
import { configureOrgSessionRoot, createOrgServices, OrgSession } from '../lib/orgSession';
import VlocodeConfiguration from '../lib/vlocodeConfiguration';

describe('OrgSession', () => {
    function createRoot() {
        const root = container.create();
        root.registerProvider(Logger, LogManager.get.bind(LogManager));
        root.add(new MemoryFileSystem(), { provides: [FileSystem] });
        root.add({ salesforce: { apiVersion: '65.0' } } as VlocodeConfiguration, { provides: [VlocodeConfiguration] });
        configureOrgSessionRoot(root);
        return root;
    }

    it.each([SalesforceConnectionProvider, SalesforceService, SalesforceSchemaService])('rejects root resolution of %p', type => {
        expect(() => createRoot().get<object>(type)).toThrow('must be resolved through an org session');
    });

    it('uses parent resources while retaining separate namespaces, definition stores and schema caches', async () => {
        const root = createRoot();
        const fs = root.get(FileSystem);
        const config = root.get(VlocodeConfiguration);
        const rootNamespace = root.get(VlocityNamespaceService);
        const rootDefinitions = root.get(DatapackExportDefinitionStore);
        const create = (username: string) => {
            const connection = {
                instanceUrl: `https://${username}.salesforce.com`,
                query2: jest.fn().mockImplementation(async query => query.includes('InstalledSubscriberPackage') ? [] : [{ NamespacePrefix: username }]),
                describeGlobal: jest.fn().mockResolvedValue({ sobjects: [{ name: 'Account', label: username }] }),
                _baseUrl: () => '/services/data/v65.0',
                request: jest.fn().mockImplementation(async ({ body }) => ({
                    results: JSON.parse(body).batchRequests.map(() => ({ result: [{ errorCode: 'NOT_FOUND' }] }))
                }))
            };
            const connector = {
                getJsForceConnection: async () => connection,
                getApiVersion: () => '65.0'
            } as unknown as SalesforceConnectionProvider;
            return { session: new OrgSession({ orgId: username, username, apiVersion: '65.0' }, root, connector), connection };
        };
        const a = create('org_a');
        const b = create('org_b');
        await a.session.initialize();
        await b.session.initialize();

        expect(a.session.salesforce).not.toBe(b.session.salesforce);
        expect(a.session.services.get(FileSystem)).toBe(fs);
        expect(b.session.services.get(VlocodeConfiguration)).toBe(config);
        expect(a.session.services.get(NamespaceService)).toBe(a.session.namespace);
        expect(a.session.namespace).not.toBe(rootNamespace);
        expect(a.session.services.get(DatapackExportDefinitionStore)).not.toBe(rootDefinitions);
        expect(a.session.services.get(DatapackExportDefinitionStore)).not.toBe(b.session.services.get(DatapackExportDefinitionStore));
        expect(a.session.salesforce.schema).not.toBe(b.session.salesforce.schema);
        expect(a.session.namespace.getNamespace()).toBe('org_a');
        expect(b.session.namespace.getNamespace()).toBe('org_b');
        await expect(a.session.salesforce.schema.describeSObjects()).resolves.toEqual([{ name: 'Account', label: 'org_a' }]);
        await expect(b.session.salesforce.schema.describeSObjects()).resolves.toEqual([{ name: 'Account', label: 'org_b' }]);
        await a.session.salesforce.schema.describeSObjects();
        expect(a.connection.describeGlobal).toHaveBeenCalledTimes(1);

        a.session.dispose();
        b.session.dispose();
        expect(root.get(FileSystem)).toBe(fs);
        expect(root.get(VlocodeConfiguration)).toBe(config);
        expect(root.get(VlocityNamespaceService)).toBe(rootNamespace);
    });

    it('keeps offline datapack definitions usable in a separate child without connecting', async () => {
        const root = createRoot();
        const connection = jest.fn().mockRejectedValue(new Error('Select a Salesforce org to connect'));
        const offline = createOrgServices(root, {
            getJsForceConnection: connection,
            isProductionOrg: jest.fn(),
            getApiVersion: () => '65.0'
        });
        try {
            const definitions = await offline.get(DatapackInfoService).getDatapackDefinitions();
            expect(definitions.some(definition => definition.datapackType === 'OmniScript')).toBe(true);
            expect(connection).toHaveBeenCalled();
        } finally {
            offline.dispose();
        }
    });
});
