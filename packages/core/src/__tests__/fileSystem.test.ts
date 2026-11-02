import { MemoryFileSystem } from '../fs';

describe('FileSystem', () => {
    it('does not create a missing directory when emptying it', async () => {
        const fileSystem = new MemoryFileSystem();

        await fileSystem.emptyDirectory('/missing');

        await expect(fileSystem.pathExists('/missing')).resolves.toBe(false);
    });
});
