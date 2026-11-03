import { Logger } from '@vlocode/core';
import { sfdx } from '@vlocode/util';
import * as vscode from 'vscode';
import { SfdxConfigManager } from '../lib/sfdxConfigManager';

jest.mock('vscode', () => {
    const mock = jest.requireActual('../__mocks__/vscode');
    return { ...mock, workspace: { ...mock.workspace, getWorkspaceFolder: jest.fn(), createFileSystemWatcher: jest.fn() } };
});

describe('SFDX configuration notifications', () => {
    afterEach(() => jest.restoreAllMocks());

    it.each(['onDidChange', 'onDidCreate', 'onDidDelete'] as const)('reloads the workspace selection on modern config %s events', async event => {
        const workspace = { uri: vscode.Uri.file('/workspace') };
        const watcher = {
            onDidChange: jest.fn(), onDidCreate: jest.fn(), onDidDelete: jest.fn(), dispose: jest.fn()
        };
        jest.mocked(vscode.workspace.createFileSystemWatcher).mockReturnValue(watcher as unknown as vscode.FileSystemWatcher);
        jest.mocked(vscode.workspace.getWorkspaceFolder).mockReturnValue(workspace as vscode.WorkspaceFolder);
        const previousFolders = vscode.workspace.workspaceFolders;
        Object.defineProperty(vscode.workspace, 'workspaceFolders', { configurable: true, value: [workspace] });
        const config = jest.spyOn(sfdx, 'getConfig').mockResolvedValue({
            path: '/workspace/.sfdx/sfdx-config.json', config: { defaultusername: 'old-org' }
        });
        const manager = new SfdxConfigManager(Logger.null);
        try {
            await manager.initialize();
            const fire = jest.spyOn(manager['events'].change, 'fire');
            fire.mockClear();
            config.mockResolvedValue({ path: '/workspace/.sf/config.json', config: { defaultusername: 'new-org' } });
            await watcher[event].mock.calls[0][0](vscode.Uri.file('/workspace/.sf/config.json'));
            expect(vscode.workspace.createFileSystemWatcher).toHaveBeenCalledWith('**/{.sf/config.json,.sfdx/sfdx-config.json}');
            expect(config).toHaveBeenLastCalledWith('/workspace');
            expect(manager.get('defaultusername')).toBe('new-org');
            expect(fire).toHaveBeenCalledWith(expect.objectContaining({ changes: { defaultusername: 'new-org' } }));
            // Removing the selected org must remove it from the snapshot as well.
            config.mockResolvedValue({ path: '/workspace/.sf/config.json', config: {} });
            await watcher[event].mock.calls[0][0](vscode.Uri.file('/workspace/.sf/config.json'));
            expect(manager.get('defaultusername')).toBeUndefined();
            expect(fire).toHaveBeenLastCalledWith(expect.objectContaining({ changes: { defaultusername: undefined } }));
        } finally {
            manager.dispose();
            expect(watcher.dispose).toHaveBeenCalled();
            Object.defineProperty(vscode.workspace, 'workspaceFolders', { configurable: true, value: previousFolders });
        }
    });

    it('does not feed its own org selection write back as a new selection', async () => {
        const workspace = { uri: vscode.Uri.file('/workspace') };
        const configFile = { path: '/workspace/.sfdx/sfdx-config.json', config: { defaultusername: 'a' } };
        const fire = jest.fn();
        const manager = Object.create(SfdxConfigManager.prototype) as any;
        Object.assign(manager, { configs: new Map([['/workspace', configFile]]), configUpdate: Promise.resolve(), events: { change: { fire } }, logger: Logger.null });
        const previousFolders = vscode.workspace.workspaceFolders;
        Object.defineProperty(vscode.workspace, 'workspaceFolders', { configurable: true, value: [workspace] });
        jest.spyOn(vscode.workspace, 'getWorkspaceFolder').mockReturnValue(workspace as vscode.WorkspaceFolder);
        let notification!: Promise<void>;
        jest.spyOn(sfdx, 'setConfig').mockImplementation(async () => {
            notification = manager.handleSfdxConfigChange(vscode.Uri.file(configFile.path));
            return true;
        });
        jest.spyOn(sfdx, 'getConfig').mockResolvedValue({ ...configFile, config: { defaultusername: 'b' } });
        try {
            await manager.update({ defaultusername: 'b' });
            await notification;
            expect(manager.get('defaultusername')).toBe('b');
            expect(fire).not.toHaveBeenCalled();
            jest.mocked(sfdx.getConfig).mockResolvedValue({ ...configFile, config: { defaultusername: 'c' } });
            await manager.handleSfdxConfigChange(vscode.Uri.file(configFile.path));
            expect(fire).toHaveBeenCalledWith(expect.objectContaining({ changes: { defaultusername: 'c' } }));
        } finally {
            Object.defineProperty(vscode.workspace, 'workspaceFolders', { configurable: true, value: previousFolders });
        }
    });

    it('ignores an older file read that finishes after a newer selection was written', async () => {
        const workspace = { uri: vscode.Uri.file('/workspace') };
        const configFile = { path: '/workspace/.sfdx/sfdx-config.json', config: { defaultusername: 'a' } };
        const fire = jest.fn();
        const manager = Object.create(SfdxConfigManager.prototype) as any;
        Object.assign(manager, { configs: new Map([['/workspace', configFile]]), configUpdate: Promise.resolve(), events: { change: { fire } }, logger: Logger.null });
        const previousFolders = vscode.workspace.workspaceFolders;
        Object.defineProperty(vscode.workspace, 'workspaceFolders', { configurable: true, value: [workspace] });
        jest.spyOn(vscode.workspace, 'getWorkspaceFolder').mockReturnValue(workspace as vscode.WorkspaceFolder);
        let finishRead!: (value: typeof configFile) => void;
        let enteredRead!: () => void;
        const reading = new Promise<void>(resolve => { enteredRead = resolve; });
        jest.spyOn(sfdx, 'getConfig')
            .mockImplementationOnce(() => new Promise(resolve => { finishRead = resolve; enteredRead(); }))
            .mockResolvedValue({ ...configFile, config: { defaultusername: 'b' } });
        jest.spyOn(sfdx, 'setConfig').mockResolvedValue(true);
        try {
            const notification = manager.handleSfdxConfigChange(vscode.Uri.file(configFile.path));
            await reading;
            await manager.update({ defaultusername: 'b' });
            finishRead({ ...configFile, config: { defaultusername: 'older-selection' } });
            await notification;
            expect(manager.get('defaultusername')).toBe('b');
            expect(fire).not.toHaveBeenCalled();
        } finally {
            Object.defineProperty(vscode.workspace, 'workspaceFolders', { configurable: true, value: previousFolders });
        }
    });
});
