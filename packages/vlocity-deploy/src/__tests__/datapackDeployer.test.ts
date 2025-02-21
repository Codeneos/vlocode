import 'jest';

import { Logger, container } from '@vlocode/core';
import { NamespaceService } from '@vlocode/salesforce';
import { VlocityDatapack, VlocityNamespaceService } from '@vlocode/vlocity';
import { DatapackDeployer, DatapackFilter } from '../datapackDeployer';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';

describe('datapackDeployer', () => {

    beforeAll(() => {
        container.registerAs(Logger.null, Logger);
        container.registerAs(new VlocityNamespaceService('vlocity_cmt'), NamespaceService);
    });

    function createDatapack(type: string, data: any) {
        return new VlocityDatapack(type, data, {
            key: data.VlocityRecordSourceKey
        });
    }

    describe('#evalFilter', () => {
        it('if datapack type mismatch and record regex match should return true', () => {
            // arrange
            const testContainer = container.new();
            const datapack = createDatapack('random', {
                "Name": "Test",
                "VlocityDataPackType": "SObject",
                "VlocityRecordSObjectType": "%vlocity_namespace%__OmniScript__c",
                "VlocityRecordSourceKey": "%vlocity_namespace%__OmniScript__c/Type/SubType/Dutch"
            });
            const filter: DatapackFilter = {
                datapackFilter: /^(OmniScript|IntegrationProcedure)$/i,
                recordFilter: /^(OmniScript__c|Element__c)$/i
            }

            // test
            expect(testContainer.create(DatapackDeployer)['evalFilter'](filter, datapack)).toBe(true);
        });
        it('filter without namespace and record type with namespace should return true', () => {
            // arrange
            const testContainer = container.new();
            const record = new DatapackDeploymentRecord(
                'DataRaptor',
                'vlocity_cmt__DRBundle__c',
                "%vlocity_namespace%__DRBundle__c/Type/SubType/Dutch",
                "%vlocity_namespace%__DRBundle__c/Type/SubType/Dutch",
                [], {}
            );
            const filter: DatapackFilter = {
                recordFilter: /^(DRMapItem__c|DRBundle__c)$/i
            }

            // test
            expect(testContainer.create(DatapackDeployer)['evalFilter'](filter, record)).toBe(true);
        });
    });
    describe('#filterApplicableRecords', () => {
        it('with record filter should remove records no matching filter', () => {
            // arrange
            const testContainer = container.new();
            const matchedRecord = new DatapackDeploymentRecord('', 'vlocity_cmt__DRBundle__c', '', '', [], {});
            const mismatchedRecord = new DatapackDeploymentRecord('', 'vlocity_cmt__DRItem__c', '', '', [], {});
            const filter: DatapackFilter = {
                recordFilter: /^(DRMapItem__c|DRBundle__c)$/i
            }

            // test
            expect(testContainer.create(DatapackDeployer)['filterApplicableRecords'](filter, [ matchedRecord, mismatchedRecord ])).toEqual([ matchedRecord ]);
        });
        it('with datapack filter should remove records no matching filter', () => {
            // arrange
            const testContainer = container.new();
            const matchedRecord = new DatapackDeploymentRecord('OmniScript', '', '', '', [], {});
            const mismatchedRecord = new DatapackDeploymentRecord('DataRaptor', '', '', '', [], {});
            const filter: DatapackFilter = {
                datapackFilter: 'OmniScript'
            }

            // test
            expect(testContainer.create(DatapackDeployer)['filterApplicableRecords'](filter, [ matchedRecord, mismatchedRecord ])).toEqual([ matchedRecord ]);
        });
    });
});