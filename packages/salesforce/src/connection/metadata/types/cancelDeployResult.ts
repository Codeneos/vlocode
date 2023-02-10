/**
 * Contains information about a deployment cancellation—whether the cancellation completed and the deployment ID.
 * 
 * The asynchronous metadata call cancelDeploy() returns a CancelDeployResult object.
 */
export interface CancelDeployResult {
    /**
     * Indicates whether the deployment cancellation, which is started through cancelDeploy(), 
     * has completed (`true`) or not (`false`).
     * 
     * When a deployment hasn’t started yet and is still in the queue, the deployment is 
     * canceled immediately with the cancelDeploy() call and this field returns true. Otherwise, 
     * this `field` returns `false` when the cancellation is in progress.
     */
    done: boolean;
    /**
     * ID of the deployment being canceled.
     */
    id: string;
}