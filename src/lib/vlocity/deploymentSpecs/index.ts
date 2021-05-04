import { DatapackDeploymentSpec } from 'lib/vlocity/datapackDeployService';
import { VlocityUITemplateSpec } from './vlocityUITemplate';
import { VlocityOmniScriptSpec } from './omniScript';

interface DeploymentSpecMap {
    [datapackType: string]: { new(...args: any[]): DatapackDeploymentSpec };
};

export default {
    'VlocityUITemplate': VlocityUITemplateSpec,
    'OmniScript': VlocityOmniScriptSpec,
    'IntegrationProcedure': VlocityOmniScriptSpec
} as DeploymentSpecMap;