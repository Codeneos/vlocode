import * as path from 'path';
import { SassCompiler } from 'lib/sass';
import { service } from 'lib/core/inject';
import type { DatapackDeploymentSpec } from 'lib/vlocity/datapackDeployService';
import { VlocityDatapack } from 'lib/vlocity/datapack';
import SalesforceService from 'lib/salesforce/salesforceService';
import { LifecyclePolicy } from 'lib/core/container';
import Timer from 'lib/util/timer';
import { Logger } from 'lib/logging';
import type DatapackDeploymentRecord from '../datapackDeploymentRecord';

@service({ lifecycle: LifecyclePolicy.transient })
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
            const includePaths = [ datapack.datapackFolder, path.join(datapack.datapackFolder, '..') ];
            const result = await this.sass.compile(datapack.sass__c, { importer: { includePaths } });
            this.logger.info(`Compiled ${datapack.name} SASS [${timer.stop()}]`);

            if (result.status == 0) {
                datapack['%vlocity_namespace%__Css__c'] = result.text;
            } else {
                throw new Error(result.formatted);
            }
        }

        // Update to inactive to allow insert; later in the process these are activated
        datapack.data.active__c = false;
    }

    public async afterDeploy(datapackRecords: DatapackDeploymentRecord[]) {
        const templateRecords = datapackRecords.filter(this.ensureRecordId).map(record => ({ id: record.recordId, active__c: true }));
        for await(const record of this.salesforceService.update(datapackRecords[0].sobjectType, templateRecords)) {
            if (!record.success) {
                this.logger.warn(`Failed activation of template ${record.ref}: ${record.error}`);
            } else {
                this.logger.verbose(`Activated of template ${record.ref}`);
            }
        }
    }

    public ensureRecordId(record: DatapackDeploymentRecord): record is DatapackDeploymentRecord & { recordId: string } {
        // Type guard to help typescript see that we are checking for undefined record ids
        return record.recordId !== undefined;
    }
}