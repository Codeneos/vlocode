import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { VlocityDatapack } from '@vlocode/vlocity';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';
import { SalesforceDeployService, SalesforcePackage } from '@vlocode/salesforce';
import { forEachAsyncParallel, getErrorMessage, Timer } from '@vlocode/util';
import { DeploymentStatus } from '../datapackDeploymentRecord';
import { Container, Logger } from '@vlocode/core';
import { OmniProcessRecord, OmniScriptActivator, OmniScriptDefinition } from '@vlocode/omniscript';

@deploymentSpec({ recordFilter: /^OmniProcess$/i })
export class OmniProcess implements DatapackDeploymentSpec {

    private readonly fields = {
        isProcedure: 'IsIntegrationProcedure',
        lwcKey: OmniProcessRecord.WebComponentKeyField,
        uiniqueName: 'UniqueName',
        active: OmniProcessRecord.ActivationField
    } as const;

    public constructor(
        private readonly activator: OmniScriptActivator,
        private readonly container: Container,
        private readonly logger: Logger) {
    }

    public async preprocess(datapack: VlocityDatapack) {
        datapack.data[this.fields.active] = false;
        delete datapack.data[this.fields.uiniqueName];
        if (datapack.data[this.fields.isProcedure] === true) {
            delete datapack.data[this.fields.lwcKey];
        }
    }

    public async afterDeploy(event: DatapackDeploymentEvent) {
        const activatedScripts: OmniScriptDefinition[] = [];

        // First activate the OmniScripts which generates the OmniScriptDefinition__c records
        for (const record of event.getDeployedRecords('OmniProcess')) {
            try {
                const activatedScript = await this.activator.activate(record.recordId, { 
                    skipLwcDeployment: true,
                    reactivateDependentScripts: false,
                    useStandardRuntime: event.deployment.options.standardRuntime
                });
                activatedScript && activatedScripts.push(activatedScript);
            } catch (err: any) {
                this.logger.error(`Failed to activate omniScript for ${record.datapackKey} -- ${getErrorMessage(err)}`);
                record.updateStatus(DeploymentStatus.Failed, err.message || err);
            }
        }

        // Then compile the LWC components; this is not done in a parallel loop to avoid LOCK errors from the tooling API
        if (!event.deployment.options.skipLwcActivation) {
            await this.deployLwcComponents(event, activatedScripts);
        }
    }

    /**
     * Deploy OmniScript LWC components to the target org
     * @param event
     */
    private async deployLwcComponents(event: DatapackDeploymentEvent, scripts: OmniScriptDefinition[]) {
        const packages = new Array<SalesforcePackage>();
        const options = {
            useStandardRuntime: event.deployment.options.standardRuntime,
            toolingApiTimeout: event.deployment.options.toolingApiTimeout
        }

        await forEachAsyncParallel(scripts, 
            async script => {
                const record = event.getRecordById(script.sOmniScriptId);
                if (!record) {
                    return;
                }
                try {
                    if (event.deployment.options.useMetadataApi) {
                        packages.push(await this.activator.compileToPackage(script, options));
                    } else {
                        await this.activator.deployLwc(script, { toolingApi: true, ...options });
                    }
                } catch (err: any) {
                    this.logger.error(`Failed to deploy LWC component for ${record.datapackKey} -- ${getErrorMessage(err)}`);
                    record.updateStatus(DeploymentStatus.Failed, err.message || err);
                }
            }, 
            event.deployment.options.parallelToolingDeployments ?? 4
        );

        if (packages.length) {
            const timer = new Timer();
            this.logger.info(`Deploying ${packages.length} LWC component(s) using metadata api...`);
            await this.container.new(SalesforceDeployService, undefined, Logger.null).deployPackage(packages.reduce((p, c) => p.merge(c)));
            this.logger.info(`Deployed ${packages.length} LWC components [${timer.stop()}]`);
        }
    }
}