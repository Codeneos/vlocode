import type { WebviewMessage } from '../../lib/webview/types';
export * from '../../lib/webview/types';

/** VSCode API injected into the webview via acquireVsCodeApi() */
export interface VsCodeApi {
    postMessage(message: WebviewMessage): void;
    getState<T>(): T | undefined;
    setState<T>(state: T): void;
}
