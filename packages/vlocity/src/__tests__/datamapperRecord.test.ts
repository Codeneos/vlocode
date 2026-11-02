import 'jest';

import { VlocityDatapack } from '../datapack';
import { DataMapperRecord } from '../datamapper';

describe('DataMapperRecord', () => {
    it('creates the canonical model from standard runtime datapacks', () => {
        const datapack = new VlocityDatapack('DataRaptor', {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransform',
            VlocityRecordSourceKey: 'OmniDataTransform/AccountExtract',
            Name: 'AccountExtract',
            Type: 'Extract',
            VersionNumber: 3,
            ExpectedInputJson: '{"accountId":"001"}',
            OmniDataTransformItem: {
                VlocityDataPackType: 'SObject',
                VlocityRecordSObjectType: 'OmniDataTransformItem',
                VlocityRecordSourceKey: 'OmniDataTransformItem/AccountName',
                GlobalKey: 'AccountName',
                FilterDataType: 'STRING',
                InputObjectName: 'Account',
                InputFieldName: 'Name',
                OutputFieldName: 'account:name',
                TransformValuesMappings: '{"Acme":"ACME"}'
            }
        });

        expect(DataMapperRecord.fromDatapack(datapack)).toMatchObject({
            sObjectType: 'OmniDataTransform',
            vlocityRecordSourceKey: 'OmniDataTransform/AccountExtract',
            Name: 'AccountExtract',
            Type: 'Extract',
            VersionNumber: 3,
            ExpectedInputJson: '{"accountId":"001"}',
            OmniDataTransformItem: [{
                sObjectType: 'OmniDataTransformItem',
                vlocityRecordSourceKey: 'OmniDataTransformItem/AccountName',
                GlobalKey: 'AccountName',
                FilterDataType: 'STRING',
                InputObjectName: 'Account',
                InputFieldName: 'Name',
                OutputFieldName: 'account:name',
                TransformValuesMappings: '{"Acme":"ACME"}'
            }]
        });
    });

    it('normalizes managed runtime datapacks without mutating their field shape', () => {
        const datapack = new VlocityDatapack('DataRaptor', {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'vlocity_cmt__DRBundle__c',
            VlocityRecordSourceKey: 'vlocity_cmt__DRBundle__c/AccountExtract',
            Name: 'AccountExtract',
            vlocity_cmt__Type__c: 'Extract',
            vlocity_cmt__InputJson__c: '{"accountId":"001"}',
            vlocity_cmt__DRMapItem__c: [{
                VlocityDataPackType: 'SObject',
                VlocityRecordSObjectType: 'vlocity_cmt__DRMapItem__c',
                VlocityRecordSourceKey: 'vlocity_cmt__DRMapItem__c/AccountName',
                vlocity_cmt__GlobalKey__c: 'AccountName',
                vlocity_cmt__InterfaceObjectName__c: 'Account',
                vlocity_cmt__InterfaceFieldAPIName__c: 'Name',
                vlocity_cmt__DomainObjectFieldAPIName__c: 'account:name',
                vlocity_cmt__TransformValuesMap__c: '{"Acme":"ACME"}'
            }]
        });

        expect(DataMapperRecord.fromDatapack(datapack)).toMatchObject({
            sObjectType: '%vlocity_namespace%__DRBundle__c',
            Name: 'AccountExtract',
            Type: 'Extract',
            ExpectedInputJson: '{"accountId":"001"}',
            OmniDataTransformItem: [{
                sObjectType: '%vlocity_namespace%__DRMapItem__c',
                GlobalKey: 'AccountName',
                InputObjectName: 'Account',
                InputFieldName: 'Name',
                OutputFieldName: 'account:name',
                TransformValuesMappings: '{"Acme":"ACME"}'
            }]
        });
        expect(datapack.data).not.toHaveProperty('Type');
        expect(datapack.data).not.toHaveProperty('OmniDataTransformItem');
    });
});
