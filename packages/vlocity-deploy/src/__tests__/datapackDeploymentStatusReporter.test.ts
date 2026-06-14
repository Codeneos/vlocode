import { DatapackDeploymentStatusReporter } from '../datapackDeploymentStatusReporter';
import { DatapackDeploymentRecord, DeploymentStatus } from '../datapackDeploymentRecord';
import { DatapackDeploymentRecordGroup } from '../datapackDeploymentRecordGroup';
import { DatapackDeploymentError, DatapackDeploymentErrorCodes } from '../datapackDeploymentError';
import { DatapackDeploymentState } from '../datapackDeploymentStatus';

describe('DatapackDeploymentStatusReporter', () => {

    interface RecordOptions {
        deployed?: boolean;
        failWith?: { code: DatapackDeploymentErrorCodes, message: string };
        failMessage?: string;
        warnings?: string[];
        datapackType?: string;
    }

    function makeRecord(sourceKey: string, datapackKey: string, options: RecordOptions = {}) {
        const record = new DatapackDeploymentRecord(options.datapackType ?? 'TYPE', 'Product2', sourceKey, datapackKey);
        if (options.deployed) {
            record.updateStatus(DeploymentStatus.Deployed, `${sourceKey}-id`);
        }
        if (options.failWith) {
            record.setFailed(new DatapackDeploymentError(options.failWith.code, options.failWith.message));
        } else if (options.failMessage) {
            record.setFailed(options.failMessage);
        }
        options.warnings?.forEach(warning => record.addWarning(warning));
        return record;
    }

    function buildReporter(records: DatapackDeploymentRecord[], groupErrors: Record<string, DatapackDeploymentError[]> = {}) {
        const recordMap = new Map<string, DatapackDeploymentRecord>();
        const groupMap = new Map<string, DatapackDeploymentRecordGroup>();
        for (const record of records) {
            recordMap.set(record.sourceKey, record);
            let group = groupMap.get(record.datapackKey);
            if (!group) {
                group = new DatapackDeploymentRecordGroup(record.datapackKey);
                groupMap.set(record.datapackKey, group);
            }
            group.push(record);
        }
        return new DatapackDeploymentStatusReporter(recordMap, groupMap, new Map(Object.entries(groupErrors)));
    }

    describe('getStatus', () => {
        it('should aggregate per-datapack status, counts and messages', () => {
            const reporter = buildReporter([
                makeRecord('A/1', 'A', { deployed: true }),
                makeRecord('A/2', 'A', { failWith: { code: 'UNKNOWN_ERROR', message: 'Field error' } }),
                makeRecord('B/1', 'B', { deployed: true, warnings: ['be careful'] }),
            ], {
                'C': [new DatapackDeploymentError('DEPLOYMENT_FAILED', 'datapack C broke')]
            });

            const status = reporter.getStatus();
            const byKey = Object.fromEntries(status.datapacks.map(d => [d.datapack, d]));

            expect(status.total).toBe(3);
            expect(status.status).toBe(DatapackDeploymentState.PartialSuccess);

            expect(byKey['A'].status).toBe(DatapackDeploymentState.PartialSuccess);
            expect(byKey['A'].recordCount).toBe(2);
            expect(byKey['A'].failedCount).toBe(1);
            expect(byKey['A'].messages).toEqual([{ type: 'error', message: 'Field error', code: 'UNKNOWN_ERROR' }]);

            expect(byKey['B'].status).toBe(DatapackDeploymentState.Success);
            expect(byKey['B'].messages).toEqual([{ type: 'warn', message: 'be careful' }]);

            // Datapack-level error without an associated record group is materialised as a failed datapack
            expect(byKey['C'].status).toBe(DatapackDeploymentState.Error);
            expect(byKey['C'].recordCount).toBe(1);
            expect(byKey['C'].messages).toEqual([{ type: 'error', message: 'datapack C broke', code: 'DEPLOYMENT_FAILED' }]);
        });

        it('should merge datapack-level errors into an existing record group', () => {
            const reporter = buildReporter([
                makeRecord('A/1', 'A', { deployed: true }),
            ], {
                'A': [new DatapackDeploymentError('DEPLOYMENT_FAILED', 'post-deploy failure')]
            });

            const status = reporter.getStatus();
            expect(status.total).toBe(1);
            expect(status.datapacks[0].messages).toEqual([
                { type: 'error', message: 'post-deploy failure', code: 'DEPLOYMENT_FAILED' }
            ]);
        });
    });

    describe('getMessages', () => {
        it('should return errors and warnings and exclude cascade failures by default', () => {
            const reporter = buildReporter([
                makeRecord('A/1', 'A', { failWith: { code: 'UNKNOWN_ERROR', message: 'boom' } }),
                makeRecord('A/2', 'A', { deployed: true, warnings: ['heads up'] }),
                makeRecord('A/3', 'A', { failWith: { code: 'RECORD_CASCADE_FAILURE', message: 'parent failed' } }),
            ]);

            const messages = reporter.getMessages();

            expect(messages).toHaveLength(2);
            expect(messages).toEqual(expect.arrayContaining([
                expect.objectContaining({ datapackKey: 'A', type: 'error', message: 'boom' }),
                expect.objectContaining({ datapackKey: 'A', type: 'warn', message: 'heads up' }),
            ]));
            expect(messages.some(m => m.message === 'parent failed')).toBe(false);
        });

        it('should include cascade failures when requested', () => {
            const reporter = buildReporter([
                makeRecord('A/3', 'A', { failWith: { code: 'RECORD_CASCADE_FAILURE', message: 'parent failed' } }),
            ]);

            const messages = reporter.getMessages({ includeCascadeFailures: true });
            expect(messages).toEqual([
                expect.objectContaining({ datapackKey: 'A', type: 'error', message: 'parent failed' })
            ]);
        });

        it('should group messages by datapack key', () => {
            const reporter = buildReporter([
                makeRecord('A/1', 'A', { failMessage: 'a failed' }),
                makeRecord('B/1', 'B', { failMessage: 'b failed' }),
            ]);

            const grouped = reporter.getMessagesByDatapack();
            expect(Object.keys(grouped).sort()).toEqual(['A', 'B']);
            expect(grouped['A'][0].message).toBe('a failed');
            expect(grouped['B'][0].message).toBe('b failed');
        });
    });

    describe('formatDeployError', () => {
        function failedRecord(message: string) {
            return makeRecord('X/1', 'X', { failMessage: message });
        }

        it('should return a placeholder when there is no status message', () => {
            const reporter = buildReporter([]);
            const pendingRecord = new DatapackDeploymentRecord('TYPE', 'Product2', 'X/1', 'X');
            expect(reporter.formatDeployError(pendingRecord)).toBe('No error message');
        });

        it('should rewrite apex trigger script exceptions into actionable guidance', () => {
            const reporter = buildReporter([]);
            const record = failedRecord('Script-thrown exception; execution of MyTrigger_Trigger failed');
            expect(reporter.formatDeployError(record))
                .toBe('APEX MyTrigger_Trigger trigger caused exception; try inserting this datapack with triggers disabled');
        });

        it('should rewrite apex caused-by script exceptions into actionable guidance', () => {
            const reporter = buildReporter([]);
            const record = failedRecord('Script-thrown exception caused by: SomeClass.method');
            expect(reporter.formatDeployError(record))
                .toBe('APEX exception caused by (SomeClass.method); try inserting this datapack with triggers disabled');
        });

        it('should strip blank lines from regular error messages', () => {
            const reporter = buildReporter([]);
            const record = failedRecord('first line\n\nsecond line\r   ');
            expect(reporter.formatDeployError(record)).toBe('first line\nsecond line');
        });
    });
});
