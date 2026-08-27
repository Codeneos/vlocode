import 'jest';

import { VlocityDatapack } from '@vlocode/vlocity';
import { OmniDataTransformationSpec } from '../deploymentSpecs/omniDataTransform';

describe('OmniDataTransformationSpec', () => {
    it('links items to the parent using parent matching fields', async () => {
        const datapack = new VlocityDatapack('DataRaptor', {
            GlobalKey: 'parent-global-key',
            Name: 'ExampleMapper',
            OmniDataTransformItem: [{
                GlobalKey: 'child-global-key',
                VlocityDataPackType: 'SObject',
                VlocityRecordSObjectType: 'OmniDataTransformItem'
            }],
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransform',
            VlocityRecordSourceKey: 'OmniDataTransform/ExampleMapper'
        });

        await new OmniDataTransformationSpec().preprocess(datapack);

        expect(datapack.OmniDataTransformItem[0].OmniDataTransformationId).toEqual({
            GlobalKey: 'parent-global-key',
            Name: 'ExampleMapper',
            VlocityDataPackType: 'VlocityMatchingKeyObject',
            VlocityMatchingRecordSourceKey: 'OmniDataTransform/ExampleMapper',
            VlocityRecordSObjectType: 'OmniDataTransform'
        });
    });
});
