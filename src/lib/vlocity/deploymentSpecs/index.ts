import { DatapackDeploymentSpec } from 'lib/vlocity/datapackDeployService';
import { VlocityUITemplateSpec } from './vlocityUITemplate';

interface DeploymentSpecMap {
    [datapackType: string]: { new(...args: any[]): DatapackDeploymentSpec };
};

export default {
    'VlocityUITemplate': VlocityUITemplateSpec
} as DeploymentSpecMap;