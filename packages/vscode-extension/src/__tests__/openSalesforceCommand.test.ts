import 'jest';
import * as vscode from 'vscode';

import { VlocityDatapack, type DatapackTypeDefinition } from '@vlocode/vlocity';
import OpenSalesforceCommand from '../commands/datapacks/openSalesforceCommand';
import type { ObjectEntry } from '../lib/vlocity/vlocityDatapackService';

describe('OpenSalesforceCommand', () => {
    it('uses the resolved datapack definition when looking up a file in the org', async () => {
        const datapack = new VlocityDatapack('OmniScript', {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniProcess',
            VlocityRecordSourceKey: 'OmniScript/example',
            Type: 'Example',
            SubType: 'Test',
            Language: 'English'
        });
        const definition: DatapackTypeDefinition = {
            datapackType: 'OmniScript',
            typeLabel: 'OmniScript',
            source: {
                sobjectType: 'OmniProcess',
                fieldList: [ 'Id', 'Type', 'SubType', 'Language' ]
            },
            exportMode: 'direct',
            scope: 'omnistudio-standard'
        };
        const command = new TestOpenSalesforceCommand(datapack, definition);

        await command.openFile(vscode.Uri.file('/project/OmniScript/example/example_DataPack.json'));

        expect(command.queriedEntry).toEqual(expect.objectContaining({
            datapackType: 'OmniScript',
            sobjectType: 'OmniProcess',
            exportDefinitionScope: 'omnistudio-standard',
            datapackDefinition: definition,
            Type: 'Example',
            SubType: 'Test',
            Language: 'English'
        }));
        expect(command.openedId).toBe('0jN000000000001');
    });
});

class TestOpenSalesforceCommand extends OpenSalesforceCommand {
    public queriedEntry?: ObjectEntry;
    public openedId?: string;

    public constructor(
        private readonly datapack: VlocityDatapack,
        private readonly definition: DatapackTypeDefinition
    ) {
        super();
    }

    protected override get datapackService(): any {
        return {
            getDatapackRecords: async (entry: ObjectEntry) => {
                this.queriedEntry = entry;
                return [{ Id: '0jN000000000001' }];
            }
        };
    }

    protected override async loadDatapacks(): Promise<VlocityDatapack[]> {
        return [ this.datapack ];
    }

    protected override async resolveDatapackDefinitions() {
        return new Map([[ this.datapack, this.definition ]]);
    }

    protected override async openIdInSalesforce(objectId: string | undefined): Promise<void> {
        this.openedId = objectId;
    }

    public openFile(file: vscode.Uri) {
        return this.openFileInSalesforce(file);
    }
}
