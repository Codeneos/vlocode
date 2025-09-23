import 'jest';
import { SalesforcePackageBuilder, SalesforcePackageType } from '../deploy/packageBuilder';
import { MemoryFileSystem, Logger, container } from '@vlocode/core';
import { TypeScriptCompilerPlugin } from '../deploy/plugins/typescriptCompilerPlugin';

/**
 * Simple test verifying that a .ts file added to the package is transpiled to .js and the packagePath updated.
 */
describe('TypeScriptCompilerPlugin', () => {
    beforeAll(() => container.add(Logger.null));

    it('transpiles .ts file to .js and updates packagePath', async () => {
        const fs = new MemoryFileSystem({
            'src/lwc/sample/sample.ts-meta.xml': '<?xml version="1.0" encoding="UTF-8"?><LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata"><apiVersion>58.0</apiVersion></LightningComponentBundle>',
            'src/lwc/sample/sample.ts': 'export const answer: number = 42;'
        });

    const builder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, '58.0');
    // Inject memory FS into container (override FileSystem binding) if not already
    container.add(fs);
        builder.addPlugin(new TypeScriptCompilerPlugin());
        await builder.addFiles(['src/lwc/sample/sample.ts']);

        const pkg = await builder.build();
        const jsEntry = pkg.getPackageData('lwc/sample/sample.js');
        expect(jsEntry).toBeTruthy();
        expect(jsEntry!.data?.toString()).toContain('export const answer');
    });
});
