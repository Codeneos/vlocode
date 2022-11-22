import { LogManager , container } from '@vlocode/core';
import { AsyncEventEmitter } from '@vlocode/util';
import { Connection, SalesforceConnectionProvider } from './connection';
import { DetailedDeployResult } from './deploy';
import { SalesforcePackage } from './deploymentPackage';

export interface SalesforceDeploymentEvents {
    progress: DeployProgress;
    cancel: DetailedDeployResult;
    complete: DetailedDeployResult;
}

export interface DeployProgress {
    status: string;
    deployed: number;
    total: number;
    errors: number;
}

export interface DeployOptions {
    allowMissingFiles?: boolean;
    autoUpdatePackage?: boolean;
    checkOnly?: boolean;
    ignoreWarnings?: boolean;
    performRetrieve?: boolean;
    rollbackOnError?: boolean;
    runAllTests?: boolean;
    runTests?: string[];
    singlePackage?: boolean;
}

export class SalesforceDeployment extends AsyncEventEmitter<SalesforceDeploymentEvents> {
    private checkInterval = 1000;
    private deploymentId: string;
    private connection: Connection;
    private lastStatus: DetailedDeployResult;
    private lastPrintedLogStamp = 0;
    private pollCount = 0;
    private lastProgress = 0;
    private nextProgressTimeoutId: NodeJS.Timeout;

    /**
     * Interval in milliseconds in which data is reported back on the `progress` event
     */
    public logInterval = 5000;

    /**
     *  Deflate compression level of the Salesforce deployment package (zip file)
     */
    public compressionLevel = 7;

    /**
     * Get the deployment status data as it was last retrieved; only set after the deployment has started.
     */
    public get status() {
        return this.lastStatus;
    }

    /**
     * Determine if the deployment has errprs
     */
    public get hasErrors() {
        return (this.lastStatus?.numberComponentErrors ?? 0) > 0 || (this.lastStatus?.numberTestErrors ?? 0) > 0;
    }

    /**
     * ID of the deployment; set after the deployment is queued on the server.
     */
    public get id() {
        return this.deploymentId;
    }

    /**
     * Get setup page URL with the deployment details
     */
    public get setupUrl() {
        const deploymentDetailsUrl = `/changemgmt/monitorDeploymentsDetails.apexp?asyncId=${this.deploymentId}`;
        const setupPageUrl = `lightning/setup/DeployStatus/page?address=${deploymentDetailsUrl}`;
        return setupPageUrl;
    }

    constructor(
        private readonly sfPackage: SalesforcePackage,
        private readonly salesforce = container.get(SalesforceConnectionProvider),
        private readonly logger = LogManager.get(SalesforceDeployment)) {
        super();
    }

    /**
     * Deploy the specified SalesforcePackage into the target org
     * @param options Options
     */
    public async start(options?: DeployOptions): Promise<this> {
        // Set deploy options passed to JSforce; options arg can override the defaults
        const deployOptions = {
            singlePackage: true,
            performRetrieve: true,
            ignoreWarnings: true,
            autoUpdatePackage: false,
            allowMissingFiles: false,
            // We assume we only run on developer orgs by default
            purgeOnDelete: true,
            rollbackOnError: false,
            ...(options ?? {})
        };

        if (await this.salesforce.isProductionOrg()) {
            deployOptions.rollbackOnError = true;
            deployOptions.purgeOnDelete = false;
        }

        // Start deploy
        this.connection = await this.salesforce.getJsForceConnection();
        const zipInput = await this.sfPackage.getBuffer(this.compressionLevel);
        const deployJob = await this.connection.metadata.deploy(zipInput, deployOptions);
        this.deploymentId = deployJob.id;
        
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setImmediate(() => this.checkDeployment());

        return this;
    }

    /**
     * Cancel ongoing deployment.
     */
    public async cancel() {
        // Cancel next progress tick
        if (this.nextProgressTimeoutId) {
            clearTimeout(this.nextProgressTimeoutId);
        }

        try {
            await this.connection.metadata.cancelDeploy(this.deploymentId);
        } catch(err) {
            // if the deployment is already completed we will get an error ignore it
        }

        try {
            // Refresh status
            this.lastStatus = await this.connection.metadata.checkDeployStatus(this.deploymentId, true) as DetailedDeployResult;
        } catch(err) {
            // Ignore errors that occur here;
        } finally {
            void this.emit('cancel', this.lastStatus);
        }
    }

    public getResult() {
        return new Promise<DetailedDeployResult>(resolve => {
            this.once('complete', resolve);
            this.once('cancel', resolve);
        });
    }

    private async checkDeployment() {
        const status = await this.connection.metadata.checkDeployStatus(this.deploymentId, true) as DetailedDeployResult;

        // Reduce polling frequency for long running deployments
        if (this.pollCount++ > 10 && this.checkInterval < 5000) {
            this.pollCount = 0;
            this.logger.verbose(`Reducing deployment poll interval to ${this.checkInterval = Math.min(this.checkInterval + 1000, 5000)}ms`);
        }

        if (Date.now() - this.lastPrintedLogStamp > this.logInterval) {
            // Do not create separate interval for logging but use the main status check loop
            this.logger.info(
                `Deployment ${status.id} -- ${status.status} ` +
                `${status.numberComponentsTotal ? `(${status.numberComponentsDeployed ?? 0}/${status.numberComponentsTotal ?? 0})` : ''}` +
                `${status.numberComponentErrors ? ` -- Errors ${status.numberComponentErrors}` : ''}`);

            if (status.numberComponentsTotal !== undefined) {
                void this.emit('progress', {
                    status: status.status,
                    deployed: status.numberComponentsDeployed ?? 0,
                    progress: (status.numberComponentsDeployed ?? 0),
                    total: status.numberComponentsTotal,
                    errors: status.numberComponentErrors ?? 0
                });
                this.lastProgress = status.numberComponentsDeployed ?? 0;
            }

            this.lastPrintedLogStamp = Date.now();
        }

        if (status.done) {
            const details : any = status.details;
            if (details.componentFailures && !Array.isArray(details.componentFailures)) {
                details.componentFailures = [ details.componentFailures ];
            }
            void this.emit('complete', status);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            this.nextProgressTimeoutId = setTimeout(() => this.checkDeployment(), this.checkInterval);
        }

        this.lastStatus = status;
    }
}