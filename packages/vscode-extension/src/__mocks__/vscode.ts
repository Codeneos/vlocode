// Mock implementation of the vscode module for testing
export class Uri {
    public scheme: string;
    public authority: string;
    public path: string;
    public query: string;
    public fragment: string;

    constructor(scheme: string, authority: string, path: string, query: string, fragment: string) {
        this.scheme = scheme;
        this.authority = authority;
        this.path = path;
        this.query = query;
        this.fragment = fragment;
    }

    static parse(value: string): Uri {
        // Simple URI parsing for test purposes
        const match = value.match(/^([^:]+):\/\/([^\/]*)(.*)$/);
        if (match) {
            return new Uri(match[1], match[2], match[3], '', '');
        }
        return new Uri('', '', '', '', '');
    }

    toString(): string {
        return `${this.scheme}://${this.authority}${this.path}`;
    }
}

export interface CancellationToken {
    isCancellationRequested: boolean;
    onCancellationRequested: any;
}

export interface TextDocumentContentProvider {
    provideTextDocumentContent(uri: Uri, token?: CancellationToken): Promise<string> | string;
}

export interface Disposable {
    dispose(): void;
}

export const workspace = {
    registerTextDocumentContentProvider: jest.fn().mockReturnValue({
        dispose: jest.fn()
    })
};
