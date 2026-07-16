import 'jest';

import type { DatapackComparisonResult } from '@vlocode/vlocity-deploy';

import {
    DatapackCompareConsoleReporter,
    DatapackCompareJsonReporter,
    DatapackCompareMarkdownReporter
} from './datapackCompareReporters';

describe('Datapack compare reporters', () => {
    const report: DatapackComparisonResult = {
        total: 1,
        upToDate: false,
        datapacks: [{
            datapack: 'Product2/Root',
            type: 'Product2',
            upToDate: false,
            recordCount: 2,
            records: [{
                sourceKey: 'Product2/Root',
                sobjectType: 'Product2',
                recordId: '01t000000000001AAA',
                upToDate: true,
                matched: true,
                matchedBy: 'id',
                plannedAction: 'none',
                touchedByDeploy: false,
                deleteRecreate: false
            }, {
                sourceKey: 'Child__c/Child A',
                sobjectType: 'Child__c',
                upToDate: false,
                matched: false,
                matchedBy: 'none',
                plannedAction: 'deleteRecreate',
                touchedByDeploy: true,
                deleteRecreate: true,
                missing: true,
                missingRecordData: [
                    { field: 'Name', expected: 'Child A' },
                    { field: 'Value__c', expected: 'Expected' }
                ]
            }],
            mismatches: [{
                sourceKey: 'Child__c/Child A',
                sobjectType: 'Child__c',
                upToDate: false,
                matched: false,
                matchedBy: 'none',
                plannedAction: 'deleteRecreate',
                touchedByDeploy: true,
                deleteRecreate: true,
                missing: true,
                missingRecordData: [
                    { field: 'Name', expected: 'Child A' },
                    { field: 'Value__c', expected: 'Expected' }
                ]
            }]
        }]
    };

    it('renders embedded missing data in the console report', () => {
        const output = new DatapackCompareConsoleReporter().render(report);

        expect(output).toContain('Product2/Root');
        expect(output).toContain('delete + recreate');
        expect(output).toContain('embedded record data missing from target');
        expect(output).toContain('Value__c: Expected');
    });

    it('renders a detailed JSON report', () => {
        const output = new DatapackCompareJsonReporter().render(report);
        const parsed = JSON.parse(output);

        expect(parsed.datapacks[0].mismatches[0]).toMatchObject({
            sourceKey: 'Child__c/Child A',
            plannedAction: 'deleteRecreate',
            missingRecordData: [
                { field: 'Name', expected: 'Child A' },
                { field: 'Value__c', expected: 'Expected' }
            ]
        });
    });

    it('renders a markdown report with mismatch details', () => {
        const output = new DatapackCompareMarkdownReporter().render(report);

        expect(output).toContain('# Datapack Compare Report');
        expect(output).toContain('| Child__c/Child A | Child__c | none |  | deleteRecreate |');
        expect(output).toContain('| Value__c | Expected |');
    });

    it('escapes markdown headings generated from datapack source keys', () => {
        const output = new DatapackCompareMarkdownReporter().render({
            ...report,
            datapacks: [{
                ...report.datapacks[0],
                datapack: 'Product2/Root | Variant',
                mismatches: [{
                    ...report.datapacks[0].mismatches[0],
                    sourceKey: 'Child__c/Child | A'
                }]
            }]
        });

        expect(output).toContain('## Product2/Root \\| Variant');
        expect(output).toContain('### Child__c/Child \\| A');
    });
});
