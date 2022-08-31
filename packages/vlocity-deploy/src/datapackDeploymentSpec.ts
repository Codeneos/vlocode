import { DatapackDeploymentRecord } from './datapackDeploymentRecord';
import { VlocityDatapack } from './datapack';
import { isPromise } from 'util/types';
import { DatapackDeploymentEvent } from './datapackDeployer';

export enum DatapackDeploymentSpecFunctions {
    preprocess,
    afterRecordConversion,
    beforeDependencyResolution,
    beforeDeploy,
    afterDeploy
}

/**
 * A deployment spec contains Datapack specific logic and allows hooking into the deployment process to manipulate what get's deployed and execute post-deployment activation logic.
 * 
 * Implementers can implement any of the specified functions in this interface, all functions are optional and only the implemented functions are executed.
 * 
 * For many standard datapacks spec logic is implemented under the {@link ./deploymentSpecs} folder.
 */
export interface DatapackDeploymentSpec {
    /**
     * This function executes before a datapack is converted into a set of {@link DatapackDeploymentRecord}'s and allow changing the datapack 
     * data, correct faulty field values that would otherwise cause errors during record conversion or remove certain fields that should not be deployed. 
     * 
     * This hook can also be used to override certain fields with autogenerated values; i.e. setting the element order and level field of OmniScript elements
     * @param datapack Datapack object
     */
    preprocess?(datapack: VlocityDatapack): Promise<any> | any;

    /**
     * This hook is almost identical to the {@link DatapackDeploymentSpec.preprocess} hook except that executes after a datapack is converted into 1 or more Salesforce records. 
     * 
     * The list of records past into this hook contains all the records generated for a single datapack; it is not possible to remove/drop any record but individual records can be manipulated,
     * 
     * __Note__ At this point dependencies are not yet resolved
     * @param records 
     */
    afterRecordConversion?(records: ReadonlyArray<DatapackDeploymentRecord>): Promise<any> | any;

    /**
     * @deprecated reserved for future use
     */
    beforeDependencyResolution?(records: ReadonlyArray<DatapackDeploymentRecord>): Promise<any> | any;

    /**
     * This hook is called before deploying the first record in a datapack, and is only called once very datapack in the deployment. Use this hook to execute and pre-deployment actions. This action is comparable with the `pre-step` job 
     * from the Vlocity tools library. Use the {@link DatapackDeploymentEvent.getRecords} function to get a list of records for a specific SObject type. 
     * The `type` argument passed to {@link DatapackDeploymentEvent.getRecords} should not be prefixed with a namespace. I.e; to get a list of `OmniScript__c` records in the deployment use:
     * ```js
     * DatapackDeploymentEvent.getRecords('OmniScript__c')
     * ```
     * instead of 
     * ```js
     * DatapackDeploymentEvent.getRecords('vlocity_cmt__OmniScript__c')
     * ```
     * 
     * The event object also exposes {@link DatapackDeploymentEvent.getDeployedRecords}; in the {@link beforeDeploy} this will always return an empty array.
     * 
     * @param event event object
     */
    beforeDeploy?(event: DatapackDeploymentEvent): Promise<any> | any;

    /**
     * This hook is called after all records of a datapack are deployed and will only be called once for every datapack in the deployment. Use this hook to execute datapack activation logic; it is comparable to `post-step` in Vlocity tools and should also execute any activation logic if required.
     * Use the {@link DatapackDeploymentEvent.getDeployedRecords} function to get a list of deployed records for a specific SObject type. This excludes any records that didn't get deployed.
     * The `type` argument passed to {@link DatapackDeploymentEvent.getRecords} should not be prefixed with a namespace even if the object you try to access has a namespace; see also {@link beforeDeploy}.
     * @param event event object
     */
    afterDeploy?(event: DatapackDeploymentEvent): Promise<any> | any;
}

/**
 * Groups multiple spec implementation together and executes them in sequence, specs can be added to the group and 
 * only for the exposed methods on the specs the group will expose implementations.
 * 
 * The order of execution of the specs is determine by the order in which they are added to the group.
 */
export class DatapackDeploymentSpecGroup implements DatapackDeploymentSpec {

    private specFns = new Map<string, Array<(...args: any[]) => Promise<any> | any>>();

    /**
     * Initialize a group of specs that are called im the order that they are added to the group.
     * @param specs optional list of specs
     */
    constructor(specs?: DatapackDeploymentSpec[]) {
        specs?.forEach(spec => this.add(spec));
    }

    /**
     * Adds a deployment spec to a group of specs; the spec can be partially implemented by in which case
     * only the implemented spec functions will be registered in the group.
     * @param spec Spec object to register in the spec group
     */
    public add(spec: Partial<DatapackDeploymentSpec>) {
        for (const fn of Object.keys(DatapackDeploymentSpecFunctions)) {
            if (typeof spec[fn] !== 'function') {
                continue;
            }

            if (!this.specFns.has(fn)) {
                // Create a local function once we have a spec that exposes any of the interface methods
                // this allows transparently exposing the spec to the deployment
                this[fn] = (...args: any[]) => this.call(fn, args);
                this.specFns.set(fn, []);
            }

            this.specFns.get(fn)?.push(spec[fn]);
        }
    }

    private call(name: string, args: any[]) {
        let lastResult: any;
        for (const fn of (this.specFns?.get(name) ?? [])) {
            if (isPromise(lastResult)) {
                lastResult = lastResult.then(() => fn(...args));
            } else {
                // TODO: handle spec function chain errors to avoid one back spec function from
                // killing the full deployment
                lastResult = fn(...args);
            }
        }
    }

    public preprocess?(datapack: VlocityDatapack): Promise<any> | any;
    public afterRecordConversion?(records: ReadonlyArray<DatapackDeploymentRecord>): Promise<any> | any;
    public beforeDependencyResolution?(records: ReadonlyArray<DatapackDeploymentRecord>): Promise<any> | any;
    public beforeDeploy?(event: DatapackDeploymentEvent): Promise<any> | any;
    public afterDeploy?(event: DatapackDeploymentEvent): Promise<any> | any;
}
