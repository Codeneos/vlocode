import 'jest';
import { sfdx } from '../sfdx';

function enoent(path: string) {
    return Object.assign(new Error(`ENOENT: no such file or directory, open '${path}'`), { code: 'ENOENT' });
}

describe('sfdx config utilities', () => {
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
});
