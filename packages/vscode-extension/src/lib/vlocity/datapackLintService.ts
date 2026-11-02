import { relative } from 'node:path';
import * as vscode from 'vscode';

import { injectable, Logger } from '@vlocode/core';
import { getErrorMessage } from '@vlocode/util';
import type { Diagnostic, Location } from '@vlocode/dplint';

import { VlocodeContext } from '../vlocodeContext';
import { DatapackLintWorker } from './datapackLintWorker';

const enabledSetting = 'vlocity.datapackLint.enabled';
const validationDelay = 750;

interface WorkspaceLintState {
    readonly folder: vscode.WorkspaceFolder;
    readonly subscriptions: vscode.Disposable;
    diagnostics: Diagnostic[];
    readonly changes: Set<string>;
    fullScan: boolean;
    revision: number;
    timer?: NodeJS.Timeout;
}

interface ActiveValidation {
    readonly workspace: WorkspaceLintState;
    readonly revision: number;
}

/** Watches saved DataPacks and publishes diagnostics from serial background scans. */
@injectable()
export class DatapackLintService implements vscode.Disposable {

    private readonly diagnostics = vscode.languages.createDiagnosticCollection('dplint');
    private readonly workspaces = new Map<string, WorkspaceLintState>();
    private readonly pending = new Set<WorkspaceLintState>();
    private subscriptions?: vscode.Disposable;
    private activeValidation?: ActiveValidation;
    private worker?: DatapackLintWorker;

    constructor(
        private readonly context: VlocodeContext,
        private readonly logger: Logger
    ) {
    }

    public initialize(): this {
        this.subscriptions = vscode.Disposable.from(
            this.diagnostics,
            vscode.workspace.onDidChangeConfiguration(event => {
                if (event.affectsConfiguration(enabledSetting)) {
                    this.updateWorkspaces();
                }
            }),
            vscode.workspace.onDidChangeWorkspaceFolders(() => this.updateWorkspaces()),
            vscode.workspace.onDidSaveTextDocument(document => this.onFileChanged(document.uri))
        );
        this.updateWorkspaces();
        return this;
    }

    public dispose(): void {
        this.subscriptions?.dispose();
        for (const state of this.workspaces.values()) {
            this.removeWorkspace(state);
        }
        this.worker?.dispose();
    }

    private updateWorkspaces(): void {
        const folders = (vscode.workspace.workspaceFolders ?? []).filter(folder => this.isEnabled(folder));
        const enabled = new Set(folders.map(folder => folder.uri.toString()));

        for (const [key, state] of this.workspaces) {
            if (!enabled.has(key)) {
                this.removeWorkspace(state);
            }
        }
        for (const folder of folders) {
            if (!this.workspaces.has(folder.uri.toString())) {
                this.watchWorkspace(folder);
            }
        }
        if (!this.workspaces.size) {
            this.worker?.dispose();
        }
        this.publishDiagnostics();
    }

    private isEnabled(folder: vscode.WorkspaceFolder): boolean {
        return folder.uri.scheme === 'file' && vscode.workspace
            .getConfiguration('vlocity', folder.uri)
            .get<boolean>('datapackLint.enabled', true);
    }

    private watchWorkspace(folder: vscode.WorkspaceFolder): void {
        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(folder, '**/*.{json,yaml,yml}'));
        const state: WorkspaceLintState = {
            folder,
            diagnostics: [], changes: new Set(), fullScan: true, revision: 0,
            subscriptions: vscode.Disposable.from(
                watcher,
                watcher.onDidCreate(uri => this.onFileChanged(uri, true)),
                watcher.onDidChange(uri => this.onFileChanged(uri)),
                watcher.onDidDelete(uri => this.onFileChanged(uri, true))
            )
        };
        this.workspaces.set(folder.uri.toString(), state);
        this.scheduleValidation(state);
    }

    private removeWorkspace(state: WorkspaceLintState): void {
        clearTimeout(state.timer);
        state.subscriptions.dispose();
        this.pending.delete(state);
        this.workspaces.delete(state.folder.uri.toString());
        state.revision++;
        if (this.activeValidation?.workspace === state) {
            this.worker?.dispose();
        } else {
            this.worker?.release(state.folder.uri.fsPath);
        }
    }

    private onFileChanged(uri: vscode.Uri, rediscover = false): void {
        const folder = vscode.workspace.getWorkspaceFolder(uri);
        const state = folder && this.workspaces.get(folder.uri.toString());
        if (!state) {
            return;
        }

        const path = relative(state.folder.uri.fsPath, uri.fsPath).replace(/\\/g, '/');
        if (/(^|\/)(node_modules|\.git)\//.test(path)) {
            return;
        }
        if (/\.json$/i.test(path) || /^(dplint\.config|\.dplintrc)\.ya?ml$/i.test(path)) {
            this.scheduleValidation(state, rediscover ? undefined : uri.fsPath);
        }
    }

    private scheduleValidation(state: WorkspaceLintState, file?: string): void {
        clearTimeout(state.timer);
        this.pending.delete(state);
        state.revision++;
        if (file) {
            state.changes.add(file);
        } else {
            state.fullScan = true;
        }
        // Debounce each folder independently so edits cannot delay another folder's scan.
        state.timer = setTimeout(() => {
            state.timer = undefined;
            this.pending.add(state);
            void this.processQueue();
        }, validationDelay);
    }

    private async processQueue(): Promise<void> {
        if (this.activeValidation) {
            return;
        }

        for (const state of this.pending) {
            this.pending.delete(state);
            const revision = state.revision;
            const files = state.fullScan ? undefined : [...state.changes];
            state.changes.clear();
            state.fullScan = false;
            this.activeValidation = { workspace: state, revision };
            try {
                if (this.worker && !this.worker.isAvailable) {
                    await this.worker.exited;
                }
                if (state.revision !== revision) {
                    continue;
                }
                const worker = this.worker?.isAvailable ? this.worker : this.createWorker();
                const result = await worker.lint(state.folder.uri.fsPath, files);
                if (result && state.revision === revision) {
                    state.diagnostics = result.diagnostics;
                    this.publishDiagnostics();
                    this.logger.verbose(`Checked ${result.fileCount} DataPack files in ${state.folder.name}: ${result.diagnostics.length} findings`);
                }
            } catch (error) {
                if (state.revision === revision) {
                    this.reportFailure(state, getErrorMessage(error));
                }
            } finally {
                this.activeValidation = undefined;
            }
        }
    }

    private createWorker(): DatapackLintWorker {
        const worker = new DatapackLintWorker(this.context.asAbsolutePath('dist/datapack-lint-worker.mjs'));
        this.worker = worker;
        void worker.exited.then(() => {
            if (this.worker === worker) {
                this.worker = undefined;
            }
        });
        return worker;
    }

    private reportFailure(state: WorkspaceLintState, message: string): void {
        this.logger.error(`DataPack lint failed for ${state.folder.name}: ${message}`);
        state.diagnostics = [{
            file: state.folder.uri.fsPath,
            pointer: '',
            line: 1,
            column: 1,
            ruleId: 'dplint/runtime',
            severity: 'error',
            message: `DataPack lint failed: ${message}`
        }];
        this.publishDiagnostics();
    }

    private publishDiagnostics(): void {
        const entries = new Map<string, vscode.Diagnostic[]>();
        for (const state of this.workspaces.values()) {
            for (const finding of state.diagnostics) {
                const diagnostics = entries.get(finding.file) ?? [];
                diagnostics.push(this.createDiagnostic(finding));
                entries.set(finding.file, diagnostics);
            }
        }
        this.diagnostics.clear();
        this.diagnostics.set([...entries].map(([file, diagnostics]) => [vscode.Uri.file(file), diagnostics]));
    }

    private createDiagnostic(finding: Diagnostic): vscode.Diagnostic {
        const severity = finding.severity === 'error' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning;
        const diagnostic = new vscode.Diagnostic(this.range(finding), finding.message, severity);
        diagnostic.source = 'dplint';
        diagnostic.code = finding.ruleId;
        diagnostic.relatedInformation = finding.relatedLocations?.map(location => new vscode.DiagnosticRelatedInformation(
            new vscode.Location(vscode.Uri.file(location.file), this.range(location)),
            'First occurrence of this source key'
        ));
        return diagnostic;
    }

    private range(location: Location): vscode.Range {
        return new vscode.Range(location.line - 1, location.column - 1, location.line - 1, location.column);
    }
}
