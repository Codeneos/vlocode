import 'jest';

import type { FieldType, SalesforceSchemaService } from '@vlocode/salesforce';
import { VlocityNamespaceService } from '@vlocode/vlocity';
import { container, Logger } from '@vlocode/core';
import { DatapackExportQueries } from '../lib/vlocity/datapackExportQueries';
import type { MatchingKeyService } from '@vlocode/vlocity-deploy/src/matchingKeyService';

describe('DatapackExportQueries', () => {

    function mockMatchingKeyService(fields: string[] = [ 'Name' ]): MatchingKeyService {
        return {
            getMatchingKey: async (obj: string) => ({
                sobjectType: obj,
                fields: [...fields],
                returnField: 'Id',
            })
        } as unknown as MatchingKeyService;
    }

    function mockSchema(fieldTypes?: Record<string, FieldType>, nameField: string = 'Name'): SalesforceSchemaService {
        return {
            describeSObjectFieldPath: (_obj: string, field: string) => {
                const path = field.split('.');
                return Promise.resolve(path.map(f => ({
                    name: f,
                    type: fieldTypes?.[field] ?? 'string'
                })));
            },
            getNameField: async () => nameField
        } as unknown as SalesforceSchemaService;
    }

    beforeAll(() => {
        container.add(new VlocityNamespaceService('%vlocity_namespace%'));
    });

    describe('getQuery', () => {
        it('should use null when nummeric fields are empty string', async () => {
            // Arrange
            const types = { '%vlocity_namespace%__Version__c': 'double' } satisfies Record<string, FieldType>;
            const fieds = [ 'Name', '%vlocity_namespace%__Version__c', '%vlocity_namespace%__Author__c' ];
            const sut = new DatapackExportQueries(mockMatchingKeyService(fieds), mockSchema(types), Logger.null);
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
            expect(result.toString()).toStrictEqual(
                `select Id, Name, LastModifiedDate, %vlocity_namespace%__Version__c, ` +
                `%vlocity_namespace%__Active__c, %vlocity_namespace%__Author__c from %vlocity_namespace%__VlocityCard__c ` +
                `where Name = 'Test' and %vlocity_namespace%__Version__c = null and %vlocity_namespace%__Author__c = 'Vlocode'`
            );
        });

        it('supports standard OmniDataTransform datapacks', async () => {
            const sut = new DatapackExportQueries(mockMatchingKeyService(), mockSchema(), Logger.null);
            const result = await sut.getQuery({
                datapackType: 'OmniDataTransform',
                sobjectType: 'OmniDataTransform',
                name: 'ExampleMapper'
            });

            expect(result.toString()).toStrictEqual(
                `select Id, Name from OmniDataTransform where Name = 'ExampleMapper'`
            );
        });

        it('passes the selected definition scope without making matching keys datapack-type aware', async () => {
            const getMatchingKey = jest.fn(async (sobjectType: string) => ({
                sobjectType,
                fields: [ 'ProductCode' ],
                returnField: 'Id'
            }));
            const sut = new DatapackExportQueries({ getMatchingKey } as unknown as MatchingKeyService, mockSchema(), Logger.null);

            const datapack = {
                datapackType: 'Product2',
                sobjectType: 'Product2',
                exportDefinitionScope: '/workspace/export-definitions.yaml',
                datapackDefinition: {
                    datapackType: 'Product2',
                    typeLabel: 'Products',
                    source: {
                        sobjectType: 'Product2',
                        fieldList: [ 'Id', 'CustomLabel__c' ]
                    }
                },
                ProductCode: 'SKU-1'
            };
            const result = await sut.getQuery(datapack);

            expect(getMatchingKey).toHaveBeenCalledWith('Product2', {
                scope: '/workspace/export-definitions.yaml'
            });
            expect(result).toBe(
                `select Id, CustomLabel__c, Name, ProductCode from Product2 where ProductCode = 'SKU-1'`
            );
        });
    });
});
