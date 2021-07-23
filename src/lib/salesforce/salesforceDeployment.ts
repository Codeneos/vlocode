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
import { AsyncEventEmitter } from 'lib/util/events';
import { container } from 'lib/core';

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

export interface SalesforceDeploymentEvents {
    progress: DeployProgress;
    cancel: jsforce.DeployResult;
    complete: jsforce.DeployResult;
}

export interface DeployProgress {
    status: string;
    increment: number;
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
    private connection: jsforce.Connection;
    private lastStatus: jsforce.DeployResult;
    private lastPrintedLogStamp = 0;
    private pollCount = 0;
    private lastProgress = 0;
    private nextProgressTimeoutId;

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
        private readonly deployOptions: DeployOptions,
        private readonly salesforce = container.get(SalesforceService),
        private readonly logger = container.get(Logger)) {
        super();
    }

    /**
     * Deploy the specified SalesforcePackage into the target org
     * @param manifest Destructive changes to apply
     * @param options Optional deployment options to use
     * @param token A cancellation token to stop the process
     */
    public async start(): Promise<this> {
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
            ...this.deployOptions
        };

        if (await this.salesforce.isProductionOrg()) {
            this.logger.warn('Production deployment detected; running as validate/checkOnly');
            // Always check only for production
            deployOptions.rollbackOnError = true;
            deployOptions.purgeOnDelete = false;
            deployOptions.checkOnly = true;
        }

        // Start deploy            
        this.connection = await this.salesforce.getJsForceConnection();
        const zipInput = await this.sfPackage.getBuffer(this.compressionLevel);
        const deployJob = await this.connection.metadata.deploy(zipInput, deployOptions);
        this.deploymentId = deployJob.id;

        return this;
    }

    /**
     * Cancel ongoing deployment.
     */
    public async cancel() {
        // Cancel next progress tick
        if (this.nextProgressTimeoutId != 0) {
            clearTimeout(this.nextProgressTimeoutId);
        }
        // @ts-expect-error; cancelDeploy is not available in jsforce types
        const deployCancelRequest = this.connection.metadata.cancelDeploy(this.deploymentId);
        void this.emit('cancel', this.lastStatus);
        await deployCancelRequest;
    }

    private async checkDeployment() {
        const status = await this.connection.metadata.checkDeployStatus(this.deploymentId, true);

        // Reduce polling frequency for long running deployments
        if (this.pollCount++ > 10 && this.checkInterval < 5000) {
            this.pollCount = 0;
            this.logger.verbose(`Reducing deployment poll interval to ${this.checkInterval = Math.min(this.checkInterval + 1000, 5000)}ms`);
        }

        if (Date.now() - this.lastPrintedLogStamp > this.logInterval) {
            // Do not create separate interval for logging but use the main status check loop
            this.logger.info(
                `Deployment ${status.id} -- ${status.status} ` +
                `(${status.numberComponentsDeployed ?? 0}/${status.numberComponentsTotal ?? 0})` +
                `${status.numberComponentErrors ? ` -- Errors ${status.numberComponentErrors}` : ''}`);

            if (status.numberComponentsTotal) {
                void this.emit('progress', {
                    status: status.status,
                    deployed: status.numberComponentsDeployed ?? 0,
                    increment: (status.numberComponentsDeployed ?? 0) - this.lastProgress,
                    total: status.numberComponentsTotal ?? 0,
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
        }

        this.nextProgressTimeoutId = setTimeout(() => this.checkDeployment(), this.checkInterval);
        this.lastStatus = status;
    }
}