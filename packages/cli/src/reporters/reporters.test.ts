import 'jest';

import { DatapackComparisonResult } from '@vlocode/vlocity-deploy';

import { ConsoleComparisonReporter } from './consoleComparisonReporter';
import { JsonComparisonReporter } from './jsonComparisonReporter';
import { MarkdownComparisonReporter } from './markdownComparisonReporter';

describe('comparison reporters', () => {

    const comparisonResult: DatapackComparisonResult = {
        total: 3,
        inSync: 1,
        outOfSync: 1,
        unknown: 1,
        datapacks: [
            {
                datapackKey: 'Product2/ProductA',
                datapackType: 'Product2',
                status: 'inSync',
                inSync: true,
                recordCount: 3,
                inSyncCount: 3,
                outOfSyncCount: 0,
                missingCount: 0,
                unknownCount: 0,
                records: [],
                extraOrgRecords: [],
                messages: []
            },
            {
                datapackKey: 'Product2/ProductB',
                datapackType: 'Product2',
                status: 'outOfSync',
                inSync: false,
                recordCount: 3,
                inSyncCount: 1,
                outOfSyncCount: 1,
                missingCount: 1,
                unknownCount: 0,
                records: [
                    {
                        sourceKey: 'Product2/ProductB',
                        sobjectType: 'Product2',
                        datapackKey: 'Product2/ProductB',
                        status: 'outOfSync',
                        deployAction: 'update',
                        recordId: '01t000000000001AAA',
                        mismatchedFields: [ { field: 'Name', expected: 'Product B|v2', actual: 'Product B' } ],
                        messages: []
                    },
                    {
                        sourceKey: 'Child__c/CHILD-1',
                        sobjectType: 'Child__c',
                        datapackKey: 'Product2/ProductB',
                        status: 'missing',
                        deployAction: 'insert',
                        missingData: { Name: 'Child 1', Sequence__c: 1 },
                        messages: []
                    }
                ],
                extraOrgRecords: [
                    { sobjectType: 'Child__c', recordId: 'a00000000000001AAA', values: { Name: 'Old child' } }
                ],
                messages: []
            },
            {
                datapackKey: 'OmniScript/Broken',
                datapackType: 'OmniScript',
                status: 'unknown',
                inSync: false,
                recordCount: 0,
                inSyncCount: 0,
                outOfSyncCount: 0,
                missingCount: 0,
                unknownCount: 0,
                records: [],
                extraOrgRecords: [],
                messages: [ 'Error while loading Datapack' ]
            }
        ]
    };

    describe('MarkdownComparisonReporter', () => {
        it('should generate a report with a summary table and per datapack details', () => {
            // Act
            const report = new MarkdownComparisonReporter('report.md', { info: jest.fn() } as any).generate(comparisonResult);

            // Assert
            expect(report).toContain('# Datapack comparison report');
            expect(report).toContain('**1 of 3 datapack(s) in sync**');
            expect(report).toContain('## Product2/ProductB');
            // Field mismatch table with escaped pipe in the expected value
            expect(report).toContain('| Name | "Product B" | "Product B\\|v2" |');
            // Missing records are listed in the record table only; their data is in the JSON report
            expect(report).not.toContain('### Missing record data');
            // Extra org records that a deployment deletes
            expect(report).toContain('| Child__c | a00000000000001AAA |');
            // Datapack level messages
            expect(report).toContain('> ⚠️ Error while loading Datapack');
        });

        it('should report out of sync datapacks on top with per object type stats', () => {
            // Act
            const report = new MarkdownComparisonReporter('report.md', { info: jest.fn() } as any).generate(comparisonResult);

            // Assert; out of sync datapacks are listed before in-sync datapacks
            expect(report.indexOf('| Product2/ProductB |')).toBeLessThan(report.indexOf('| Product2/ProductA |'));
            expect(report).toContain('## Records by object type');
            expect(report).toContain('| SObject | Total | In sync | Out of sync | Missing |');
        });

        it('should link record ids to the org when an org url is provided', () => {
            // Act
            const report = new MarkdownComparisonReporter('report.md', { info: jest.fn() } as any, { orgUrl: 'https://test.my.salesforce.com' })
                .generate(comparisonResult);

            // Assert; the matched root record and extra org records link to the org
            expect(report).toContain('[01t000000000001AAA](https://test.my.salesforce.com/01t000000000001AAA)');
            expect(report).toContain('[a00000000000001AAA](https://test.my.salesforce.com/a00000000000001AAA)');
        });
    });

    describe('JsonComparisonReporter', () => {
        it('should generate a report with summary and full datapack details', () => {
            // Act
            const report = new JsonComparisonReporter('report.json', { info: jest.fn() } as any).generate(comparisonResult);

            // Assert
            expect(report.reportType).toBe('datapack-comparison');
            expect(report.summary).toEqual({ total: 3, inSync: 1, outOfSync: 1, unknown: 1 });
            expect(report.datapacks).toHaveLength(3);
            expect(report.datapacks[1].records[0]).toEqual(expect.objectContaining({
                sourceKey: 'Product2/ProductB',
                status: 'outOfSync',
                deployAction: 'update'
            }));
            expect(report.datapacks[1].extraOrgRecords).toHaveLength(1);
        });
    });

    describe('ConsoleComparisonReporter', () => {
        it('should print a line per datapack and expand differences', () => {
            // Arrange
            const logger = { info: jest.fn() };

            // Act
            new ConsoleComparisonReporter(logger as any).report(comparisonResult);
            const output = logger.info.mock.calls.map(call => String(call[0])).join('\n');

            // Assert
            expect(output).toContain('Product2/ProductA');
            expect(output).toContain('in sync');
            expect(output).toContain('1 to update, 1 to insert, 1 to delete');
            expect(output).toContain('update Product2 Product2/ProductB');
            expect(output).toContain('insert Child__c Child__c/CHILD-1');
            expect(output).toContain('delete Child__c a00000000000001AAA');
            expect(output).toContain('1/3 datapack(s) in sync');
        });
    });
});
