import 'jest';

import { MatchingFieldsSpec } from '../deploymentSpecs/matchingFields';

describe('MatchingFieldsSpec', () => {

    function createSpec(fileContent?: string) {
        const readFileAsString = jest.fn(async () => fileContent ?? '{}');
        const pathExists = jest.fn(async () => fileContent !== undefined);
        const fs = { pathExists, readFileAsString } as any;
        const logger = { verbose: jest.fn(), warn: jest.fn() } as any;
        return { spec: new MatchingFieldsSpec(fs, logger) as any, readFileAsString };
    }

    function record(sobjectType: string, upsertFields: string[] = []) {
        return { sobjectType, normalizedSObjectType: sobjectType, upsertFields };
    }

    it('loads matching-keys.json only once across multiple afterRecordConversion calls on the same instance', async () => {
        const { spec, readFileAsString } = createSpec(JSON.stringify({ Product2: ['ProductCode'] }));

        // Two concurrent calls (records are converted in parallel) plus a later sequential one.
        await Promise.all([
            spec.afterRecordConversion([record('Account')]),
            spec.afterRecordConversion([record('Contact')])
        ]);
        await spec.afterRecordConversion([record('Lead')]);

        expect(readFileAsString).toHaveBeenCalledTimes(1);
    });

    it('applies override matching key fields loaded from the file', async () => {
        const { spec } = createSpec(JSON.stringify({ Product2: ['ProductCode'] }));
        const rec = record('Product2', ['Name']);

        await spec.afterRecordConversion([rec]);

        expect(rec.upsertFields).toEqual(['ProductCode']);
    });
});
