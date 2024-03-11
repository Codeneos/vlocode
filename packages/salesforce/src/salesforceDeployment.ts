import { LogManager , container } from '@vlocode/core';
import { AsyncEventEmitter, CancellationToken } from '@vlocode/util';
import { DeployOptions, DeployResult, DeployResultDetails, DeployStatus, FailureDeployMessage, SalesforceConnection, SalesforceConnectionProvider } from './connection';
import { SalesforcePackage } from './deploymentPackage';

export interface SalesforceDeploymentEvents {
    progress: DeployProgress;
    cancel: DeployResult;
    complete: DeployResult;
}

export interface DeployProgress {
    status: DeployStatus;
    deployed: number;
    total: number;
    errors: number;
}

export class SalesforceDeployment extends AsyncEventEmitter<SalesforceDeploymentEvents> {
    private checkInterval = 1000;
    private cancelled: true | undefined;
    private deploymentId: string;
    private connection: SalesforceConnection;
    private lastStatus: DeployResult;
    private lastPrintedLogStamp = 0;
    private pollCount = 0;
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
    public get result() {
        if (!this.lastStatus) {
            throw new Error('Deployment has not yet started, start the deployment before accessing the result property');
        }
        return this.lastStatus;
    }

    /**
     * Determine if the deployment has completed, either successfully or with errors or warnings.
     * Returns `false` if the deployment has not yet started.
     * Returns `true` if the deployment is completed.
     */
    public get isCompleted() {
        return this.lastStatus?.done ?? false;
    }

    /**
     * Returns `true` if the deployment has been cancelled or is currently cancelling.
     */
    public get isCancelled() {
        return this.cancelled === true || this.lastStatus?.status === 'Canceled' || this.lastStatus?.status === 'Canceling';
    }

    /**
     * Returns `true` if the deployment has been cancelled from the server side (Salesforce UI)
     */
     public get isServerSideCancelled() {
        return this.cancelled === undefined && this.isCancelled;
    }

    /**
     * Determine if the deployment has completed successfully.
     */
    public get status() {
        return this.lastStatus?.status ?? 'Pending';
    }

    /**
     * Determine if the deployment has completed successfully.
     */
    public get isPartialSuccess() {
        return this.lastStatus.success && !!this.lastStatus.details?.componentFailures?.length;
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
     * Get package containing the metadata that is being deployed as part of this deployment;
     */
    public get deploymentPackage() {
        return this.sfPackage;
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
        const deployOptions: DeployOptions = {
            singlePackage: true,
            ignoreWarnings: true,
            performRetrieve: false,
            autoUpdatePackage: false,
            allowMissingFiles: false,
            // We assume we only run on developer orgs by default
            purgeOnDelete: true,
            rollbackOnError: false,
            testLevel: 'NoTestRun',
            ...(options ?? {})
        };

        if (await this.salesforce.isProductionOrg()) {
            deployOptions.rollbackOnError = true;
            deployOptions.purgeOnDelete = false;

            if (deployOptions.testLevel === 'NoTestRun') {
                // not supported on production orgs; unset test level so default is used
                delete deployOptions.testLevel;
            }
        }

        if (deployOptions.testLevel === 'RunSpecifiedTests' && !deployOptions.runTests?.length) {
            throw new Error('Test level "RunSpecifiedTests" requires property "runTests" to be set and not empty');
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

        // Set client side cancelled flag
        this.cancelled = true;

        try {
            try {
                this.lastStatus = await this.connection.metadata.cancelDeploy(this.deploymentId);
            } catch(err) {
                this.lastStatus = await this.connection.metadata.checkDeployStatus(this.deploymentId, true);
            }
        } catch(err) {
            // Ignore errors that occur during cancellation
        } finally {
            void this.emit('cancel', this.lastStatus);
        }
    }

    public getResult(token?: CancellationToken) {
        if (this.isCompleted) {
            return this.result;
        }
        token?.onCancellationRequested(() => {
            void this.cancel();
        });
        return new Promise<DeployResult>(resolve => {
            this.once('complete', resolve);
            this.once('cancel', resolve);
        });
    }

    private async checkDeployment() {
        const status = await this.connection.metadata.checkDeployStatus(this.deploymentId, true);
        this.lastStatus = this.processDeployResult(status);

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
                    total: status.numberComponentsTotal ?? 0,
                    errors: status.numberComponentErrors ?? 0
                });
            }
            this.lastPrintedLogStamp = Date.now();
        }

        if (status.done) {
            void this.emit('complete', status);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            this.nextProgressTimeoutId = setTimeout(() => this.checkDeployment(), this.checkInterval);
        }
    }

    private processDeployResult(result: DeployResult) {
        const details = result.details;
        if (details) {
            result.details = this.processDetailedResult(details);
        }
        return result;
    }

    private processDetailedResult(details: DeployResultDetails) {
        if (details?.componentFailures && !Array.isArray(details.componentFailures)) {
            details.componentFailures = [ details.componentFailures ];
        }

        details.componentFailures = details.componentFailures?.filter(failure => !this.isDependentClassError(failure));
        details.allComponentMessages = details.allComponentMessages?.filter(msg => !('problemType' in msg) || !this.isDependentClassError(msg));

        if (details.runTestResult?.failures) {
            details.runTestResult.failures = details.runTestResult?.failures?.filter(
                failure => failure.message.includes('Dependent class is invalid')
            );
        }

        return details;
    }

    private isDependentClassError(failure: FailureDeployMessage) {
        return failure.lineNumber === -1 && failure.columnNumber === -1 && 
            failure.problem.includes('Dependent class is invalid');
    }
}