import { RecordBatchOptions } from "@vlocode/salesforce";

export interface DatapackDeploymentOptions extends RecordBatchOptions {
    /**
     * Disable all Vlocity Triggers before starting the deployment; triggers are automatically re-enabled after the deployment completes.
     * @default false
     */
    disableTriggers?: boolean;
    /**
     * Number of times to retry the update or insert operation when it fails; defaults to 1 when not set
     * @default 1
     */
    maxRetries?: number;
    /**
     * Chunk size for retrying failed records; defaults to 5
     * @default 5
     */
    retryChunkSize?: number;
    /**
     * Attempt to lookup dependencies that are part of the deployment but failed to deploy. By setting this to true when part of a datapack fails to deploy
     * the deployment will attempt to lookup an existing record that also matches the lookup requirements. This can help resolve deployment issues whe
     * deploying datapacks from which the parent record cannot be updated, but it does introduce a risk of incorrectly linking records.
     * @default false
     */
    lookupFailedDependencies?: boolean;
    /**
     * Purge dependent records after deploying any record. This setting controls whether or not the deployment will delete direct dependencies linked
     * through a matching (not lookup) dependency. This is especially useful to delete for example PCI records and ensure that old relationships are deleted.
     * @default false
     */
    purgeMatchingDependencies?: boolean;
    /**
     * When @see DatapackDeploymentOptions.purgeMatchingDependencies is enabled this setting controls how embedded datapacks are deleted from the target org
     * when enabled purging of existing records happens in bulk, this is more efficient but in this mode it is not possible to related errors while deleting
     * records to a particular datapack.
     * @default true
     */
    purgeLookupOptimization?: boolean;
    /**
     * When enabled teh deployment wil check for changes between the datapack source and the source org and only deploy
     * @default false;
     */
    deltaCheck?: boolean;
    /**
     * Continue the deployment when a fatal error occurs, note that continuing the deployment on fatal errors will result in an incomplete deployment. This setting
     * affects fatal errors such as unable to convert a datapack to valid Salesforce records and should not be enabled on production deployments.
     * @default false;
     */
    continueOnError?: boolean;
    /**
     * When strict order is enabled the deployment will wait for all records in a datapack to complete before proceeding with deploying
     * any dependent datapacks. By default Vlocode determines deployment order based on record level dependencies this allows for optimal
     * chunking improving the overall speed of the deployment. By setting `strictOrder` to `true` Vlocode also enforces that any datapack
     * that is dependent on another datapack is deployed after the datapack it depends on.
     *
     * Enabling this reduces deployment performance as the deployment will be split in smaller chunks increasing the number of API calls to Salesforce.
     * @default false;
     */
    strictOrder?: boolean;
    /**
     * When enabled the deployment will not fail when a dependency cannot be resolved. If a record has a dependency that cannot be resolved the
     * record will normally be skipped  as deploying the record would fail or cause a corrupted state in the org.
     *
     * When this option is enabled records the deployment will try to deploy the record wihtout resolving the dependency. Only enable this if you are
     * sure that all records can be deployed without all dependencies resolved.
     * @default false
     */
    allowUnresolvedDependencies?: boolean;
    /**
     * When enabled LWC enabled OmniScripts will not get compiled into native LWC components and be deployed to the target org during deployment.
     *
     * Use this if you want to manually compile OmniScripts into LWC or have a batch process ot activate OmniScript LWCs in bulk.
     * @default false
     */
    skipLwcActivation?: boolean;
    /**
     * When true LWC components are deployed using the metadata API instead of the tooling API. The tooling API is usually faster and thus the preferred way to compiled deploy LWC components.
     *
     * Disable this if you need to use the metadata API to deploy LWC components.
     * @default false
     */
    useMetadataApi?: boolean;
    /**
     * Number of milliseconds to wait before timing out a tooling API deployment. This setting is only used when the tooling API is used to deploy LWC components; {@link useMetadataApi} set to `false`.
     * @default 120000
     */
    toolingApiTimeout?: number;
    /**
     * Number of parallel tooling deployments for OmniStudio components. This setting controls the number of parallel deployments that are performed when deploying LWC components for OmniScripts and FlexCards.
     * @default 4
     */
    parallelToolingDeployments?: number;
    /**
     * When enabled the deployment will activate OmniScripts in the target org using Anonyms Apex.
     * @default false
     */
    remoteScriptActivation?: boolean;
    /**
     * When enabled LWC components for FlexCards and OmniScripts will be deployed using the standard (in core) runtime instead of the managed packaged
     * runtime. This setting only works on Orgs on which the standard OmniStudio runtime is enabled.
     * @default false
     */
    standardRuntime?: boolean;
    /**
     * When enabled the deployment will attempt to assign record types to the Profile of the user performing the deployment.
     * This is useful when deploying OmniStudio components that require specific record types to be assigned to the Profile of the user performing the deployment 
     * which are not assigned by default.
     * @default true
     */
    fixRecordTypeAssignment?: boolean;
    /**
     * When enabled the deployment will report datapacks that failed to deploy because a dependent datapack failed to deploy.
     * This is useful to identify which datapacks failed to deploy because of a dependency failure but also results in more verbose deployment reports 
     * that may not be useful in all cases.
     * @default false
     */
    reportCascadeFailures?: boolean;
    /**
     * When enabled the deployment will try to lookup dependencies that are part of the deployment in parallel in multiple batches.
     * Disabling this will result in a more sequential lookup of dependencies which may be useful when debugging deployment issues.
     * Should be enabled for production deployments to improve performance.
     * @default true
     */
    bulkDependencyResolution?: boolean;
}
