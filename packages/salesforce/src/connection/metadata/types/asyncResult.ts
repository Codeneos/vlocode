/**
 * Contains the ID of a deployment or retrieval. In API version 28.0 and earlier, 
 * contains status information of any asynchronous metadata call.
 */
export interface AsyncResult {
    /**
     * Required. The ID of the component that’s being deployed or retrieved.
     */
    id: string;
}