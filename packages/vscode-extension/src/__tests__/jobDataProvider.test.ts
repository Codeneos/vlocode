import * as fs from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import * as vscode from 'vscode';
import { JobDataProvider } from '../treeViews/dataProviders/jobDataProvider';

jest.mock('vscode', () => {
    const vscode = jest.requireActual('vscode');
    return { ...vscode, workspace: { ...vscode.workspace, findFiles: jest.fn() } };
});

class TestProvider extends JobDataProvider {
    public commands() {
        return this.getCommands();
    }
}

describe('Jobs explorer', () => {
    let folder: string;
    const execute = jest.fn();
    beforeEach(async () => {
        folder = await fs.mkdtemp(join(tmpdir(), 'vlocode-jobs-'));
        execute.mockReset();
    });
    afterEach(async () => {
        jest.restoreAllMocks();
        await fs.remove(folder);
    });

    it('discovers export manifests and legacy jobs while excluding other files', async () => {
        const files = [
            ['products.yaml', 'export:\n  Product2: SELECT Id FROM Product2'],
            ['accounts.yml', 'export:\n  Account: [SELECT Id FROM Account]'],
            ['contacts.json', '{"export":{"Contact":"SELECT Id FROM Contact"}}'],
            ['legacy.yaml', 'queries:\n  - VlocityDataPackType: Product2\n    query: SELECT Id FROM Product2'],
            ['definitions.yaml', 'Product2:\n  objectType: Product2'],
            ['record.json', '{"Name":"Example"}']
        ];
        const uris = await Promise.all(files.map(async ([name, body]) => {
            const file = join(folder, name);
            await fs.outputFile(file, body);
            return vscode.Uri.file(file);
        }));
        jest.spyOn(vscode.workspace, 'findFiles').mockResolvedValue(uris);
        const provider = new TestProvider({ commands: { registerAll: jest.fn(), execute } } as any);
        const nodes = await provider.getChildren();
        expect(nodes.map(node => node.label)).toEqual(['products.yaml', 'accounts.yml', 'contacts.json', 'legacy.yaml']);
        expect(nodes.map(node => node.exportManifest)).toEqual([true, true, true, false]);
        expect(vscode.workspace.findFiles).toHaveBeenCalledWith('**/*.{yaml,yml,json}');
        await (provider.commands()['vlocode.jobExplorer.run'] as any)(nodes[0]);
        expect(execute).toHaveBeenCalledWith('vlocode.runExportJob', [uris[0]]);
    });
});
