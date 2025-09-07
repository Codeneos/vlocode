
import { CachedFileSystemAdapter, container, Logger, LogWriter, NodeFileSystem, FileSystem } from "@vlocode/core";
import { Connection, SalesforceConnectionProvider, SfdxConnectionProvider, JsForceConnectionProvider } from "@vlocode/salesforce";

import { DatapackDeployer } from './datapackDeployer';
import { DatapackDeploymentOptions } from './datapackDeploymentOptions';
import { DatapackLoader, VlocityNamespaceService } from '@vlocode/vlocity';

interface DatapackDeployOptions extends DatapackDeploymentOptions {
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
        throw new Error('Set either set options.sfdxUser -or- options.jsforceConnection otherwise');
    }

    // Setup dependencies
    localContainer.add(await new VlocityNamespaceService().initialize(localContainer.get(SalesforceConnectionProvider)));
    localContainer.add(new CachedFileSystemAdapter(new NodeFileSystem()), { provides: [ FileSystem ] });

    // load datapacks
    input = Array.isArray(input) ? input : [ input ];
    const datapackLoader = localContainer.new(DatapackLoader);
    const datapacks = (await Promise.all(input.map(i => datapackLoader.loadDatapacksFromFolder(i)))).flat(1);
    if (datapacks.length == 0) {
        throw new Error(`No datapacks found in specified folders: ${input}`);
    }

    // Create deployment
    return await localContainer.new(DatapackDeployer).deploy(datapacks, options);
}