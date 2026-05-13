import 'jest';

import * as fs from 'fs';
import * as path from 'path';

interface CustomEditorContribution {
    priority?: string;
    viewType?: string;
    selector?: Array<{ filenamePattern: string }>;
}

interface MenuContribution {
    command: string;
    when?: string;
}

interface PackageJson {
    contributes: {
        customEditors: CustomEditorContribution[];
        menus: Record<string, MenuContribution[]>;
    };
}

describe('Datapack editor contribution', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8')) as PackageJson;

    it('registers standard datapack headers with the custom editor', () => {
        const editor = packageJson.contributes.customEditors.find(
            editor => editor.viewType === 'vlocode.datapackEditor'
        );

        expect(editor?.selector).toEqual(expect.arrayContaining([
            { filenamePattern: '**/*_DataPack.json' }
        ]));
        expect(editor?.priority).toBe('default');
    });

    it('shows the open editor and source commands for datapack editor contexts', () => {
        const menuEntries = Object.values(packageJson.contributes.menus).flat();

        expect(menuEntries).toEqual(expect.arrayContaining([
            expect.objectContaining({
                command: 'vlocode.datapackEditor.openEditor',
                when: expect.stringContaining('resourceScheme == file')
            }),
            expect.objectContaining({
                command: 'vlocode.datapackEditor.viewSource',
                when: expect.stringContaining('vlocode.datapackEditor')
            })
        ]));
    });
});
