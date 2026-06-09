import 'jest';

import type { FieldType } from '@vlocode/salesforce';
import { VlocityNamespaceService } from '@vlocode/vlocity';
import { container, Logger } from '@vlocode/core';
import {
    DatapackExportMatchingKeyProvider,
    DatapackExportQueries,
    DatapackExportQuerySalesforce
} from '../lib/vlocity/datapackExportQueries';

describe('DatapackExportQueries', () => {

    function mockMatchingKeyService(fields: string[] = [ 'Name' ]): DatapackExportMatchingKeyProvider {
        return {
            getMatchingKeyDefinition: async (obj: string) => ({
                sobjectType: obj,
                fields: [...fields],
                returnField: 'Id',
            })
        };
    }

    function mockSalesforce(fieldTypes?: Record<string, FieldType>, nameField: string = 'Name'): DatapackExportQuerySalesforce {
        return {
            schema: {
                describeSObjectFieldPath: (_obj: string, field: string) => {
                    const path = field.split('.');
                    return Promise.resolve(path.map(f => ({
                        name: f,
                        type: fieldTypes?.[field] ?? 'string'
                    })));
                },
                getNameField: async () => nameField
            }
        };
    }

    beforeAll(() => {
        container.add(new VlocityNamespaceService('%vlocity_namespace%'));
    });

    describe('getQuery', () => {
        it('should use null when nummeric fields are empty string', async () => {
            // Arrange
            const types = { '%vlocity_namespace%__Version__c': 'double' } satisfies Record<string, FieldType>;
            const fieds = [ 'Name', '%vlocity_namespace%__Version__c', '%vlocity_namespace%__Author__c' ];
            const sut = new DatapackExportQueries(mockMatchingKeyService(fieds), mockSalesforce(types), Logger.null);
            const entry = {
                datapackType: 'VlocityCard',
                sobjectType: '%vlocity_namespace%__VlocityCard__c',
                Name: 'Test',
                '%vlocity_namespace%__Active__c': false,
                '%vlocity_namespace%__Author__c': 'Vlocode',
                '%vlocity_namespace%__Version__c': '',
            };

            // Act
            const result = await sut.getQuery(entry);

            // Assert
            expect(result).toStrictEqual(
                `select Id, Name, LastModifiedDate, %vlocity_namespace%__Version__c, ` +
                `%vlocity_namespace%__Active__c, %vlocity_namespace%__Author__c from %vlocity_namespace%__VlocityCard__c ` +
                `where Name = 'Test' and %vlocity_namespace%__Version__c = null and %vlocity_namespace%__Author__c = 'Vlocode'`
            );
        });

        it('supports standard OmniDataTransform datapacks', async () => {
            const sut = new DatapackExportQueries(mockMatchingKeyService(), mockSalesforce(), Logger.null);
            const result = await sut.getQuery({
                datapackType: 'OmniDataTransform',
                sobjectType: 'OmniDataTransform',
                name: 'ExampleMapper'
            });

            expect(result).toStrictEqual(
                `select Id, Name from OmniDataTransform where Name = 'ExampleMapper'`
            );
        });
    });
});
