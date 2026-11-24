import * as fs from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import * as vscode from 'vscode';
import { container, Logger } from '@vlocode/core';
import { PackageManifest, RetrieveResultFile, SalesforceDeployService } from '@vlocode/salesforce';
import RefreshMetadataCommand from '../commands/metadata/refreshMetadataCommand';
import RetrieveMetadataCommand from '../commands/metadata/retrieveMetadataCommand';

const withActivity = async (_options: unknown, run: (...args: any[]) => Promise<void>) =>
    run({}, { isCancellationRequested: false });

class TestCommand extends RetrieveMetadataCommand {
    public readonly table = jest.fn();
    public readonly fetchMetadata = jest.fn();
    protected override readonly vlocode = {
        config: { salesforce: { apiVersion: '64.0', exportFormat: 'sfdx', exportFolder: '' } },
        withActivity
    } as any;
    protected override get salesforce(): any { return { deploy: { retrieveManifest: this.fetchMetadata } }; }
    protected override get output(): any { return { table: this.table }; }
    public run(folder: string, components = [{ fullname: 'Account', componentType: 'CustomObject' }]) {
        this.vlocode.config.salesforce.exportFolder = folder;
        return (this as any).retrieveMetadata(components);
    }
}

class TestRefreshCommand extends RefreshMetadataCommand {
    protected override readonly vlocode = {
        config: { salesforce: { apiVersion: '64.0' } },
        withActivity,
        getDiagnostics: () => new Map()
    } as any;

    constructor(private readonly deploy: SalesforceDeployService) {
        super();
    }

    protected override get salesforce(): any { return { deploy: this.deploy }; }
}

const profile = {
    fullName: 'Example%2FProfile',
    $: { type: 'Profile' },
    fieldPermissions: [{ field: 'Account.Example__c', readable: true, editable: false }],
    recordTypeVisibilities: [{ recordType: 'Account.Example', visible: true, default: false }]
};
const recordType = {
    fullName: 'Account.Example',
    label: 'Example',
    active: true,
    picklistValues: [{ picklist: 'Industry', values: [{ fullName: 'Technology', default: true }] }]
};

function mockMetadataConnection() {
    const metadata = {
        read: jest.fn(async (type: string) => type === 'Profile' ? [profile] : [recordType]),
        retrieve: jest.fn()
    };
    const deploy = new SalesforceDeployService({
        getJsForceConnection: async () => ({ metadata })
    } as any, Logger.null);
    return { deploy, metadata };
}

describe('metadata retrieval', () => {
    beforeAll(() => {
        container.add(Logger.null);
    });

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

    it.each([
        ['Profile', profile.fullName, 'profiles/Example%2FProfile.profile-meta.xml', '<field>Account.Example__c</field>'],
        ['RecordType', recordType.fullName, 'objects/Account/recordTypes/Example.recordType-meta.xml', '<picklist>Industry</picklist>']
    ])('exports %s through readMetadata', async (type, fullName, relativePath, content) => {
        const folder = await fs.mkdtemp(join(tmpdir(), 'vlocode-export-'));
        const { deploy, metadata } = mockMetadataConnection();
        const command = new TestCommand();
        command.fetchMetadata.mockImplementation(deploy.retrieveManifest.bind(deploy));
        jest.mocked(vscode.window.showInformationMessage).mockResolvedValue(undefined);
        try {
            await command.run(folder, [{ componentType: type, fullname: fullName }]);
            expect(metadata.read).toHaveBeenCalledWith(type, [fullName]);
            expect(metadata.retrieve).not.toHaveBeenCalled();
            const xml = await fs.readFile(join(folder, relativePath), 'utf8');
            expect(xml).toContain(content);
            expect(xml).toContain(`<${type} xmlns="http://soap.sforce.com/2006/04/metadata">`);
            expect(xml).not.toContain(`<fullName>${fullName}</fullName>`);
        } finally {
            await fs.remove(folder);
        }
    });

    it('refreshes the selected profile and record type files from the API', async () => {
        const folder = await fs.mkdtemp(join(tmpdir(), 'vlocode-refresh-'));
        const { deploy, metadata } = mockMetadataConnection();
        const command = new TestRefreshCommand(deploy);
        const profilePath = join(folder, 'profiles/Example%2FProfile.profile-meta.xml');
        const recordTypePath = join(folder, 'objects/Account/recordTypes/Example.recordType-meta.xml');
        try {
            await fs.outputFile(profilePath, '<Profile/>');
            await fs.outputFile(recordTypePath, '<RecordType><fullName>Example</fullName></RecordType>');

            await command.execute(vscode.Uri.file(profilePath), [profilePath, recordTypePath].map(file => vscode.Uri.file(file)));

            expect(metadata.read).toHaveBeenCalledWith('Profile', [profile.fullName]);
            expect(metadata.read).toHaveBeenCalledWith('RecordType', [recordType.fullName]);
            expect(metadata.retrieve).not.toHaveBeenCalled();
            expect(await fs.readFile(profilePath, 'utf8')).toContain('<recordType>Account.Example</recordType>');
            expect(await fs.readFile(recordTypePath, 'utf8')).toContain('<fullName>Example</fullName>');
            expect(await fs.readFile(recordTypePath, 'utf8')).toContain('<picklist>Industry</picklist>');
        } finally {
            await fs.remove(folder);
        }
    });

    it('reads profiles in batches of 10', async () => {
        const { deploy, metadata } = mockMetadataConnection();
        const names = Array.from({ length: 12 }, (_, i) => `Profile${i}`);
        metadata.read.mockImplementation(async (_type: string, batch: string[]) => batch.map(fullName => ({ fullName })));

        const manifest = new PackageManifest();
        manifest.add('Profile', names);

        const result = await deploy.retrieveManifest(manifest, { preferMetadataRead: true, apiVersion: '64.0' });

        expect(metadata.read.mock.calls.map(([, batch]) => batch)).toEqual([names.slice(0, 10), names.slice(10)]);
        expect(result.retrieveCount).toBe(12);
    });
});
