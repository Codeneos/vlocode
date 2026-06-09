import 'jest';

import type { DataMapperItem, FieldSuggestion, LoadObjectGroup } from './datamapper.model';
import { extractPath, filterText, inputPath, outputPath } from './datamapper-paths';
import { firstTab, getDataMapperKind, getDataMapperSubtitle, getTabs } from './datamapper-kind';
import { createExtractGroups, isExtractionItem, normalizeExtractSequences, nextExtractSequence } from './extract-groups';
import { extractSourceSuggestions, pathSuggestions, uniqueSuggestions } from './field-suggestions';
import { isFormulaItem, nextFormulaSequence, normalizeFormulaSequences } from './formulas';
import { createMappingItem } from './items';
import { createLoadObjectGroups, isLoadItem, isLoadLinkItem, isLoadMappingItem, loadObjectLabel, normalizeLoadSequences, nextLoadSequence } from './load-objects';

describe('DataMapper UI model helpers', () => {
    it('derives kind, tabs, first tab, and subtitle from metadata', () => {
        const loadModel = { header: { type: 'Load' }, items: [], sourceFormat: 'xml' as const, title: 'LoadMapper' };
        const transformModel = { header: { Type: 'Transform' }, items: [], sourceFormat: 'json' as const, title: 'TransformMapper' };
        const extractModel = { header: { Type: 'Extract' }, items: [], sourceFormat: 'json' as const, title: 'ExtractMapper' };

        expect(getDataMapperKind(loadModel)).toBe('load');
        expect(getTabs('load').map(tab => tab.id)).toEqual(['objects', 'formula', 'mapping']);
        expect(firstTab('load')).toBe('objects');
        expect(getDataMapperKind(transformModel)).toBe('transform');
        expect(getTabs('transform').map(tab => tab.id)).toEqual(['formula', 'mapping', 'preview']);
        expect(getDataMapperKind(extractModel)).toBe('extract');
        expect(getTabs('extract').map(tab => tab.id)).toEqual(['extract', 'formula', 'mapping', 'preview']);
        expect(getDataMapperSubtitle(loadModel, 'load')).toBe('XML Load DataMapper');
    });

    it('normalizes common path and filter display values', () => {
        const item = dmItem({
            InputObjectName: 'Account',
            InputFieldName: 'Name',
            OutputFieldName: 'customer:name',
            FilterOperator: 'LIKE',
            FilterValue: 'A%'
        });

        expect(inputPath(item)).toBe('Account:Name');
        expect(outputPath(item)).toBe('customer:name');
        expect(extractPath(item)).toBe('customer:name');
        expect(filterText(item)).toBe('Name LIKE A%');
        expect(filterText(dmItem())).toBe('No filter configured');
    });

    it('groups extract rows by source object, output path, and query sequence', () => {
        const items = [
            dmItem({ GlobalKey: 'map', OutputObjectName: 'json', OutputFieldName: 'customer:name' }),
            dmItem({ GlobalKey: 'formula', FormulaExpression: 'CONCAT(Name)', FormulaSequence: 1, OutputObjectName: 'Formula' }),
            dmItem({ GlobalKey: 'g2a', InputObjectName: 'Contact', OutputFieldName: 'contacts', InputObjectQuerySequence: 2, InputFieldName: 'Email' }),
            dmItem({ GlobalKey: 'g1a', InputObjectName: 'Account', OutputFieldName: 'customer', InputObjectQuerySequence: 1, InputFieldName: 'Name' }),
            dmItem({ GlobalKey: 'g1b', InputObjectName: 'Account', OutputFieldName: 'customer', InputObjectQuerySequence: 1, InputFieldName: 'Id' })
        ];

        const groups = createExtractGroups(items);

        expect(groups.map(group => `${group.sequence}:${group.inputObjectName}:${group.outputFieldName}:${group.items.length}`)).toEqual([
            '1:Account:customer:2',
            '2:Contact:contacts:1'
        ]);
        expect(items.filter(isExtractionItem).map(item => item.GlobalKey)).toEqual(['g2a', 'g1a', 'g1b']);
        expect(nextExtractSequence(items)).toBe(3);
    });

    it('resequences extract groups without touching non-extract items', () => {
        const formula = dmItem({ GlobalKey: 'formula', FormulaExpression: 'Name', FormulaSequence: 5, OutputObjectName: 'Formula' });
        const items = [
            dmItem({ GlobalKey: 'later', InputObjectName: 'Contact', OutputFieldName: 'contacts', InputObjectQuerySequence: 10 }),
            formula,
            dmItem({ GlobalKey: 'earlier', InputObjectName: 'Account', OutputFieldName: 'customer', InputObjectQuerySequence: 4 })
        ];

        normalizeExtractSequences(items);

        expect(items.map(item => `${item.GlobalKey}:${item.InputObjectQuerySequence ?? ''}:${item.FormulaSequence ?? ''}`)).toEqual([
            'later:2:',
            'formula::5',
            'earlier:1:'
        ]);
    });

    it('groups load objects and separates relationship links from field mappings', () => {
        const items = [
            dmItem({ GlobalKey: 'accountName', OutputObjectName: 'Account', OutputCreationSequence: 2, OutputFieldName: 'Name' }),
            dmItem({ GlobalKey: 'accountLink', OutputObjectName: 'Account', OutputCreationSequence: 2, LinkedObjectSequence: 1 }),
            dmItem({ GlobalKey: 'contactEmail', OutputObjectName: 'Contact', OutputCreationSequence: 1, OutputFieldName: 'Email' }),
            dmItem({ GlobalKey: 'jsonIgnored', OutputObjectName: 'json', OutputCreationSequence: 3 }),
            dmItem({ GlobalKey: 'formulaIgnored', OutputObjectName: 'Formula', FormulaExpression: 'Name' })
        ];

        const groups = createLoadObjectGroups(items);

        expect(groups.map(group => `${group.sequence}:${group.outputObjectName}:${group.items.length}:${group.links.length}`)).toEqual([
            '1:Contact:1:0',
            '2:Account:1:1'
        ]);
        expect(isLoadItem(items[0])).toBe(true);
        expect(isLoadMappingItem(items[0])).toBe(true);
        expect(isLoadLinkItem(items[1])).toBe(true);
        expect(isLoadItem(items[3])).toBe(false);
        expect(nextLoadSequence(items)).toBe(3);
        expect(loadObjectLabel(groups[0])).toBe('1 - Contact');
    });

    it('resequences load groups while preserving links and mappings together', () => {
        const items = [
            dmItem({ GlobalKey: 'accountName', OutputObjectName: 'Account', OutputCreationSequence: 4, OutputFieldName: 'Name' }),
            dmItem({ GlobalKey: 'accountLink', OutputObjectName: 'Account', OutputCreationSequence: 4, LinkedObjectSequence: 1 }),
            dmItem({ GlobalKey: 'contactEmail', OutputObjectName: 'Contact', OutputCreationSequence: 2, OutputFieldName: 'Email' })
        ];

        normalizeLoadSequences(items);

        expect(items.map(item => `${item.GlobalKey}:${item.OutputCreationSequence}`)).toEqual([
            'accountName:2',
            'accountLink:2',
            'contactEmail:1'
        ]);
    });

    it('normalizes formula detection and sequence order', () => {
        const items = [
            dmItem({ GlobalKey: 'mapping', OutputObjectName: 'json', OutputFieldName: 'customer:name' }),
            dmItem({ GlobalKey: 'second', FormulaExpression: 'B', FormulaSequence: 10 }),
            dmItem({ GlobalKey: 'first', OutputFieldName: 'Formula', FormulaSequence: 3 })
        ];

        expect(items.map(isFormulaItem)).toEqual([false, true, true]);
        expect(nextFormulaSequence(items)).toBe(11);
        normalizeFormulaSequences(items);
        expect(items.map(item => `${item.GlobalKey}:${item.FormulaSequence ?? ''}`)).toEqual([
            'mapping:',
            'second:2',
            'first:1'
        ]);
    });

    it('creates complete mapping defaults for extract and load designers', () => {
        const loadGroups: LoadObjectGroup[] = [{
            id: 'Account\u001f3',
            trackId: '3',
            outputObjectName: 'Account',
            sequence: 3,
            items: [],
            links: []
        }];
        const loadItem = createMappingItem('load', loadGroups);
        const extractItem = createMappingItem('extract', []);
        const nextLoadItem = createMappingItem('load', loadGroups, dmItem({ OutputObjectName: 'Contact', OutputCreationSequence: 5 }));

        expect(loadItem).toEqual(expect.objectContaining({
            DefaultValue: '',
            FilterGroup: 0,
            InputObjectQuerySequence: 0,
            IsDisabled: false,
            IsRequiredForUpsert: false,
            IsUpsertKey: false,
            LinkedObjectSequence: 0,
            OutputCreationSequence: 3,
            OutputObjectName: 'Account',
            TransformValuesMappings: '{ }',
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransformItem'
        }));
        expect(typeof loadItem.GlobalKey).toBe('string');
        expect(extractItem.OutputObjectName).toBe('json');
        expect(nextLoadItem.OutputObjectName).toBe('Contact');
        expect(nextLoadItem.OutputCreationSequence).toBe(5);
    });

    it('builds unique, sorted source suggestions for extract mappings', () => {
        const extractGroups = createExtractGroups([
            dmItem({ InputObjectName: 'Account', OutputFieldName: 'customer', InputObjectQuerySequence: 1 }),
            dmItem({ InputObjectName: 'Contact', OutputFieldName: 'contacts', InputObjectQuerySequence: 2 })
        ]);
        const sourceFields: FieldSuggestion[] = [
            { objectName: 'Account', name: 'Name', label: 'Account Name', path: 'Account:Name' },
            { name: 'Email', path: 'Contact:Email' }
        ];
        const formulas = [dmItem({ FormulaExpression: 'Name', FormulaResultPath: 'displayName', OutputObjectName: 'Formula' })];
        const items = [
            dmItem({ InputObjectName: 'Account', InputFieldName: 'Id' }),
            dmItem({ InputObjectName: 'Account', InputFieldName: 'customer:alreadyQualified' })
        ];

        const suggestions = extractSourceSuggestions(sourceFields, extractGroups, formulas, items);

        expect(suggestions).toEqual(expect.arrayContaining([
            expect.objectContaining({ label: 'Extract object path', path: 'customer' }),
            expect.objectContaining({ label: 'Account Name', path: 'customer:Name' }),
            expect.objectContaining({ path: 'contacts:Email' }),
            expect.objectContaining({ label: 'Formula result path', path: 'displayName' }),
            expect.objectContaining({ path: 'customer:Id' }),
            expect.objectContaining({ path: 'customer:alreadyQualified' })
        ]));
        expect(suggestions.map(suggestion => suggestion.path)).toEqual([...new Set(suggestions.map(suggestion => suggestion.path))].sort((a, b) => a.localeCompare(b)));
    });

    it('deduplicates autocomplete suggestions case-insensitively and stringifies paths', () => {
        expect(uniqueSuggestions([
            { name: 'Name', path: 'Account:Name' },
            { name: 'Duplicate', path: 'account:name' },
            { name: 'Id', path: 'Account:Id' }
        ])).toEqual([
            { name: 'Id', path: 'Account:Id' },
            { name: 'Name', path: 'Account:Name' }
        ]);
        expect(pathSuggestions(['customer:name', '', undefined, 42]).map(suggestion => suggestion.path)).toEqual(['customer:name', '42']);
    });
});

function dmItem(patch: DataMapperItem = {}): DataMapperItem {
    return patch;
}
