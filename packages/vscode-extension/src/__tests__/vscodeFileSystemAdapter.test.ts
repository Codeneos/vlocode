import * as vscode from 'vscode';
import { VSCodeFileSystemAdapter } from '../lib/fs/vscodeFileSystemAdapter';

describe('VSCodeFileSystemAdapter', () => {
    const fs = vscode.workspace.fs as unknown as Record<'stat' | 'readFile' | 'writeFile', jest.Mock>;

    function givenFile(content: string | undefined) {
        fs.stat.mockImplementation(async () => {
            if (content === undefined) {
                throw vscode.FileSystemError.FileNotFound();
            }
            return { type: vscode.FileType.File, ctime: 0, mtime: 0, size: content.length };
        });
        fs.readFile.mockResolvedValue(Buffer.from(content ?? ''));
    }

    beforeEach(() => jest.resetAllMocks());

    it('appends to an existing file', async () => {
        givenFile('a');
        await new VSCodeFileSystemAdapter().writeFile('/a.txt', Buffer.from('b'), { append: true });
        expect(fs.writeFile.mock.calls[0][1].toString()).toBe('ab');
    });

    it('creates a missing file when appending', async () => {
        givenFile(undefined);
        await new VSCodeFileSystemAdapter().writeFile('/a.txt', Buffer.from('b'), { append: true });
        expect(fs.writeFile.mock.calls[0][1].toString()).toBe('b');
    });

    it('does not overwrite an existing file when overwrite is false', async () => {
        givenFile('a');
        await expect(new VSCodeFileSystemAdapter().writeFile('/a.txt', Buffer.from('b'), { overwrite: false })).rejects.toThrow();
        expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('returns the file name in stats', async () => {
        givenFile('a');
        expect((await new VSCodeFileSystemAdapter().stat('/dir/a.txt'))?.name).toBe('a.txt');
    });
});
