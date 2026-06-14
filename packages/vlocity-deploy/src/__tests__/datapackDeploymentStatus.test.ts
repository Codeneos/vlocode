import { DatapackDeploymentState, DatapackkDeploymentState } from '../datapackDeploymentStatus';

describe('DatapackDeploymentState', () => {
    describe('summarize', () => {
        it('should return Success for an empty set of states', () => {
            // No pending and no errors collapses to a successful summary
            expect(DatapackDeploymentState.summarize([])).toBe(DatapackDeploymentState.Success);
        });

        it('should return Success when all states are Success', () => {
            expect(DatapackDeploymentState.summarize([
                DatapackDeploymentState.Success,
                DatapackDeploymentState.Success,
            ])).toBe(DatapackDeploymentState.Success);
        });

        it('should return InProgress when any state is InProgress regardless of other states', () => {
            expect(DatapackDeploymentState.summarize([
                DatapackDeploymentState.Pending,
                DatapackDeploymentState.Error,
                DatapackDeploymentState.InProgress,
            ])).toBe(DatapackDeploymentState.InProgress);
        });

        it('should return Pending when a state is Pending and nothing is InProgress', () => {
            expect(DatapackDeploymentState.summarize([
                DatapackDeploymentState.Pending,
                DatapackDeploymentState.Success,
            ])).toBe(DatapackDeploymentState.Pending);
        });

        it('should return Error when there are errors but no partial successes', () => {
            expect(DatapackDeploymentState.summarize([
                DatapackDeploymentState.Success,
                DatapackDeploymentState.Error,
            ])).toBe(DatapackDeploymentState.Error);
        });

        it('should return PartialSuccess when both errors and partial successes are present', () => {
            expect(DatapackDeploymentState.summarize([
                DatapackDeploymentState.Success,
                DatapackDeploymentState.Error,
                DatapackDeploymentState.PartialSuccess,
            ])).toBe(DatapackDeploymentState.PartialSuccess);
        });
    });

    describe('DatapackkDeploymentState (deprecated alias)', () => {
        it('should be the same object as DatapackDeploymentState', () => {
            expect(DatapackkDeploymentState).toBe(DatapackDeploymentState);
        });

        it('should expose the same summarize implementation', () => {
            expect(DatapackkDeploymentState.summarize([DatapackkDeploymentState.Error]))
                .toBe(DatapackDeploymentState.Error);
        });
    });
});
