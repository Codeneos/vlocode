import 'jest';

import * as fs from 'fs-extra';
import * as os from 'node:os';
import * as path from 'node:path';

import { Logger } from '@vlocode/core';
import { VlocityDatapack } from '@vlocode/vlocity';
import { DatapackExpander, DatapackExportDefinitionStore } from '@vlocode/vlocity-deploy';
import VlocityDatapackService from '../vlocityDatapackService';

describe('VlocityDatapackService', () => {
    function createService() {
        const definitions = new DatapackExportDefinitionStore();
        definitions.add({ objectType: 'OmniDataTransform', scope: 'OmniDataTransform' }, {
            objectType: 'OmniDataTransform',
            name: [ 'Name' ],
            fields: {
                ExpectedInputJson: {
                    fileName: [ '_InputJson' ]
                }
            }
        });

        const expander = new DatapackExpander(definitions, Logger.null);
        return new VlocityDatapackService(
            Logger.null,
            {} as any,
            {} as any,
            {} as any,
            {} as any,
            {} as any,
            {} as any,
            expander
        );
    }

    it('expands standard OmniDataTransform datapacks without Vlocity build tools', async () => {
        const service = createService();
        const targetPath = await fs.mkdtemp(path.join(os.tmpdir(), 'vlocode-direct-expand-'));
        const datapack = new VlocityDatapack('DataRaptor', {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransform',
            VlocityRecordSourceKey: 'OmniDataTransform/ExampleMapper',
            Name: 'ExampleMapper',
            ExpectedInputJson: {
                accountId: '001000000000000'
            }
        });

        try {
            const headerFile = await service.expandDatapack(datapack, targetPath);

            expect(path.normalize(headerFile)).toBe(path.join(targetPath, 'OmniDataTransform', 'ExampleMapper', 'ExampleMapper_DataPack.json'));
            expect(await fs.pathExists(headerFile)).toBe(true);
            expect(await fs.pathExists(path.join(targetPath, 'OmniDataTransform', 'ExampleMapper', 'ExampleMapper_InputJson.json'))).toBe(true);
        } finally {
            await fs.remove(targetPath);
        }
    });
});
