import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import open from 'open';

import type VlocodeService from './vlocodeService';

interface FileLinkTarget {
    path: string;
    line?: number;
    column?: number;
}

interface LinkMatch {
    start: number;
    end: number;
    target: vscode.Uri;
}

export class VlocodeLogLinkProvider implements vscode.DocumentLinkProvider {

    public static readonly languageId = 'vlocode-log';
    private static readonly openUrlCommand = 'vlocode.log.openUrl';
    private static readonly openFileCommand = 'vlocode.log.openFile';

    private static readonly urlPattern = /\bhttps?:\/\/[^\s<>"'`)\]]+/g;
    private static readonly pathPattern = /(?:~\/|\.{1,2}\/|\/|[A-Za-z]:[\\/]|[\w.-]+[\\/])(?:[^\s<>"'`|:]+[\\/])*[^\s<>"'`|:]+(?::\d+)?(?::\d+)?/g;

    public static register(service: VlocodeService) {
        service.registerDisposable(vscode.languages.registerDocumentLinkProvider(
            { language: VlocodeLogLinkProvider.languageId },
            new VlocodeLogLinkProvider()
        ));
        service.registerDisposable(vscode.commands.registerCommand(VlocodeLogLinkProvider.openUrlCommand, (url: string) => {
            void open(url);
        }));
        service.registerDisposable(vscode.commands.registerCommand(VlocodeLogLinkProvider.openFileCommand, async (target: FileLinkTarget) => {
            const document = await vscode.workspace.openTextDocument(vscode.Uri.file(target.path));
            const editor = await vscode.window.showTextDocument(document);

            if (target.line !== undefined) {
                const position = new vscode.Position(
                    Math.max(target.line - 1, 0),
                    Math.max((target.column ?? 1) - 1, 0)
                );
                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
            }
        }));
    }

    public provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentLink[]> {
        const links: vscode.DocumentLink[] = [];
        for (let line = 0; line < document.lineCount; line++) {
            const text = document.lineAt(line).text;
            const matches = [
                ...this.findUrlLinks(text),
                ...this.findPathLinks(text)
            ].sort((a, b) => a.start - b.start);

            for (const match of this.withoutOverlaps(matches)) {
                const link = new vscode.DocumentLink(
                    new vscode.Range(line, match.start, line, match.end),
                    match.target
                );
                link.tooltip = 'Open link';
                links.push(link);
            }
        }
        return links;
    }

    private findUrlLinks(text: string): LinkMatch[] {
        return this.findMatches(text, VlocodeLogLinkProvider.urlPattern)
            .map(match => ({
                start: match.start,
                end: match.end,
                target: this.createCommandUri(VlocodeLogLinkProvider.openUrlCommand, match.value)
            }));
    }

    private findPathLinks(text: string): LinkMatch[] {
        return this.findMatches(text, VlocodeLogLinkProvider.pathPattern)
            .map(match => {
                const parsed = this.parseFileTarget(match.value);
                const resolvedPath = this.resolvePath(parsed.path);
                if (!resolvedPath) {
                    return undefined;
                }
                return {
                    start: match.start,
                    end: match.end,
                    target: this.createCommandUri(VlocodeLogLinkProvider.openFileCommand, {
                        ...parsed,
                        path: resolvedPath
                    })
                };
            })
            .filter((match): match is LinkMatch => match !== undefined);
    }

    private findMatches(text: string, pattern: RegExp) {
        const matches: Array<{ start: number; end: number; value: string }> = [];
        pattern.lastIndex = 0;

        for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
            const rawValue = match[0];
            const value = this.trimTrailingPunctuation(rawValue);
            if (!value) {
                continue;
            }
            matches.push({
                start: match.index,
                end: match.index + value.length,
                value
            });
        }
        return matches;
    }

    private trimTrailingPunctuation(value: string): string {
        return value.replace(/[),.;\]]+$/g, '');
    }

    private parseFileTarget(value: string): FileLinkTarget {
        const match = /^(.*?)(?::(\d+)(?::(\d+))?)?$/.exec(value);
        return {
            path: match?.[1] ?? value,
            line: match?.[2] ? Number(match[2]) : undefined,
            column: match?.[3] ? Number(match[3]) : undefined
        };
    }

    private resolvePath(filePath: string): string | undefined {
        const expandedPath = filePath.startsWith('~/') ? path.join(os.homedir(), filePath.slice(2)) : filePath;
        if (path.isAbsolute(expandedPath) && fs.existsSync(expandedPath)) {
            return expandedPath;
        }

        for (const root of this.getWorkspaceRoots()) {
            const candidate = path.resolve(root, expandedPath);
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }
    }

    private getWorkspaceRoots(): string[] {
        return vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath) ?? [process.cwd()];
    }

    private createCommandUri(command: string, args: unknown): vscode.Uri {
        return vscode.Uri.parse(`command:${command}?${encodeURIComponent(JSON.stringify([args]))}`);
    }

    private *withoutOverlaps(matches: LinkMatch[]) {
        let lastEnd = -1;
        for (const match of matches) {
            if (match.start >= lastEnd) {
                yield match;
                lastEnd = match.end;
            }
        }
    }
}
