import { SassCompiler } from 'lib/sass';
import { dependency } from 'lib/core/inject';
import type { DatapackDeploymentSpec } from 'lib/vlocity/datapackDeployService';
import { VlocityDatapack } from 'lib/vlocity/datapack';
import SalesforceService from 'lib/salesforce/salesforceService';
import { LifecyclePolicy } from 'lib/core/container';
import Timer from 'lib/util/timer';
import { Logger } from 'lib/logging';
import type DatapackDeploymentRecord from '../datapackDeploymentRecord';

@dependency({ lifecycle: LifecyclePolicy.transient })
export class VlocityUITemplateSpec implements DatapackDeploymentSpec {

    public constructor(
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger,
        private readonly sass: SassCompiler) {
    }

    /**
     * Pre-process template datapacks
     * @param datapack Datapack
     */
    public async preprocess(datapack: VlocityDatapack) {
        if (datapack.sass__c) {
            const timer = new Timer();
            const result = await this.sass.compile(datapack.sass__c);
            this.logger.info(`Compiled ${datapack.name} SASS [${timer.stop()}]`);

            if (result.status == 0) {
                datapack['%vlocity_namespace%__Css__c'] = result.text;
            } else {
                throw new Error(result.formatted);
            }
        }
    }

    public async beforeDeploy(datapackRecords: DatapackDeploymentRecord[]) {
        const templateRecords = datapackRecords.filter(this.ensureRecordId).map(record => ({ id: record.recordId, isActive: false }));
        await this.salesforceService.update(datapackRecords[0].sobjectType, templateRecords);
    }

    public ensureRecordId(record: DatapackDeploymentRecord): record is DatapackDeploymentRecord & { recordId: string } {
        // Type guard to help typescript see that we are checking for undefined record ids
        return record.recordId !== undefined;
    }
}