import 'jest';
import * as vscode from 'vscode';
import { Logger, MemoryFileSystem } from '@vlocode/core';

import { WorkspaceContextDetector } from '../workspaceContextDetector';

describe('WorkspaceContextDetector', () => {
    const workspaceFolder = {
        name: 'workspace',
        uri: vscode.Uri.file('/workspace')
    };
    const previousFolders = vscode.workspace.workspaceFolders;
    let changeHandler: (uri: vscode.Uri) => Promise<void>;

    beforeEach(() => {
        jest.useFakeTimers();
        Object.defineProperty(vscode.workspace, 'workspaceFolders', { configurable: true, value: [workspaceFolder] });
        (vscode.workspace as any).onDidChangeWorkspaceFolders = jest.fn().mockReturnValue({ dispose: jest.fn() });
        (vscode.workspace as any).createFileSystemWatcher = jest.fn().mockReturnValue({
            onDidCreate: jest.fn().mockReturnValue({ dispose: jest.fn() }),
            onDidChange: jest.fn((handler: typeof changeHandler) => {
                changeHandler = handler;
                return { dispose: jest.fn() };
            }),
            onDidDelete: jest.fn().mockReturnValue({ dispose: jest.fn() }),
            dispose: jest.fn()
        });
        (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(undefined);
    });

    afterEach(() => {
        Object.defineProperty(vscode.workspace, 'workspaceFolders', { configurable: true, value: previousFolders });
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('updates the context when a created file is reported as changed', async () => {
        const fileSystem = new MemoryFileSystem({ '/workspace/existing.txt': '' });
        const detector = new WorkspaceContextDetector(
            'metadata',
            file => file.name.endsWith('.cls'),
            fileSystem,
            Logger.null
        );

        const initialized = detector.initialize();
        await jest.runAllTimersAsync();
        await initialized;
        jest.clearAllMocks();

        await fileSystem.outputFile('/workspace/classes/Test.cls', '');
        await changeHandler(vscode.Uri.file('/workspace/classes/Test.cls'));
        await jest.runAllTimersAsync();

        expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
            'setContext',
            'vlocode.metadata',
            expect.objectContaining({
                '/workspace': true,
                '/workspace/classes': true,
                '/workspace/classes/Test.cls': true
            })
        );
    });
});
