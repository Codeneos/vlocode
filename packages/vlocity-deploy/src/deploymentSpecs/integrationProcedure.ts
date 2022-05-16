import { injectable, LifecyclePolicy } from '@vlocode/core';
import { VlocityOmniScript } from './omniScript';

@injectable({ lifecycle: LifecyclePolicy.transient })
export class VlocityIntegrationProcedure extends VlocityOmniScript {
}