import * as path from 'path';
import { Logger } from '@vlocode/core';
import { Timer } from '@vlocode/util';
import type { DatapackDeploymentEvent } from '../datapackDeployer';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { VlocityDatapack } from '../datapack';
import { SassCompiler } from '../sass';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { RecordActivator } from './recordActivator';

@deploymentSpec({ datapackFilter: /^VlocityUITemplate$/i })
export class VlocityUITemplate implements DatapackDeploymentSpec {

    public constructor(
        private readonly activator: RecordActivator,
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
        datapack.data['%vlocity_namespace%__Active__c'] = false;
    }

    public afterDeploy(event: DatapackDeploymentEvent) {
        return this.activator.activateRecords(event.getDeployedRecords('VlocityUITemplate__c'), () => ({ active__c: true }));
    }
}