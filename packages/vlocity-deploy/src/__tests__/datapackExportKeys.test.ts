import 'jest';
import { Logger } from '@vlocode/core';
import { applyExportKeys } from '../export/datapackExportKeys';
import { DatapackExpander } from '../export/datapackExpander';
import { DatapackExportDefinitionStore } from '../export/exportDefinitionStore';
import { DatapackExportDefinitions } from '../exportDefinitions';

const sobject = (type: string, fields: Record<string, any>) => ({
    VlocityDataPackType: 'SObject' as const, VlocityRecordSObjectType: type, VlocityRecordSourceKey: `${type}/Example`, ...fields
});

describe('Datapack export keys', () => {
    it('writes field-list keys for records and references without changing input or matching fields', () => {
        const definitions = new DatapackExportDefinitionStore();
        definitions.load({
            Root: { objectType: 'Root', name: ['Name'], exportKey: ['Name'], ignoreFields: ['Version'] },
            Child: { objectType: 'Child', name: ['Name'], exportKey: ['Parent', 'Name'] },
            External: { objectType: 'External', name: ['Name'], exportKey: ['Name'] }
        });
        const parent = { VlocityDataPackType: 'VlocityMatchingKeyObject', VlocityMatchingRecordSourceKey: 'Root/Example/64' };
        const input = sobject('Root', { Name: 'Example', Version: 64, VlocityRecordSourceKey: 'Root/Example/64',
            Children: [sobject('Child', { Name: 'Action', Parent: parent, VlocityRecordSourceKey: 'Child/Root/Example/64/Action' })],
            External: { VlocityDataPackType: 'VlocityLookupMatchingKeyObject', VlocityRecordSObjectType: 'External', VlocityLookupRecordSourceKey: 'External/Other/12', Name: 'Other', Version: 12 }
        });
        const original = JSON.stringify(input);
        const result = new DatapackExpander(definitions, Logger.null).expandDatapack(input, { datapackType: 'Root' });
        const root = JSON.parse(result.files['Example_DataPack.json'].toString());
        expect(root.VlocityRecordSourceKey).toBe('Root/Example');
        expect(root.Children[0].VlocityRecordSourceKey).toBe('Child/Root/Example/Action');
        expect(root.Children[0].Parent.VlocityMatchingRecordSourceKey).toBe(root.VlocityRecordSourceKey);
        expect(root.External).toEqual({ ...input.External, VlocityLookupRecordSourceKey: 'External/Other' });
        expect(result.parentKeys).toEqual(['External/Other']);
        expect(JSON.stringify(input)).toBe(original);
    });

    it.each(['standard', 'managed'])('uses the referenced %s script export key even when only the dependent datapack is expanded', runtime => {
        const managed = runtime === 'managed';
        const config = DatapackExportDefinitions[managed ? 'omniStudioManaged' : 'omniStudioStandard'];
        const definitions = new DatapackExportDefinitionStore();
        definitions.load(config.definitions, { scope: config.id });
        const field = (native: string, custom: string) => managed ? `%vlocity_namespace%__${custom}__c` : native;
        const type = config.definitions.OmniScript.objectType;
        const parent = {
            VlocityDataPackType: 'VlocityLookupMatchingKeyObject', VlocityRecordSObjectType: type,
            VlocityLookupRecordSourceKey: `${type}/Fixture/Parent/English/64`,
            [field('Type', 'Type')]: 'Fixture', [field('SubType', 'SubType')]: 'Parent',
            [field('Language', 'Language')]: 'English', [field('VersionNumber', 'Version')]: 64
        };
        const input = sobject('Dependent', { Name: 'Dependent', Parent: parent });
        const result = new DatapackExpander(definitions, Logger.null).expandDatapack(input, { scope: config.id });
        const root = JSON.parse(Object.values(result.files)[0].toString());
        expect(root.Parent).toEqual({ ...parent, VlocityLookupRecordSourceKey: `${type}/Fixture/Parent/English` });
        expect(result.parentKeys).toEqual([`${type}/Fixture/Parent/English`]);
        expect(parent.VlocityLookupRecordSourceKey).toBe(`${type}/Fixture/Parent/English/64`);
    });

    it('resolves export-key lookup fields through nested references, retaining the matching fields', () => {
        const definitions = new DatapackExportDefinitionStore();
        definitions.load({
            Parent: { objectType: 'Parent', name: ['Name'], exportKey: ['Name'] },
            Child: { objectType: 'Child', name: ['Name'], exportKey: ['Parent', 'Name'] }
        });
        const parent = { VlocityDataPackType: 'VlocityLookupMatchingKeyObject', VlocityRecordSObjectType: 'Parent',
            VlocityLookupRecordSourceKey: 'Parent/Example/64', Name: 'Example', Version: 64 };
        const child = { VlocityDataPackType: 'VlocityLookupMatchingKeyObject', VlocityRecordSObjectType: 'Child',
            VlocityLookupRecordSourceKey: 'Child/Parent/Example/64/Action', Name: 'Action', Parent: parent };
        const output = applyExportKeys(sobject('Root', { Child: child }), { objectType: 'Root' }, definitions);
        expect(output.Child.VlocityLookupRecordSourceKey).toBe('Child/Parent/Example/Action');
        expect(output.Child.Parent).toEqual({ ...parent, VlocityLookupRecordSourceKey: 'Parent/Example' });
    });

    it('retains keys of references without an exportKey definition', () => {
        const definitions = new DatapackExportDefinitionStore();
        const reference = { VlocityDataPackType: 'VlocityLookupMatchingKeyObject', VlocityRecordSObjectType: 'External',
            VlocityLookupRecordSourceKey: 'External/Example/64', Name: 'Example', Version: 64 };
        const input = sobject('Root', { External: reference });
        expect(applyExportKeys(input, { objectType: 'Root' }, definitions)).toEqual(input);
    });

    it('resolves namespace-qualified fields and preserves ordered empty, zero and false components', () => {
        const definitions = new DatapackExportDefinitionStore();
        definitions.load({ Root: { objectType: 'Root', name: ['Name'], exportKey: ['%vlocity_namespace%__Code__c', 'Empty', 'Zero', 'False'] } });
        const input = sobject('Root', { vlocity_cmt__Code__c: 'Example', Empty: null, Zero: 0, False: false });
        expect(applyExportKeys(input, { objectType: 'Root' }, definitions).VlocityRecordSourceKey).toBe('Root/Example//0/false');
    });

    it('allows source versions to share a configured serialized export key', () => {
        const definitions = new DatapackExportDefinitionStore();
        definitions.load({ Child: { objectType: 'Child', name: ['Name'], exportKey: ['Name'] } });
        const input = sobject('Root', { Children: [1, 2].map(version => sobject('Child', { Name: 'Same', VlocityRecordSourceKey: `Child/Same/${version}` })) });
        const output = applyExportKeys(input, { objectType: 'Root' }, definitions);
        expect(output.Children.map((child: any) => child.VlocityRecordSourceKey)).toEqual(['Child/Same', 'Child/Same']);
    });

});
