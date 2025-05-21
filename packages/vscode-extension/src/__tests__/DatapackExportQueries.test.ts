import 'jest';

import { SalesforceSchemaService } from '@vlocode/salesforce';
import { VlocityMatchingKey, VlocityMatchingKeyService } from '@vlocode/vlocity';
import { Logger } from '@vlocode/core';
import { DatapackExportQueries } from '../lib/vlocity/datapackExportQueries';

describe('DatapackExportQueries', () => {

    function mockMatchingKeyService(fields: string[] = [ 'Name' ]) {
        return ({
            getMatchingKeyDefinition: (obj: string) => ({
                sobjectType: obj,
                fields: fields,
                returnField: 'Id',
            }) as VlocityMatchingKey
        } as any) as VlocityMatchingKeyService;
    }

    function mockSchemaService(fieldTypes?: Record<string, string>, nameField: string = 'Name') {
        return ({
            describeSObjectFieldPath: (obj: string, field: string) => {
                const path = field.split('.');
                return Promise.resolve(path.map(f => ({
                    name: f,
                    type: fieldTypes?.[field] ?? 'string',
                    referenceTo: undefined,
                    relationshipName: undefined,
                    relationshipOrder: undefined,
                })));
            },            
            getNameField: () => {
                return nameField;
            },
        } as any) as SalesforceSchemaService;
    }

    describe('getQuery', () => {
        it('should use null when nummeric fields are empty string', async () => {
            // Arrange
            const types = { '%vlocity_namespace%__Version__c': 'double' };
            const fieds = [ 'Name', '%vlocity_namespace%__Version__c', '%vlocity_namespace%__Author__c' ];
            const sut = new DatapackExportQueries(mockMatchingKeyService(fieds), mockSchemaService(types), Logger.null);
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
                `where Name = 'Test' and %vlocity_namespace%__Version__c = null and %vlocity_namespace%__Active__c = 'false' and %vlocity_namespace%__Author__c = 'Vlocode'`
            );
        });
    });
});