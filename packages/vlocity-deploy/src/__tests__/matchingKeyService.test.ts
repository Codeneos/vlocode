import 'jest';

import { Logger } from '@vlocode/core';
import { removeNamespacePrefix } from '@vlocode/util';
import { MatchingKeyService } from '../matchingKeyService';
import { DatapackExportDefinitionStore } from '../export/exportDefinitionStore';
import { DatapackExportDefinitions } from '../exportDefinitions';

describe('MatchingKeyService', () => {

    function field(name: string, props?: Record<string, unknown>) {
        return {
            name,
            type: 'string',
            unique: false,
            nillable: true,
            autoNumber: false,
            calculated: false,
            nameField: false,
            cascadeDelete: false,
            relationshipOrder: null,
            referenceTo: [],
            ...props
        };
    }

    function describeOf(name: string, fields: any[]) {
        return { name, fields };
    }

    function normalize(value: string) {
        return removeNamespacePrefix(value).toLowerCase();
    }

    function mockSalesforce(describes: any[] = [], orgMatchingKeys: any[] = []) {
        const findDescribe = (type: string) => describes.find(d => normalize(d.name) === normalize(type));
        return {
            schema: {
                describeSObject: jest.fn(async (type: string) => findDescribe(type)),
                describeSObjectField: jest.fn(async (type: string, fieldName: string) =>
                    findDescribe(type)?.fields.find((f: any) => normalize(f.name) === normalize(fieldName))),
                isSObjectFieldDefined: jest.fn(async () => false)
            },
            data: {
                lookup: jest.fn(async () => orgMatchingKeys)
            }
        };
    }

    function mockFileSystem(files: Record<string, string> = {}) {
        return {
            pathExists: jest.fn(async (path: string) => path in files),
            readFileAsString: jest.fn(async (path: string) => files[path])
        };
    }

    function createService(options?: {
        describes?: any[],
        orgMatchingKeys?: any[],
        files?: Record<string, string>,
        definitions?: Record<string, any>
    }) {
        const store = new DatapackExportDefinitionStore();
        if (options?.definitions) {
            store.load(options.definitions);
        }
        const salesforce = mockSalesforce(options?.describes, options?.orgMatchingKeys);
        const fs = mockFileSystem(options?.files);
        const service = new MatchingKeyService(Logger.null, salesforce as any, store, fs as any);
        return { service, store, salesforce, fs };
    }

    const testObject = describeOf('vlocity_cmt__Test__c', [
        field('Name', { nameField: true }),
        field('vlocity_cmt__OrgField__c'),
        field('vlocity_cmt__DefField__c'),
        field('vlocity_cmt__FileField__c')
    ]);

    const testOrgKey = {
        objectAPIName: 'vlocity_cmt__Test__c',
        matchingKeyFields: 'vlocity_cmt__OrgField__c',
        returnKeyField: 'Id'
    };

    describe('#getMatchingKey', () => {
        it('prefers matching key files over export definitions and org matching keys', async () => {
            const { service } = createService({
                describes: [ testObject ],
                orgMatchingKeys: [ testOrgKey ],
                files: { 'matching-keys.json': JSON.stringify({ 'Test__c': [ 'vlocity_cmt__FileField__c' ] }) },
                definitions: { Test: { objectType: '%vlocity_namespace%__Test__c', name: '{Name}', matchingKeyFields: [ 'vlocity_cmt__DefField__c' ] } }
            });

            const matchingKey = await service.getMatchingKey('vlocity_cmt__Test__c');

            expect(matchingKey.fields).toEqual([ 'vlocity_cmt__FileField__c' ]);
        });

        it('prefers export definition matching keys over org matching keys', async () => {
            const { service } = createService({
                describes: [ testObject ],
                orgMatchingKeys: [ testOrgKey ],
                definitions: { Test: { objectType: '%vlocity_namespace%__Test__c', name: '{Name}', matchingKeyFields: [ 'vlocity_cmt__DefField__c' ] } }
            });

            const matchingKey = await service.getMatchingKey('vlocity_cmt__Test__c');

            expect(matchingKey.fields).toEqual([ 'vlocity_cmt__DefField__c' ]);
        });

        it('prefers matching keys from the selected export-definition scope', async () => {
            const product = describeOf('Product2', [
                field('Name', { nameField: true }),
                field('GlobalKey__c'),
                field('ProductCode')
            ]);
            const { service, store } = createService({ describes: [ product ] });
            store.load({
                Product2: { objectType: 'Product2', matchingKeyFields: [ 'GlobalKey__c' ] }
            }, { scope: 'industries' });
            store.load({
                Product2: { objectType: 'Product2', matchingKeyFields: [ 'ProductCode' ] }
            }, { scope: '/workspace/custom-export-definitions.yaml' });

            const customKey = await service.getMatchingKey('Product2', {
                scope: '/workspace/custom-export-definitions.yaml'
            });
            const industriesKey = await service.getMatchingKey('Product2', { scope: 'industries' });

            expect(customKey.fields).toEqual([ 'ProductCode' ]);
            expect(industriesKey.fields).toEqual([ 'GlobalKey__c' ]);
        });

        it('falls through from a scoped definition without a key to org metadata', async () => {
            const product = describeOf('Product2', [
                field('Name', { nameField: true }),
                field('ProductCode')
            ]);
            const { service, store } = createService({
                describes: [ product ],
                orgMatchingKeys: [{
                    objectAPIName: 'Product2',
                    matchingKeyFields: 'ProductCode',
                    returnKeyField: 'Id'
                }]
            });
            store.load({
                Product2: { objectType: 'Product2', name: [ 'Name' ] }
            }, { scope: '/workspace/custom-export-definitions.yaml' });

            const matchingKey = await service.getMatchingKey('Product2', {
                scope: '/workspace/custom-export-definitions.yaml'
            });

            expect(matchingKey.fields).toEqual([ 'ProductCode' ]);
        });

        it('resolves matching keys by object type when datapack definitions share an object', async () => {
            const omniProcess = describeOf('OmniProcess', [
                field('Name', { nameField: true }),
                field('Type'),
                field('SubType'),
                field('Language')
            ]);
            const { service, store } = createService({ describes: [ omniProcess ] });
            store.load({
                OmniScript: {
                    objectType: 'OmniProcess',
                    matchingKeyFields: [ 'Type', 'SubType', 'Language' ]
                },
                IntegrationProcedure: {
                    objectType: 'OmniProcess',
                    matchingKeyFields: [ 'Type', 'SubType', 'Language' ]
                }
            }, { scope: 'std' });

            const matchingKey = await service.getMatchingKey('OmniProcess', { scope: 'std' });

            expect(matchingKey.fields).toEqual([ 'Type', 'SubType', 'Language' ]);
        });

        it('resolves OmniStudio matching keys from bundled definitions by object type', async () => {
            const omniProcess = describeOf('OmniProcess', [
                field('Name', { nameField: true }),
                field('Type'),
                field('SubType'),
                field('Language'),
                field('Version')
            ]);
            const managedOmniScript = describeOf('vlocity_cmt__OmniScript__c', [
                field('Name', { nameField: true }),
                field('vlocity_cmt__Type__c'),
                field('vlocity_cmt__SubType__c'),
                field('vlocity_cmt__Language__c'),
                field('vlocity_cmt__Version__c')
            ]);
            const { service } = createService({ describes: [ omniProcess, managedOmniScript ] });

            const matchingKey = await service.getMatchingKey('OmniProcess', { scope: '/workspace/custom.yaml' });
            const managedMatchingKey = await service.getMatchingKey('vlocity_cmt__OmniScript__c', {
                scope: '/workspace/custom.yaml'
            });

            expect(matchingKey.fields).toEqual([ 'Type', 'SubType', 'Language', 'Version' ]);
            expect(managedMatchingKey.fields).toEqual([
                'vlocity_cmt__Type__c',
                'vlocity_cmt__SubType__c',
                'vlocity_cmt__Language__c',
                'vlocity_cmt__Version__c'
            ]);
            expect(DatapackExportDefinitions.omniStudioStandard.definitions.OmniScript.matchingKeyFields)
                .toEqual([ 'Type', 'SubType', 'Language', 'Version' ]);
            expect(DatapackExportDefinitions.omniStudioStandard.definitions.IntegrationProcedure.matchingKeyFields)
                .toEqual([ 'Type', 'SubType', 'Language', 'Version' ]);
            expect(DatapackExportDefinitions.omniStudioStandard.definitions.IntegrationProcedure.name)
                .toEqual([ 'Type', 'SubType' ]);
            expect(DatapackExportDefinitions.omniStudioManaged.definitions.OmniScript.matchingKeyFields)
                .toEqual([
                    '%vlocity_namespace%__Type__c',
                    '%vlocity_namespace%__SubType__c',
                    '%vlocity_namespace%__Language__c',
                    '%vlocity_namespace%__Version__c'
                ]);
            expect(DatapackExportDefinitions.omniStudioManaged.definitions.IntegrationProcedure.matchingKeyFields)
                .toEqual([
                    '%vlocity_namespace%__Type__c',
                    '%vlocity_namespace%__SubType__c',
                    '%vlocity_namespace%__Language__c',
                    '%vlocity_namespace%__Version__c'
                ]);
        });

        it('prefers consumer definitions over bundled matching key definitions', async () => {
            const omniProcess = describeOf('OmniProcess', [
                field('Name', { nameField: true }),
                field('Type'),
                field('SubType')
            ]);
            const { service } = createService({
                describes: [ omniProcess ],
                definitions: {
                    IntegrationProcedure: {
                        objectType: 'OmniProcess',
                        matchingKeyFields: [ 'Name' ]
                    }
                }
            });

            const matchingKey = await service.getMatchingKey('OmniProcess', { allowFallback: false });

            expect(matchingKey.fields).toEqual([ 'Name' ]);
        });

        it('prefers org matching keys over bundled matching key definitions', async () => {
            const omniProcess = describeOf('OmniProcess', [
                field('Name', { nameField: true }),
                field('Type'),
                field('SubType'),
                field('Language')
            ]);
            const { service } = createService({
                describes: [ omniProcess ],
                orgMatchingKeys: [{
                    objectAPIName: 'OmniProcess',
                    matchingKeyFields: 'Name',
                    returnKeyField: 'Id'
                }]
            });

            const matchingKey = await service.getMatchingKey('OmniProcess', { allowFallback: false });

            expect(matchingKey.fields).toEqual([ 'Name' ]);
        });

        it('uses org matching keys when no file or export definition defines a key', async () => {
            const { service } = createService({
                describes: [ testObject ],
                orgMatchingKeys: [ testOrgKey ]
            });

            const matchingKey = await service.getMatchingKey('vlocity_cmt__Test__c');

            expect(matchingKey.fields).toEqual([ 'vlocity_cmt__OrgField__c' ]);
        });

        it('resolves the same matching key for all namespace forms of an object', async () => {
            const { service } = createService({
                describes: [ testObject ],
                orgMatchingKeys: [ testOrgKey ]
            });

            const placeholderForm = await service.getMatchingKey('%vlocity_namespace%__Test__c');
            const namespaceForm = await service.getMatchingKey('vlocity_cmt__Test__c');
            const bareForm = await service.getMatchingKey('Test__c');

            expect(placeholderForm.fields).toEqual([ 'vlocity_cmt__OrgField__c' ]);
            expect(namespaceForm.fields).toEqual([ 'vlocity_cmt__OrgField__c' ]);
            expect(bareForm.fields).toEqual([ 'vlocity_cmt__OrgField__c' ]);
        });

        it('uses built-in default matching keys when no source defines a key', async () => {
            const { service } = createService({
                describes: [ describeOf('OmniDataTransform', [ field('Name', { nameField: true }), field('VersionNumber') ]) ]
            });

            const matchingKey = await service.getMatchingKey('OmniDataTransform', { scope: '/workspace/custom.yaml' });

            expect(matchingKey.fields).toEqual([ 'VersionNumber', 'Name' ]);
        });

        it('keeps OmniDataTransformItem key-less with the standard export definitions loaded', async () => {
            const { service } = createService({
                describes: [ describeOf('OmniDataTransformItem', [
                    field('Name', { nameField: true }),
                    field('OmniDataTransformationId', { type: 'reference', cascadeDelete: true, nillable: false, referenceTo: [ 'OmniDataTransform' ] })
                ]) ],
                definitions: DatapackExportDefinitions.omniStudioStandard.definitions
            });

            const matchingKey = await service.getMatchingKey('OmniDataTransformItem');

            // Key-less objects are always inserted; master-detail fields are not added as they would match sibling records
            expect(matchingKey.fields).toEqual([]);
        });

        it('returns an empty matching key for objects marked as auto-generated in the export definitions', async () => {
            const { service } = createService({
                describes: [ testObject ],
                definitions: { Test: { objectType: '%vlocity_namespace%__Test__c', name: '{Name}', autoGeneratedMatchingKey: true } }
            });

            const matchingKey = await service.getMatchingKey('vlocity_cmt__Test__c');

            expect(matchingKey.fields).toEqual([]);
        });

        it('falls back to a required unique field before the name field', async () => {
            const { service } = createService({
                describes: [ describeOf('Product2', [
                    field('Name', { nameField: true }),
                    field('GlobalKey__c', { unique: true, nillable: false })
                ]) ]
            });

            const matchingKey = await service.getMatchingKey('Product2');

            expect(matchingKey.fields).toEqual([ 'GlobalKey__c' ]);
        });

        it('falls back to DeveloperName before the name field', async () => {
            const { service } = createService({
                describes: [ describeOf('CustomMetadata__mdt', [
                    field('Name', { nameField: true }),
                    field('DeveloperName')
                ]) ]
            });

            const matchingKey = await service.getMatchingKey('CustomMetadata__mdt');

            expect(matchingKey.fields).toEqual([ 'DeveloperName' ]);
        });

        it('falls back to the name field when it is not an auto number field', async () => {
            const { service } = createService({
                describes: [ describeOf('Account', [ field('Name', { nameField: true }) ]) ]
            });

            const matchingKey = await service.getMatchingKey('Account');

            expect(matchingKey.fields).toEqual([ 'Name' ]);
        });

        it('does not infer a matching key when schema fallback is disabled', async () => {
            const { service } = createService({
                describes: [ describeOf('Account', [ field('Name', { nameField: true }) ]) ]
            });

            const withoutFallback = await service.getMatchingKey('Account', { allowFallback: false });
            const withFallback = await service.getMatchingKey('Account');

            expect(withoutFallback.fields).toEqual([]);
            expect(withFallback.fields).toEqual([ 'Name' ]);
        });

        it('uses a configured matching key when schema fallback is disabled', async () => {
            const { service } = createService({
                describes: [ testObject ],
                orgMatchingKeys: [ testOrgKey ]
            });

            const matchingKey = await service.getMatchingKey('Test__c', { allowFallback: false });

            expect(matchingKey.fields).toEqual([ 'vlocity_cmt__OrgField__c' ]);
        });

        it('returns an empty matching key when none can be determined', async () => {
            const { service } = createService({
                describes: [ describeOf('Junction__c', [ field('Name', { nameField: true, autoNumber: true }) ]) ]
            });

            const matchingKey = await service.getMatchingKey('Junction__c');

            expect(matchingKey.fields).toEqual([]);
        });

        it('always includes master-detail relationship fields in the matching key', async () => {
            const { service } = createService({
                describes: [ describeOf('Child__c', [
                    field('Name', { nameField: true }),
                    field('Parent__c', { type: 'reference', relationshipOrder: 0, cascadeDelete: true, nillable: false, referenceTo: [ 'Parent__c' ] })
                ]) ]
            });

            const matchingKey = await service.getMatchingKey('Child__c');

            expect(matchingKey.fields).toEqual([ 'Name', 'Parent__c' ]);
        });

        it('uses only the master-detail fields when no other matching key can be determined', async () => {
            const { service } = createService({
                describes: [ describeOf('PricebookEntry', [
                    field('Name', { nameField: true, autoNumber: true }),
                    field('Pricebook2Id', { type: 'reference', cascadeDelete: true, nillable: false, referenceTo: [ 'Pricebook2' ] }),
                    field('Product2Id', { type: 'reference', cascadeDelete: true, nillable: false, referenceTo: [ 'Product2' ] })
                ]) ]
            });

            const matchingKey = await service.getMatchingKey('PricebookEntry');

            expect(matchingKey.fields).toEqual([ 'Pricebook2Id', 'Product2Id' ]);
        });

        it('treats objects with a single master-detail field and no other key fields as key-less', async () => {
            // A single parent field would match all sibling records under the same parent; such
            // records are matched by their record data instead (SBQQ__ErrorCondition__c-like objects)
            const { service } = createService({
                describes: [ describeOf('SBQQ__ErrorCondition__c', [
                    field('Name', { nameField: true, autoNumber: true }),
                    field('SBQQ__Rule__c', { type: 'reference', cascadeDelete: true, nillable: false, referenceTo: [ 'SBQQ__ProductRule__c' ] })
                ]) ]
            });

            const matchingKey = await service.getMatchingKey('SBQQ__ErrorCondition__c');

            expect(matchingKey.fields).toEqual([]);
        });

        it('does not include optional cascade-delete lookups in the matching key', async () => {
            const { service } = createService({
                describes: [ describeOf('Contact', [
                    field('Name', { nameField: true }),
                    field('AccountId', { type: 'reference', cascadeDelete: true, nillable: true, referenceTo: [ 'Account' ] })
                ]) ]
            });

            const matchingKey = await service.getMatchingKey('Contact');

            expect(matchingKey.fields).toEqual([ 'Name' ]);
        });

        it('throws when a configured matching key field does not exist on the object', async () => {
            const { service } = createService({
                describes: [ testObject ],
                files: { 'matching-keys.json': JSON.stringify({ 'Test__c': [ 'NoSuchField__c' ] }) }
            });

            await expect(service.getMatchingKey('vlocity_cmt__Test__c'))
                .rejects.toThrow(/'NoSuchField__c' does not exist/);
        });

        it('returns a frozen matching key so callers cannot mutate the cached key', async () => {
            const { service } = createService({ describes: [ testObject ], orgMatchingKeys: [ testOrgKey ] });

            const matchingKey = await service.getMatchingKey('Test__c');

            expect(Object.isFrozen(matchingKey)).toBe(true);
            expect(Object.isFrozen(matchingKey.fields)).toBe(true);
            expect(await service.getMatchingKey('Test__c')).toBe(matchingKey);
        });

        it('ignores incomplete matching key records from the org', async () => {
            const { service } = createService({
                describes: [ testObject ],
                orgMatchingKeys: [
                    { objectAPIName: 'vlocity_cmt__Test__c', matchingKeyFields: null, returnKeyField: 'Id' },
                    { objectAPIName: null, matchingKeyFields: 'Name', returnKeyField: 'Id' }
                ]
            });

            const matchingKey = await service.getMatchingKey('Test__c');

            expect(matchingKey.fields).toEqual([ 'Name' ]);
        });

        it('throws a clear error for an undefined or empty SObject type', async () => {
            const { service } = createService();

            await expect(service.getMatchingKey(undefined as any)).rejects.toThrow(/undefined or empty SObject type/);
            await expect(service.getMatchingKey('')).rejects.toThrow(/undefined or empty SObject type/);
        });

        it('resolves matching keys without org access using configured and inferred keys', async () => {
            const { service, salesforce } = createService({ describes: [ testObject ] });
            salesforce.data.lookup.mockRejectedValue(new Error('no access'));

            const matchingKey = await service.getMatchingKey('Test__c');

            expect(matchingKey.fields).toEqual([ 'Name' ]);
        });
    });

    describe('#setMatchingKeyFiles', () => {
        it('loads matching keys from multiple files with later files overriding earlier files', async () => {
            const { service } = createService({
                describes: [ testObject ],
                files: {
                    'matching-keys.json': JSON.stringify({ 'Test__c': [ 'vlocity_cmt__FileField__c' ] }),
                    'extra-keys.json': JSON.stringify({ 'Test__c': [ 'vlocity_cmt__DefField__c' ] })
                }
            });

            service.setMatchingKeyFiles('extra-keys.json');
            const matchingKey = await service.getMatchingKey('Test__c');

            expect(matchingKey.fields).toEqual([ 'vlocity_cmt__DefField__c' ]);
        });

        it('resets previously resolved matching keys when a new file is registered', async () => {
            const { service } = createService({
                describes: [ testObject ],
                orgMatchingKeys: [ testOrgKey ],
                files: { 'extra-keys.json': JSON.stringify({ 'Test__c': [ 'vlocity_cmt__FileField__c' ] }) }
            });

            expect((await service.getMatchingKey('Test__c')).fields).toEqual([ 'vlocity_cmt__OrgField__c' ]);
            service.setMatchingKeyFiles('extra-keys.json');
            expect((await service.getMatchingKey('Test__c')).fields).toEqual([ 'vlocity_cmt__FileField__c' ]);
        });

        it('loads matching key files in YAML format', async () => {
            const { service } = createService({
                describes: [ testObject ],
                files: { 'matching-keys.yaml': 'Test__c:\n  - vlocity_cmt__FileField__c\n' }
            });

            const matchingKey = await service.getMatchingKey('Test__c');

            expect(matchingKey.fields).toEqual([ 'vlocity_cmt__FileField__c' ]);
        });

        it('ignores malformed matching key files', async () => {
            const { service } = createService({
                describes: [ testObject ],
                orgMatchingKeys: [ testOrgKey ],
                files: { 'matching-keys.json': 'not valid json {' }
            });

            const matchingKey = await service.getMatchingKey('Test__c');

            expect(matchingKey.fields).toEqual([ 'vlocity_cmt__OrgField__c' ]);
        });
    });
});
