import * as fs from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import * as vscode from 'vscode';
import { RetrieveResultFile } from '@vlocode/salesforce';
import RetrieveMetadataCommand from '../commands/metadata/retrieveMetadataCommand';

class TestCommand extends RetrieveMetadataCommand {
    public readonly table = jest.fn();
    public readonly fetchMetadata = jest.fn();
    protected override readonly vlocode = {
        config: { salesforce: { apiVersion: '64.0', exportFormat: 'sfdx', exportFolder: '' } },
        withActivity: async (_options: unknown, run: (...args: any[]) => Promise<void>) => run({}, { isCancellationRequested: false })
    } as any;
    protected override get salesforce(): any { return { deploy: { retrieveManifest: this.fetchMetadata } }; }
    protected override get output(): any { return { table: this.table }; }
    public run(folder: string) {
        this.vlocode.config.salesforce.exportFolder = folder;
        return (this as any).retrieveMetadata([{ fullname: 'Account', componentType: 'CustomObject' }]);
    }
}

describe('metadata retrieval', () => {
    it('writes decomposed SFDX files without reporting the format as unsupported', async () => {
        const folder = await fs.mkdtemp(join(tmpdir(), 'vlocode-retrieve-'));
        const command = new TestCommand();
        const content = Buffer.from('<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata"><label>Account</label><fields><fullName>Example__c</fullName><label>Example</label><type>Text</type><length>80</length></fields></CustomObject>');
        const file = new RetrieveResultFile(
            { componentName: 'Account', componentType: 'CustomObject' } as any,
            { fileName: 'objects/Account.object' } as any,
            { async: async () => content } as any
        );
        command.fetchMetadata.mockResolvedValue({ success: true, retrieveCount: 1, getFiles: () => [file] });
        jest.mocked(vscode.window.showWarningMessage).mockClear();
        jest.mocked(vscode.window.showInformationMessage).mockResolvedValue(undefined);
        try {
            await command.run(folder);
            expect(await fs.pathExists(join(folder, 'objects/Account/fields/Example__c.field-meta.xml'))).toBe(true);
            expect(await fs.pathExists(join(folder, 'objects/Account/Account.object-meta.xml'))).toBe(true);
            expect(vscode.window.showWarningMessage).not.toHaveBeenCalled();
            expect(command.table).toHaveBeenCalled();
        } finally {
            await fs.remove(folder);
        }
    });
});
