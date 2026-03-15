import { useEffect, useRef } from 'react';
import type { VsCodeApi, WebviewMessage } from '../types';

// The acquireVsCodeApi function is injected by VS Code into the webview context.
declare function acquireVsCodeApi(): VsCodeApi;

let _api: VsCodeApi | undefined;

function getVsCodeApi(): VsCodeApi {
    if (!_api) {
        _api = acquireVsCodeApi();
    }
    return _api;
}

/**
 * Hook that provides the VS Code API for message passing.
 * Returns a stable postMessage function.
 */
export function useVsCodeApi() {
    const apiRef = useRef<VsCodeApi | undefined>(undefined);

    if (!apiRef.current) {
        try {
            apiRef.current = getVsCodeApi();
        } catch {
            // Running outside of VS Code (e.g. browser preview)
            apiRef.current = {
                postMessage: (msg) => console.log('[webview → extension]', msg),
                getState: () => undefined,
                setState: () => undefined,
            };
        }
    }

    return {
        postMessage: (message: WebviewMessage) => apiRef.current!.postMessage(message),
        getState: <T>() => apiRef.current!.getState<T>(),
        setState: <T>(state: T) => apiRef.current!.setState(state),
    };
}
