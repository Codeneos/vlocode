import { Logger } from '@vlocode/core';
import { VlocityDatapack } from '@vlocode/vlocity';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { OmniProcessRecord, OmniScriptRecord } from '@vlocode/omniscript';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { PreprocessorMessages } from './preprocessorMessages';

@deploymentSpec({
    recordFilter: /^(OmniScript__c|OmniProcess)$/i
})
export class OmniScriptElementOrderSpec implements DatapackDeploymentSpec {

    private readonly messages: PreprocessorMessages;
    private readonly sourceKeyField = 'VlocityMatchingRecordSourceKey';
    private readonly fields: Record<string, {
        order: string;
        level: string;
        parentRef: string;
        elements: string;
    }> = {
        [OmniScriptRecord.SObjectType]: {
            order: '%vlocity_namespace%__Order__c',
            level: '%vlocity_namespace%__Level__c',
            parentRef: '%vlocity_namespace%__ParentElementId__c',
            elements: '%vlocity_namespace%__Element__c',
        },
        [OmniProcessRecord.SObjectType]: {
            order: 'SequenceNumber',
            level: 'Level',
            parentRef: 'ParentElementId',
            elements: 'OmniProcessElement',
        }
    };

    public constructor(private readonly logger: Logger) {
        this.messages = new PreprocessorMessages(logger);
    }

    public preprocess(datapack: VlocityDatapack) {
        const fieldSet = this.fields[datapack.sobjectType]; 
        if (!fieldSet) {
            return;
        }

        if (typeof datapack[fieldSet.elements] !== 'object') {
            this.messages.warn(
                datapack.sourceKey,
                `Expected "${fieldSet.elements}" property to be an array for datapack of type ${datapack.datapackType}`
            );
            datapack[fieldSet.elements] = [];
        }

        if (!Array.isArray(datapack[fieldSet.elements])) {
            datapack[fieldSet.elements] = [ datapack[fieldSet.elements] ];
        }

        // Update the order of the elements in the datapack before deployment
        this.updateElementOrder(datapack);
    }

    /**
     * Update the order and level of the elements in the OmniScript or IntegrationProcedure.
     * @param datapack
     */
    private updateElementOrder(datapack: VlocityDatapack) {
        // Map elements by their source key so we can easily lookup the parent elements
        const fieldSet = this.fields[datapack.sobjectType];
        const elementsByKey = new Map<string, Record<string, unknown>>(datapack[fieldSet.elements].map(element => [element.VlocityRecordSourceKey, element]) );

        const getElementLevel = (element: Record<string, unknown>) => {
            const parentElementPath = new Array<typeof element>();
            while (element) {
                const parentKey = element[fieldSet.parentRef]?.[this.sourceKeyField];
                const parent = parentKey && elementsByKey.get(parentKey);
                if (!parent) {
                    break;
                }
                if (parentElementPath.includes(parent)) {
                    this.messages.warn(datapack, `element "${element.Name}" has a circular reference to "${parent.Name}"`);
                    break;
                }
                parentElementPath.push(element = parent);
            }
            return parentElementPath.length;
        };

        // Iterate over the elements and update the order and level
        // based on the order of the elements in the elements array in the datapack
        const elementCountByParent = new Map<string, number>();
        for (const element of datapack[fieldSet.elements]) {
            const parentKey = element[fieldSet.parentRef]?.[this.sourceKeyField] ?? 'root';
            const orderInParent = (elementCountByParent.get(parentKey) ?? 0) + 1;

            const currentLevel = parseInt(element[fieldSet.level]);
            const currentOrder = parseInt(element[fieldSet.order]);
            const calculatedLevel = getElementLevel(element);

            if (!isNaN(currentOrder) && currentOrder < orderInParent) {
                this.messages.warn(datapack, `element "${element.Name}" expected "${fieldSet.order}" to be "${orderInParent}"; instead saw "${currentOrder}"`);
            }

            if (!isNaN(currentLevel) && currentLevel !== calculatedLevel) {
                this.messages.warn(datapack, `element "${element.Name}" expected "${fieldSet.level}"" to be "${currentLevel}"; instead saw "${calculatedLevel}"`);
            }

            /* eslint-disable @typescript-eslint/no-unused-expressions */
            isNaN(currentOrder) && (element[fieldSet.order] = orderInParent);
            isNaN(currentLevel) && (element[fieldSet.level] = calculatedLevel);

            elementCountByParent.set(parentKey, orderInParent);
        }
    }
}

