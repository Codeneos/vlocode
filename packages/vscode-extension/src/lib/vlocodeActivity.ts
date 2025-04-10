import type * as vscode from 'vscode';

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
    readonly cancellable: boolean;

    /**
     * True if the activity should not be shown to the user
     */
    readonly hidden: boolean;

    /**
     * Gets the current execution time in ms
     */
    readonly executionTime?: number;

    /**
     * Cancel the activity, only available `cancelable` is true
     */
    cancel?() : any;
}

export interface ActivityOptions {
    progressTitle: string;
    /**
     * Title displayed in the activty expolrer; can be empty in which cas ethe title is picked up from progress title.
     */
    activityTitle?: string;
    /**
     * True if the progress can be cancelled by the user; if so a cancel button is displayed inthe progress nofifcation
     * Activities of this type should accept a cancellation token
     * @default false
     */
    cancellable?: boolean;
    /**
     * The location where the progress is displayed
     * @Default {@link vscode.ProgressLocation.Notification}
     */
    location?: vscode.ProgressLocation;
    /**
     * True to hide the activity from the activity explorer
     * @default false
     */
    hidden?: boolean;
    /**
     * Task runner throws exceptions back to so they can be caught by the called
     */
    propagateExceptions?: boolean;
}

export type ActivityProgressData =  {
    message?: string;
    progress?: number;
    total?: number;
    status?: VlocodeActivityStatus;
} | {
    message?: string;
    increment?: number;
    total?: number;
    status?: VlocodeActivityStatus;
}

export type ActivityProgress = vscode.Progress<ActivityProgressData>;

export interface CancellableActivity<T> {
    (progress: ActivityProgress, token: vscode.CancellationToken): Promise<T>;
}

export interface NoncancellableActivity<T> {
    (progress: ActivityProgress): Promise<T>;
}

export type Activity<T> = CancellableActivity<T> | NoncancellableActivity<T>;