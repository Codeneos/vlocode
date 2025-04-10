import { groupBy } from "@vlocode/util";

export enum DatapackkDeploymentState {
    Pending = 'pending',
    InProgress = 'inProgress',
    Success = 'success',
    PartialSuccess = 'partialSuccess',
    Error = 'error',
}

export namespace DatapackkDeploymentState {
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
    export function summarize(statuses: DatapackkDeploymentState[]) : DatapackkDeploymentState {
        const stats = groupBy(statuses, r => r);
        if (stats[DatapackkDeploymentState.InProgress]) {
            return DatapackkDeploymentState.InProgress;
        } else if (!stats[DatapackkDeploymentState.Pending]) {
            if (!stats[DatapackkDeploymentState.Error]) {
                return DatapackkDeploymentState.Success;
            } else if (stats[DatapackkDeploymentState.PartialSuccess]) {
                return DatapackkDeploymentState.PartialSuccess;
            }
            return DatapackkDeploymentState.Error;
        }
        return DatapackkDeploymentState.Pending;
    }    
}



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
    readonly status: DatapackkDeploymentState;
    
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
    readonly status: DatapackkDeploymentState;
    
    /**
     * A collection of error messages generated during the deployment of this datapack.
     * Each error contains a type, optional code, and message but excludes record references.
     */
    readonly datapacks: ReadonlyArray<DatapackDeploymentDatapackStatus>;
}
