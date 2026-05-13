import 'jest';

import * as fs from 'fs';
import * as path from 'path';

interface CustomEditorContribution {
    viewType?: string;
    selector?: Array<{ filenamePattern: string }>;
    priority?: string;
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

describe('DataMapper editor contribution', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8')) as PackageJson;

    it('registers OmniDataTransform datapack files with the custom editor', () => {
        const dataMapperEditor = packageJson.contributes.customEditors.find(
            editor => editor.viewType === 'vlocode.datamapperEditor'
        );

        expect(dataMapperEditor?.selector).toEqual(expect.arrayContaining([
            { filenamePattern: '**/OmniDataTransform/**/*_DataPack.json' },
            { filenamePattern: '**/OmniDataTransform/**/*_Items.json' }
        ]));
    });

    it('gives the DataMapper editor precedence over the generic datapack editor', () => {
        const dataMapperEditorIndex = packageJson.contributes.customEditors.findIndex(
            editor => editor.viewType === 'vlocode.datamapperEditor'
        );
        const datapackEditorIndex = packageJson.contributes.customEditors.findIndex(
            editor => editor.viewType === 'vlocode.datapackEditor'
        );
        const dataMapperEditor = packageJson.contributes.customEditors[dataMapperEditorIndex];

        expect(dataMapperEditor?.priority).toBe('default');
        expect(dataMapperEditorIndex).toBeGreaterThanOrEqual(0);
        expect(datapackEditorIndex).toBeGreaterThan(dataMapperEditorIndex);
    });

    it('shows the open editor command for OmniDataTransform datapack files', () => {
        const openEditorMenus = Object.values(packageJson.contributes.menus)
            .flat()
            .filter(menu => menu.command === 'vlocode.datamapper.openEditor');

        expect(openEditorMenus).toEqual(expect.arrayContaining([
            expect.objectContaining({
                when: expect.stringContaining('resourceScheme == file')
            }),
            expect.objectContaining({
                when: expect.stringContaining('(DataRaptor|OmniDataTransform)')
            })
        ]));
    });
});
