import { DatapackDeploymentSpec } from 'lib/vlocity/datapackDeployService';
import { VlocityUITemplateSpec } from './vlocityUITemplate';
import { VlocityOmniScriptSpec } from './omniScript';
import { VlocityActionSpec } from './vlocityAction';
import { VlocityCardSpec } from './vlocityCard';

interface DeploymentSpecMap {
    [datapackType: string]: { new(...args: any[]): DatapackDeploymentSpec };
};

export default {
    'VlocityUITemplate': VlocityUITemplateSpec,
    'OmniScript': VlocityOmniScriptSpec,
    'IntegrationProcedure': VlocityOmniScriptSpec,
    'VlocityAction': VlocityActionSpec,
    'VlocityCard': VlocityCardSpec,
    'VlocityUILayout': VlocityCardSpec
} as DeploymentSpecMap;