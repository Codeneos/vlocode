import 'jest';

import { Logger } from '@vlocode/core';

import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';
import { OverrideDefinitionRecords } from '../deploymentSpecs/overrideDefinitionRecords';

describe('OverrideDefinitionRecords', () => {

    const PRODUCT_ID_1 = '01t000000000001AAA';
    const PRODUCT_ID_2 = '01t000000000002AAA';

    function createSpec() {
        const salesforceService = {
            data: {
                lookup: jest.fn(async (type: string, filters: Array<{ 'GlobalKey__c': string }>) => {
                    const products = { 'GK-1': PRODUCT_ID_1, 'GK-2': PRODUCT_ID_2 };
                    return filters
                        .filter(filter => products[filter['GlobalKey__c']])
                        .map(filter => ({ Id: products[filter['GlobalKey__c']], GlobalKey__c: filter['GlobalKey__c'] }));
                })
            }
        };
        return new OverrideDefinitionRecords(salesforceService as any, Logger.null);
    }

    function createRecord(values: object) {
        return new DatapackDeploymentRecord('Product2', 'vlocity_cmt__OverrideDefinition__c',
            'OverrideDefinition__c/OD-1', 'Product2/PRODUCT-1', undefined, values);
    }

    it('should clear the source org hierarchy path after record conversion so it is not delta compared', () => {
        // Arrange; the datapack contains the hierarchy path of the source org which is
        // meaningless in the target org and recalculated just before deployment
        const spec = createSpec();
        const record = createRecord({
            'vlocity_cmt__ProductHierarchyGlobalKeyPath__c': 'GK-1<GK-2',
            'vlocity_cmt__ProductHierarchyPath__c': '01tSRC0000000001AA<01tSRC0000000002AA'
        });

        // Act
        spec.afterRecordConversion([ record ]);

        // Assert
        expect(record.value('ProductHierarchyPath__c')).toBeUndefined();
        expect(record.value('ProductHierarchyGlobalKeyPath__c')).toBe('GK-1<GK-2');
    });

    it('should resolve the hierarchy global key path to target org product ids before deployment', async () => {
        // Arrange
        const spec = createSpec();
        const record = createRecord({
            'vlocity_cmt__ProductHierarchyGlobalKeyPath__c': 'GK-1<GK-2'
        });

        // Act
        await spec.beforeDeployRecord([ record ]);

        // Assert; the path is recalculated with the ids of the target org
        expect(record.value('ProductHierarchyPath__c')).toBe(`${PRODUCT_ID_1}<${PRODUCT_ID_2}`);
    });
});
