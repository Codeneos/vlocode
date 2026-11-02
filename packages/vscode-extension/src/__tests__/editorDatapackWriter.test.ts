import * as vscode from 'vscode';
import { container, Container, FileSystem, Logger, MemoryFileSystem } from '@vlocode/core';
import { SalesforceConnectionProvider } from '@vlocode/salesforce';
import { VlocityDatapack } from '@vlocode/vlocity';
import { DatapackExportDefinitionStore, DatapackWriter } from '@vlocode/vlocity-deploy';
import { createOrgServices } from '../lib/orgSession';
import { VlocodeContext } from '../lib/vlocodeContext';
import VlocodeService from '../lib/vlocodeService';
import { DatapackEditorProvider } from '../webviews/datapackEditorProvider';

jest.mock('vscode', () => ({
    ...jest.requireActual('../__mocks__/vscode'),
    Disposable: {
        from: (...subscriptions: { dispose(): void }[]) => ({
            dispose: () => subscriptions.forEach(subscription => subscription.dispose())
        })
    }
}));

interface EditorOperations {
    writeDatapack(datapack: VlocityDatapack): Promise<void>;
    serializeSourceDocuments(document: { datapack: VlocityDatapack }): Promise<Map<string, string>>;
}

describe('editor DataPack writer ownership', () => {
    const folder = '/project/DataRaptor/Transform';
    const header = `${folder}/Transform_DataPack.json`;
    let root: Container;
    let orgA: Container;
    let orgB: Container;
    let selectedServices: Container;
    let fileSystem: MemoryFileSystem;
    let editor: EditorOperations;

    function loadDefinitions(services: Container, suffix: string): void {
        services.get(DatapackExportDefinitionStore).load({
            DataRaptor: {
                objectType: 'OmniDataTransform',
                name: ['Name'],
                embeddedObjects: {
                    OmniDataTransformItem: {
                        objectType: 'OmniDataTransformItem',
                        fileName: [suffix]
                    }
                }
            }
        }, { scope: '/project/export-definitions.yaml' });
    }

    function datapack(): VlocityDatapack {
        return new VlocityDatapack('DataRaptor', {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransform',
            VlocityRecordSourceKey: 'DataRaptor/Transform',
            Name: 'Transform',
            OmniDataTransformItem: [{
                VlocityDataPackType: 'SObject',
                VlocityRecordSObjectType: 'OmniDataTransformItem',
                VlocityRecordSourceKey: 'DataRaptor/Transform/AccountName',
                Name: 'AccountName'
            }]
        }, { headerFile: header, projectFolder: '/project' });
    }

    beforeEach(() => {
        fileSystem = new MemoryFileSystem({ [header]: '{}' });
        root = container.create();
        root.registerProvider(Logger, () => Logger.null);
        root.add(fileSystem, { provides: [FileSystem] });
        root.add({} as VlocodeContext, { provides: [VlocodeContext] });
        root.add({
            get services() { return selectedServices; },
            registerDisposable: jest.fn(),
            onUsernameChanged: jest.fn().mockReturnValue({ dispose: jest.fn() })
        } as unknown as VlocodeService, { provides: [VlocodeService] });

        // A shared writer may already exist; session writers must still use their own definitions.
        loadDefinitions(root, '_Root');
        root.get(DatapackWriter);
        const connector = {} as SalesforceConnectionProvider;
        orgA = createOrgServices(root, connector);
        orgB = createOrgServices(root, connector);
        loadDefinitions(orgA, '_A');
        loadDefinitions(orgB, '_B');
        selectedServices = orgA;
        editor = root.get(DatapackEditorProvider) as unknown as EditorOperations;
        jest.mocked(vscode.window.showWarningMessage).mockResolvedValue({ save: true } as never);
    });

    afterEach(() => {
        orgA.dispose();
        orgB.dispose();
        root.dispose();
        jest.clearAllMocks();
    });

    it('uses each session\'s custom layout for source synchronization and saving', async () => {
        const pack = datapack();
        for (const [services, suffix] of [[orgA, '_A'], [orgB, '_B']] as const) {
            selectedServices = services;
            const sources = await editor.serializeSourceDocuments({ datapack: pack });
            expect([...sources.keys()].sort()).toEqual([`${folder}/Transform${suffix}.json`, header].sort());

            await editor.writeDatapack(pack);

            await expect(fileSystem.readFileAsString(header)).resolves.toContain(`Transform${suffix}.json`);
            await expect(fileSystem.pathExists(`${folder}/Transform${suffix}.json`)).resolves.toBe(true);
            await expect(fileSystem.pathExists(`${folder}/Transform_Root.json`)).resolves.toBe(false);
        }
        await expect(fileSystem.pathExists(`${folder}/Transform_A.json`)).resolves.toBe(false);
    });

    it('writes the confirmed layout when the selected org changes during confirmation', async () => {
        let confirm!: (action: { save: true }) => void;
        let shown!: () => void;
        const promptShown = new Promise<void>(resolve => { shown = resolve; });
        jest.mocked(vscode.window.showWarningMessage).mockImplementationOnce(() => {
            shown();
            return new Promise(resolve => { confirm = resolve; }) as never;
        });

        const saving = editor.writeDatapack(datapack());
        await promptShown;
        selectedServices = orgB;
        confirm({ save: true });
        await saving;

        await expect(fileSystem.readFileAsString(header)).resolves.toContain('Transform_A.json');
        await expect(fileSystem.pathExists(`${folder}/Transform_A.json`)).resolves.toBe(true);
        await expect(fileSystem.pathExists(`${folder}/Transform_B.json`)).resolves.toBe(false);
    });
});
