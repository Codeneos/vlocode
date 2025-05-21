import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { VlocityDatapack, VlocityDatapackMatchingReference } from '@vlocode/vlocity';

@deploymentSpec({ recordFilter: /^(OmniDataTransform)$/ })
export class OmniDataTransformationSpec implements DatapackDeploymentSpec {

    private itemsField = 'OmniDataTransformItem';
    private parentField = 'OmniDataTransformationId';
    private activationField = 'IsActive';
    private matchingFields = ['GlobalKey'];

    public async preprocess(datapack: VlocityDatapack) {
        // Link items to parent if they are not linked
        for (const item of this.getItems(datapack)) {
            if (item[this.parentField]) {
                continue;
            }
            item[this.parentField] = {
                ...this.matchingFields.reduce((acc, field) => Object.assign(acc, { [field]: item[field] }), {}),
                VlocityDataPackType: 'VlocityMatchingKeyObject',
                VlocityMatchingRecordSourceKey: datapack.sourceKey,
                VlocityRecordSObjectType: datapack.sobjectType,
            } as VlocityDatapackMatchingReference;
        }

        // Set the activation status of the DataMapper -- strictly speaking this is not needed but for UI consistency
        // we set the activation status of the DataMapper to true if it is not set in the datapack
        if (datapack[this.activationField] === undefined) {
            datapack[this.activationField] = true;
        }
    }

    private getItems(datapack: VlocityDatapack): Array<object> {
        if (typeof datapack[this.itemsField] !== 'object') {
            datapack[this.itemsField] = [];
        }
        if (!Array.isArray(datapack[this.itemsField])) {
            datapack[this.itemsField] = [ datapack[this.itemsField] ];
        }
        return datapack[this.itemsField];
    }
}