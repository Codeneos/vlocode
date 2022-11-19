import 'jest';

import { Logger, container } from '@vlocode/core';
import { NamespaceService } from '@vlocode/salesforce';
import { VlocityNamespaceService } from '../vlocityNamespaceService';
import { DatapackDeployer, DatapackFilter } from '../datapackDeployer';
import { VlocityDatapack } from '../datapack';

describe('datapackDeployer', () => {

    beforeAll(() => {
        container.registerAs(Logger.null, Logger);
        container.registerAs(new VlocityNamespaceService('vlocity_cmt'), NamespaceService);
    });
    
    function createDatapack(type: string, data: any) {
        return new VlocityDatapack(
            './mydatapack_DataPack.json', 
            type, 
            data.VlocityRecordSourceKey, 
            './project-folder', 
            data
        );
    }

    describe('#evalFilter', () => {
        it('if datapack type mismatch and record regex match should return true', async () => {
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
    });    
});