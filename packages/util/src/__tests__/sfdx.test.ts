import 'jest';
import { sfdx } from '../sfdx';

function enoent(path: string) {
    return Object.assign(new Error(`ENOENT: no such file or directory, open '${path}'`), { code: 'ENOENT' });
}

describe('sfdx config utilities', () => {
    function configFileSystem(contents: Record<string, object>) {
        const files = new Map(Object.entries(contents).map(([file, config]) => [file, Buffer.from(JSON.stringify(config))]));
        return {
            files,
            readFile: jest.fn(async (file: string) => {
                const contents = files.get(file);
                if (!contents) {
                    throw enoent(file);
                }
                return contents;
            }),
            writeFile: jest.fn(async (file: string, data: Buffer) => { files.set(file, data); }),
            mkdir: jest.fn(async () => undefined)
        };
    }

    it('prefers the modern target-org over a stale legacy default username', async () => {
        const fileSystem = configFileSystem({
            '/workspace/project/.sf/config.json': { 'target-org': 'new-org', 'org-api-version': '65.0' },
            '/workspace/project/.sfdx/sfdx-config.json': { defaultusername: 'old-org' }
        });
        const result = await sfdx.getConfig('/workspace/project', { fs: fileSystem });
        expect(result?.path).toBe('/workspace/project/.sf/config.json');
        expect(result?.config.defaultusername).toBe('new-org');
        await sfdx.setConfig('/workspace/project', { defaultusername: 'selected-org' }, { fs: fileSystem });
        expect(JSON.parse(fileSystem.files.get('/workspace/project/.sf/config.json')!.toString())).toEqual({
            'target-org': 'selected-org', 'org-api-version': '65.0'
        });
    });

    it('retains a legacy selection when modern config only contains unrelated settings', async () => {
        const fileSystem = configFileSystem({
            '/workspace/project/.sf/config.json': { 'org-api-version': '65.0' },
            '/workspace/project/.sfdx/sfdx-config.json': { defaultusername: 'legacy-org' }
        });
        expect((await sfdx.getConfig('/workspace/project', { fs: fileSystem }))?.config.defaultusername).toBe('legacy-org');
    });

    it('writes a direct modern config without modifying the parent selection', async () => {
        const fileSystem = configFileSystem({ '/workspace/.sf/config.json': { 'target-org': 'parent-org' } });
        await sfdx.setConfig('/workspace/project/.sf/config.json', { defaultusername: 'child-org' }, { fs: fileSystem });
        expect(JSON.parse(fileSystem.files.get('/workspace/project/.sf/config.json')!.toString())).toEqual({ 'target-org': 'child-org' });
        expect(JSON.parse(fileSystem.files.get('/workspace/.sf/config.json')!.toString())).toEqual({ 'target-org': 'parent-org' });
    });

    it('creates .sfdx/sfdx-config.json when setting config without an existing file', async () => {
        const files = new Map<string, Buffer>();
        const fileSystem = {
            readFile: jest.fn(async (fileName: string) => {
                const content = files.get(fileName);
                if (!content) {
                    throw enoent(fileName);
                }
                return content;
            }),
            writeFile: jest.fn(async (fileName: string, data: Buffer) => {
                files.set(fileName, data);
            }),
            mkdir: jest.fn(async () => undefined)
        };

        await sfdx.setConfig('/workspace/project', { defaultusername: 'test@example.com' }, { fs: fileSystem });

        expect(fileSystem.mkdir).toHaveBeenCalledWith('/workspace/project/.sfdx', { recursive: true });
        expect(fileSystem.writeFile).toHaveBeenCalledWith('/workspace/project/.sfdx/sfdx-config.json', expect.any(Buffer));
        expect(JSON.parse(files.get('/workspace/project/.sfdx/sfdx-config.json')!.toString('utf8'))).toEqual({
            defaultusername: 'test@example.com'
        });
    });

    it('creates the config next to a direct sfdx-config path', async () => {
        const files = new Map<string, Buffer>();
        const fileSystem = {
            readFile: jest.fn(async (fileName: string) => {
                const content = files.get(fileName);
                if (!content) {
                    throw enoent(fileName);
                }
                return content;
            }),
            writeFile: jest.fn(async (fileName: string, data: Buffer) => {
                files.set(fileName, data);
            }),
            mkdir: jest.fn(async () => undefined)
        };

        await sfdx.setConfig('/workspace/project/.sfdx/sfdx-config.json', { defaultusername: 'direct@example.com' }, { fs: fileSystem });

        expect(fileSystem.mkdir).toHaveBeenCalledWith('/workspace/project/.sfdx', { recursive: true });
        expect(fileSystem.writeFile).toHaveBeenCalledWith('/workspace/project/.sfdx/sfdx-config.json', expect.any(Buffer));
        expect(JSON.parse(files.get('/workspace/project/.sfdx/sfdx-config.json')!.toString('utf8'))).toEqual({
            defaultusername: 'direct@example.com'
        });
    });

    it('does not fall back to a parent config for a missing direct sfdx-config path', async () => {
        const files = new Map<string, Buffer>([
            ['/workspace/.sfdx/sfdx-config.json', Buffer.from(JSON.stringify({ defaultusername: 'parent@example.com' }))]
        ]);
        const fileSystem = {
            readFile: jest.fn(async (fileName: string) => {
                const content = files.get(fileName);
                if (!content) {
                    throw enoent(fileName);
                }
                return content;
            }),
            writeFile: jest.fn(async (fileName: string, data: Buffer) => {
                files.set(fileName, data);
            }),
            mkdir: jest.fn(async () => undefined)
        };

        await sfdx.setConfig('/workspace/project/.sfdx/sfdx-config.json', { defaultusername: 'child@example.com' }, { fs: fileSystem });

        expect(fileSystem.writeFile).toHaveBeenCalledWith('/workspace/project/.sfdx/sfdx-config.json', expect.any(Buffer));
        expect(JSON.parse(files.get('/workspace/project/.sfdx/sfdx-config.json')!.toString('utf8'))).toEqual({
            defaultusername: 'child@example.com'
        });
        expect(JSON.parse(files.get('/workspace/.sfdx/sfdx-config.json')!.toString('utf8'))).toEqual({
            defaultusername: 'parent@example.com'
        });
    });
});
