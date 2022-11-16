import { Stream } from 'stream';
import * as ZipArchive from 'jszip';

import { Logger , injectable } from '@vlocode/core';
import { CancellationToken, wait } from '@vlocode/util';
import { SalesforceConnectionProvider } from './connection/salesforceConnectionProvider';
import { DeploymentProgress, DetailedDeployResult, PackageManifest, RetrieveResultPackage, RetrieveStatus } from './deploy';
import { DeployOptions } from './salesforceDeployment';
import { SalesforcePackage } from './deploymentPackage';

@injectable()
export class SalesforceDeployService {

    constructor(...args: any[]);
    constructor(
        private readonly salesforce: SalesforceConnectionProvider,
        private readonly logger: Logger) {
    }

    /**
     * Deploy the specified SalesforcePackage into the target org
     * @param manifest Destructive changes to apply
     * @param options Optional deployment options to use
     * @param token A cancellation token to stop the process
     */
    public async deployPackage(sfPackage: SalesforcePackage, options?: DeployOptions, progress?: DeploymentProgress, token?: CancellationToken) : Promise<DetailedDeployResult> {
        return this.deploy(await sfPackage.getBuffer(), options, progress, token);
    }

    /**
     * Deploy a package file, buffer or stream to Salesforce async and returns once the deployment is completed.
     * @param zipInput zip file, buffer or stream to deploy
     * @param options additional deploy options
     * @param progressOptions progress options
     */
    private async deploy(zipInput: Stream | Buffer | string | ZipArchive, options?: DeployOptions, progress?: DeploymentProgress, token?: CancellationToken) : Promise<DetailedDeployResult> {
        let checkInterval = 1000;
        const logInterval = 5000;

        const deploymentTask = async (progress?: DeploymentProgress, cancellationToken?: CancellationToken) => {
            // Convert jszip object to Buffer object
            if (zipInput instanceof ZipArchive) {
                zipInput = await zipInput.generateAsync({
                    type: 'nodebuffer',
                    compression: 'DEFLATE',
                    compressionOptions: {
                        level: 7
                    }
                });
            }

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
                ...options
            };

            if (await this.salesforce.isProductionOrg()) {
                deployOptions.rollbackOnError = true;
                deployOptions.purgeOnDelete = false;
            }

            // Start deploy            
            const connection = await this.salesforce.getJsForceConnection();
            const deployJob = await connection.metadata.deploy(zipInput, deployOptions);

            // Wait for deploy
            let lastConsoleLog = 0;
            let lastProgress = 0;
            let pollCount = 0;
            while (await wait(checkInterval)) {
                // Reduce polling frequency for long running deployments
                if (pollCount++ > 10 && checkInterval < 5000) {
                    pollCount = 0;
                    this.logger.verbose(`Reducing deployment poll interval to ${checkInterval = Math.min(checkInterval + 1000, 5000)}ms`);
                }

                const status = await connection.metadata.checkDeployStatus(deployJob.id, true);

                if (cancellationToken && cancellationToken.isCancellationRequested) {
                    void connection.metadata.cancelDeploy(deployJob.id);
                    return status;
                }

                if (Date.now() - lastConsoleLog > logInterval) {
                    // Do not create separate interval for logging but use the main status check loop
                    this.logger.info(
                        `Deployment ${status.id} -- ${status.status} ` +
                        `(${status.numberComponentsDeployed ?? 0}/${status.numberComponentsTotal ?? 0})` +
                        `${status.numberComponentErrors ? ` -- Errors ${status.numberComponentErrors}` : ''}`);
                    if (status.numberComponentsTotal) {
                        progress?.report({
                            message: `${status.numberComponentsDeployed}/${status.numberComponentsTotal}`,
                            increment: status.numberComponentsDeployed - lastProgress,
                            total: status.numberComponentsTotal
                        });
                        lastProgress = status.numberComponentsDeployed;
                    } else {
                        progress?.report({ message: status.status });
                    }
                    lastConsoleLog = Date.now();
                }

                if (status.done) {
                    const details : any = status.details;
                    if (details.componentFailures && !Array.isArray(details.componentFailures)) {
                        details.componentFailures = [ details.componentFailures ];
                    }
                    return status;
                }
            }
        };

        // @ts-expect-error TS can't infer the return type of the deploymentTask
        return deploymentTask(progress, token)!;
    }

    /**
     * Retrieve the files specified in the Manifest from the currently connected org.
     * @param files Files to deploy
     * @param options Extra deploy options
     * @param progressOptions Progress options
     */
    public async retrieveManifest(manifest: PackageManifest, apiVersion?: string, token?: CancellationToken) : Promise<RetrieveResultPackage> {
        const checkInterval = 2000;

        const retrieveTask = async (cancellationToken?: CancellationToken) => {
            // Create package
            const singlePackage = true;

            // Start deploy            
            const connection = await this.salesforce.getJsForceConnection();
            const retrieveJob = await connection.metadata.retrieve({
                singlePackage, unpackaged: manifest.toJson(apiVersion ?? this.salesforce.getApiVersion())
            }, undefined);

            // Wait for deploy
            while (await wait(checkInterval)) {
                if (cancellationToken && cancellationToken.isCancellationRequested) {
                    // We can't cancel a retrieve
                    throw new Error('Retrieve request cancelled');
                }

                const status = await connection.metadata.checkRetrieveStatus(retrieveJob.id) as RetrieveStatus;
                if (status.done === true || status.done === 'true') {
                    const retrieveZip = status.zipFile ? await new ZipArchive().loadAsync(Buffer.from(status.zipFile, 'base64')) : undefined;
                    return new RetrieveResultPackage(status, singlePackage, retrieveZip);
                }
            }
        };

        // @ts-expect-error TS does not correctly detect the return param for the while loop `await wait` loop
        return retrieveTask(token);
    }
}