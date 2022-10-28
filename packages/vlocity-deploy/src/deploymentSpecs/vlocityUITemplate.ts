import * as path from 'path';
import { Logger } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import { Timer } from '@vlocode/util';
import type { DatapackDeploymentEvent } from '../datapackDeployer';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { VlocityDatapack } from '../datapack';
import { SassCompiler } from '../sass';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';

@deploymentSpec({ datapackFilter: /^VlocityUITemplate$/i })
export class VlocityUITemplate implements DatapackDeploymentSpec {

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

    public async afterDeploy(event: DatapackDeploymentEvent) {
        const templateRecords = [...event.getDeployedRecords('VlocityUITemplate__c')].map(record => ({ id: record.recordId, active__c: true }));
        for await(const record of this.salesforceService.update('%vlocity_namespace%__VlocityUITemplate__c', templateRecords)) {
            if (!record.success) {
                this.logger.warn(`Failed activation of template ${record.ref}: ${record.error}`);
            } else {
                this.logger.verbose(`Activated Vlocity UI template ${record.ref}`);
            }
        }
    }
}