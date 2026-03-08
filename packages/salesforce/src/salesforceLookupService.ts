import { injectable, LifecyclePolicy } from '@vlocode/core';
import { SalesforceDataService } from './salesforceDataService';

/**
 * @deprecated use SalesforceDataService instead, this class does not add any additional functionality and is only kept for backward compatibility with existing code
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class SalesforceLookupService extends SalesforceDataService {
}
