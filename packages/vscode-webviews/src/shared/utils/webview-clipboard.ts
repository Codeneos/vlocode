export interface WebviewApi {
    postMessage(message: unknown): void;
}

interface ClipboardResponse {
    error?: string;
    requestId: string;
    text?: string;
    type: 'clipboardResponse';
}

interface PendingRead {
    reject(error: Error): void;
    resolve(text: string): void;
    timeout: number;
}

let vscodeApi: WebviewApi | undefined;
let nextRequestId = 0;
let listening = false;
const pendingReads = new Map<string, PendingRead>();

export function registerWebviewApi(api: WebviewApi | undefined) {
    vscodeApi = api;
    if (!listening) {
        listening = true;
        window.addEventListener('message', event => handleClipboardResponse(event.data));
    }
}

/**
 * Write text to the clipboard. Fire-and-forget: the caller never needs the host
 * to confirm the write, so no response is awaited. `navigator.clipboard` is used
 * as a fallback when running outside a VS Code webview (e.g. the browser preview).
 */
export function writeClipboardText(text: string): void {
    if (vscodeApi) {
        vscodeApi.postMessage({ type: 'clipboard', operation: 'write', text });
    } else {
        void navigator.clipboard?.writeText(text);
    }
}

/**
 * Read text from the clipboard. Inside a VS Code webview this must round-trip to
 * the extension host because `navigator.clipboard.readText()` is blocked there.
 */
export async function readClipboardText(): Promise<string> {
    if (!vscodeApi) {
        return navigator.clipboard ? navigator.clipboard.readText() : '';
    }
    const requestId = `clipboard-${Date.now()}-${++nextRequestId}`;
    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => {
            pendingReads.delete(requestId);
            reject(new Error('Timed out waiting for VS Code clipboard response.'));
        }, 3000);
        pendingReads.set(requestId, { reject, resolve, timeout });
        vscodeApi?.postMessage({ type: 'clipboard', operation: 'read', requestId });
    });
}

function handleClipboardResponse(message: unknown) {
    if (!isClipboardResponse(message)) {
        return;
    }
    const request = pendingReads.get(message.requestId);
    if (!request) {
        return;
    }
    pendingReads.delete(message.requestId);
    window.clearTimeout(request.timeout);
    if (message.error) {
        request.reject(new Error(message.error));
    } else {
        request.resolve(message.text ?? '');
    }
}

function isClipboardResponse(message: unknown): message is ClipboardResponse {
    if (!message || typeof message !== 'object') {
        return false;
    }
    const candidate = message as Partial<ClipboardResponse>;
    return candidate.type === 'clipboardResponse' && typeof candidate.requestId === 'string';
}
