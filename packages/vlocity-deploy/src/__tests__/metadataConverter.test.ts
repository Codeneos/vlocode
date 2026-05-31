import 'jest';

import { XML } from '@vlocode/util';
import { DataMapperExecutor, VlocityDatapack } from '@vlocode/vlocity';
import { MetadataConverter } from '../convert';

describe('metadataConverter', () => {
    const converter = new MetadataConverter();

    it('should round-trip OmniDataTransform metadata XML through a datapack', () => {
        // arrange
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OmniDataTransform xmlns="http://soap.sforce.com/2006/04/metadata">
    <name>ExampleMapper</name>
    <type>Extract</type>
    <active>true</active>
    <omniDataTransformItem>
        <globalKey>item-1</globalKey>
        <inputObjectName>Account</inputObjectName>
        <inputFieldName>Name</inputFieldName>
        <outputFieldName>account:name</outputFieldName>
    </omniDataTransformItem>
</OmniDataTransform>`;

        // test
        const datapack = converter.metadataXmlToDatapack('/metadata/ExampleMapper.rpt-meta.xml', xml);
        const convertedXml = converter.datapackToMetadataXml(datapack);
        const converted = XML.parse<Record<string, any>>(convertedXml, {
            arrayMode: path => path.endsWith('omniDataTransformItem')
        }).OmniDataTransform;

        // assert
        expect(datapack.sobjectType).toBe('OmniDataTransform');
        expect(datapack.name).toBe('ExampleMapper');
        expect(datapack.OmniDataTransformItem).toHaveLength(1);
        expect(datapack.OmniDataTransformItem[0].InputObjectName).toBe('Account');
        expect(converted.name).toBe('ExampleMapper');
        expect(converted.type).toBe('Extract');
        expect(converted.active).toBe(true);
        expect(converted.omniDataTransformItem[0].inputFieldName).toBe('Name');
    });

    it('should round-trip DataRaptor datapacks through metadata XML', () => {
        // arrange
        const datapack = new VlocityDatapack('DataRaptor', {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransform',
            VlocityRecordSourceKey: 'OmniDataTransform/ExampleMapper',
            Name: 'ExampleMapper',
            Type: 'Extract',
            OmniDataTransformItem: [{
                VlocityDataPackType: 'SObject',
                VlocityRecordSObjectType: 'OmniDataTransformItem',
                VlocityRecordSourceKey: 'OmniDataTransform/ExampleMapper/OmniDataTransformItem/item-1',
                GlobalKey: 'item-1',
                InputFieldName: 'Account:Name',
                OutputFieldName: 'account:name'
            }]
        });

        // test
        const xml = converter.datapackToMetadataXml(datapack);
        const converted = converter.metadataXmlToDatapack('/metadata/ExampleMapper.rpt-meta.xml', xml);

        // assert
        expect(converted.sobjectType).toBe('OmniDataTransform');
        expect(converted.name).toBe('ExampleMapper');
        expect(converted.Type).toBe('Extract');
        expect(converted.OmniDataTransformItem).toHaveLength(1);
        expect(converted.OmniDataTransformItem[0].InputFieldName).toBe('Account:Name');
        expect(converted.OmniDataTransformItem[0].OutputFieldName).toBe('account:name');
    });

    it('should produce DataMapper XML conversions that can be executed', async () => {
        // arrange
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OmniDataTransform xmlns="http://soap.sforce.com/2006/04/metadata">
    <name>ExampleTransform</name>
    <type>Transform</type>
    <inputType>JSON</inputType>
    <outputType>JSON</outputType>
    <omniDataTransformItem>
        <globalKey>item-1</globalKey>
        <inputFieldName>account:name</inputFieldName>
        <outputFieldName>customer:name</outputFieldName>
        <outputObjectName>json</outputObjectName>
    </omniDataTransformItem>
</OmniDataTransform>`;

        // test
        const datapack = converter.metadataXmlToDatapack('/metadata/ExampleTransform.rpt-meta.xml', xml);
        const result = await new DataMapperExecutor().execute(datapack, { account: { name: 'Acme' } });

        // assert
        expect(result).toEqual({ customer: { name: 'Acme' } });
    });

    it('should round-trip OmniProcess metadata XML and keep OmniScript element hierarchy', () => {
        // arrange
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OmniProcess xmlns="http://soap.sforce.com/2006/04/metadata">
    <name>Event_Assignment_English</name>
    <type>Event</type>
    <subType>Assignment</subType>
    <language>English</language>
    <omniProcessType>OmniScript</omniProcessType>
    <versionNumber>1</versionNumber>
    <omniProcessElements>
        <name>Step1</name>
        <type>Step</type>
        <childElements>
            <name>Text1</name>
            <type>Text Block</type>
        </childElements>
    </omniProcessElements>
</OmniProcess>`;

        // test
        const datapack = converter.metadataXmlToDatapack('/metadata/Event_Assignment_English.os-meta.xml', xml);
        const convertedXml = converter.datapackToMetadataXml(datapack);
        const converted = XML.parse<Record<string, any>>(convertedXml, {
            arrayMode: path => path.endsWith('omniProcessElements') || path.endsWith('childElements')
        }).OmniProcess;

        // assert
        expect(convertedXml).toContain('<OmniProcess');
        expect(convertedXml).not.toContain('<OmniScript');
        expect(datapack.sobjectType).toBe('OmniProcess');
        expect(datapack.OmniProcessElement).toHaveLength(2);
        expect(datapack.OmniProcessElement[1].ParentElementId.VlocityMatchingRecordSourceKey)
            .toBe(datapack.OmniProcessElement[0].VlocityRecordSourceKey);
        expect(converted.name).toBe('Event_Assignment_English');
        expect(converted.omniProcessElements[0].name).toBe('Step1');
        expect(converted.omniProcessElements[0].childElements[0].name).toBe('Text1');
    });

    it('should reject OmniScript metadata XML root nodes', () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OmniScript xmlns="http://soap.sforce.com/2006/04/metadata">
    <name>Event_Assignment_English</name>
</OmniScript>`;

        expect(() => converter.metadataXmlToDatapack('/metadata/Event_Assignment_English.os-meta.xml', xml))
            .toThrow('Unsupported metadata XML; expected OmniDataTransform, OmniProcess, or OmniIntegrationProcedure');
    });

    it('should round-trip OmniIntegrationProcedure metadata XML through an IntegrationProcedure datapack', () => {
        // arrange
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OmniIntegrationProcedure xmlns="http://soap.sforce.com/2006/04/metadata">
    <name>TMF_GetCustomer_English</name>
    <type>TMF</type>
    <subType>GetCustomer</subType>
    <language>English</language>
    <isIntegrationProcedure>true</isIntegrationProcedure>
    <omniProcessType>Integration Procedure</omniProcessType>
    <propertySetConfig>{"trackingCustomData":{}}</propertySetConfig>
    <versionNumber>2</versionNumber>
    <omniProcessElements>
        <name>GetCustomerIds</name>
        <type>Remote Action</type>
        <propertySetConfig>{"remoteClass":"CustomerController","remoteMethod":"getIds"}</propertySetConfig>
        <childElements>
            <name>SetResponse</name>
            <type>Set Values</type>
            <propertySetConfig>{"elementValueMap":{"data":"%GetCustomerIds%"}}</propertySetConfig>
        </childElements>
    </omniProcessElements>
</OmniIntegrationProcedure>`;

        // test
        const datapack = converter.metadataXmlToDatapack('/metadata/TMF_GetCustomer.ip-meta.xml', xml);
        const convertedXml = converter.datapackToMetadataXml(datapack);
        const converted = XML.parse<Record<string, any>>(convertedXml, {
            arrayMode: path => path.endsWith('omniProcessElements') || path.endsWith('childElements')
        }).OmniIntegrationProcedure;

        // assert
        expect(datapack.datapackType).toBe('IntegrationProcedure');
        expect(datapack.sobjectType).toBe('OmniProcess');
        expect(datapack.IsIntegrationProcedure).toBe(true);
        expect(datapack.OmniProcessElement).toHaveLength(2);
        expect(datapack.OmniProcessElement[1].ParentElementId.VlocityMatchingRecordSourceKey)
            .toBe(datapack.OmniProcessElement[0].VlocityRecordSourceKey);
        expect(converted.name).toBe('TMF_GetCustomer_English');
        expect(converted.omniProcessType).toBe('Integration Procedure');
        expect(converted.omniProcessElements[0].childElements[0].name).toBe('SetResponse');
        expect(convertedXml).not.toContain('&quot;');
        expect(convertedXml).toContain('"remoteClass": "CustomerController"');
        expect(convertedXml).toContain('"elementValueMap": {');
    });
});
