import { VlocityDatapack } from '@vlocode/vlocity';

import { OmniScriptRecord } from '../types/omniScript';

describe('OmniScriptRecord', () => {
    it('converts a standard Integration Procedure datapack into the shared record model', () => {
        const sourceKey = 'OmniProcess/Customer/Get/English';
        const parentKey = `${sourceKey}/OmniProcessElement/GetCustomer`;
        const datapack = new VlocityDatapack('IntegrationProcedure', {
            VlocityRecordSObjectType: 'OmniProcess',
            VlocityRecordSourceKey: sourceKey,
            Name: 'Customer_Get_English',
            Description: 'Gets a customer',
            RequiredPermission: 'CustomerAccess',
            ResponseCacheType: 'Session',
            Type: 'Customer',
            SubType: 'Get',
            Language: 'English',
            VersionNumber: 3,
            IsActive: false,
            OmniProcessType: 'Integration Procedure',
            PropertySetConfig: { trackingCustomData: {} },
            OmniProcessElement: [{
                VlocityRecordSObjectType: 'OmniProcessElement',
                VlocityRecordSourceKey: parentKey,
                Name: 'GetCustomer',
                Type: 'Remote Action',
                IsActive: true,
                Description: 'Calls Apex',
                SequenceNumber: 1,
                Level: 0,
                PropertySetConfig: { remoteClass: 'CustomerController' }
            }, {
                VlocityRecordSObjectType: 'OmniProcessElement',
                VlocityRecordSourceKey: `${sourceKey}/OmniProcessElement/Response`,
                Name: 'Response',
                Type: 'Response Action',
                IsActive: true,
                SequenceNumber: 1,
                Level: 1,
                ParentElementId: {
                    VlocityDataPackType: 'VlocityMatchingKeyObject',
                    VlocityMatchingRecordSourceKey: parentKey,
                    VlocityRecordSObjectType: 'OmniProcessElement'
                },
                PropertySetConfig: '{"responseFormat":"JSON"}'
            }]
        });

        const record = OmniScriptRecord.fromDatapack(datapack, {
            preserveActivationState: true
        });

        expect(record).toMatchObject({
            id: sourceKey,
            vlocityRecordSourceKey: sourceKey,
            name: 'Customer_Get_English',
            description: 'Gets a customer',
            requiredPermission: 'CustomerAccess',
            responseCacheType: 'Session',
            version: 3,
            isActive: false,
            propertySet: { trackingCustomData: {} }
        });
        expect(record.elements).toEqual([
            expect.objectContaining({
                id: parentKey,
                vlocityRecordSourceKey: parentKey,
                description: 'Calls Apex',
                order: 1,
                propertySet: { remoteClass: 'CustomerController' }
            }),
            expect.objectContaining({
                parentElementId: parentKey,
                propertySet: { responseFormat: 'JSON' }
            })
        ]);

    });

    it('maps managed-package aliases and parses property sets', () => {
        const datapack = new VlocityDatapack('IntegrationProcedure', {
            VlocityRecordSObjectType: '%vlocity_namespace%__OmniScript__c',
            VlocityRecordSourceKey: 'OmniScript/Customer/Get/English',
            Name: 'Customer_Get_English',
            '%vlocity_namespace%__AdditionalInformation__c': 'Gets a customer',
            '%vlocity_namespace%__ProcedureResponseCacheType__c': 'Session',
            '%vlocity_namespace%__Type__c': 'Customer',
            '%vlocity_namespace%__SubType__c': 'Get',
            '%vlocity_namespace%__Language__c': 'English',
            '%vlocity_namespace%__Version__c': 2,
            '%vlocity_namespace%__IsActive__c': false,
            '%vlocity_namespace%__OmniProcessType__c': 'IntegrationProcedure',
            '%vlocity_namespace%__PropertySet__c': { trackingCustomData: {} },
            '%vlocity_namespace%__Element__c': [{
                VlocityRecordSObjectType: '%vlocity_namespace%__Element__c',
                VlocityRecordSourceKey: 'Element/GetCustomer',
                Name: 'GetCustomer',
                '%vlocity_namespace%__Type__c': 'Remote Action',
                '%vlocity_namespace%__Active__c': true,
                '%vlocity_namespace%__InternalNotes__c': 'Calls Apex',
                '%vlocity_namespace%__Order__c': 1,
                '%vlocity_namespace%__Level__c': 0,
                '%vlocity_namespace%__PropertySet__c': { remoteClass: 'CustomerController' }
            }]
        });

        const record = OmniScriptRecord.fromDatapack(datapack);

        expect(record).toMatchObject({
            id: 'OmniScript/Customer/Get/English',
            vlocityRecordSourceKey: 'OmniScript/Customer/Get/English',
            description: 'Gets a customer',
            responseCacheType: 'Session',
            isActive: true,
            propertySet: { trackingCustomData: {} }
        });
        expect(record.elements[0]).toMatchObject({
            id: 'Element/GetCustomer',
            vlocityRecordSourceKey: 'Element/GetCustomer',
            description: 'Calls Apex',
            propertySet: { remoteClass: 'CustomerController' }
        });

    });
});
