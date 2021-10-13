import { MapLike } from 'typescript';

import { DatapackDeploymentSpec } from '@lib/vlocity/datapackDeployer';
import { VlocityUITemplateSpec } from './vlocityUITemplate';
import { VlocityOmniScriptSpec } from './omniScript';
import { VlocityActionSpec } from './vlocityAction';
import { VlocityCardSpec } from './vlocityCard';
import { Product2Spec } from './product2';

export default {
    'VlocityUITemplate': VlocityUITemplateSpec,
    'OmniScript': VlocityOmniScriptSpec,
    'IntegrationProcedure': VlocityOmniScriptSpec,
    'VlocityAction': VlocityActionSpec,
    'VlocityCard': VlocityCardSpec,
    'VlocityUILayout': VlocityCardSpec,
    'Product2': Product2Spec
} as MapLike<{ new(...args: any[]): DatapackDeploymentSpec }>;