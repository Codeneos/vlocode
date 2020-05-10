/**
 * Status of the activity
 */
export enum VlocodeActivityStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
    Cancelled
}

/**
 * Minimal version of VScodes extension context.
 */
export interface VlocodeActivity {

    /**
     * Display name of the activity;
     */
    readonly title: string;

    /**
     * Status of the activity
     */
    readonly status: VlocodeActivityStatus;

    /**
     * Wether or not the activity can be cancelled
     */
    readonly cancelable?: Boolean;

    /**
     * Cancel the activity, only available `cancelable` is true
     */
    cancel?() : any;
}