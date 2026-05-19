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

describe('Integration Procedure editor contribution', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8')) as PackageJson;

    it('registers Integration Procedure datapack and metadata XML files with the custom editor', () => {
        const editor = packageJson.contributes.customEditors.find(
            editor => editor.viewType === 'vlocode.integrationProcedureEditor'
        );

        expect(editor?.selector).toEqual(expect.arrayContaining([
            { filenamePattern: '**/IntegrationProcedure/**/*_DataPack.json' },
            { filenamePattern: '**/IntegrationProcedure/**/*_Element*.json' },
            { filenamePattern: '**/omniIntegrationProcedures/*-meta.xml' }
        ]));
        expect(editor?.priority).toBe('default');
    });

    it('gives the Integration Procedure editor precedence over the generic datapack editor', () => {
        const integrationProcedureEditorIndex = packageJson.contributes.customEditors.findIndex(
            editor => editor.viewType === 'vlocode.integrationProcedureEditor'
        );
        const datapackEditorIndex = packageJson.contributes.customEditors.findIndex(
            editor => editor.viewType === 'vlocode.datapackEditor'
        );

        expect(integrationProcedureEditorIndex).toBeGreaterThanOrEqual(0);
        expect(datapackEditorIndex).toBeGreaterThan(integrationProcedureEditorIndex);
    });

    it('shows editor and source commands for Integration Procedure contexts', () => {
        const menuEntries = Object.values(packageJson.contributes.menus).flat();

        expect(menuEntries).toEqual(expect.arrayContaining([
            expect.objectContaining({
                command: 'vlocode.integrationProcedure.openEditor',
                when: expect.stringContaining('IntegrationProcedure')
            }),
            expect.objectContaining({
                command: 'vlocode.integrationProcedure.openEditor',
                when: expect.stringContaining('omniIntegrationProcedures')
            }),
            expect.objectContaining({
                command: 'vlocode.integrationProcedure.viewSource',
                when: expect.stringContaining('vlocode.integrationProcedureEditor')
            })
        ]));
    });
});
