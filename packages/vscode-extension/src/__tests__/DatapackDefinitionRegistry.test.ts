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
});
