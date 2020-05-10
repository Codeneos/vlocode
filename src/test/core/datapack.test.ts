import { expect } from 'chai';
import { VlocityDatapack } from 'lib/vlocity/datapack';
import 'mocha';

const minimalTestDataPack = {
    "ChildData__c": [
        {
            "%vlocity_namespace%__ChildLineNumber__c": "1",
            "%vlocity_namespace%__GlobalKey__c": "8b31f79a-8268-65e9-3fa3-cc03ff4f1101",
            "%vlocity_namespace%__ParentProductId__c": {
                "%vlocity_namespace%__GlobalKey__c": "956f1cd4-61c3-4986-2dbd-33bef2fd4bdf",
                "VlocityDataPackType": "VlocityMatchingKeyObject",
                "VlocityMatchingRecordSourceKey": "Product2/956f1cd4-61c3-4986-2dbd-33bef2fd4bdf",
                "VlocityRecordSObjectType": "Product2"
            },
            "Name": "Root PCI",
            "VlocityDataPackType": "SObject",
            "VlocityRecordSObjectType": "%vlocity_namespace%__ProductChildItem__c",
            "VlocityRecordSourceKey": "%vlocity_namespace%__ProductChildItem__c/8b31f79a-8268-65e9-3fa3-cc03ff4f1101"
        }
    ],  
    "%vlocity_namespace%__GlobalKey__c": "956f1cd4-61c3-4986-2dbd-33bef2fd4bdf",
    "Name": "test",
    "RecordTypeId": {
        "DeveloperName": "Product",
        "SobjectType": "Product2",
        "VlocityDataPackType": "VlocityLookupMatchingKeyObject",
        "VlocityLookupRecordSourceKey": "RecordType/Product2/Product",
        "VlocityRecordSObjectType": "RecordType"
    },
    "RevenueInstallmentPeriod": "",
    "RevenueScheduleType": "",
    "StandardPricebookEntry": [
        {
            "IsActive": true,
            "Name": "Datapack Product2 Test",
            "Pricebook2.Name": "Standard Price Book",
            "Pricebook2Id": {
                "Name": "Standard Price Book",
                "VlocityDataPackType": "VlocityLookupMatchingKeyObject",
                "VlocityLookupRecordSourceKey": "Pricebook2/Standard Price Book",
                "VlocityRecordSObjectType": "Pricebook2"
            },
            "Product2.%vlocity_namespace%__GlobalKey__c": "956f1cd4-61c3-4986-2dbd-33bef2fd4bdf",
            "Product2Id": {
                "%vlocity_namespace%__GlobalKey__c": "956f1cd4-61c3-4986-2dbd-33bef2fd4bdf",
                "VlocityDataPackType": "VlocityMatchingKeyObject",
                "VlocityMatchingRecordSourceKey": "Product2/956f1cd4-61c3-4986-2dbd-33bef2fd4bdf",
                "VlocityRecordSObjectType": "Product2"
            },
            "VlocityDataPackType": "SObject",
            "VlocityRecordSObjectType": "PricebookEntry",
            "VlocityRecordSourceKey": "PricebookEntry/Pricebook2/Standard Price Book/Product2/956f1cd4-61c3-4986-2dbd-33bef2fd4bdf"
        }
    ],
    "Supplier__c": "Logistics",
    "VlocityDataPackType": "SObject",
    "VlocityRecordSObjectType": "Product2",
    "VlocityRecordSourceKey": "Product2/956f1cd4-61c3-4986-2dbd-33bef2fd4bdf"
};

function createDatapackSut() {
    return new VlocityDatapack('test.json', 
        minimalTestDataPack.VlocityRecordSObjectType, 
        minimalTestDataPack.VlocityRecordSourceKey, 
        './', 
        JSON.parse(JSON.stringify(minimalTestDataPack))
    );
}

describe('datapack', () => {   
    describe("#regenerateGlobalKey", function () {
        it("should update main record global key", function() {
            const datapack = createDatapackSut();
            const oldGlobalKey = datapack.globalKey;

            datapack.regenerateGlobalKey();

            // assert
            expect(datapack.globalKey).not.equals(oldGlobalKey);
            expect(JSON.stringify(datapack.data)).not.contains(oldGlobalKey);
        });
        it("should update child records global key", function() {
            const datapack = createDatapackSut();     
            const oldChildGlobalKey = datapack['ChildData__c'][0]['%vlocity_namespace%__GlobalKey__c'];

            datapack.regenerateGlobalKey();

            // assert
            expect(datapack['ChildData__c'][0]['%vlocity_namespace%__GlobalKey__c']).not.equals(oldChildGlobalKey);
            expect(JSON.stringify(datapack.data)).not.contains(oldChildGlobalKey);
        });
    });    
});