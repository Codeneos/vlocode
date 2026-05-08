import 'jest';

import * as path from 'path';
import * as vscode from 'vscode';

import { VlocodeLogLinkProvider } from '../vlocodeLogLinkProvider';

function createDocument(lines: string[]): vscode.TextDocument {
    return {
        lineCount: lines.length,
        lineAt: (line: number) => ({ text: lines[line] })
    } as unknown as vscode.TextDocument;
}

function linkedText(line: string, link: vscode.DocumentLink): string {
    return line.slice(link.range.start.character, link.range.end.character);
}

function decodeCommandArgs(link: vscode.DocumentLink): unknown[] {
    return JSON.parse(decodeURIComponent(link.target!.query));
}

describe('VlocodeLogLinkProvider', () => {

    const workspaceRoot = '/workspace';

    beforeEach(() => {
        (vscode.workspace as any).workspaceFolders = [{ uri: vscode.Uri.file(workspaceRoot) }];
    });

    it('links URLs and file paths only from the log message column', async () => {
        const relativePath = 'packages/vscode-extension/src/lib/vlocodeLogLinkProvider.ts';
        const resolvedPath = path.resolve(workspaceRoot, relativePath);
        const fileExists = jest.fn(candidate => candidate === resolvedPath);

        const line = `2026-05-07 12:20:30.456 | /workspace/ignored/file.ts | log | See https://example.com/docs and ${relativePath}:12:3`;
        const links = await new VlocodeLogLinkProvider(fileExists).provideDocumentLinks(createDocument([line]));

        expect(links.map(link => linkedText(line, link))).toEqual([
            'https://example.com/docs',
            `${relativePath}:12:3`
        ]);
        expect(decodeCommandArgs(links[0])).toEqual(['https://example.com/docs']);
        expect(decodeCommandArgs(links[1])).toEqual([{ path: resolvedPath, line: 12, column: 3 }]);
    });

    it('does not hit the filesystem for path-shaped values without a file signal', async () => {
        const fileExists = jest.fn();
        const line = '2026-05-07 12:20:30.456 |             VlocodeService | log | Salesforce field Account/Name was skipped';

        const links = await new VlocodeLogLinkProvider(fileExists).provideDocumentLinks(createDocument([line]));

        expect(links).toEqual([]);
        expect(fileExists).not.toHaveBeenCalled();
    });

    it('caches repeated path resolution during one document link pass', async () => {
        const relativePath = 'packages/vscode-extension/src/lib/vlocodeLogLinkProvider.ts';
        const resolvedPath = path.resolve(workspaceRoot, relativePath);
        const fileExists = jest.fn(candidate => candidate === resolvedPath);
        const line = `2026-05-07 12:20:30.456 |             VlocodeService | log | ${relativePath} ${relativePath}`;

        const links = await new VlocodeLogLinkProvider(fileExists).provideDocumentLinks(createDocument([line]));

        expect(links).toHaveLength(2);
        expect(fileExists).toHaveBeenCalledTimes(1);
    });

    it('supports async filesystem checks', async () => {
        const relativePath = 'packages/vscode-extension/src/lib/vlocodeLogLinkProvider.ts';
        const resolvedPath = path.resolve(workspaceRoot, relativePath);
        const fileExists = jest.fn(async candidate => candidate === resolvedPath);
        const line = `2026-05-07 12:20:30.456 |             VlocodeService | log | ${relativePath}`;

        const links = await new VlocodeLogLinkProvider(fileExists).provideDocumentLinks(createDocument([line]));

        expect(links).toHaveLength(1);
        expect(decodeCommandArgs(links[0])).toEqual([{ path: resolvedPath }]);
    });
});
