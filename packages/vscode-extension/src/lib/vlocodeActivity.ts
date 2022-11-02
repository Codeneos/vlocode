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
    activityTitle?: string;
    cancellable: boolean;
    location: vscode.ProgressLocation;
    hidden?: boolean;
    /** Task runner throws exceptions back to so they can be caught by the called */
    propagateExceptions?: boolean;
}

export type ActivityProgress = vscode.Progress<{
    message?: string;
    increment?: number;
    total?: number;
    status?: VlocodeActivityStatus;
}>;

export interface Activity<T> {
    (progress: ActivityProgress, token?: vscode.CancellationToken): Promise<T>;
}

export interface CancellableActivity<T> extends Activity<T> {
    (progress: ActivityProgress, token: vscode.CancellationToken): Promise<T>;
}

export interface NoncancellableActivity<T> extends Activity<T>  {
    (progress: ActivityProgress): Promise<T>;
}