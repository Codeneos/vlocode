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
        const match = value.match(/^([^:]+):(?:(?:\/\/([^/?#]*))?([^?#]*))(?:\?([^#]*))?(?:#(.*))?$/);
        if (match) {
            return new Uri(match[1], match[2] ?? '', match[3] ?? '', match[4] ?? '', match[5] ?? '');
        }
        return new Uri('', '', '', '', '');
    }

    static file(fsPath: string): Uri {
        return new Uri('file', '', fsPath, '', '');
    }

    get fsPath(): string {
        return this.path;
    }

    toString(): string {
        const authority = this.authority ? `//${this.authority}` : '';
        const query = this.query ? `?${this.query}` : '';
        const fragment = this.fragment ? `#${this.fragment}` : '';
        return `${this.scheme}:${authority}${this.path}${query}${fragment}`;
    }
}

export class Position {
    constructor(public line: number, public character: number) {}
}

export class Range {
    public start: Position;
    public end: Position;

    constructor(startLine: number | Position, startCharacter: number | Position, endLine?: number, endCharacter?: number) {
        if (startLine instanceof Position && startCharacter instanceof Position) {
            this.start = startLine;
            this.end = startCharacter;
        } else {
            this.start = new Position(startLine as number, startCharacter as number);
            this.end = new Position(endLine ?? startLine as number, endCharacter ?? startCharacter as number);
        }
    }
}

export class Selection extends Range {}

export class DocumentLink {
    public tooltip?: string;

    constructor(public range: Range, public target?: Uri) {}
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
    workspaceFolders: undefined as Array<{ uri: Uri }> | undefined,
    openTextDocument: jest.fn(),
    registerTextDocumentContentProvider: jest.fn().mockReturnValue({
        dispose: jest.fn()
    })
};

export const window = {
    createOutputChannel: jest.fn().mockReturnValue({
        appendLine: jest.fn(),
        show: jest.fn(),
        dispose: jest.fn()
    }),
    showTextDocument: jest.fn(),
    showWarningMessage: jest.fn()
};

export const commands = {
    registerCommand: jest.fn().mockReturnValue({
        dispose: jest.fn()
    })
};

export const languages = {
    registerDocumentLinkProvider: jest.fn().mockReturnValue({
        dispose: jest.fn()
    })
};

export const TextEditorRevealType = {
    InCenterIfOutsideViewport: 0
};
