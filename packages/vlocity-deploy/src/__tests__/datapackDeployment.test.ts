
import { Logger, container } from '@vlocode/core';
import { VlocityNamespaceService } from '@vlocode/vlocity';
import { NamespaceService } from '@vlocode/salesforce';

import { DatapackDeployment } from '../datapackDeployment';
import { DatapackDeploymentRecord, DeploymentStatus } from '../datapackDeploymentRecord';

describe('DatapackDeployment', () => {

    function mockDatapackRecord(options: { 
        datapackType?: string, 
        sobjectType?: string, 
        sourceKey?: string, 
        datapackKey?: string, 
        upsertFields?: string[], 
        values?: object
    }) {
        return new DatapackDeploymentRecord(
            options.datapackType ?? 'TYPE',
            options.sobjectType ?? 'Product2',
            options.sourceKey ?? 'SourceKey',
            options.datapackKey ?? 'DatapackKey',
            options.upsertFields,
            options.values ?? {}
        );
    }

    beforeAll(() => {
        container.registerAs(Logger.null, Logger);
        container.registerAs(new VlocityNamespaceService('vlocity_cmt'), NamespaceService);
    });

    describe('hasPendingDependencies', () => {
        it('should not return true for records with undeployed dependencies', () => {
            // Arrange
            const deployment = container.create(DatapackDeployment);
            const recordA1 = mockDatapackRecord( { sourceKey: 'A/1', datapackKey: 'A' });
            const recordA2 = mockDatapackRecord( { sourceKey: 'A/2', datapackKey: 'A' });
            const recordB1 = mockDatapackRecord( { sourceKey: 'B/1', datapackKey: 'B' });
            const recordB2 = mockDatapackRecord( { sourceKey: 'B/2', datapackKey: 'B' });

            recordA2.addDependency(recordA1);
            recordB2.addDependency(recordB1);
            recordA1.addDependency(recordB1);

            deployment.add(recordA1, recordA2, recordB1, recordB2);

            // Assert
            expect(deployment['hasPendingDependencies'](recordA1)).toBe(true);
            expect(deployment['hasPendingDependencies'](recordB1)).toBe(false);
            expect(deployment['hasPendingDependencies'](recordA1)).toBe(true);
            expect(deployment['hasPendingDependencies'](recordA2)).toBe(true);
        });
    });

    describe('getDeployableRecords', () => {
        /* eslint-disable no-constant-condition */
        it('with [strictOrder: false] should return records ordered by dependencies', () => {
            // Arrange
            const deployment = container.create(DatapackDeployment, { strictOrder: false });
            const recordA1 = mockDatapackRecord( { sourceKey: 'A/1', datapackKey: 'A' });
            const recordA2 = mockDatapackRecord( { sourceKey: 'A/2', datapackKey: 'A' });
            const recordB1 = mockDatapackRecord( { sourceKey: 'B/1', datapackKey: 'B' });
            const recordB2 = mockDatapackRecord( { sourceKey: 'B/2', datapackKey: 'B' });

            recordA2.addDependency(recordA1);
            recordB2.addDependency(recordB1);
            recordA1.addDependency(recordB1);

            deployment.add(recordA1, recordA2, recordB1, recordB2);
            const deploySets = new Array<DatapackDeploymentRecord[]>();

            // Act
            while (true) {
                const records = deployment['getDeployableRecords']();
                if (!records || records.size === 0) {
                    break;
                }
                for (const record of records.values()) {
                    record.updateStatus(DeploymentStatus.Deployed, 'ID');
                }
                deploySets.push([...records.values()]);
            }

            // Assert
            expect(deploySets.length).toBe(3);
            expect(deploySets[0].map(r => r.sourceKey)).toStrictEqual([ 'B/1' ]);
            expect(deploySets[1].map(r => r.sourceKey)).toStrictEqual([ 'A/1', 'B/2' ]);
            expect(deploySets[2].map(r => r.sourceKey)).toStrictEqual([ 'A/2' ]);
        });
        it('with [strictOrder: true] should not deploy dependent records until all records in datapack are deployed', () => {
            // Arrange
            const deployment = container.create(DatapackDeployment, { strictOrder: true });
            const recordA1 = mockDatapackRecord( { sourceKey: 'A/1', datapackKey: 'A' });
            const recordA2 = mockDatapackRecord( { sourceKey: 'A/2', datapackKey: 'A' });
            const recordB1 = mockDatapackRecord( { sourceKey: 'B/1', datapackKey: 'B' });
            const recordB2 = mockDatapackRecord( { sourceKey: 'B/2', datapackKey: 'B' });

            recordA2.addDependency(recordA1);
            recordB2.addDependency(recordB1);
            recordA1.addDependency(recordB1);

            deployment.add(recordA1, recordA2, recordB1, recordB2);
            const deploySets = new Array<DatapackDeploymentRecord[]>();

            // Act
            while(true) {
                const records = deployment['getDeployableRecords']();
                if (!records || records.size === 0) {
                    break;
                }
                for (const record of records.values()) {
                    record.updateStatus(DeploymentStatus.Deployed, 'ID');
                }
                deploySets.push([...records.values()]);
            }

            // Assert
            expect(deploySets.length).toBe(4);
            expect(deploySets[0].map(r => r.sourceKey)).toStrictEqual([ 'B/1' ]);
            expect(deploySets[1].map(r => r.sourceKey)).toStrictEqual([ 'B/2' ]);
            expect(deploySets[2].map(r => r.sourceKey)).toStrictEqual([ 'A/1' ]);
            expect(deploySets[3].map(r => r.sourceKey)).toStrictEqual([ 'A/2' ]);
        });
        it('with [strictOrder: true] and circular datapack dependency ', () => {
            // A direct circular dependency should be ignore the strictOrder option and deploy the records in the correct order
            // ignore datapack dependency order when Datapack A depends on Datapack B and Datapack B depends on Datapack A 
            // but none of the records in the datapack depend on each other

            // Arrange
            const deployment = container.create(DatapackDeployment, { strictOrder: true });

            const recordA1 = mockDatapackRecord( { sourceKey: 'A/1', datapackKey: 'A' });
            const recordA2 = mockDatapackRecord( { sourceKey: 'A/2', datapackKey: 'A' });

            const recordB1 = mockDatapackRecord( { sourceKey: 'B/1', datapackKey: 'B' });
            const recordB2 = mockDatapackRecord( { sourceKey: 'B/2', datapackKey: 'B' });
            
            recordA2.addDependency(recordA1);
            recordA2.addDependency(recordB1);

            recordB2.addDependency(recordB1);
            recordB2.addDependency(recordA1);

            deployment.add(recordA1, recordA2, recordB1, recordB2);
            const deploySets = new Array<DatapackDeploymentRecord[]>();

            // Act
            while(true) {
                const records = deployment['getDeployableRecords']();
                if (!records || records.size === 0) {
                    break;
                }
                for (const record of records.values()) {
                    record.updateStatus(DeploymentStatus.Deployed, 'ID');
                }
                deploySets.push([...records.values()]);
            }

            // Assert
            expect(deploySets.length).toBe(2);
            expect(deploySets[0].map(r => r.sourceKey)).toStrictEqual([ 'A/1', 'B/1' ]);
            expect(deploySets[1].map(r => r.sourceKey)).toStrictEqual([ 'A/2', 'B/2' ]);
        });
        it('with [strictOrder: true] and deep circular datapack dependency should ignore strictOrder options', () => {
            // When adatapack indirectly depends on another datapack, the strictOrder option should be ignored
            // otherwise the deployment will fail due to circular dependencies with strictOrder enabled

            // Arrange
            const deployment = container.create(DatapackDeployment, { strictOrder: true });

            const recordA1 = mockDatapackRecord( { sourceKey: 'A/1', datapackKey: 'A' });
            const recordA2 = mockDatapackRecord( { sourceKey: 'A/2', datapackKey: 'A' });
            
            const recordB1 = mockDatapackRecord( { sourceKey: 'B/1', datapackKey: 'B' });
            const recordB2 = mockDatapackRecord( { sourceKey: 'B/2', datapackKey: 'B' });

            const recordC1 = mockDatapackRecord( { sourceKey: 'C/1', datapackKey: 'C' });
            const recordC2 = mockDatapackRecord( { sourceKey: 'C/2', datapackKey: 'C' });
            
            const recordD1 = mockDatapackRecord( { sourceKey: 'D/1', datapackKey: 'D' });
            const recordD2 = mockDatapackRecord( { sourceKey: 'D/2', datapackKey: 'D' });
            
            recordA2.addDependency(recordA1);
            recordB2.addDependency(recordB1);
            recordC2.addDependency(recordC1);
            recordD2.addDependency(recordD1);

            recordA2.addDependency(recordD1);
            recordB2.addDependency(recordA1);
            recordC2.addDependency(recordB1);
            recordD2.addDependency(recordC1);

            deployment.add(recordA1, recordA2, recordB1, recordB2, recordC1, recordC2, recordD1, recordD2);
            const deploySets = new Array<DatapackDeploymentRecord[]>();

            // Act
            while(true) {
                const records = deployment['getDeployableRecords']();
                if (!records || records.size === 0) {
                    break;
                }
                for (const record of records.values()) {
                    record.updateStatus(DeploymentStatus.Deployed, 'ID');
                }
                deploySets.push([...records.values()]);
            }

            // Assert
            expect(deploySets.length).toBe(2);
            expect(deploySets[0].map(r => r.sourceKey)).toStrictEqual([ 'A/1', 'B/1', 'C/1', 'D/1']);
            expect(deploySets[1].map(r => r.sourceKey)).toStrictEqual([ 'A/2', 'B/2', 'C/2', 'D/2']);
        });
    });

    describe('hasCircularDependencies', () => {
        it('should return path when circular dependencies (A->B->A) exist', () => {
            // Arrange
            const deployment = container.create(DatapackDeployment);
            const recordA = mockDatapackRecord( { sourceKey: 'A', datapackKey: 'A' });	
            const recordB = mockDatapackRecord( { sourceKey: 'B', datapackKey: 'B' });

            recordA.addDependency(recordB);
            recordB.addDependency(recordA);

            deployment.add(recordA, recordB);

            // Act
            const result1 = deployment['hasCircularDependencies'](recordA);
            const result2 = deployment['hasCircularDependencies'](recordB);

            // Assert
            expect(result1).toStrictEqual([ 'A', 'B', 'A' ]);	
            expect(result2).toStrictEqual([ 'B', 'A', 'B' ]);
        });
        it('should return true when a deep circular dependencies (A->B->C->A) exist', () => {
            // Arrange
            const deployment = container.create(DatapackDeployment);
            const recordA = mockDatapackRecord( { sourceKey: 'A', datapackKey: 'A' });	
            const recordB = mockDatapackRecord( { sourceKey: 'B', datapackKey: 'B' });
            const recordC = mockDatapackRecord( { sourceKey: 'C', datapackKey: 'C' });

            recordA.addDependency(recordC);
            recordB.addDependency(recordA);
            recordC.addDependency(recordB);

            deployment.add(recordA, recordB, recordC);

            // Act
            const result = deployment['hasCircularDependencies'](recordA);

            // Assert
            expect(result).toStrictEqual([ 'A', 'C', 'B', 'A' ]);	
        });
    });
});