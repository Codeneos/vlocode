import * as path from 'path';
import { Stream } from 'stream';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as jsforce from 'jsforce';
import * as ZipArchive from 'jszip';
import * as vscode from 'vscode';

import { Logger } from 'lib/logging';
import { wait } from 'lib/util/async';
import { filterAsyncParallel, mapAsyncParallel, filterUndefined } from 'lib/util/collection';
import { getDocumentBodyAsString } from 'lib/util/fs';
import { injectable } from 'lib/core/inject';
import VlocodeConfiguration from 'lib/vlocodeConfiguration';
import { SalesforcePackage } from './deploymentPackage';
import SalesforceService from './salesforceService';
import { RetrieveResultPackage } from './deploy/retrieveResultPackage';
import { MetadataManifest, PackageManifest } from './deploy/packageXml';

export type DetailedDeployResult = jsforce.DeployResult & {
    details?: { 
        componentFailures: FailureDeployMessage[];
        componentSuccesses: DeployMessage[];
    };
};

export interface DeployMessage {
    /**
     * ID of the component being deployed.
     */
    id: string;
    /**
     * The metadata type of the component in this deployment. This field is available in API version 30.0 and later.
     */
    componentType: string;
    /**
     * The name of the file in the .zip file used to deploy this component.
     */
    fileName: string;
    /**
     * The full name of the component. 
     * Inherited from Metadata, this field is defined in the WSDL for this metadata type. It must be specified when creating, updating, or deleting. See createMetadata() to see an example of this field specified for a call.
     */
    fullName: string;
    /**
     * Indicates whether the component was successfully deployed (true) or not (false).
     */
    success: boolean;
    /**
     * If true, the component was changed as a result of this deployment. If false, the deployed component was the same as the corresponding component already in the organization.
     */
    changed: boolean;
    /**
     * If true, the component was deleted as a result of this deployment. If false, the component was either new or modified as result of the deployment.
     */
    deleted: boolean;
    /**
     * If true, the component was created as a result of this deployment. If false, the component was either deleted or modified as a result of the deployment.
     */
    created: boolean;
}

export interface FailureDeployMessage extends DeployMessage {
    problem: string;
    problemType: 'Warning' | 'Error';
    columnNumber: string;
    lineNumber: string;
}

export type DeploymentProgress = vscode.Progress<{
    message?: string;
    increment?: number;
    total?: number;
}>;

interface RetrieveStatus extends jsforce.RetrieveResult {
    done: boolean | string;
    success: boolean | string;
    errorMessage?: string;
    errorStatusCode?: string;
    status: 'Pending' | 'InProgress' | 'Succeeded' | 'Failed';
}

@injectable()
export class SalesforceDeployService {

    constructor(...args: any[]);
    constructor(
        private readonly salesforce: SalesforceService,
        private readonly config: VlocodeConfiguration,
        private readonly logger: Logger) {
    }

    /**
     * Deploy the specified SalesforcePackage into the target org
     * @param manifest Destructive changes to apply
     * @param options Optional deployment options to use
     * @param token A cancellation token to stop the process
     */
    public async deployPackage(sfPackage: SalesforcePackage, options?: jsforce.DeployOptions, progress?: DeploymentProgress, token?: vscode.CancellationToken) : Promise<DetailedDeployResult> {
        return this.deploy(await sfPackage.getBuffer(), options, progress, token);
    }

    /**
     * Deploy a package file, buffer or stream to Salesforce async and returns once the deployment is completed.
     * @param zipInput zip file, buffer or stream to deploy
     * @param options additional deploy options
     * @param progressOptions progress options
     */
    private async deploy(zipInput: Stream | Buffer | string | ZipArchive, options?: jsforce.DeployOptions, progress?: DeploymentProgress, token?: vscode.CancellationToken) : Promise<DetailedDeployResult> {
        let checkInterval = 1000;
        const logInterval = 5000;
        const deploymentTypeText = options && options.checkOnly ? 'Validate' : 'Deploy';

        const deploymentTask = async (progress?: DeploymentProgress, cancellationToken?: vscode.CancellationToken) => {
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

            const testZip = path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, 'test.zip');
            await fs.writeFile(testZip, zipInput);

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
                this.logger.warn('Production deployment detected; running as validate/checkOnly');
                // Always check only for production
                deployOptions.rollbackOnError = true;
                deployOptions.purgeOnDelete = false;
                deployOptions.checkOnly = true;
            }

            // Start deploy            
            const connection = await this.salesforce.getJsForceConnection();
            const deployJob = await connection.metadata.deploy(zipInput, deployOptions);

            // Wait for deploy
            let lastConsoleLog = 0;
            let lastProgress = 0;
            let pollCount = 0;
            while (await wait(checkInterval)) {
                if (cancellationToken && cancellationToken.isCancellationRequested) {
                    // @ts-expect-error; cancelDeploy is not available in jsforce types
                    void connection.metadata.cancelDeploy(deployJob.id);
                    throw new Error(`${deploymentTypeText} cancelled`);
                }

                // Reduce polling frequency for long running deployments
                if (pollCount++ > 10 && checkInterval < 5000) {
                    pollCount = 0;
                    this.logger.verbose(`Reducing deployment poll interval to ${checkInterval = Math.min(checkInterval + 1000, 5000)}ms`);
                }

                const status = await connection.metadata.checkDeployStatus(deployJob.id, true);

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

        // @ts-expect-error TS does not correctly detect the return param for the while loop `await wait` loop
        return deploymentTask(progress, token);
    }

    /**
     * Retrieve the files specified in the Manifest from the currently connected org.
     * @param files Files to deploy
     * @param options Extra deploy options
     * @param progressOptions Progress options
     */
    public async retrieveManifest(manifest: PackageManifest, apiVersion?: string, token?: vscode.CancellationToken) : Promise<RetrieveResultPackage> {
        const checkInterval = 2000;

        const retrieveTask = async (cancellationToken?: vscode.CancellationToken) => {
            // Create package
            apiVersion = apiVersion ?? this.config.salesforce.apiVersion ?? await this.salesforce.getApiVersion();
            const singlePackage = true;

            // Start deploy            
            const connection = await this.salesforce.getJsForceConnection();
            const retrieveJob = await connection.metadata.retrieve({
                singlePackage, unpackaged: manifest.toJson(apiVersion)
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