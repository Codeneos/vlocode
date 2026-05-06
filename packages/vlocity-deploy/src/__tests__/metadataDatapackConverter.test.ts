import 'jest';

import { XML } from '@vlocode/util';
import { VlocityDatapack } from '@vlocode/vlocity';
import { MetadataDatapackConverter } from '../convert';

describe('metadataDatapackConverter', () => {
    const converter = new MetadataDatapackConverter();

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

    it('should round-trip OmniScript metadata XML and keep element hierarchy', () => {
        // arrange
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OmniScript xmlns="http://soap.sforce.com/2006/04/metadata">
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
</OmniScript>`;

        // test
        const datapack = converter.metadataXmlToDatapack('/metadata/Event_Assignment_English.os-meta.xml', xml);
        const convertedXml = converter.datapackToMetadataXml(datapack);
        const converted = XML.parse<Record<string, any>>(convertedXml, {
            arrayMode: path => path.endsWith('omniProcessElements') || path.endsWith('childElements')
        }).OmniScript;

        // assert
        expect(datapack.sobjectType).toBe('OmniProcess');
        expect(datapack.OmniProcessElement).toHaveLength(2);
        expect(datapack.OmniProcessElement[1].ParentElementId.VlocityMatchingRecordSourceKey)
            .toBe(datapack.OmniProcessElement[0].VlocityRecordSourceKey);
        expect(converted.name).toBe('Event_Assignment_English');
        expect(converted.omniProcessElements[0].name).toBe('Step1');
        expect(converted.omniProcessElements[0].childElements[0].name).toBe('Text1');
    });
});
