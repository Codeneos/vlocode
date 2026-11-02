import { stat } from 'fs/promises';

import { CachedFileSystemAdapter, container, Container, Logger, LogWriter, NodeFileSystem, FileSystem } from "@vlocode/core";
import { Connection, SalesforceConnectionProvider, SfdxConnectionProvider, JsForceConnectionProvider } from "@vlocode/salesforce";

import { DatapackDeployer } from './datapackDeployer';
import { DatapackDeploymentOptions } from './datapackDeploymentOptions';
import { DatapackLoader, VlocityNamespaceService } from '@vlocode/vlocity';

/**
 * Options that describe how to connect to Salesforce and where to write log entries for the
 * standalone {@link deploy} and {@link compare} entry points.
 */
export interface DatapackConnectionOptions {
    /**
     * Optional JSForce connection to the org to which to deploy the specified datapacks
     */
    jsforceConnection?: Connection;
    /**
     * An SFDX username or alias used for connecting to Salesforce
     */
    sfdxUser?: string;
    /**
     * Optional logger to which the deployment process writes log entries; if not is specified no messages will be logged.
     */
    logger?: LogWriter;
}

interface DatapackDeployOptions extends DatapackDeploymentOptions, DatapackConnectionOptions {
}

/**
 * Create a self-contained IoC container with a Salesforce connection, Vlocity namespace service and
 * filesystem registered; used by the standalone {@link deploy} and {@link compare} entry points to
 * setup the dependent classes and objects without requiring a pre-configured container.
 * @param options options describing the Salesforce connection and logging setup
 * @returns A new container instance with all dependencies registered
 */
export async function createDatapackContainer(options: DatapackConnectionOptions): Promise<Container> {
    const localContainer = container.create();

    if (options.logger) {
        localContainer.add(new Logger(undefined, '@vlocode/vlocity-deploy', options.logger));
    } else if(!localContainer.get(Logger)) {
        localContainer.add(Logger.null);
    }

    if (options.jsforceConnection) {
        localContainer.add(new JsForceConnectionProvider(options.jsforceConnection), { provides: [ SalesforceConnectionProvider ] });
    } else if (options.sfdxUser) {
        localContainer.add(new SfdxConnectionProvider(options.sfdxUser, undefined), { provides: [ SalesforceConnectionProvider ] });
    } else {
        throw new Error('Either options.sfdxUser or options.jsforceConnection must be set to connect to Salesforce');
    }

    // Setup dependencies
    localContainer.add(await new VlocityNamespaceService().initialize(localContainer.get(SalesforceConnectionProvider)));
    localContainer.add(new CachedFileSystemAdapter(new NodeFileSystem()), { provides: [ FileSystem ] });

    return localContainer;
}

/**
 * Load all datapacks from the specified paths; folders are scanned recursively for datapacks and
 * files are loaded as single datapacks.
 * @param loader Datapack loader used to load the datapacks
 * @param input The folder(s) or datapack file(s) to load
 * @returns Array with the loaded datapacks; empty when no datapacks are found
 */
export async function loadDatapacks(loader: DatapackLoader, input: string | string[]) {
    const paths = Array.isArray(input) ? input : [ input ];
    return (await Promise.all(paths.map(async path =>
        (await stat(path)).isDirectory() ? loader.loadDatapacksFromFolder(path) : [ await loader.loadDatapack(path) ]
    ))).flat(1);
}

/**
 * Deploy 1 or more datapack from the specified folders to Salesforce. The deployment process can be controlled by the options parameter.
 * At minimum a connection or sfdxAlias should be specified which will tell the deployment to which environment to connect.
 *
 * This is a simple straight forward method that can be used to trigger a deployment without having to prepare and setup the dependent classes and objects.
 * @param input The folder(s) to load the datapacks from that will be deployed
 * @param options options that control the deployment
 * @returns An promise of the deployment object containing the deployment results
 */
export async function deploy(input: string | string[], options: DatapackDeployOptions) {
    const localContainer = await createDatapackContainer(options);
    const datapacks = await loadDatapacks(localContainer.new(DatapackLoader), input);
    if (!datapacks.length) {
        throw new Error(`No datapacks found in specified paths: ${input}`);
    }
    return await localContainer.new(DatapackDeployer).deploy(datapacks, options);
}
