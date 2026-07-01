import 'jest';

import { Logger } from '@vlocode/core';
import { DatapackDefinitionRegistry } from '../lib/vlocity/datapackDefinitionRegistry';

describe('DatapackDefinitionRegistry', () => {

    function createRegistry() {
        return new DatapackDefinitionRegistry({} as any, {} as any, {} as any, Logger.null) as any;
    }

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
