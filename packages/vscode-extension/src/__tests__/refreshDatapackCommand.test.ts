import 'jest';
import * as vscode from 'vscode';

import { VlocityDatapack, type DatapackTypeDefinition } from '@vlocode/vlocity';
import RefreshDatapackCommand from '../commands/datapacks/refreshDatapackCommand';
import { DatapackResultCollection, type ObjectEntry } from '../lib/vlocity/vlocityDatapackService';

function createDatapack(datapackType = 'OmniScript', name = 'Example') {
    return new VlocityDatapack(datapackType, {
        VlocityDataPackType: 'SObject',
        VlocityRecordSObjectType: 'OmniProcess',
        VlocityRecordSourceKey: `OmniProcess/${name}/Test/English`,
        Name: name,
        Type: name,
        SubType: 'Test',
        Language: 'English'
    }, { key: `${datapackType}/${name}`, projectFolder: '/project/datapacks' });
}

class TestRefreshDatapackCommand extends RefreshDatapackCommand {
    protected override readonly vlocode = {
        withStatusBarProgress: async (_title: string, run: () => Promise<unknown>) => run(),
        withActivity: async (_title: string, run: (...args: any[]) => Promise<unknown>) => run({}, {})
    } as any;

    public readonly lookup = jest.fn();
    public readonly exportRecords = jest.fn(async (entries: ObjectEntry[]) => new DatapackResultCollection(
        entries.map(entry => ({ key: entry.id!, label: entry.id!, success: true }))));

    public constructor(private readonly datapacks: VlocityDatapack[]) {
        super();
    }

    protected override get datapackService(): any {
        return { getDatapackRecords: this.lookup };
    }

    protected override async showDependencySelection() {
        return 0;
    }

    protected override async loadDatapacks() {
        return this.datapacks;
    }

    protected override async resolveDatapackDefinitions() {
        return new Map(this.datapacks.map(datapack => [datapack, {
            datapackType: datapack.datapackType,
            typeLabel: datapack.datapackType,
            source: { sobjectType: datapack.sobjectType, fieldList: ['Id'] },
            exportMode: 'direct',
            scope: 'omnistudio-standard'
        } satisfies DatapackTypeDefinition]));
    }

    protected override async exportDatapacks(entries: ObjectEntry[]) {
        return this.exportRecords(entries);
    }

    public refresh() {
        return this.refreshDatapacks([vscode.Uri.file('/project/datapacks')]);
    }
}

describe('RefreshDatapackCommand', () => {
    beforeEach(() => jest.clearAllMocks());

    it.each(['OmniScript', 'IntegrationProcedure'])('exports a resolved %s with no dependencies', async datapackType => {
        const datapack = createDatapack(datapackType);
        const command = new TestRefreshDatapackCommand([datapack]);
        command.lookup.mockResolvedValue([[{ Id: '0jN000000000001AAA' }]]);

        await command.refresh();

        expect(command.lookup).toHaveBeenCalledWith([expect.objectContaining({ datapack })]);
        expect(command.exportRecords).toHaveBeenCalledWith([expect.objectContaining({
            id: '0jN000000000001AAA', datapackType, exportMode: 'direct', exportDefinitionScope: 'omnistudio-standard'
        })]);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Successfully exported 0jN000000000001AAA');
    });

    it('fails with the datapack name when no record matches', async () => {
        const command = new TestRefreshDatapackCommand([createDatapack()]);
        command.lookup.mockResolvedValue([[]]);

        await expect(command.refresh()).rejects.toEqual(expect.objectContaining({
            message: expect.stringContaining('No matching Salesforce record found for OmniScript/Example')
        }));
        expect(command.exportRecords).not.toHaveBeenCalled();
        expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
    });

    it('reports unresolved datapacks even when another datapack exports successfully', async () => {
        const command = new TestRefreshDatapackCommand([createDatapack(), createDatapack('IntegrationProcedure', 'Missing')]);
        command.lookup.mockResolvedValue([[{ Id: '0jN000000000001AAA' }], []]);

        await expect(command.refresh()).rejects.toEqual(expect.objectContaining({
            message: expect.stringContaining('No matching Salesforce record found for IntegrationProcedure/Missing')
        }));
        expect(command.exportRecords).toHaveBeenCalledWith([expect.objectContaining({ id: '0jN000000000001AAA' })]);
        expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
    });

    it('rejects an empty export result', async () => {
        const command = new TestRefreshDatapackCommand([createDatapack()]);
        command.lookup.mockResolvedValue([[{ Id: '0jN000000000001AAA' }]]);
        command.exportRecords.mockResolvedValue(new DatapackResultCollection());

        await expect(command.refresh()).rejects.toThrow('No datapacks were exported');
        expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
    });

    it('reports when the selection contains no datapacks', async () => {
        const command = new TestRefreshDatapackCommand([]);

        await expect(command.refresh()).rejects.toThrow('No datapacks found in the selected files');
        expect(command.lookup).not.toHaveBeenCalled();
    });
});
