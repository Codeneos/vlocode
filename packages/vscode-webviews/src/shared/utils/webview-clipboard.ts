export interface WebviewApi {
    postMessage(message: unknown): void;
}

type ClipboardOperation = 'read' | 'write';

interface ClipboardResponse {
    error?: string;
    requestId: string;
    text?: string;
    type: 'clipboardResponse';
}

interface PendingRequest {
    reject(error: Error): void;
    resolve(text: string): void;
    timeout: number;
}

let vscodeApi: WebviewApi | undefined;
let nextRequestId = 0;
let listening = false;
const pending = new Map<string, PendingRequest>();

export function registerWebviewApi(api: WebviewApi | undefined) {
    vscodeApi = api;
    if (!listening) {
        listening = true;
        window.addEventListener('message', event => handleClipboardResponse(event.data));
    }
}

export async function readClipboardText(): Promise<string> {
    return requestClipboard('read');
}

export async function writeClipboardText(text: string): Promise<void> {
    await requestClipboard('write', text);
}

async function requestClipboard(operation: 'read'): Promise<string>;
async function requestClipboard(operation: 'write', text: string): Promise<string>;
async function requestClipboard(operation: ClipboardOperation, text = ''): Promise<string> {
    if (vscodeApi) {
        return requestVsCodeClipboard(operation, text);
    }
    return requestBrowserClipboard(operation, text);
}

function requestVsCodeClipboard(operation: ClipboardOperation, text: string): Promise<string> {
    const requestId = `clipboard-${Date.now()}-${++nextRequestId}`;
    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => {
            pending.delete(requestId);
            reject(new Error('Timed out waiting for VS Code clipboard response.'));
        }, 3000);
        pending.set(requestId, { reject, resolve, timeout });
        vscodeApi?.postMessage({ type: 'clipboard', requestId, operation, text });
    });
}

async function requestBrowserClipboard(operation: ClipboardOperation, text: string): Promise<string> {
    if (!navigator.clipboard) {
        throw new Error('Clipboard API is not available.');
    }
    if (operation === 'read') {
        return navigator.clipboard.readText();
    }
    await navigator.clipboard.writeText(text);
    return '';
}

function handleClipboardResponse(message: unknown) {
    if (!isClipboardResponse(message)) {
        return;
    }
    const request = pending.get(message.requestId);
    if (!request) {
        return;
    }
    pending.delete(message.requestId);
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
