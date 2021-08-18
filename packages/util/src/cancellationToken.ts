export interface CancellationToken {

    /**
     * Is `true` when the token has been cancelled, `false` otherwise.
     */
    isCancellationRequested: boolean;

    /**
     * An {@link Event} which fires upon cancellation.
     */
    onCancellationRequested(listener: (e: any) => any, thisArgs?: any,  ..._: any[]): { dispose(): any };
}