import 'jest';

import {
    DataMapperFormulaEvaluator,
    DATA_MAPPER_FORMULA_FUNCTIONS
} from '../datamapper';
import {
    OmniStudioFormulaEvaluator,
    OmniStudioFormulaLanguageService,
    OMNISTUDIO_FORMULA_FUNCTIONS,
    OMNISTUDIO_FORMULA_RUNTIME_FUNCTIONS
} from '../omnistudio/formula';

describe('OmniStudio formula registry', () => {
    it('advertises documented runtime functions and keeps DataMapper compatibility aliases', () => {
        const metadataNames = new Set(OMNISTUDIO_FORMULA_FUNCTIONS.map(definition => definition.name));
        const runtimeNames = new Set(Object.keys(OMNISTUDIO_FORMULA_RUNTIME_FUNCTIONS));
        const evaluatorBuiltIns = new Set(['FILTER', 'FUNCTION', 'IF']);

        for (const metadataName of metadataNames) {
            expect(runtimeNames.has(metadataName) || evaluatorBuiltIns.has(metadataName)).toBe(true);
        }

        expect(OMNISTUDIO_FORMULA_FUNCTIONS).toBe(DATA_MAPPER_FORMULA_FUNCTIONS);
        expect(new DataMapperFormulaEvaluator()).toBeInstanceOf(OmniStudioFormulaEvaluator);
        expect(metadataNames.has('IF')).toBe(true);
        expect(metadataNames.has('FILTER')).toBe(true);
        expect(metadataNames.has('FUNCTION')).toBe(true);
        expect(metadataNames.has('QUERY')).toBe(true);
        expect(metadataNames.has('COUNTQUERY')).toBe(true);
        expect(metadataNames.has('REPLACE')).toBe(false);
    });
});

describe('OmniStudioFormulaLanguageService', () => {
    const service = new OmniStudioFormulaLanguageService();

    it('returns function and path completions', () => {
        const completions = service.getCompletions('ISB', 3, {
            paths: [{ path: 'quote:Id', label: 'Quote Id' }]
        });

        expect(completions.some(completion => completion.label === 'ISBLANK')).toBe(true);
        expect(service.getCompletions('%quote', 6, {
            paths: [{ path: 'quote:Id', label: 'Quote Id' }]
        })).toEqual(expect.arrayContaining([
            expect.objectContaining({ kind: 'path', insertText: '%quote:Id%' })
        ]));
    });

    it('returns hover and signature help from registry metadata', () => {
        expect(service.getHover('IF(true, 1, 0)', 1)).toEqual(expect.objectContaining({
            contents: expect.arrayContaining([expect.stringContaining('IF(condition, trueValue, falseValue)')])
        }));
        expect(service.getSignatureHelp('IF(true, ', 9)).toEqual(expect.objectContaining({
            name: 'IF',
            activeParameter: 1
        }));
    });

    it('validates syntax and argument counts', () => {
        expect(service.validate('UNKNOWN(1)')).toEqual(expect.arrayContaining([
            expect.objectContaining({ message: 'Unknown OmniStudio formula function: UNKNOWN' })
        ]));
        expect(service.validate('IF(true')).toEqual(expect.arrayContaining([
            expect.objectContaining({ message: 'Unclosed opening parenthesis' })
        ]));
        expect(service.validate('ISBLANK()')).toEqual(expect.arrayContaining([
            expect.objectContaining({ message: 'ISBLANK expects 1 argument(s)' })
        ]));
    });
});
