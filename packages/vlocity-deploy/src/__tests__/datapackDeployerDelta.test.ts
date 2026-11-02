import 'jest';

import { Logger } from '@vlocode/core';

import { DatapackComparer, DatapackComparisonResult } from '../datapackComparer';
import { DatapackDeployer } from '../datapackDeployer';
import { DatapackDeployment } from '../datapackDeployment';
import { DatapackRecordFactory } from '../datapackRecordFactory';

describe('DatapackDeployer delta comparison wiring', () => {

    it('connects created deployments to the bulk comparer using the same deployment instance', async () => {
        const comparison: DatapackComparisonResult = {
            total: 0,
            inSync: 0,
            extraRecords: 0,
            outOfSync: 0,
            unknown: 0,
            datapacks: []
        };
        const compareDeployment = jest.fn(async () => comparison);
        const deployment = {
            on: jest.fn(),
            setDeltaComparisonProvider: jest.fn(),
            totalRecordCount: 0
        };
        const testContainer = {
            new: jest.fn((type: unknown) => {
                if (type === DatapackDeployment) {
                    return deployment;
                }
                if (type === DatapackRecordFactory) {
                    return {};
                }
                if (type === DatapackComparer) {
                    return { compareDeployment };
                }
                throw new Error(`Unexpected type: ${String(type)}`);
            })
        };
        const deployer = new DatapackDeployer({} as any, {} as any, Logger.null);
        Object.defineProperty(deployer, 'container', { value: testContainer });

        const created = await deployer.createDeployment([], { deltaCheck: true });
        const provider = deployment.setDeltaComparisonProvider.mock.calls[0][0];
        const cancelToken = { isCancellationRequested: false } as any;
        const options = { deltaCheck: true };

        expect(created).toBe(deployment);
        await expect(provider(deployment, options, cancelToken)).resolves.toBe(comparison);
        expect(compareDeployment).toHaveBeenCalledWith(deployment, options, cancelToken);
    });
});
