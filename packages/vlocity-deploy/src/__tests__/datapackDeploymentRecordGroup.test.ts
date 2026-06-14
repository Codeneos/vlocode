import { DatapackDeploymentRecordGroup } from '../datapackDeploymentRecordGroup';
import { DatapackDeploymentRecord, DeploymentAction, DeploymentStatus } from '../datapackDeploymentRecord';
import { DatapackDeploymentState } from '../datapackDeploymentStatus';

describe('DatapackDeploymentRecordGroup', () => {

    let sequence = 0;

    function record(state: DeploymentStatus | 'skipped', sobjectType = 'Product2') {
        const rec = new DatapackDeploymentRecord('TYPE', sobjectType, `Key/${sequence++}`, 'DatapackKey');
        if (state === 'skipped') {
            rec.setAction(DeploymentAction.Skip);
        } else if (state === DeploymentStatus.Failed) {
            rec.setFailed('boom');
        } else if (state !== DeploymentStatus.Pending) {
            rec.updateStatus(state, state === DeploymentStatus.Deployed ? 'recordId' : undefined);
        }
        return rec;
    }

    function group(...records: DatapackDeploymentRecord[]) {
        return new DatapackDeploymentRecordGroup('DatapackKey', records);
    }

    describe('status', () => {
        it('should be Success when all records are deployed', () => {
            expect(group(record(DeploymentStatus.Deployed), record(DeploymentStatus.Deployed)).status)
                .toBe(DatapackDeploymentState.Success);
        });

        it('should be Success when records are a mix of deployed and skipped', () => {
            expect(group(record(DeploymentStatus.Deployed), record('skipped')).status)
                .toBe(DatapackDeploymentState.Success);
        });

        it('should be PartialSuccess when some records deployed and some failed', () => {
            expect(group(record(DeploymentStatus.Deployed), record(DeploymentStatus.Failed)).status)
                .toBe(DatapackDeploymentState.PartialSuccess);
        });

        it('should be Error when records failed without any deployed record', () => {
            expect(group(record(DeploymentStatus.Failed), record('skipped')).status)
                .toBe(DatapackDeploymentState.Error);
        });

        it('should be Pending when a record is still pending', () => {
            expect(group(record(DeploymentStatus.Deployed), record(DeploymentStatus.Pending)).status)
                .toBe(DatapackDeploymentState.Pending);
        });

        it('should be Pending when every record is still pending', () => {
            // Regression guard: DeploymentStatus.Pending is 0 and must not be dropped during grouping
            expect(group(record(DeploymentStatus.Pending), record(DeploymentStatus.Pending)).status)
                .toBe(DatapackDeploymentState.Pending);
        });

        it('should be InProgress when a record is in progress', () => {
            expect(group(record(DeploymentStatus.InProgress), record(DeploymentStatus.Pending)).status)
                .toBe(DatapackDeploymentState.InProgress);
        });

        it('should be InProgress when a record is queued for retry', () => {
            expect(group(record(DeploymentStatus.Retry), record(DeploymentStatus.Deployed)).status)
                .toBe(DatapackDeploymentState.InProgress);
        });
    });

    describe('failedCount / hasErrors', () => {
        it('should count only the failed records', () => {
            const g = group(record(DeploymentStatus.Failed), record(DeploymentStatus.Failed), record(DeploymentStatus.Deployed));
            expect(g.failedCount).toBe(2);
            expect(g.hasErrors()).toBe(true);
        });

        it('should report no errors when nothing failed', () => {
            const g = group(record(DeploymentStatus.Deployed), record('skipped'));
            expect(g.failedCount).toBe(0);
            expect(g.hasErrors()).toBe(false);
        });
    });

    describe('record lookups', () => {
        it('should expose size and find records by sobject type', () => {
            const product = record(DeploymentStatus.Deployed, 'Product2');
            const account = record(DeploymentStatus.Deployed, 'Account');
            const g = group(product, account);

            expect(g.size).toBe(2);
            expect(g.getRecordOfType('Account')).toBe(account);
            expect(g.getRecordsOfType('Product2')).toEqual([product]);
            expect(g.getRecordById('recordId')).toBe(product);
        });
    });
});
