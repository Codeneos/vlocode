import { OmniScriptElementRecord, OmniScriptRecord } from '@vlocode/omniscript';
import { VlocityDatapack } from '@vlocode/vlocity';

import { OmniStudioConverter } from '../convert/omniStudioConverter';

describe('OmniStudioConverter', () => {
    const converter = new OmniStudioConverter();

    it('updates standard OmniScript records directly', () => {
        const datapack = new VlocityDatapack('IntegrationProcedure', {
            VlocityRecordSObjectType: 'OmniProcess',
            OmniProcessElement: [{
                VlocityRecordSObjectType: 'OmniProcessElement',
                VlocityRecordSourceKey: 'Element/GetCustomer'
            }]
        });
        OmniScriptRecord.fromDatapack(datapack);
        expect(Object.getOwnPropertyDescriptor(datapack.data, 'description')).toBeUndefined();
        const data = datapack.data as Record<string, unknown>;
        const element = data.OmniProcessElement[0];

        converter.updateDatapackRecord(element, {
            ...elementRecord(),
            propertySet: { remoteClass: 'CustomerController' }
        });
        converter.updateDatapackRecord(data, {
            ...scriptRecord(),
            element: [element],
            propertySet: { trackingCustomData: {} }
        });

        expect(datapack.data.Language).toBe('Dutch');
        expect(datapack.data.VersionNumber).toBe(2);
        expect(datapack.data.PropertySetConfig).toEqual({ trackingCustomData: {} });
        expect(element.Description).toBe('Updated Apex call');
        expect(element.IsActive).toBe(true);
        expect(element.SequenceNumber).toBe(1);
        expect(element.UniqueIndex).toBe('GetCustomer');
        expect(element.PropertySetConfig).toEqual({ remoteClass: 'CustomerController' });
        expect(() => OmniScriptRecord.fromDatapack(datapack)).not.toThrow();
    });

    it('uses the existing OmniStudio mapping for managed records', () => {
        const datapack = new VlocityDatapack('IntegrationProcedure', {
            VlocityRecordSObjectType: '%vlocity_namespace%__OmniScript__c',
            '%vlocity_namespace%__Language__c': 'English',
            '%vlocity_namespace%__Element__c': [{
                VlocityRecordSObjectType: '%vlocity_namespace%__Element__c',
                VlocityRecordSourceKey: 'Element/GetCustomer',
                '%vlocity_namespace%__InternalNotes__c': 'Calls Apex'
            }]
        });
        OmniScriptRecord.fromDatapack(datapack);
        expect(Object.getOwnPropertyDescriptor(datapack.data, 'description')).toBeUndefined();
        const data = datapack.data as Record<string, unknown>;
        const element = data['%vlocity_namespace%__Element__c'][0];

        converter.updateDatapackRecord(element, {
            ...elementRecord(),
            propertySet: { remoteClass: 'CustomerController' }
        });
        converter.updateDatapackRecord(data, {
            ...scriptRecord(),
            element: [element],
            propertySet: { trackingCustomData: {} }
        });

        expect(datapack.data['%vlocity_namespace%__Language__c']).toBe('Dutch');
        expect(datapack.data['%vlocity_namespace%__Version__c']).toBe(2);
        expect(datapack.data['%vlocity_namespace%__PropertySet__c']).toEqual({ trackingCustomData: {} });
        expect(element['%vlocity_namespace%__InternalNotes__c']).toBe('Updated Apex call');
        expect(element['%vlocity_namespace%__Active__c']).toBe(true);
        expect(element['%vlocity_namespace%__Order__c']).toBe(1);
        expect(element['%vlocity_namespace%__SearchKey__c']).toBe('GetCustomer');
        expect(element['%vlocity_namespace%__PropertySet__c']).toEqual({ remoteClass: 'CustomerController' });
        expect(datapack.data).not.toHaveProperty('Language');
        expect(element).not.toHaveProperty('Description');
        expect(() => OmniScriptRecord.fromDatapack(datapack)).not.toThrow();
    });

    it('preserves property set JSON values when converting runtimes', () => {
        const managed = new VlocityDatapack('IntegrationProcedure', {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: '%vlocity_namespace%__OmniScript__c',
            VlocityRecordSourceKey: 'IntegrationProcedure/Customer/Get/English',
            '%vlocity_namespace%__PropertySet__c': { trackingCustomData: {} },
            '%vlocity_namespace%__Element__c': [{
                VlocityDataPackType: 'SObject',
                VlocityRecordSObjectType: '%vlocity_namespace%__Element__c',
                VlocityRecordSourceKey: 'Element/GetCustomer',
                '%vlocity_namespace%__PropertySet__c': { remoteClass: 'CustomerController' }
            }]
        });

        const standard = converter.convertDatapack(managed);

        expect(standard.data.PropertySetConfig).toEqual({ trackingCustomData: {} });
        expect(standard.data.OmniProcessElement[0].PropertySetConfig).toEqual({
            remoteClass: 'CustomerController'
        });

        const convertedBack = converter.convertDatapack(standard);
        expect(convertedBack.data['%vlocity_namespace%__PropertySet__c']).toEqual({ trackingCustomData: {} });
        expect(convertedBack.data['%vlocity_namespace%__Element__c'][0]['%vlocity_namespace%__PropertySet__c']).toEqual({
            remoteClass: 'CustomerController'
        });
    });
});

function scriptRecord(): OmniScriptRecord {
    return {
        activationField: 'IsActive',
        customJavaScript: '',
        dataRaptorBundleId: '',
        id: 'IntegrationProcedure/Customer_Get_English',
        isActive: false,
        isLwcEnabled: true,
        isReusable: false,
        language: 'Dutch',
        name: 'Customer_Get_English',
        omniProcessType: 'Integration Procedure',
        propertySet: { trackingCustomData: {} },
        sObjectType: 'OmniProcess',
        subType: 'Get',
        testHTMLTemplates: '',
        type: 'Customer',
        version: 2
    };
}

function elementRecord(): OmniScriptElementRecord {
    return {
        active: true,
        description: 'Updated Apex call',
        id: 'Element/GetCustomer',
        level: 0,
        name: 'GetCustomer',
        omniScriptId: 'IntegrationProcedure/Customer_Get_English',
        order: 1,
        propertySet: { remoteClass: 'CustomerController' },
        sObjectType: 'OmniProcessElement',
        type: 'Remote Action',
        uniqueIndex: 'GetCustomer'
    };
}
