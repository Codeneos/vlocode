import 'jest';
import * as path from 'path';

// Test data
import datapackData from './data/datapack.json'

import { Logger, container } from '@vlocode/core';
import { SalesforceConnectionProvider, NamespaceService, SchemaDataStore, SalesforceSchemaService,  } from '@vlocode/salesforce';
import { VlocityDatapack, VlocityNamespaceService, VlocityMatchingKeyService, VlocityMatchingKey } from '@vlocode/vlocity';
import { DatapackRecordFactory } from '../datapackRecordFactory';

describe('datapackRecordFactory', () => {
    function mockConnectionProvider(results: any[]) {
        return ({
            getJsForceConnection: () => ({
                // eslint-disable-next-line @typescript-eslint/require-await
                query: async () => ({
                    done: true,
                    totalSize: results.length,
                    records: results,
                })
            })
        } as any) as SalesforceConnectionProvider;
    }

    function mockMatchingKeyService() {
        return ({
            getMatchingKeyDefinition: (obj: string) => ({
                sobjectType: obj,
                fields: [ 'Name' ],
                returnField: 'Id',
            }) as VlocityMatchingKey
        } as any) as VlocityMatchingKeyService;
    }

    beforeAll(() =>  container.add(Logger.null));

    it('should convert datapack to multiple deployable records', async () => {
        // Arrange
        const schemaDataFile = path.join(__dirname, './data/schema.json');
        const testContainer = container.create();

        testContainer.use(mockConnectionProvider([]), SalesforceConnectionProvider);
        testContainer.use(new VlocityNamespaceService('vlocity_cmt'));
        testContainer.use(await new SchemaDataStore().loadFromFile(schemaDataFile));
        testContainer.use(mockMatchingKeyService(), VlocityMatchingKeyService);
        //testContainer.add(SalesforceSchemaService);

        const datapack = new VlocityDatapack(datapackData.VlocityDataPackType, datapackData);
        const sut = testContainer.new(DatapackRecordFactory);

        // Act
        const records = await sut.createRecords(datapack);

        // Assert
        expect(records.length).toBe(7);

        // Note this is an expensive assert that matches the expected record values
        // to the values in the datapack JSON for every record type atleast once
        expect(records[0].sobjectType).toBe('Product2');
        expect(records[0].values).toStrictEqual({
            "vlocity_cmt__ApprovedBy__c": null,
            "vlocity_cmt__ApprovedOn__c": null,
            "vlocity_cmt__AttributeDefaultValues__c": "",
            "vlocity_cmt__AttributeRules__c": "",
            "vlocity_cmt__ChangeDetectorImplementation__c": "",
            "vlocity_cmt__ClassId__c": null,
            "vlocity_cmt__DefaultImageId__c": null,
            "vlocity_cmt__EffectiveDate__c": "2019-04-02",
            "vlocity_cmt__EndDate__c": null,
            "vlocity_cmt__EndOfLifeDate__c": null,
            "vlocity_cmt__FulfilmentStartDate__c": "2019-04-01T22:11:22.123+0000",
            "vlocity_cmt__GlobalKey__c": "956f1cd4-61c3-4986-2dbd-33bef2fd4bdf",
            "vlocity_cmt__HeaderData__c": "",
            "vlocity_cmt__HelpText__c": "",
            "vlocity_cmt__ImageId__c": "",
            "vlocity_cmt__IsConfigurable__c": false,
            "vlocity_cmt__IsLocationDependent__c": false,
            "vlocity_cmt__IsNotAssetizable__c": false,
            "vlocity_cmt__IsOrderable__c": true,
            "vlocity_cmt__JeopardySafetyIntervalUnit__c": "Seconds",
            "vlocity_cmt__JeopardySafetyInterval__c": null,
            "vlocity_cmt__Modification__c": null,
            "vlocity_cmt__ObjectTypeId__c": null,
            "vlocity_cmt__ParentClassId__c": null,
            "vlocity_cmt__ProductSpecId__c": null,
            "vlocity_cmt__ProductTemplateProductId__c": null,
            "vlocity_cmt__Scope__c": "Order Item",
            "vlocity_cmt__SellingEndDate__c": null,
            "vlocity_cmt__SellingStartDate__c": "2019-04-01T22:11:22.123+0000",
            "vlocity_cmt__SpecificationType__c": "Offer",
            "vlocity_cmt__StandardPremium__c": null,
            "vlocity_cmt__Status__c": "",
            "vlocity_cmt__SubType__c": "None",
            "vlocity_cmt__TimeToLive__c": null,
            "vlocity_cmt__TrackAsAgreement__c": false,
            "vlocity_cmt__Type__c": "Hardware",
            "vlocity_cmt__VendorAccountId__c": null,
            "CanUseQuantitySchedule": false,
            "CanUseRevenueSchedule": false,
            "Description": "",
            "DisplayUrl": "",
            "ExternalDataSourceId": null,
            "ExternalId": "",
            "Family": "Mobile",
            "IsActive": true,
            "Name": "test",
            "NumberOfQuantityInstallments": null,
            "NumberOfRevenueInstallments": null,
            "ProductCode": "874473",
            "QuantityInstallmentPeriod": "",
            "QuantityScheduleType": "",
            "QuantityUnitOfMeasure": "",
            "RevenueInstallmentPeriod": "",
            "RevenueScheduleType": "",
            "Supplier__c": "Logistics"
        });

        expect(records[1].sobjectType).toBe('vlocity_cmt__CatalogProductRelationship__c');
        expect(records[1].values).toStrictEqual({
            "vlocity_cmt__EffectiveDate__c": null,
            "vlocity_cmt__EndDate__c": null,
            "vlocity_cmt__IsActive__c": true,
            "vlocity_cmt__ItemType__c": "Product",
            "vlocity_cmt__PromotionId__c": null,
            "vlocity_cmt__SequenceNumber__c": null,
            "Name": "Datapack Product2 Test"
        });

        expect(records[2].sobjectType).toBe('vlocity_cmt__ProductChildItem__c');
        expect(records[2].values).toStrictEqual({
            "vlocity_cmt__ChildLineNumber__c": "1",
            "vlocity_cmt__ChildProductId__c": null,
            "vlocity_cmt__CollapseHierarchy__c": false,
            "vlocity_cmt__GlobalKey__c": "8b31f79a-8268-65e9-3fa3-cc03ff4f1101",
            "vlocity_cmt__IsOverride__c": false,
            "vlocity_cmt__IsRootProductChildItem__c": true,
            "vlocity_cmt__IsVirtualItem__c": false,
            "vlocity_cmt__MaxQuantity__c": 99999,
            "vlocity_cmt__MaximumChildItemQuantity__c": 99999,
            "vlocity_cmt__MinMaxDefaultQty__c": "0, 99999, 1",
            "vlocity_cmt__MinQuantity__c": 0,
            "vlocity_cmt__MinimumChildItemQuantity__c": 0,
            "vlocity_cmt__Quantity__c": 1,
            "vlocity_cmt__RelationshipType__c": "Child",
            "vlocity_cmt__SelectionMethodImplementation__c": "",
            "vlocity_cmt__SeqNumber__c": 1,
            "Name": "Root PCI"
        });

        expect(records[5].sobjectType).toBe('PricebookEntry');
        expect(records[5].values).toStrictEqual({
            "vlocity_cmt__FloorPrice__c": null,
            "vlocity_cmt__OverageCharge__c": null,
            "vlocity_cmt__OverageUOM__c": "",
            "vlocity_cmt__RecurringPrice__c": null,
            "vlocity_cmt__RecurringUOM__c": "Monthly",
            "IsActive": true,
            "Name": "Datapack Product2 Test",
            "ProductCode": "874473",
            "UnitPrice": 426,
            "UseStandardPrice": false,
            "VAT_Rate__c": 21
        });
    });

    it('should stringify convert JSON object', async () => {
        // Arrange
        const testContainer = container.create();

        const datapackData = {
            "StringField__c": {
                "Test": "JSON"
            },
            "VlocityDataPackType": "SObject",
            "VlocityRecordSObjectType": "TestObject",
            "VlocityRecordSourceKey": "TestObject/956f1cd4-61c3-4986-2dbd-33bef2fd4bdf"
        };

        const schemaData = {
            "version": 1,
            "values": [ {
                "metadata": {
                    "fullName": "TestObject",
                    "fields": [ {
                        "fullName": "StringField__c",
                        "externalId": false,
                        "label": "String Field",
                        "length": 255,
                        "required": false,
                        "trackHistory": false,
                        "type": "Text",
                        "unique": false
                    } ]
                },
                "describe": {
                    "keyPrefix": "000",
                    "name": "TestObject",
                    "fields": [ {
                        "aggregatable": true,
                        "byteLength": 765,
                        "createable": true,
                        "custom": true,
                        "digits": 0,
                        "filterable": true,
                        "groupable": true,
                        "label": "String Field",
                        "length": 255,
                        "name": "StringField__c",
                        "nillable": true,
                        "permissionable": true,
                        "picklistValues": [],
                        "precision": 0,
                        "referenceTo": [],
                        "scale": 0,
                        "soapType": "xsd:string",
                        "sortable": true,
                        "type": "string",
                        "updateable": true
                    }]
                }
            } ]
        };

        testContainer.add(mockConnectionProvider([]), { provides: [ SalesforceConnectionProvider ] });
        testContainer.add(new VlocityNamespaceService('vlocity_cmt'), { provides: [ NamespaceService ] });
        testContainer.add(await new SchemaDataStore().load(schemaData), { provides: [ SchemaDataStore ] });
        testContainer.add(mockMatchingKeyService(), { provides: [ VlocityMatchingKeyService ] });

        const datapack = new VlocityDatapack(datapackData.VlocityDataPackType, datapackData);
        const sut = testContainer.new(DatapackRecordFactory);

        // Act
        const records = await sut.createRecords(datapack);

        // Assert
        expect(records.length).toBe(1);
        expect(records[0].sobjectType).toBe('TestObject');
        expect(records[0].values).toStrictEqual({
            "StringField__c": "{\"Test\":\"JSON\"}"
        });
    });
});
