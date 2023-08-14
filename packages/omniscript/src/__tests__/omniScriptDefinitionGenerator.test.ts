import 'jest';
import * as path from 'path';
import { readJsonSync } from 'fs-extra';

import { Logger, container } from '@vlocode/core';
import { filterObject } from '@vlocode/util';
import { VlocityNamespaceService } from '@vlocode/vlocity';
import { SalesforceConnectionProvider, NamespaceService, SalesforceConnection, SessionDataStore } from '@vlocode/salesforce';

import { MockTransport } from './mocks/mockTransport';
import { OmniScriptDefinitionBuilder } from '../omniScriptDefinitionBuilder';
import { OmniScriptDefinitionGenerator } from '../omniScriptDefinitionGenerator';

describe('OmniScriptDefinitionGenerator', () => {

    const scriptId = 'a2C0E00000604rnUAA';
    const scriptRecord = readJsonSync(path.join(__dirname, './data/omniscript-record.json'));
    const elementRecords = readJsonSync(path.join(__dirname, './data/omniscript-elements.json'));

    beforeAll(async () => {
        const sessionData = SessionDataStore.loadSession(path.join(__dirname, './data/definition-generation.json'));
        const transportMock = new MockTransport(sessionData);
        const connection = new SalesforceConnection({ version: '55.0', transport: transportMock });

        transportMock.addQueryResponse(/from\+vlocity_cmt__OmniScript__c\+where/ig, [ scriptRecord ]);
        transportMock.addQueryResponse(/from\+vlocity_cmt__Element__c\+where/ig, elementRecords);

        container.registerAs(Logger.null, Logger);
        container.registerAs(new VlocityNamespaceService('vlocity_cmt'), NamespaceService);
        container.registerAs({
            getJsForceConnection: () => {
                return Promise.resolve(connection);
            },
            getApiVersion: () => '55.0'
        } as any, SalesforceConnectionProvider);
    });

    describe('#getScriptDefinition', () => {
        it('should set base script properties according to record definition', async () => {
            // test
            const definition = await container.create(OmniScriptDefinitionGenerator).getScriptDefinition(scriptId)

            // assert
            expect(definition.sOmniScriptId).toBe(scriptId);
            expect(definition.bpVersion).toBe(5);
            expect(definition.bpType).toBe('Vlocode');
            expect(definition.bpSubType).toBe('test');
            expect(definition.bpLang).toBe('English');
            expect(definition.bHasAttachment).toBe(false);
            expect(definition.bReusable).toBe(false);
            expect(definition.children.length).toBe(17);
            expect(definition.labelKeyMap).toStrictEqual({});
        });
        it('should populate rMap for all repeat, multi-select and radio elements', async () => {
            // test
            const definition = await container.create(OmniScriptDefinitionGenerator).getScriptDefinition(scriptId);

            // assert
            expect(Object.keys(definition.rMap).sort()).toStrictEqual([
                "Text2",
                "Radio1",
                "Multi-select1",
                "Radio3",
                "Radio2",
                "RadioGroup1",
                "EditBlock1"
            ].sort());
        });
        it('should add root elements in the correct order and index', async () => {
            // test
            const definition = await container.create(OmniScriptDefinitionGenerator).getScriptDefinition(scriptId)

            // assert
            const selectElement = new OmniScriptDefinitionBuilder(definition).findElement('Select1');
            expect(selectElement?.propSetMap?.options).toStrictEqual([
                {
                    "name": "OmniScript",
                    "value": "OmniScript"
                },
                {
                    "name": "Integration Procedure",
                    "value": "Integration Procedure"
                },
                {
                    "name": "Test Procedure",
                    "value": "Test Procedure"
                }
            ]);
        });
        it('should pre-populate picklist values for choice elements', async () => {
            // test
            const definition = await container.create(OmniScriptDefinitionGenerator).getScriptDefinition(scriptId)

            // assert
            const propertiesToValidate = [ "type", "name", "indexInParent", "level", "offSet" ];
            const children = definition.children.map(child => filterObject(child, key => propertiesToValidate.includes(key)));
            expect(children).toStrictEqual([
                { type: "Set Values", name: "SetValues2", level: 0, indexInParent: 0, offSet: 0 },
                { type: "Step", name: "Step1", level: 0, indexInParent: 1, offSet: 0 },
                { type: "Step", name: "Step2", level: 0, indexInParent: 2, offSet: 0 },
                { type: "Set Values", name: "SetValues1", level: 0, indexInParent: 3, offSet: 0 },
                { type: "Set Errors", name: "SetErrors1", level: 0, indexInParent: 4, offSet: 0 },
                { type: "DataRaptor Extract Action", name: "DataRaptorExtractAction2", level: 0, indexInParent: 5, offSet: 0 },
                { type: "Email Action", name: "EmailAction1", level: 0, indexInParent: 6, offSet: 0 },
                { type: "DocuSign Envelope Action", name: "DocuSignEnvelopeAction1", level: 0, indexInParent: 7, offSet: 0 },
                { type: "Delete Action", name: "DeleteAction1", level: 0, indexInParent: 8, offSet: 0 },
                { type: "Integration Procedure Action", name: "IntegrationProcedureAction1", level: 0, indexInParent: 9, offSet: 0 },
                { type: "Review Action", name: "ReviewAction1", level: 0, indexInParent: 10, offSet: 0 },
                { type: "Rest Action", name: "HTTPAction1", level: 0, indexInParent: 11, offSet: 0 },
                { type: "Post to Object Action", name: "PosttoObjectAction1", level: 0, indexInParent: 12, offSet: 0 },
                { type: "PDF Action", name: "PDFAction1", level: 0, indexInParent: 13, offSet: 0 },
                { type: "Matrix Action", name: "MatrixAction1", level: 0, indexInParent: 14, offSet: 0 },
                { type: "Navigate Action", name: "NavigateAction1", level: 0, indexInParent: 15, offSet: 0 },
                { type: "Done Action", name: "DoneAction1", level: 0, indexInParent: 16, offSet: 0 }
            ]);
        });
        it('should exactly match standard definition', async () => {
            // Note: this is an E2E test that compares the generated definition from the OmniScriptDefinitionGenerator
            // for a test script with various elements and configuration to a version that is generated by the APEX script definition generator
            // it should always pass unless the elements JSON file is changed
            // Vlocity version: 900.449 (CMT Winter 2022)
            const expectedDefinition = readJsonSync(path.join(__dirname, './data/omniscript-definition.json'));
            const definition = await container.create(OmniScriptDefinitionGenerator).getScriptDefinition(scriptId);
            definition.lwcId = 'xxx';

            // assert
            expect(definition).toEqual(expectedDefinition);
        });
    });
});