import { XML } from '@vlocode/util';
import { MetadataRegistry } from '../metadataRegistry';
import { MetadataExpander } from '../deploy/metadataExpander';

interface MockMetadataFile {
    componentType: string;
    componentName: string;
    packagePath: string;
    content(): Promise<Buffer>;
    metadata(): Promise<object | undefined>;
}

function buildXml(rootName: string, data?: any) {
    return XML.stringify({
        [rootName]: {
            $: { xmlns: MetadataRegistry.xmlNamespace },
            ...(data || {})
        }
    });
}

describe('MetadataExpander', () => {
    const expander = new MetadataExpander();

    describe('#expandMetadata - decomposed children', () => {
        it('CustomObject with fields should expand to child files and parent meta when parent not empty', async () => {
            const componentName = 'Account';
            const xml = buildXml('CustomObject', {
                label: 'Account',
                fields: [
                    {
                        fullName: 'TestField__c',
                        label: 'Test Field',
                        type: 'Text',
                        length: 255
                    }
                ]
            });

            const metadata: MockMetadataFile = {
                componentType: 'CustomObject',
                componentName,
                packagePath: `objects/${componentName}.object`,
                content: async () => Buffer.from(xml),
                metadata: async () => undefined
            };

            const result = await expander.expandMetadata(metadata);
            const files = Object.keys(result).sort();

            expect(files).toContain(`${componentName}/fields/TestField__c.field-meta.xml`);
            expect(files).toContain(`${componentName}/${componentName}.object-meta.xml`);

            // Validate child XML root and content
            const childXml = result[`${componentName}/fields/TestField__c.field-meta.xml`].toString('utf8');
            expect(XML.getRootTagName(childXml)).toBe('CustomField');
            const childParsed = XML.parse(childXml);
            expect(childParsed.CustomField.fullName).toBe('TestField__c');

            // Validate parent XML root
            const parentXml = result[`${componentName}/${componentName}.object-meta.xml`].toString('utf8');
            expect(XML.getRootTagName(parentXml)).toBe('CustomObject');
            const parentParsed = XML.parse(parentXml);
            expect(parentParsed.CustomObject.label).toBe('Account');
        });
    });

    describe('#expandMetadata - StaticResource', () => {
        it('should use mime extension and write content + -meta.xml', async () => {
            const componentName = 'MyLogo';
            const metaObj = { contentType: 'image/png', cacheControl: 'Public' };
            const metadata: MockMetadataFile = {
                componentType: 'StaticResource',
                componentName,
                packagePath: `staticresources/${componentName}.resource`,
                content: async () => Buffer.from('PNG_DATA'),
                metadata: async () => metaObj
            };

            const result = await expander.expandMetadata(metadata);
            const files = Object.keys(result).sort();

            expect(files).toContain(`${componentName}.png`);
            expect(files).toContain(`${componentName}.png-meta.xml`);
            expect(result[`${componentName}.png`].toString()).toBe('PNG_DATA');

            const metaXml = result[`${componentName}.png-meta.xml`].toString('utf8');
            expect(XML.getRootTagName(metaXml)).toBe('StaticResource');
            const parsed = XML.parse(metaXml);
            expect(parsed.StaticResource.contentType).toBe('image/png');
        });

        it('should return empty when metadata() is undefined', async () => {
            const componentName = 'NoMeta';
            const metadata: MockMetadataFile = {
                componentType: 'StaticResource',
                componentName,
                packagePath: `staticresources/${componentName}.resource`,
                content: async () => Buffer.from('DATA'),
                metadata: async () => undefined
            };

            const result = await expander.expandMetadata(metadata);
            expect(Object.keys(result)).toHaveLength(0);
        });
    });

    describe('#expandMetadata - CustomLabels', () => {
        it('should expand each <labels> entry into its own child file and not include parent when empty', async () => {
            const componentName = 'CustomLabels';
            const xml = buildXml('CustomLabels', {
                labels: [
                    {
                        fullName: 'Welcome',
                        language: 'en_US',
                        value: 'Hello',
                        protected: false
                    },
                    {
                        fullName: 'Farewell',
                        language: 'en_US',
                        value: 'Goodbye',
                        protected: false
                    }
                ]
            });

            const metadata: MockMetadataFile = {
                componentType: 'CustomLabels',
                componentName,
                packagePath: `labels/${componentName}.labels`,
                content: async () => Buffer.from(xml),
                metadata: async () => undefined
            };

            const result = await expander.expandMetadata(metadata);
            const files = Object.keys(result).sort();

            // Expect child files for each label
            expect(files).toContain(`${componentName}/labels/Welcome.labels-meta.xml`);
            expect(files).toContain(`${componentName}/labels/Farewell.labels-meta.xml`);

            // Parent should not be included because after removing <labels> the parent is empty
            expect(files.some(f => f.endsWith(`${componentName}.labels-meta.xml`))).toBe(false);

            // Validate child XML
            const childXml = result[`${componentName}/labels/Welcome.labels-meta.xml`].toString('utf8');
            expect(XML.getRootTagName(childXml)).toBe('CustomLabel');
            const parsed = XML.parse(childXml);
            expect(parsed.CustomLabel.fullName).toBe('Welcome');
            expect(parsed.CustomLabel.value).toBe('Hello');
        });
    });

    describe('#expandMetadata - CustomObjectTranslation', () => {
        it('should expand field translations into child files and omit parent when empty', async () => {
            const componentName = 'Account-en_US';
            const xml = buildXml('CustomObjectTranslation', {
                fields: [
                    {
                        name: 'Field__c',
                        label: 'Field Translated Label'
                    }
                ]
            });

            const metadata: MockMetadataFile = {
                componentType: 'CustomObjectTranslation',
                componentName,
                packagePath: `objectTranslations/${componentName}.objectTranslation`,
                content: async () => Buffer.from(xml),
                metadata: async () => undefined
            };

            const result = await expander.expandMetadata(metadata);
            const files = Object.keys(result).sort();

            expect(files).toContain(`${componentName}/fields/Field__c.fieldTranslation-meta.xml`);
            expect(files.some(f => f.endsWith(`${componentName}.objectTranslation-meta.xml`))).toBe(false);

            const childXml = result[`${componentName}/fields/Field__c.fieldTranslation-meta.xml`].toString('utf8');
            expect(XML.getRootTagName(childXml)).toBe('CustomFieldTranslation');
            const parsed = XML.parse(childXml);
            expect(parsed.CustomFieldTranslation.name).toBe('Field__c');
            expect(parsed.CustomFieldTranslation.label).toBe('Field Translated Label');
        });
    });

    describe('#expandMetadata - generic content', () => {
        it('should append -meta.xml when body looks like XML and file is not .xml', async () => {
            const metadata: MockMetadataFile = {
                componentType: 'UnknownType',
                componentName: 'Cmp',
                packagePath: 'src/Cmp.cmp',
                content: async () => Buffer.from('<?xml version="1.0"?><aura:component />'),
                metadata: async () => undefined
            };

            const result = await expander.expandMetadata(metadata);
            expect(Object.keys(result)).toEqual(['Cmp.cmp-meta.xml']);
        });

        it('should keep original name when body is not XML', async () => {
            const metadata: MockMetadataFile = {
                componentType: 'UnknownType',
                componentName: 'File',
                packagePath: 'src/file.txt',
                content: async () => Buffer.from('hello'),
                metadata: async () => undefined
            };

            const result = await expander.expandMetadata(metadata);
            expect(Object.keys(result)).toEqual(['file.txt']);
        });

        it('should keep original .xml filename (no -meta.xml) when extension is .xml', async () => {
            const metadata: MockMetadataFile = {
                componentType: 'UnknownType',
                componentName: 'Meta',
                packagePath: 'src/meta.xml',
                content: async () => Buffer.from('<?xml version="1.0"?><root/>'),
                metadata: async () => undefined
            };

            const result = await expander.expandMetadata(metadata);
            expect(Object.keys(result)).toEqual(['meta.xml']);
        });
    });

    describe('#saveExpandedMetadata', () => {
        it('should write files to provided destination using outputFile callback', async () => {
            const componentName = 'Account';
            const xml = buildXml('CustomObject', {
                label: 'Account',
                fields: [ { fullName: 'Field__c' } ]
            });
            const metadata: MockMetadataFile = {
                componentType: 'CustomObject',
                componentName,
                packagePath: `objects/${componentName}.object`,
                content: async () => Buffer.from(xml),
                metadata: async () => undefined
            };

            const writes: Array<{ path: string; data: Buffer }> = [];
            const outputFile = async (name: string, data: Buffer) => {
                writes.push({ path: name, data });
            };

            await expander.saveExpandedMetadata(metadata, 'c:/tmp/out', { outputFile });

            // Verify at least two writes (child + parent)
            expect(writes.length).toBeGreaterThanOrEqual(2);
            const paths = writes.map(w => w.path.replace(/\\/g, '/')).sort();
            expect(paths).toContain('c:/tmp/out/Account/fields/Field__c.field-meta.xml');
            expect(paths).toContain('c:/tmp/out/Account/Account.object-meta.xml');
        });
    });
});
