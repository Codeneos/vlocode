import 'jest';
import { join } from 'path';
import { tmpdir } from 'os';
import * as fs from 'fs-extra';

import { DatapackExportFileLoader } from './datapackExportFileLoader';

describe('DatapackExportFileLoader', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(join(tmpdir(), 'vlocode-export-'));
    });

    afterEach(async () => {
        await fs.remove(tempDir);
    });

    async function loadYaml(contents: string) {
        const file = join(tempDir, 'export.yaml');
        await fs.outputFile(file, contents);
        return new DatapackExportFileLoader().load(file);
    }

    it('loads suppressNulls from YAML export files', async () => {
        const result = await loadYaml('suppressNulls: true\nexport:\n  Account: SELECT Id FROM Account');

        expect(result.suppressNulls).toBe(true);
        expect(result.export).toStrictEqual({
            Account: ['SELECT Id FROM Account']
        });
    });

    it('rejects non-boolean suppressNulls values', async () => {
        await expect(loadYaml('suppressNulls: enabled\nexport:\n  Account: SELECT Id FROM Account'))
            .rejects
            .toThrow('Invalid export file; "suppressNulls" must be a boolean');
    });
});
