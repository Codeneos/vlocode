import { groupBy } from "@vlocode/util";

export enum DatapackDeploymentState {
    Pending = 'pending',
    InProgress = 'inProgress',
    Success = 'success',
    PartialSuccess = 'partialSuccess',
    Error = 'error',
}

export namespace DatapackDeploymentState {
    /**
     * Summarizes an array of datapack deployment states into a single representative state.
     * 
     * The function uses the following logic to determine the summary state:
     * - If any deployment is 'InProgress', returns 'InProgress'.
     * - If no deployments are 'Pending':
     *   - If there are no 'Error' states, returns 'Success'.
     *   - If there are 'PartialSuccess' states, returns 'PartialSuccess'.
     *   - Otherwise, returns 'Error'.
     * - If none of the above conditions are met, returns 'Pending'.
     * 
     * @param statuses - Array of deployment states to summarize
     * @returns A single state representing the overall deployment status
     */
    export function summarize(statuses: DatapackDeploymentState[]) : DatapackDeploymentState {
        const stats = groupBy(statuses, r => r);
        if (stats[DatapackDeploymentState.InProgress]) {
            return DatapackDeploymentState.InProgress;
        } else if (!stats[DatapackDeploymentState.Pending]) {
            if (!stats[DatapackDeploymentState.Error]) {
                return DatapackDeploymentState.Success;
            } else if (stats[DatapackDeploymentState.PartialSuccess]) {
                return DatapackDeploymentState.PartialSuccess;
            }
            return DatapackDeploymentState.Error;
        }
        return DatapackDeploymentState.Pending;
    }
}

/**
 * @deprecated Misspelled alias of {@link DatapackDeploymentState}; kept for backwards
 * compatibility and scheduled for removal in a future major release. Use
 * {@link DatapackDeploymentState} instead.
 */
export const DatapackkDeploymentState = DatapackDeploymentState;
/**
 * @deprecated Misspelled alias of {@link DatapackDeploymentState}; kept for backwards
 * compatibility and scheduled for removal in a future major release. Use
 * {@link DatapackDeploymentState} instead.
 */
export type DatapackkDeploymentState = DatapackDeploymentState;

export type DatapackDeploymentMessage =
    { type: 'warn' , message: string } | 
    { type: 'error' , message: string, code?: string };

/**
 * Represents the deployment status of a datapack.
 * 
 * This interface provides information about the current state of a datapack deployment,
 * including its type, key, overall status, and counts of records processed and failed.
 */
export interface DatapackDeploymentDatapackStatus {
    /**
     * The type of the datapack (e.g., 'OmniScript', 'DataRaptor', 'IntegrationProcedure').
     * Identifies the category or type of Vlocity component being deployed.
     */
    readonly type: string;
    
    /**
     * The unique key that identifies this datapack.
     * This is typically a combination of the datapack's name and type.
     */
    readonly datapack: string;
    
    /**
     * The overall deployment status of the datapack.
     * Indicates whether deployment was successful, failed, or partially successful.
     */
    readonly status: DatapackDeploymentState;
    
    /**
     * The total number of records contained within this datapack.
     * Each datapack can consist of multiple records that are deployed together.
     */
    readonly recordCount: number;
    
    /**
     * The number of records that failed to deploy within this datapack.
     * Used to determine if a deployment was partially successful.
     */
    readonly failedCount: number;
    
    /**
     * A collection of error messages generated during the deployment of this datapack.
     * Each error contains a type, optional code, and message but excludes record references.
     */
    readonly messages: ReadonlyArray<DatapackDeploymentMessage>;
}

export interface DatapackDeploymentStatus {

    /**
     * Number of datapacks in this deployment.
     * This is the total number of datapacks that are part of the deployment process.
     * It may include both successfully deployed and failed datapacks.
     */
    readonly total: number;
    
    /**
     * The overall deployment status of the datapack.
     * Indicates whether deployment was successful, failed, or partially successful.
     */
    readonly status: DatapackDeploymentState;
    
    /**
     * A collection of error messages generated during the deployment of this datapack.
     * Each error contains a type, optional code, and message but excludes record references.
     */
    readonly datapacks: ReadonlyArray<DatapackDeploymentDatapackStatus>;
}
