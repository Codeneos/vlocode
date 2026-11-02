import 'jest';
import { Logger } from '@vlocode/core';
import { DatapackNormalizer } from '../export/datapackNormalizer';
import { DatapackExpander } from '../export/datapackExpander';
import { DatapackExportDefinitionStore } from '../export/exportDefinitionStore';
import { DatapackExportDefinitions } from '../exportDefinitions';

const sobject = (type: string, fields: Record<string, any>) => ({
    VlocityDataPackType: 'SObject' as const, VlocityRecordSObjectType: type, VlocityRecordSourceKey: `${type}/Example`, ...fields
});

describe.each(['omniStudioStandard', 'omniStudioManaged'] as const)('%s output', runtime => {
    it('sorts mappings using all six priorities, empty values last and canonical JSON ties', () => {
        const config = DatapackExportDefinitions[runtime];
        const definitions = new DatapackExportDefinitionStore();
        definitions.load(config.definitions, { scope: config.id });
        const ref = { objectType: config.definitions.DataRaptor.objectType, datapackType: 'DataRaptor', scope: config.id };
        const [embedded] = definitions.getEmbeddedObjects(ref);
        const fields = embedded.sortFields!;
        expect(fields).toHaveLength(6);
        const mapping = (values: any[], extra = {}) => sobject(embedded.objectType!, {
            ...Object.fromEntries(fields.map((field, i) => [field, values[i]])), ...extra
        });
        const rows = [
            mapping([1, 1, 1, 'A', 'A', 'A'], { Formula: 'A' }),
            mapping([1, 1, 1, 'A', 'A', 'A'], { Formula: 'Z' }),
            mapping([1, 1, 1, 'A', 'A', 'Z']),
            mapping([1, 1, 1, 'A', 'Z', 'A']),
            mapping([1, 1, 1, 'Z', 'A', 'A']),
            mapping([1, 1, 2, 'A', 'A', 'A']),
            mapping([1, 2, 1, 'A', 'A', 'A']),
            mapping([2, 1, 1, 'A', 'A', 'A']),
            mapping([null, 1, 1, 'A', 'A', 'A'])
        ];
        const input = [...rows].reverse();
        const output = new DatapackNormalizer(definitions);
        expect(output.sortField(ref, embedded.name, input)).toEqual(rows);
        expect(input).toEqual([...rows].reverse());
        const root = output.normalizeRecord(sobject(ref.objectType, { Empty: null, Zero: 0, False: false, [embedded.name]: input }), ref);
        expect(root.Empty).toBe('');
        expect(root.Zero).toBe(0);
        expect(root.False).toBe(false);
        expect(root[embedded.name][8]).not.toHaveProperty(fields[0]);
    });
});

describe('Datapack normalization', () => {
    it('resolves managed sort fields against concrete namespace keys', () => {
        const definitions = new DatapackExportDefinitionStore();
        definitions.load(DatapackExportDefinitions.omniStudioManaged.definitions);
        const child = (name: string, order: number) => sobject('vlocity_cmt__Element__c', {
            Name: name, VlocityRecordSourceKey: `Element/${name}`, vlocity_cmt__Order__c: order
        });
        const root = sobject('vlocity_cmt__OmniScript__c', {
            vlocity_cmt__Element__c: [child('Later', 2), child('First', 1)]
        });
        const output = new DatapackNormalizer(definitions).normalizeRecord(root, { objectType: root.VlocityRecordSObjectType, datapackType: 'OmniScript' });
        expect(output.vlocity_cmt__Element__c.map((value: any) => value.Name)).toEqual(['First', 'Later']);
        expect(output.vlocity_cmt__Element__c[0]).not.toHaveProperty('vlocity_cmt__Order__c');
    });

    it('uses excluded fields for array order and filenames before pruning them without mutating input', () => {
        const definitions = new DatapackExportDefinitionStore();
        definitions.load({
            Root: { objectType: 'Root', name: ['Name'], ignoreFields: ['Name'], embeddedObjects: {
                Children: { objectType: 'Child', filter: {}, fileName: ['Name'], expandArray: true, sortFields: ['Position'] }
            } },
            Child: { objectType: 'Child', name: ['Name'], ignoreFields: ['Name', 'Position'] }
        });
        const input = sobject('Root', { Name: 'RootName', Children: [
            sobject('Child', { Name: 'Later', Position: 2 }), sobject('Child', { Name: 'Earlier', Position: 1 })
        ] });
        const before = JSON.stringify(input);
        const result = new DatapackExpander(definitions, Logger.null).expandDatapack(input, { datapackType: 'Root' });
        const root = JSON.parse(result.files['RootName_DataPack.json'].toString());
        expect(root.Children).toEqual(['RootName_Earlier.json', 'RootName_Later.json']);
        expect(root).not.toHaveProperty('Name');
        expect(JSON.parse(result.files['RootName_Earlier.json'].toString())).not.toHaveProperty('Position');
        expect(JSON.parse(result.files['RootName_Earlier.json'].toString())).not.toHaveProperty('Name');
        expect(JSON.stringify(input)).toBe(before);
    });

    it('preserves positional arrays in explicitly parsed JSON payloads, including arrays at field level', () => {
        const definitions = new DatapackExportDefinitionStore();
        definitions.load({ Root: { objectType: 'Root', name: ['Name'], fields: { Payload: { parseJson: true } } } });
        const input = sobject('Root', { Payload: [{ Name: 'Z', z: 2, a: 1 }, { Name: 'A' }] });
        const output = new DatapackNormalizer(definitions).normalizeRecord(input, { objectType: 'Root' });
        expect(output.Payload.map((item: any) => item.Name)).toEqual(['Z', 'A']);
        expect(Object.keys(output.Payload[0])).toEqual(['Name', 'a', 'z']);
    });

    it('reports a circular hierarchy rather than losing rootless elements', () => {
        const definitions = new DatapackExportDefinitionStore();
        definitions.load({ Root: { objectType: 'Root', name: ['Name'], fields: { Children: { sortParentField: 'Parent' } } } });
        const child = (key: string, parent: string) => sobject('Child', { VlocityRecordSourceKey: key, Parent: { VlocityMatchingRecordSourceKey: parent } });
        expect(() => new DatapackNormalizer(definitions).sortField({ objectType: 'Root' }, 'Children', [child('a', 'b'), child('b', 'a')]))
            .toThrow('Circular export hierarchy');
        expect(() => new DatapackNormalizer(definitions).sortField({ objectType: 'Root' }, 'Children', [child('a', 'a')]))
            .toThrow('Circular export hierarchy');
        expect(new DatapackNormalizer(definitions).sortField({ objectType: 'Root' }, 'Children', [{ Name: 'Keyless root' }]))
            .toEqual([{ Name: 'Keyless root' }]);
    });
});
