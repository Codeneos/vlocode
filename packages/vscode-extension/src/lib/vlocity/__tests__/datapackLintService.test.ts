import * as vscode from 'vscode';
import { Worker } from 'node:worker_threads';
import { container, Logger } from '@vlocode/core';
import { VlocodeContext } from '../../vlocodeContext';
import type { DatapackLintResult } from '../datapackLintProtocol';
import { DatapackLintService } from '../datapackLintService';

jest.mock('vscode', () => {
    const dispose = () => ({ dispose: jest.fn() });
    class Uri {
        scheme = 'file';
        constructor(public fsPath: string) {}
        static file(path: string) { return new Uri(path); }
        toString() { return `file://${this.fsPath}`; }
    }
    class Range { constructor(public startLine: number, public startColumn: number, public endLine: number, public endColumn: number) {} }
    class Diagnostic { constructor(public range: Range, public message: string, public severity: number) {} }
    class Location { constructor(public uri: Uri, public range: Range) {} }
    class DiagnosticRelatedInformation { constructor(public location: Location, public message: string) {} }
    class RelativePattern { constructor(public base: unknown, public pattern: string) {} }
    return {
        Uri, Range, Diagnostic, Location, DiagnosticRelatedInformation, RelativePattern,
        Disposable: { from: (...items) => ({ dispose: jest.fn(() => items.splice(0).forEach(item => item.dispose())) }) },
        DiagnosticSeverity: { Error: 0, Warning: 1 },
        workspace: {
            workspaceFolders: [], getConfiguration: jest.fn(), getWorkspaceFolder: jest.fn(),
            onDidChangeConfiguration: jest.fn(dispose), onDidChangeWorkspaceFolders: jest.fn(dispose),
            onDidSaveTextDocument: jest.fn(dispose), createFileSystemWatcher: jest.fn()
        },
        languages: { createDiagnosticCollection: jest.fn() }
    };
}, { virtual: true });

jest.mock('../../vlocodeContext', () => ({ VlocodeContext: class {} }));
jest.mock('node:worker_threads', () => {
    const { EventEmitter } = require('node:events');
    return { Worker: jest.fn().mockImplementation(() => Object.assign(new EventEmitter(), { terminate: jest.fn().mockResolvedValue(1), postMessage: jest.fn() })) };
});

const root = (name: string) => ({ uri: vscode.Uri.file(`/${name}`), name, index: 0 });
const finding = (file = '/catalog/a.json'): DatapackLintResult['diagnostics'][number] => ({ file, pointer: '/Ref', line: 3, column: 8, ruleId: 'lookup-reference', severity: 'warn', message: 'Missing record' });
let collection: { set: jest.Mock; clear: jest.Mock; dispose: jest.Mock };
let enabled: Record<string, boolean>;
let service: DatapackLintService;

function workers(): any[] { return (Worker as unknown as jest.Mock).mock.results.map(result => result.value); }
function changeConfig() { (vscode.workspace.onDidChangeConfiguration as jest.Mock).mock.calls[0][0]({ affectsConfiguration: () => true }); }
function save(path = '/catalog/a.json') { (vscode.workspace.onDidSaveTextDocument as jest.Mock).mock.calls[0][0]({ uri: vscode.Uri.file(path) }); }
function watcher(index = 0): any { return (vscode.workspace.createFileSystemWatcher as jest.Mock).mock.results[index].value; }
function entries(): any[] { return collection.set.mock.calls.at(-1)?.[0] ?? []; }
async function complete(worker: Worker, diagnostics: DatapackLintResult['diagnostics'] = [], fileCount = 1): Promise<void> {
    worker.emit('message', { diagnostics, fileCount });
    await Promise.resolve();
}

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    enabled = {};
    collection = { set: jest.fn(), clear: jest.fn(), dispose: jest.fn() };
    Object.assign(vscode.workspace, { workspaceFolders: [root('catalog')] });
    (vscode.workspace.getConfiguration as jest.Mock).mockImplementation((_section, uri) => ({ get: (_key, fallback) => enabled[uri.fsPath] ?? fallback }));
    (vscode.workspace.getWorkspaceFolder as jest.Mock).mockImplementation(uri => vscode.workspace.workspaceFolders?.find(folder => uri.fsPath.startsWith(folder.uri.fsPath + '/')));
    (vscode.languages.createDiagnosticCollection as jest.Mock).mockReturnValue(collection);
    (vscode.workspace.createFileSystemWatcher as jest.Mock).mockImplementation(() => ({
        onDidCreate: jest.fn(() => ({ dispose: jest.fn() })), onDidChange: jest.fn(() => ({ dispose: jest.fn() })),
        onDidDelete: jest.fn(() => ({ dispose: jest.fn() })), dispose: jest.fn()
    }));
    const context = { asAbsolutePath: (path: string) => `/extension/${path}` } as VlocodeContext;
    const logger = { verbose: jest.fn(), error: jest.fn() } as unknown as Logger;
    const services = container.create();
    services.use(context, VlocodeContext);
    services.use(logger, Logger);
    service = services.get(DatapackLintService);
});
afterEach(() => { service.dispose(); jest.useRealTimers(); });

function requests(index = 0): Array<{ cwd: string; files?: string[] }> {
    return workers()[index].postMessage.mock.calls.map(call => call[0]).filter(request => request.type === 'lint');
}

test('enabled by default; maps diagnostics and retains the worker for subsequent file checks', async () => {
    service.initialize();
    jest.runAllTimers();
    expect(Worker).toHaveBeenCalledWith('/extension/dist/datapack-lint-worker.mjs');
    expect(requests()).toEqual([{ type: 'lint', cwd: '/catalog', files: undefined }]);
    const related = { file: '/catalog/first.json', pointer: '', line: 1, column: 2 };
    await complete(workers()[0], [{ ...finding(), relatedLocations: [related] }], 2);
    expect(entries()[0][0].fsPath).toBe('/catalog/a.json');
    expect(entries()[0][1][0]).toMatchObject({ source: 'dplint', code: 'lookup-reference', severity: 1, range: { startLine: 2, startColumn: 7, endColumn: 8 } });
    expect(entries()[0][1][0].relatedInformation[0].location.uri.fsPath).toBe('/catalog/first.json');
    save();
    jest.runAllTimers();
    expect(Worker).toHaveBeenCalledTimes(1);
    expect(requests()[1]).toMatchObject({ files: ['/catalog/a.json'] });
    await complete(workers()[0]);
    expect(entries()).toEqual([]);
});

test('disabled at startup performs no scan and registers no file watchers', () => {
    enabled['/catalog'] = false;
    service.initialize();
    save();
    jest.runAllTimers();
    expect(Worker).not.toHaveBeenCalled();
    expect(vscode.workspace.createFileSystemWatcher).not.toHaveBeenCalled();
});

test('disabling clears diagnostics, releases the idle worker, and re-enabling rebuilds the cache', async () => {
    service.initialize();
    jest.runAllTimers();
    const worker = workers()[0];
    await complete(worker, [finding()]);
    enabled['/catalog'] = false;
    changeConfig();
    expect(entries()).toEqual([]);
    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(watcher().dispose).toHaveBeenCalledTimes(1);
    enabled['/catalog'] = true;
    changeConfig();
    jest.runAllTimers();
    expect(Worker).toHaveBeenCalledTimes(1);
    worker.emit('exit', 1);
    await Promise.resolve();
    expect(Worker).toHaveBeenCalledTimes(2);
    expect(requests(1)[0].files).toBeUndefined();
});

test('saves are coalesced and filesystem creation/deletion request new input discovery', async () => {
    service.initialize();
    jest.runAllTimers();
    await complete(workers()[0]);
    save(); save();
    watcher().onDidChange.mock.calls[0][0](vscode.Uri.file('/catalog/a.json'));
    jest.advanceTimersByTime(749);
    expect(requests()).toHaveLength(1);
    jest.advanceTimersByTime(1);
    expect(requests()[1].files).toEqual(['/catalog/a.json']);
    await complete(workers()[0]);
    for (const event of ['onDidCreate', 'onDidDelete']) {
        watcher()[event].mock.calls[0][0](vscode.Uri.file('/catalog/b.json'));
    }
    jest.runAllTimers();
    expect(requests()[2].files).toBeUndefined();
});

test('JSON/YAML config changes trigger validation; unrelated files do not', async () => {
    service.initialize();
    jest.runAllTimers();
    await complete(workers()[0]);
    save('/catalog/readme.md'); save('/catalog/node_modules/package/index.json'); save('/catalog/unrelated.yaml');
    jest.runAllTimers();
    expect(requests()).toHaveLength(1);
    save('/catalog/dplint.config.yaml');
    jest.runAllTimers();
    expect(requests()[1].files).toEqual(['/catalog/dplint.config.yaml']);
});

test('newer saves suppress stale results while preserving the cache and serializing requests', async () => {
    service.initialize();
    jest.runAllTimers();
    const worker = workers()[0];
    save(); save();
    jest.runAllTimers();
    expect(requests()).toHaveLength(1);
    expect(worker.terminate).not.toHaveBeenCalled();
    await complete(worker, [finding()]);
    expect(entries()).toEqual([]);
    expect(requests()).toHaveLength(2);
    await complete(worker, [finding('/catalog/current.json')]);
    expect(entries()[0][0].fsPath).toBe('/catalog/current.json');
});

test('disabling the active folder waits for worker exit before another workspace starts', async () => {
    Object.assign(vscode.workspace, { workspaceFolders: [root('catalog'), root('second')] });
    service.initialize();
    jest.runAllTimers();
    enabled['/catalog'] = false;
    changeConfig();
    expect(workers()[0].terminate).toHaveBeenCalledTimes(1);
    expect(Worker).toHaveBeenCalledTimes(1);
    workers()[0].emit('message', { diagnostics: [finding()], fileCount: 1 });
    expect(entries()).toEqual([]);
    workers()[0].emit('exit', 1);
    await jest.advanceTimersByTimeAsync(0);
    expect(Worker).toHaveBeenCalledTimes(2);
    expect(requests(1)[0].cwd).toBe('/second');
});

test('workspace scans share one worker and removing an idle workspace releases only its cache', async () => {
    Object.assign(vscode.workspace, { workspaceFolders: [root('catalog'), root('second')] });
    service.initialize();
    jest.runAllTimers();
    await complete(workers()[0], [finding()]);
    expect(requests()[1].cwd).toBe('/second');
    await complete(workers()[0], [finding('/second/b.json')]);
    expect(Worker).toHaveBeenCalledTimes(1);
    expect(entries()).toHaveLength(2);
    Object.assign(vscode.workspace, { workspaceFolders: [root('second')] });
    (vscode.workspace.onDidChangeWorkspaceFolders as jest.Mock).mock.calls[0][0]({});
    expect(entries()).toHaveLength(1);
    expect(entries()[0][0].fsPath).toBe('/second/b.json');
    expect(workers()[0].postMessage).toHaveBeenCalledWith({ type: 'release', cwd: '/catalog' });
    expect(workers()[0].terminate).not.toHaveBeenCalled();
});

test('worker failures appear in Problems and the next check starts a new worker', async () => {
    service.initialize();
    jest.runAllTimers();
    workers()[0].emit('error', new Error('Failed to load worker'));
    workers()[0].emit('exit', 1);
    await Promise.resolve();
    expect(entries()[0][1][0]).toMatchObject({ code: 'dplint/runtime', severity: 0, message: 'DataPack lint failed: Failed to load worker' });
    save(); jest.runAllTimers();
    expect(Worker).toHaveBeenCalledTimes(2);
});

test('changes in one folder do not delay another folder waiting to be scanned', () => {
    Object.assign(vscode.workspace, { workspaceFolders: [root('catalog'), root('second')] });
    service.initialize();
    jest.advanceTimersByTime(500);
    save();
    jest.advanceTimersByTime(250);
    expect(requests()[0].cwd).toBe('/second');
});

test('unexpected exit during a check reports a failure', async () => {
    service.initialize();
    jest.runAllTimers();
    workers()[0].emit('exit', 0);
    await Promise.resolve();
    expect(entries()[0][1][0].message).toBe('DataPack lint failed: Lint worker exited unexpectedly (code 0)');
});

test('a worker startup failure does not prevent other folders from being scanned', () => {
    Object.assign(vscode.workspace, { workspaceFolders: [root('catalog'), root('second')] });
    (Worker as unknown as jest.Mock).mockImplementationOnce(() => { throw new Error('Cannot start worker'); });
    service.initialize();
    jest.runAllTimers();
    expect(entries()[0][1][0].message).toBe('DataPack lint failed: Cannot start worker');
    expect(Worker).toHaveBeenCalledTimes(2);
});

test('disposal stops workers, drops pending work, and never publishes late results', async () => {
    service.initialize(); jest.runAllTimers();
    save();
    service.dispose();
    expect(workers()[0].terminate).toHaveBeenCalledTimes(1);
    expect(watcher().dispose).toHaveBeenCalled();
    expect(collection.dispose).toHaveBeenCalled();
    for (const event of [vscode.workspace.onDidChangeConfiguration, vscode.workspace.onDidChangeWorkspaceFolders, vscode.workspace.onDidSaveTextDocument]) {
        expect((event as jest.Mock).mock.results[0].value.dispose).toHaveBeenCalled();
    }
    const calls = collection.set.mock.calls.length;
    workers()[0].emit('message', { diagnostics: [finding()], fileCount: 1 });
    workers()[0].emit('exit', 1);
    await Promise.resolve();
    jest.runAllTimers();
    expect(collection.set).toHaveBeenCalledTimes(calls);
    expect(Worker).toHaveBeenCalledTimes(1);
});
