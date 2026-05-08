import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import open from 'open';
import { getErrorMessage } from '@vlocode/util';

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

type MaybePromise<T> = T | Promise<T>;

interface PathResolutionContext {
    readonly workspaceRoots: readonly string[];
    readonly cache: Map<string, Promise<string | undefined>>;
}

export class VlocodeLogLinkProvider implements vscode.DocumentLinkProvider {

    public static readonly languageId = 'vlocode-log';
    private static readonly openUrlCommand = 'vlocode.log.openUrl';
    private static readonly openFileCommand = 'vlocode.log.openFile';

    private static readonly urlPattern = /\bhttps?:\/\/[^\s<>"'`)\]]+/g;
    private static readonly pathPattern = /(?:~\/|\.{1,2}\/|\/|[A-Za-z]:[\\/]|[\w.-]+[\\/])(?:[^\s<>"'`|:]+[\\/])*[^\s<>"'`|:]+(?::\d+)?(?::\d+)?/g;
    private static readonly trailingPunctuationPattern = /[),.;\]]+$/;
    private static readonly fileTargetPattern = /^(.*?)(?::(\d+)(?::(\d+))?)?$/;
    private static readonly absoluteOrRelativePathPattern = /^(?:~\/|\.{1,2}\/|\/|[A-Za-z]:[\\/])/;
    private static readonly fileExtensionPattern = /\.[A-Za-z][\w-]{0,15}$/;

    public constructor(private readonly fileExists: (filePath: string) => MaybePromise<boolean> = filePath => VlocodeLogLinkProvider.fileExists(filePath)) {
    }

    private readonly pathCache = new Map<string, Promise<string | undefined>>();

    private static async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }

    public static register(): vscode.Disposable {
        const registrations = [
            vscode.languages.registerDocumentLinkProvider(
                { language: VlocodeLogLinkProvider.languageId },
                new VlocodeLogLinkProvider()
            ),
            vscode.commands.registerCommand(VlocodeLogLinkProvider.openUrlCommand, async (url: string) => {
                try {
                    await open(url);
                } catch (error) {
                    void vscode.window.showWarningMessage(`Unable to open URL: ${getErrorMessage(error)}`);
                }
            }),
            vscode.commands.registerCommand(VlocodeLogLinkProvider.openFileCommand, async (target: FileLinkTarget) => {
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
            })
        ];

        return {
            dispose: () => registrations.forEach(registration => registration.dispose())
        };
    }

    public async provideDocumentLinks(document: vscode.TextDocument): Promise<vscode.DocumentLink[]> {
        const context: PathResolutionContext = {
            workspaceRoots: this.getWorkspaceRoots(),
            cache: this.pathCache
        };

        const lineResults = await Promise.all(
            Array.from({ length: document.lineCount }, (_, line) => {
                const { text: scanText, offset } = this.getLinkScanText(document.lineAt(line).text);
                return this.resolveLineLinks(line, scanText, offset, context);
            })
        );

        return lineResults.flat();
    }

    private async resolveLineLinks(line: number, scanText: string, offset: number, context: PathResolutionContext): Promise<vscode.DocumentLink[]> {
        const matches = [
            ...this.findUrlLinks(scanText, offset),
            ...await this.findPathLinks(scanText, offset, context)
        ].sort((a, b) => a.start - b.start);

        return [...this.withoutOverlaps(matches)].map(match => {
            const link = new vscode.DocumentLink(
                new vscode.Range(line, match.start, line, match.end),
                match.target
            );
            link.tooltip = 'Open link';
            return link;
        });
    }

    private getLinkScanText(text: string): { text: string; offset: number } {
        let separatorCount = 0;
        for (let index = 0; index < text.length; index++) {
            if (text[index] === '|') {
                separatorCount++;
                if (separatorCount === 3) {
                    return {
                        text: text.slice(index + 1),
                        offset: index + 1
                    };
                }
            }
        }
        return { text, offset: 0 };
    }

    private findUrlLinks(text: string, offset = 0): LinkMatch[] {
        return this.findMatches(text, VlocodeLogLinkProvider.urlPattern)
            .map(match => ({
                start: offset + match.start,
                end: offset + match.end,
                target: this.createCommandUri(VlocodeLogLinkProvider.openUrlCommand, match.value)
            }));
    }

    private async findPathLinks(text: string, offset: number, context: PathResolutionContext): Promise<LinkMatch[]> {
        const matches = await Promise.all(
            this.findMatches(text, VlocodeLogLinkProvider.pathPattern)
            .map(async match => {
                const parsed = this.parseFileTarget(match.value);
                if (!this.shouldResolvePath(parsed)) {
                    return undefined;
                }

                const resolvedPath = await this.resolvePath(parsed.path, context);
                if (!resolvedPath) {
                    return undefined;
                }
                return {
                    start: offset + match.start,
                    end: offset + match.end,
                    target: this.createCommandUri(VlocodeLogLinkProvider.openFileCommand, {
                        ...parsed,
                        path: resolvedPath
                    })
                };
            })
        );
        return matches.filter((match): match is LinkMatch => match !== undefined);
    }

    private findMatches(text: string, pattern: RegExp) {
        const matches: Array<{ start: number; end: number; value: string }> = [];

        for (const match of text.matchAll(pattern)) {
            const value = this.trimTrailingPunctuation(match[0]);
            if (!value) {
                continue;
            }
            matches.push({
                start: match.index!,
                end: match.index! + value.length,
                value
            });
        }
        return matches;
    }

    private trimTrailingPunctuation(value: string): string {
        return value.replace(VlocodeLogLinkProvider.trailingPunctuationPattern, '');
    }

    private parseFileTarget(value: string): FileLinkTarget {
        const match = VlocodeLogLinkProvider.fileTargetPattern.exec(value);
        return {
            path: match?.[1] ?? value,
            line: match?.[2] ? Number(match[2]) : undefined,
            column: match?.[3] ? Number(match[3]) : undefined
        };
    }

    private shouldResolvePath(parsed: FileLinkTarget): boolean {
        if (VlocodeLogLinkProvider.absoluteOrRelativePathPattern.test(parsed.path)) {
            return true;
        }

        if (parsed.line !== undefined) {
            return true;
        }

        return VlocodeLogLinkProvider.fileExtensionPattern.test(parsed.path);
    }

    private resolvePath(filePath: string, context: PathResolutionContext): Promise<string | undefined> {
        let cached = context.cache.get(filePath);
        if (!cached) {
            cached = this.resolvePathUncached(filePath, context.workspaceRoots);
            context.cache.set(filePath, cached);
        }
        return cached;
    }

    private async resolvePathUncached(filePath: string, workspaceRoots: readonly string[]): Promise<string | undefined> {
        const expandedPath = filePath.startsWith('~/') ? path.join(os.homedir(), filePath.slice(2)) : filePath;
        if (path.isAbsolute(expandedPath)) {
            return await this.fileExists(expandedPath) ? expandedPath : undefined;
        }

        for (const root of workspaceRoots) {
            const candidate = path.resolve(root, expandedPath);
            if (await this.fileExists(candidate)) {
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
