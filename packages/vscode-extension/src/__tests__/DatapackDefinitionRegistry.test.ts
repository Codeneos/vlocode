import 'jest';

import { Logger } from '@vlocode/core';
import { DatapackExportDefinitionStore } from '@vlocode/vlocity-deploy';
import { DatapackDefinitionRegistry } from '../lib/vlocity/datapackDefinitionRegistry';

describe('DatapackDefinitionRegistry', () => {

    function createRegistry() {
        return new DatapackDefinitionRegistry({} as any, {} as any, {} as any, Logger.null) as any;
    }

    function createRegistryForCapabilities(capabilities: {
        nativeOmniStudio?: boolean;
        managedOmniStudio?: boolean;
        industries?: boolean;
    }) {
        const definitions = new DatapackExportDefinitionStore();
        const vlocode = {
            isNativeOmniStudioAvailable: capabilities.nativeOmniStudio === true,
            isManagedOmniStudioAvailable: capabilities.managedOmniStudio === true || capabilities.industries === true,
            isVlocityAvailable: capabilities.industries === true,
            salesforceService: {
                schema: {
                    isSObjectAccessible: jest.fn().mockResolvedValue(true)
                }
            }
        };
        const datapackInfo = {
            getDatapackDefinitions: jest.fn().mockResolvedValue([])
        };
        const registry = new DatapackDefinitionRegistry(vlocode as any, datapackInfo as any, definitions, Logger.null) as any;
        return { registry, definitions };
    }

    describe('predefined definitions', () => {
        it('does not load product definitions without the corresponding org capabilities', async () => {
            const { registry, definitions } = createRegistryForCapabilities({});

            await registry.loadDatapackDefinitions();

            expect(registry.entries).toEqual([]);
            expect(definitions.objectDefinitions()).toEqual([]);
            expect(registry.datapackInfo.getDatapackDefinitions).not.toHaveBeenCalled();
        });

        it('loads native OmniStudio definitions as their own scoped collection', async () => {
            const { registry, definitions } = createRegistryForCapabilities({ nativeOmniStudio: true });

            await registry.loadDatapackDefinitions();

            expect(registry.entries.map((entry: any) => entry.id)).toEqual([ 'omnistudio-standard' ]);
            expect(registry.entries[0].definitions).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    datapackType: 'OmniScript',
                    exportMode: 'direct',
                    scope: 'omnistudio-standard'
                })
            ]));
            expect(definitions.objectDefinitions().every(definition => definition.scope === 'omnistudio-standard')).toBe(true);
        });

        it('loads managed OmniStudio and Industries as separate scoped collections', async () => {
            const { registry, definitions } = createRegistryForCapabilities({ industries: true });

            await registry.loadDatapackDefinitions();

            expect(registry.entries.map((entry: any) => entry.id)).toEqual([ 'omnistudio-managed', 'industries' ]);
            expect(registry.entries.flatMap((entry: any) => entry.definitions).every((definition: any) => definition.exportMode === 'direct')).toBe(true);
            expect(new Set(definitions.objectDefinitions().map(definition => definition.scope))).toEqual(
                new Set([ 'omnistudio-managed', 'industries' ])
            );
        });

        it('loads managed OmniStudio without Industries for the standalone managed package', async () => {
            const { registry } = createRegistryForCapabilities({ managedOmniStudio: true });

            await registry.loadDatapackDefinitions();

            expect(registry.entries.map((entry: any) => entry.id)).toEqual([ 'omnistudio-managed' ]);
        });

        it('loads both native and managed definition sets when both runtimes are available', async () => {
            const { registry } = createRegistryForCapabilities({ nativeOmniStudio: true, industries: true });

            await registry.loadDatapackDefinitions();

            expect(registry.entries.map((entry: any) => entry.id)).toEqual([
                'omnistudio-standard',
                'omnistudio-managed',
                'industries'
            ]);
        });
    });

    describe('toDatapackTypeDefinition', () => {
        it('uses object filters as explorer where conditions', () => {
            const registry = createRegistry();

            const result = registry.toDatapackTypeDefinition('OmniScript', {
                objectType: 'OmniProcess',
                name: [ 'Name' ],
                filter: {
                    IsIntegrationProcedure: false
                }
            });

            expect(result.source.whereCondition).toBe('IsIntegrationProcedure = false');
        });

        it('uses array filters as OR explorer where conditions', () => {
            const registry = createRegistry();

            const result = registry.toDatapackTypeDefinition('Attachment', {
                objectType: 'Attachment',
                name: [ 'Name' ],
                filter: [
                    { Id: '{Id}' },
                    { ParentId: '{Id}', Name: 'Account' },
                    { IsPrivate: false }
                ]
            });

            expect(result.source.whereCondition).toEqual({
                left: `Name = 'Account'`,
                operator: 'or',
                right: 'IsPrivate = false'
            });
        });

        it('uses string filters as explorer where conditions', () => {
            const registry = createRegistry();

            const result = registry.toDatapackTypeDefinition('CustomType', {
                objectType: 'CustomObject__c',
                name: [ 'Name' ],
                filter: `ParentId = '{Id}' AND Status__c != 'Draft'`
            });

            expect(result.source.whereCondition).toBe(`Status__c != 'Draft'`);
        });
    });

    describe('getMatchingDefinitions', () => {
        const stdOmniScript = {
            datapackType: 'OmniScript',
            typeLabel: 'OmniScript',
            source: { sobjectType: 'OmniProcess', fieldList: [ 'Id' ] },
            scope: 'std',
            exportMode: 'direct'
        };
        const customOmniScript = {
            datapackType: 'OmniScript',
            typeLabel: 'OmniScript (custom)',
            source: { sobjectType: 'OmniProcess', fieldList: [ 'Id' ] },
            scope: '/workspace/custom.yaml',
            exportMode: 'direct'
        };
        const integrationProcedure = {
            datapackType: 'IntegrationProcedure',
            typeLabel: 'Integration Procedure',
            source: { sobjectType: 'OmniProcess', fieldList: [ 'Id' ] },
            scope: 'std',
            exportMode: 'direct'
        };

        function createRegistryWithCollections(collections: any[]) {
            const registry = createRegistry();
            // Seed the cache so getDefinitionCollections() returns these without reloading.
            registry.entries = collections;
            return registry;
        }

        it('returns a single match when only one definition matches the type and object', async () => {
            const registry = createRegistryWithCollections([
                { id: 'std', label: 'Standard Datapacks', definitions: [ stdOmniScript, integrationProcedure ] }
            ]);

            const matches = await registry.getMatchingDefinitions({ datapackType: 'OmniScript', sobjectType: 'OmniProcess' });

            expect(matches).toHaveLength(1);
            expect(matches[0].definition).toBe(stdOmniScript);
            expect(matches[0].collection.label).toBe('Standard Datapacks');
        });

        it('returns every match across collections when a custom definition overrides a standard one', async () => {
            const registry = createRegistryWithCollections([
                { id: 'std', label: 'Standard Datapacks', definitions: [ stdOmniScript ] },
                { id: 'custom', label: 'Custom Datapacks', definitions: [ customOmniScript ] }
            ]);

            const matches = await registry.getMatchingDefinitions({ datapackType: 'OmniScript', sobjectType: 'OmniProcess' });

            expect(matches).toHaveLength(2);
            expect(matches.map((match: any) => match.definition)).toEqual([ stdOmniScript, customOmniScript ]);
        });

        it('matches the SObject type namespace-insensitively', async () => {
            const registry = createRegistryWithCollections([
                { id: 'std', label: 'Standard Datapacks', definitions: [
                    { ...stdOmniScript, source: { sobjectType: 'vlocity_cmt__OmniScript__c', fieldList: [ 'Id' ] } }
                ] }
            ]);

            const matches = await registry.getMatchingDefinitions({ datapackType: 'OmniScript', sobjectType: 'OmniScript__c' });

            expect(matches).toHaveLength(1);
        });

        it('does not match a different datapack type on the same object', async () => {
            const registry = createRegistryWithCollections([
                { id: 'std', label: 'Standard Datapacks', definitions: [ stdOmniScript, integrationProcedure ] }
            ]);

            const matches = await registry.getMatchingDefinitions({ datapackType: 'IntegrationProcedure', sobjectType: 'OmniProcess' });

            expect(matches).toHaveLength(1);
            expect(matches[0].definition).toBe(integrationProcedure);
        });
    });
});
