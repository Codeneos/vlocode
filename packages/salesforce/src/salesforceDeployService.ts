import { Stream } from 'stream';
import * as ZipArchive from 'jszip';

import { Logger, injectable } from '@vlocode/core';
import { Timer, removeAll, stringEqualsIgnoreCase, Iterable } from '@vlocode/util';
import { CancellationToken, mapAsyncParallel, wait } from '@vlocode/util';
import { DeployOptions, SalesforceConnectionProvider, DeployResult } from './connection';
import { DeploymentProgress, PackageManifest, RetrieveResultPackage } from './deploy';
import { SalesforcePackage } from './deploymentPackage';
import { MetadataRegistry } from './metadataRegistry';

export interface RetrieveManifestOptions { 
    apiVersion?: string;
    checkInterval?: number;
    cancellationToken?: CancellationToken;
    /**
     * Enable parallel retrieval of metadata types; when set to true
     * each metadata type is retrieved in parallel. By default a max of `5` parallel retrievals are done.
     * You can change the default parallelism by setting the parallel option to a number.
     */
    parallel?: boolean | number;
    /**
     * When parallel retrieval is enabled, this option can be used to set the chunk size of each parallel retrieval.
     * The chunk size determines the number of metadata types that are retrieved in a single parallel call.
     *
     * Defaults to `1` when not set explicitly. Meaning that each metadata type is retrieved in a separate parallel call.
     */
    parallelChunkSize?: number;
}

@injectable()
export class SalesforceDeployService {

    constructor(...args: any[]);
    constructor(
        private readonly salesforce: SalesforceConnectionProvider,
        private readonly metadataRegister: MetadataRegistry,
        private readonly logger: Logger) {
    }

    /**
     * Deploy the specified SalesforcePackage into the target org
     * @param manifest Destructive changes to apply
     * @param options Optional deployment options to use
     * @param token A cancellation token to stop the process
     */
    public async deployPackage(sfPackage: SalesforcePackage, options?: DeployOptions, progress?: DeploymentProgress, token?: CancellationToken) : Promise<DeployResult> {
        return this.deploy(await sfPackage.getBuffer(), options, progress, token);
    }

    /**
     * Deploy a package file, buffer or stream to Salesforce async and returns once the deployment is completed.
     * @param zipInput zip file, buffer or stream to deploy
     * @param options additional deploy options
     * @param progressOptions progress options
     */
    private async deploy(zipInput: Stream | Buffer | string | ZipArchive, options?: DeployOptions, progress?: DeploymentProgress, token?: CancellationToken) : Promise<DeployResult> {
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
                            deployed: status.numberComponentsDeployed ?? undefined,
                            total: status.numberComponentsTotal
                        });
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
     * Retrieve metadata specified in the Manifest from the currently connected org.
     * @param manifest Manifest to retrieve
     * @param options Retrieve options
     */
    public async retrieveManifest(
        manifest: PackageManifest, 
        options?: RetrieveManifestOptions ): Promise<RetrieveResultPackage> 
    {
        if (options?.parallel) {
            const results = await mapAsyncParallel(
                this.splitManifest(manifest, options.parallelChunkSize ?? 1),
                (manifestChunk) => this.getRetrieveTask(manifestChunk, options)(options.cancellationToken),
                typeof options.parallel === 'number' ? options.parallel : 5
            );
            return results.reduce((result, chunkResult) => result.merge(chunkResult));
        } else {
            return this.getRetrieveTask(manifest, options)(options?.cancellationToken);
        }
    }

    /**
     * Split the manifest into chunks of metadata types that can be retrieved in parallel;
     * when a metadata type has child metadata types, all child metadata types are retrieved in the same chunk as the parent.
     * All other metadata types are retrieved in separate chunks.
     * @param manifest Manifest to split
     * @param typesPerChunk Number of metadata types to retrieve in a single chunk
     * @returns Array of manifests that can be retrieved in parallel
     */
    private splitManifest(manifest: PackageManifest, typesPerChunk: number) {
        const types = manifest.types();
        const metadataGroups: string[][] = [];

        while(types.length) {
            const typeName = types.shift()!;
            const metadataInfo = this.metadataRegister.getMetadataType(typeName);
            const currentGroup = metadataGroups.find(group => group.length < typesPerChunk) 
                ?? (metadataGroups[metadataGroups.length] = []);

            if (metadataInfo) {
                // Due to the way the metadata API works, we can't retrieve a single child type
                // as it will always retrieve the parent type as well -- even if the parent type is not specified in the manifest
                for (const group of Iterable.join(metadataGroups, [ types ])) {
                    if (group !== currentGroup) {
                        currentGroup.push(
                            ...removeAll(group, (item) => stringEqualsIgnoreCase(item, metadataInfo.childXmlNames))
                        );
                    }
                }
            }

            currentGroup.push(typeName);
        }

        return metadataGroups.filter(group => group.length).map(group => manifest.filter(group));
    }

    private getRetrieveTask(manifest: PackageManifest, options?: { apiVersion?: string, checkInterval?: number }) {
        return async (cancellationToken?: CancellationToken) => {
            // Start retrieve
            this.logger.debug(
                `Start retrieve of: ${
                    manifest.types().map(type => `${type} (${manifest.count(type)})`)
                }`
            );

            const timer = new Timer();
            const connection = await this.salesforce.getJsForceConnection();
            const retrieveId = await connection.metadata.retrieve({
                apiVersion: connection.version,
                singlePackage: true,
                unpackaged: manifest.toJson(options?.apiVersion ?? this.salesforce.getApiVersion())
            });

            // Wait for retrieve to complete
            while (await wait(options?.checkInterval ?? 2000)) {
                if (cancellationToken && cancellationToken.isCancellationRequested) {
                    // We can't cancel a retrieve
                    throw new Error('Retrieve request cancelled');
                }

                const status = await connection.metadata.checkRetrieveStatus(retrieveId, false);
                if (status.done === true) {
                    this.logger.debug(
                        `Retrieve completed; fetching zip-file from server ${timer.toString('seconds')} [${
                            manifest.types().map(type => `${type} (${manifest.count(type)})`)
                        }]`
                    );
                    const statusWithArchive = await connection.metadata.checkRetrieveStatus(retrieveId, true);
                    const metadataArchive = statusWithArchive.zipFile ? await new ZipArchive().loadAsync(Buffer.from(statusWithArchive.zipFile, 'base64')) : undefined;
                    return new RetrieveResultPackage(status, true, metadataArchive);
                }
            }

            throw new Error('Retrieve request timed out');
        };  
    }
}