import 'jest';

import { SalesforcePackageBuilder, SalesforcePackageType } from '../deploy/packageBuilder';
import { Logger, MemoryFileSystem, container } from '@vlocode/core';
import { XML } from '@vlocode/util';

function buildXml(rootName: string, data?: any) {
    return XML.stringify({
        [rootName]: {
            $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
            ...(data || {})
        }
    });
}

function buildMetadataXml(rootName: string, data?: any) {
    return buildXml(rootName, {
        apiVersion: '51.0',
        ...(data || {})
    });
}

function normalizePath(p : string | string[]) {
    if (typeof p == 'string') {
        return p.replace(/[\\/]+/g, '/');
    }
    return p.map(normalizePath);
}

describe('SalesforcePackageBuilder', () => {
    const apiVersion = '51.0';

    const mockFs = new MemoryFileSystem({
        // Non deployable Files
        'src/randomFileInFolder1.xml': buildMetadataXml('RandomXmlFile1'),
        'src/randomJson.json': '{}',
        'src/lwc/eslint.json': '{}',
        'src/lwc/randomFileInFolder2.xml': buildMetadataXml('RandomXmlFile2'),
        // LWC
        'src/lwc/test/test.js-meta.xml': buildMetadataXml('LightningComponentBundle', { description: 'test', isExposed: false, masterLabel: 'Test' }),
        'src/lwc/test/test.html': '<template></template>',
        'src/lwc/test/test.js': 'import {LightningElement, api} from \'lwc\';',
        'src/lwc/test/support.js': 'import {LightningElement, api} from \'lwc\';',
        // LWC files that should be excluded from deployment
        'src/lwc/test/__tests__/test.spec.js': 'describe("test", () => { it("works", () => {}); });',
        'src/lwc/test/__tests__/testHelper.js': 'export const mockData = {};',
        'src/lwc/test/jsconfig.json': '{"compilerOptions": {}}',
        'src/lwc/test/tsconfig.json': '{"compilerOptions": {}}',
        // Aura
        'src/aura/test/test.cmp-meta.xml': buildMetadataXml('AuraDefinitionBundle', { description: 'test' }),
        'src/aura/test/test.cmp': '<aura:component></aura:component>',
        'src/aura/test/testController.js': '({ onInit : function(component, event, helper) { } })',
        // APEX
        'src/classes/myClass.cls': 'global class MyClass { }',
        'src/classes/myClass.cls-meta.xml': buildMetadataXml('ApexClass'),
        // Trigger
        'src/triggers/myTrigger.trigger': 'trigger MyTrigger on Account (before insert, before update, after insert, after update) { }',
        'src/triggers/myTrigger.trigger-meta.xml': buildMetadataXml('ApexTrigger'),
        // decomposed object
        'src/objects/PetersCustomObject__c/fields/PetersField__c.field-meta.xml': buildXml('CustomField', { fullName: 'PetersField__c' }),
        'src/objects/PetersCustomObject__c/listViews/What_A_View.listview-meta.xml': buildXml('ListView', { fullName: 'What_A_View' }),
        'src/objects/PetersCustomObject__c/PetersCustomObject__c.object-meta.xml': buildXml('CustomObject', { fullName: 'PetersCustomObject__c' }),
        // Destructive changes
        'src/destructiveChangesPost.xml': buildXml('Package', { types: [ { name: 'ApexClass', members: [ 'a', 'b' ] } ] }),
        'src/destructiveChangesPost2.xml': buildXml('Package', { types: [ { name: 'ApexClass', members: [ 'x', 'y' ] } ] }),
        'src/destructiveChangesPre.xml': buildXml('Package', { types: [ { name: 'ApexClass', members: [ 'c', 'd' ] } ] }),
        'src/destructiveChanges.xml': buildXml('Package', { types: [ { name: 'ApexClass', members: [ 'g', 'h' ] } ] }),
        'src/destructiveChangesSingle.xml': buildXml('Package', { types: [ { name: 'ApexClass', members: 'a' } ] }),
        // Dashboards
        'src/dashboards/MyFolder.dashboardFolder-meta.xml': buildXml('DashboardFolder', { name: 'MyFolder', accessType: 'Public', publicFolderAccess: 'ReadWrite' }),
        'src/dashboards/MyFolder/Board.dashboard-meta.xml': buildXml('Dashboard', { name: 'Board' }),
        // DigitalExperienceBundle
        'src/digitalExperiences/site/OrderSign1/OrderSign1.digitalExperience-meta.xml': buildXml('DigitalExperienceBundle', { label: 'OrderSign1', type: 'LWR' }),
        'src/digitalExperiences/site/OrderSign1/sfdc_cms__view/newsDetail/_meta.json': JSON.stringify({ type: 'sfdc_cms__view', title: 'News Detail' }),
        'src/digitalExperiences/site/OrderSign1/sfdc_cms__view/newsDetail/content.json': JSON.stringify({ label: 'News Detail' }),
        'src/digitalExperiences/site/OrderSign1/sfdc_cms__view/register/_meta.json': JSON.stringify({ type: 'sfdc_cms__view', title: 'Register' }),
        'src/digitalExperiences/site/OrderSign1/sfdc_cms__view/register/content.json': JSON.stringify({ label: 'Register' }),
        'src/digitalExperiences/site/OrderSign1/sfdc_cms__view/register/fr.json': JSON.stringify({ label: "S'inscrire" }),
    });

    beforeAll(() => {
        container.add(Logger.null);
        container.add(mockFs);
    });

    describe('#addFiles', () => {
        describe('#lwcComponent', () => {
            it('should place bundle files at the correct package paths in the archive', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/lwc/test/test.js-meta.xml' ]);

                const sfPackage = await (await packageBuilder.build()).generateArchive();
                const packageFiles = Object.keys(sfPackage.files).filter(f => !f.endsWith('/'));

                expect(packageFiles).toEqual(expect.arrayContaining([
                    'package.xml',
                    'lwc/test/test.js-meta.xml',
                    'lwc/test/test.html',
                    'lwc/test/test.js',
                    'lwc/test/support.js',
                ]));
                // Component name in manifest should still be just the bundle folder name
                const manifest = packageBuilder.getManifest().toJson(apiVersion);
                expect(manifest.types[0].members[0]).toEqual('test');
            });
            it('should add all related parts when adding the meta file', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/lwc/test/test.js-meta.xml']);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).toEqual(4);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'src/lwc/test/test.html',
                    'src/lwc/test/test.js-meta.xml',
                    'src/lwc/test/test.js',
                    'src/lwc/test/support.js'
                ]));
                expect(manifest.types.length).toEqual(1);
                expect(manifest.types[0].name).toEqual('LightningComponentBundle');
                expect(manifest.types[0].members.length).toEqual(1);
                expect(manifest.types[0].members[0]).toEqual('test');
            });
            it('should add all related parts when adding the HTML file', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/lwc/test/test.html']);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).toEqual(4);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'src/lwc/test/test.html',
                    'src/lwc/test/test.js-meta.xml',
                    'src/lwc/test/test.js',
                    'src/lwc/test/support.js'
                ]));
                expect(manifest.types.length).toEqual(1);
                expect(manifest.types[0].name).toEqual('LightningComponentBundle');
                expect(manifest.types[0].members.length).toEqual(1);
                expect(manifest.types[0].members[0]).toEqual('test');
            });
            it('should add all related parts when adding a the JS file', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/lwc/test/test.js']);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).toEqual(4);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'src/lwc/test/test.html',
                    'src/lwc/test/test.js-meta.xml',
                    'src/lwc/test/test.js',
                    'src/lwc/test/support.js'
                ]));
                expect(manifest.types.length).toEqual(1);
                expect(manifest.types[0].name).toEqual('LightningComponentBundle');
                expect(manifest.types[0].members.length).toEqual(1);
                expect(manifest.types[0].members[0]).toEqual('test');
            });
            it('should add all related parts when adding a component folder ', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/lwc/test' ]);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).toEqual(4);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'src/lwc/test/test.html',
                    'src/lwc/test/test.js-meta.xml',
                    'src/lwc/test/test.js',
                    'src/lwc/test/support.js'
                ]));
                expect(manifest.types.length).toEqual(1);
                expect(manifest.types[0].name).toEqual('LightningComponentBundle');
                expect(manifest.types[0].members.length).toEqual(1);
                expect(manifest.types[0].members[0]).toEqual('test');
            });
            it('should exclude __tests__ files from the deployable package', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/lwc/test/test.js-meta.xml' ]);

                const filesAdded = normalizePath([ ...(await packageBuilder.build()).files() ]);

                expect(filesAdded).not.toContain('src/lwc/test/__tests__/test.spec.js');
                expect(filesAdded).not.toContain('src/lwc/test/__tests__/testHelper.js');
                expect(filesAdded.length).toEqual(4);
            });
            it('should exclude jsconfig.json and tsconfig.json from the deployable package', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/lwc/test/test.js-meta.xml' ]);

                const filesAdded = normalizePath([ ...(await packageBuilder.build()).files() ]);

                expect(filesAdded).not.toContain('src/lwc/test/jsconfig.json');
                expect(filesAdded).not.toContain('src/lwc/test/tsconfig.json');
                expect(filesAdded.length).toEqual(4);
            });
            it('should exclude test files when adding the LWC folder directly', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/lwc/test' ]);

                const filesAdded = normalizePath([ ...(await packageBuilder.build()).files() ]);

                expect(filesAdded.length).toEqual(4);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'src/lwc/test/test.html',
                    'src/lwc/test/test.js-meta.xml',
                    'src/lwc/test/test.js',
                    'src/lwc/test/support.js',
                ]));
                expect(filesAdded).not.toContain('src/lwc/test/__tests__/test.spec.js');
                expect(filesAdded).not.toContain('src/lwc/test/jsconfig.json');
            });
            it('should not add the same file multiple times when adding all bundled files', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([
                    'src/lwc',
                    'src/lwc/test/test.html',
                    'src/lwc/test/test.js-meta.xml',
                    'src/lwc/test/test.js',
                    'src/lwc/test/support.js'
                ]);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).toEqual(4);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'src/lwc/test/test.html',
                    'src/lwc/test/test.js-meta.xml',
                    'src/lwc/test/test.js',
                    'src/lwc/test/support.js'
                ]));
                expect(manifest.types.length).toEqual(1);
                expect(manifest.types[0].name).toEqual('LightningComponentBundle');
                expect(manifest.types[0].members.length).toEqual(1);
                expect(manifest.types[0].members[0]).toEqual('test');
            });
        });
        describe('#auraComponent', () => {
            it('cmp file should add all related parts', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/aura/test/test.cmp']);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).toEqual(3);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'src/aura/test/test.cmp',
                    'src/aura/test/test.cmp-meta.xml',
                    'src/aura/test/testController.js'
                ]));
                expect(manifest.types.length).toEqual(1);
                expect(manifest.types[0].name).toEqual('AuraDefinitionBundle');
                expect(manifest.types[0].members.length).toEqual(1);
                expect(manifest.types[0].members[0]).toEqual('test');
            });
            it('JS file should add all related parts', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/aura/test/testController.js']);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).toEqual(3);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'src/aura/test/test.cmp',
                    'src/aura/test/test.cmp-meta.xml',
                    'src/aura/test/testController.js'
                ]));
                expect(manifest.types.length).toEqual(1);
                expect(manifest.types[0].name).toEqual('AuraDefinitionBundle');
                expect(manifest.types[0].members.length).toEqual(1);
                expect(manifest.types[0].members[0]).toEqual('test');
            });
            it('component folder should add all related parts', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/aura/test' ]);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).toEqual(3);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'src/aura/test/test.cmp',
                    'src/aura/test/test.cmp-meta.xml',
                    'src/aura/test/testController.js'
                ]));
                expect(manifest.types.length).toEqual(1);
                expect(manifest.types[0].name).toEqual('AuraDefinitionBundle');
                expect(manifest.types[0].members.length).toEqual(1);
                expect(manifest.types[0].members[0]).toEqual('test');
            });
        });
        describe('#apexClass', () => {
            it('should add all class file when only meta selected', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/classes/myClass.cls']);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).toEqual(2);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'src/classes/myClass.cls',
                    'src/classes/myClass.cls-meta.xml'
                ]));
                expect(manifest.types.length).toEqual(1);
                expect(manifest.types[0].name).toEqual('ApexClass');
                expect(manifest.types[0].members.length).toEqual(1);
                expect(manifest.types[0].members[0]).toEqual('myClass');
            });
        });
        describe('#customObject', () => {
            it('should add all fragments of an object as separate entries in manifest', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/objects/PetersCustomObject__c']);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(manifest.types).toStrictEqual([
                    { name:'CustomObject', members: [ 'PetersCustomObject__c' ] },
                    { name:'CustomField', members: [ 'PetersCustomObject__c.PetersField__c' ] },
                    { name:'ListView', members: [ 'PetersCustomObject__c.What_A_View' ] }
                ]);
            });
            it('should merge source from fragments into parent', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/objects/PetersCustomObject__c']);

                const sfPackage = await packageBuilder.getPackage().generateArchive();
                const packageFiles = Object.keys(sfPackage.files);
                const metadata = await sfPackage.file('objects/PetersCustomObject__c.object')?.async('string');
                const parsedMetadata = metadata && XML.parse(metadata, { ignoreAttributes: true, ignoreNamespacePrefix: true });

                expect(packageFiles).toStrictEqual([
                    'package.xml',
                    'objects/',
                    'objects/PetersCustomObject__c.object'
                ]);

                expect(parsedMetadata).toStrictEqual({
                    CustomObject: {
                        fullName: 'PetersCustomObject__c',
                        fields: {
                            fullName: 'PetersField__c',
                        },
                        listViews: {
                            fullName: 'What_A_View',
                        }
                    }
                });
            });
            it('should add parent tag without content when deploying fragment', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/objects/PetersCustomObject__c/fields']);

                const manifest = packageBuilder.getManifest().toJson(apiVersion);
                const sfPackage = await packageBuilder.getPackage().generateArchive();
                const packageFiles = Object.keys(sfPackage.files);
                const metadata = await sfPackage.file('objects/PetersCustomObject__c.object')?.async('string');
                const parsedMetadata = metadata && XML.parse(metadata, { ignoreAttributes: true, ignoreNamespacePrefix: true });

                expect(manifest.types).toStrictEqual([
                    { name:'CustomField', members: [ 'PetersCustomObject__c.PetersField__c' ] }
                ]);

                expect(packageFiles).toStrictEqual([
                    'package.xml',
                    'objects/',
                    'objects/PetersCustomObject__c.object'
                ]);

                expect(parsedMetadata).toStrictEqual({
                    CustomObject: {
                        fields: {
                            fullName: 'PetersField__c',
                        }
                    }
                });
            });
        });
        describe('#settings', () => {
            it('should add all settings as Setting metadata type', async () => {
                const settingsFsMock = new MemoryFileSystem({
                    // Non deployable Files
                    'main/default/app/settings/Account.settings': buildXml('AccountSettings'),
                    'main/default/app/settings/Address.settings': buildXml('AddressSettings'),
                    'main/default/app/settings/BusinessHours.settings': buildXml('BusinessHoursSettings'),
                });
                const localContainer = container.create();
                localContainer.add(settingsFsMock);
                const packageBuilder = localContainer.new(SalesforcePackageBuilder, SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([
                    'main/default/app/settings/Account.settings',
                    'main/default/app/settings/Address.settings',
                    'main/default/app/settings/BusinessHours.settings'
                ]);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).toEqual(3);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'main/default/app/settings/Account.settings',
                    'main/default/app/settings/Address.settings',
                    'main/default/app/settings/BusinessHours.settings'
                ]));
                expect(manifest.types.length).toEqual(1);
                expect(manifest.types[0].name).toEqual('Settings');
                expect(manifest.types[0].members.length).toEqual(3);
                expect(manifest.types[0].members).toEqual([
                    'Account',
                    'Address',
                    'BusinessHours'
                ]);
            });
        });
        describe('#destructiveChanges', () => {
            it('should add destructive changes to deployment as-is', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/destructiveChangesPost.xml' ]);

                const filesAdded = normalizePath(Object.keys((await packageBuilder.getPackage().generateArchive()).files));
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).toEqual(2); // includes package.xml
                expect(filesAdded).toEqual(expect.arrayContaining([ 'destructiveChangesPost.xml' ]));
                expect(manifest.types.length).toEqual(0);
            });
            it('should merge multiple destructive changes into single package file', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([
                    'src/destructiveChangesPost.xml',
                    'src/destructiveChangesPost2.xml'
                ]);

                const filesAdded = normalizePath(Object.keys((await packageBuilder.getPackage().generateArchive()).files));
                const manifest = packageBuilder.getManifest().toJson(apiVersion);
                const destructedClasses = packageBuilder.getPackage().getDestructiveChanges();

                expect(destructedClasses).toEqual([
                    {
                        componentName: 'a',
                        componentType: 'ApexClass',
                        type: 'post'
                    },{
                        componentName: 'b',
                        componentType: 'ApexClass',
                        type: 'post'
                    },{
                        componentName: 'x',
                        componentType: 'ApexClass',
                        type: 'post'
                    },{
                        componentName: 'y',
                        componentType: 'ApexClass',
                        type: 'post'
                    }
                ]);
                expect(filesAdded.length).toEqual(2);
                expect(filesAdded).toEqual(expect.arrayContaining([ 'destructiveChangesPost.xml' ]));
                expect(manifest.types.length).toEqual(0);
            });
            it('should merge default destructive changes as pre', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([
                    'src/destructiveChanges.xml'
                ]);

                const filesAdded = normalizePath(Object.keys((await packageBuilder.getPackage().generateArchive()).files));
                const manifest = packageBuilder.getManifest().toJson(apiVersion);
                const destructedClasses = packageBuilder.getPackage().getDestructiveChanges();

                expect(filesAdded.length).toEqual(2);
                expect(destructedClasses).toEqual([
                    {
                        componentName: 'g',
                        componentType: 'ApexClass',
                        type: 'pre'
                    },{
                        componentName: 'h',
                        componentType: 'ApexClass',
                        type: 'pre'
                    }
                ]);
                expect(filesAdded).toEqual(expect.arrayContaining([ 'destructiveChangesPre.xml' ]));
                expect(manifest.types.length).toEqual(0);
            });
            it('should merge multiple destructive changes types in 2 separate files', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([
                    'src/destructiveChanges.xml',
                    'src/destructiveChangesPre.xml',
                    'src/destructiveChangesPost.xml'
                ]);

                const filesAdded = normalizePath(Object.keys((await packageBuilder.getPackage().generateArchive()).files));
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).toEqual(3);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'destructiveChangesPre.xml',
                    'destructiveChangesPost.xml'
                ]));
                expect(manifest.types.length).toEqual(0);
            });
            it('should correctly parse destructive changes with just one component', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([
                    'src/destructiveChangesSingle.xml'
                ]);

                const filesAdded = normalizePath(Object.keys((await packageBuilder.getPackage().generateArchive()).files));
                const manifest = packageBuilder.getManifest().toJson(apiVersion);
                const destructedClasses = packageBuilder.getPackage().getDestructiveChanges();
                expect(destructedClasses).toEqual([
                    {
                        componentName: 'a',
                        componentType: 'ApexClass',
                        type: 'pre'
                    }
                ]);
                expect(filesAdded.length).toEqual(2);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'destructiveChangesPre.xml'
                ]));
                expect(manifest.types.length).toEqual(0);
            });
        });
        describe('#mixed', () => {
            it('should add all deployable objects', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src' ]);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest();

                expect(filesAdded).toEqual(expect.arrayContaining([
                    'src/lwc/test/test.js-meta.xml',
                    'src/aura/test/test.cmp-meta.xml',
                    'src/classes/myClass.cls-meta.xml',
                    'src/triggers/myTrigger.trigger-meta.xml',
                ]));
                expect(manifest.list().length).toEqual(12);
                expect(manifest.list('AuraDefinitionBundle').length).toEqual(1);
                expect(manifest.list('LightningComponentBundle').length).toEqual(1);
                expect(manifest.list('ApexClass').length).toEqual(1);
                expect(manifest.list('ApexTrigger').length).toEqual(1);
                expect(manifest.list('CustomObject').length).toEqual(1);
                expect(manifest.list('CustomField').length).toEqual(1);
                expect(manifest.list('ListView').length).toEqual(1);
                expect(manifest.list('Dashboard').length).toEqual(2);
                expect(manifest.list('DigitalExperienceBundle').length).toEqual(1);
                expect(manifest.list('DigitalExperience').length).toEqual(2);
            });
        });
        describe('#dashboards', () => {
            it('should add dashboards folders with -meta.xml suffix', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/dashboards' ]);

                const manifest = packageBuilder.getManifest();
                const [ folder, dashBoard ] = [...packageBuilder.getPackage().sourceFiles()]
                    .sort((a,b) => a.packagePath.localeCompare(b.packagePath));

                expect(folder.packagePath).toEqual('dashboards/MyFolder-meta.xml');
                expect(dashBoard.packagePath).toEqual('dashboards/MyFolder/Board.dashboard');
                expect(manifest.list().length).toEqual(2);
                expect(manifest.list('Dashboard').length).toEqual(2);
            });
        });
        describe('#digitalExperienceBundle', () => {
            it('should add all bundle files when adding the meta file', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/digitalExperiences/site/OrderSign1/OrderSign1.digitalExperience-meta.xml' ]);

                const filesAdded = normalizePath([ ...(await packageBuilder.build()).files() ]);
                expect(filesAdded.length).toEqual(6);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'src/digitalExperiences/site/OrderSign1/OrderSign1.digitalExperience-meta.xml',
                    'src/digitalExperiences/site/OrderSign1/sfdc_cms__view/newsDetail/_meta.json',
                    'src/digitalExperiences/site/OrderSign1/sfdc_cms__view/newsDetail/content.json',
                    'src/digitalExperiences/site/OrderSign1/sfdc_cms__view/register/_meta.json',
                    'src/digitalExperiences/site/OrderSign1/sfdc_cms__view/register/content.json',
                    'src/digitalExperiences/site/OrderSign1/sfdc_cms__view/register/fr.json',
                ]));
            });
            it('should add all bundle files when adding the bundle folder', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/digitalExperiences/site/OrderSign1' ]);

                const filesAdded = normalizePath([ ...(await packageBuilder.build()).files() ]);
                expect(filesAdded.length).toEqual(6);
                expect(filesAdded).toEqual(expect.arrayContaining([
                    'src/digitalExperiences/site/OrderSign1/OrderSign1.digitalExperience-meta.xml',
                    'src/digitalExperiences/site/OrderSign1/sfdc_cms__view/newsDetail/_meta.json',
                    'src/digitalExperiences/site/OrderSign1/sfdc_cms__view/register/fr.json',
                ]));
            });
            it('should use site/BundleName as the DigitalExperienceBundle manifest member', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/digitalExperiences/site/OrderSign1/OrderSign1.digitalExperience-meta.xml' ]);

                const manifest = packageBuilder.getManifest().toJson(apiVersion);
                const bundleEntry = manifest.types.find(t => t.name === 'DigitalExperienceBundle');

                expect(bundleEntry).toBeDefined();
                expect(bundleEntry!.members).toEqual([ 'site/OrderSign1' ]);
            });
            it('should add a DigitalExperience manifest entry for each _meta.json in the bundle', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/digitalExperiences/site/OrderSign1/OrderSign1.digitalExperience-meta.xml' ]);

                const manifest = packageBuilder.getManifest().toJson(apiVersion);
                const deEntry = manifest.types.find(t => t.name === 'DigitalExperience');

                expect(deEntry).toBeDefined();
                expect(deEntry!.members.length).toEqual(2);
                expect(deEntry!.members).toEqual(expect.arrayContaining([
                    'site/OrderSign1.sfdc_cms__view/newsDetail',
                    'site/OrderSign1.sfdc_cms__view/register',
                ]));
            });
            it('should preserve the full bundle directory structure in archive package paths', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/digitalExperiences/site/OrderSign1/OrderSign1.digitalExperience-meta.xml' ]);

                const sfPackage = await (await packageBuilder.build()).generateArchive();
                const packageFiles = Object.keys(sfPackage.files).filter(f => !f.endsWith('/'));

                expect(packageFiles).toEqual(expect.arrayContaining([
                    'package.xml',
                    'digitalExperiences/site/OrderSign1/OrderSign1.digitalExperience-meta.xml',
                    'digitalExperiences/site/OrderSign1/sfdc_cms__view/newsDetail/_meta.json',
                    'digitalExperiences/site/OrderSign1/sfdc_cms__view/newsDetail/content.json',
                    'digitalExperiences/site/OrderSign1/sfdc_cms__view/register/_meta.json',
                    'digitalExperiences/site/OrderSign1/sfdc_cms__view/register/content.json',
                    'digitalExperiences/site/OrderSign1/sfdc_cms__view/register/fr.json',
                ]));
            });
            it('should not rename content files to the .digitalExperience suffix', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([ 'src/digitalExperiences/site/OrderSign1/OrderSign1.digitalExperience-meta.xml' ]);

                const sfPackage = await (await packageBuilder.build()).generateArchive();
                const packageFiles = Object.keys(sfPackage.files);

                // No file should be renamed to the bundle suffix
                expect(packageFiles.filter(f => f.endsWith('.digitalExperience'))).toHaveLength(0);
                // Content files must retain their original names
                expect(packageFiles.some(f => f.endsWith('_meta.json'))).toBe(true);
                expect(packageFiles.some(f => f.endsWith('content.json'))).toBe(true);
                expect(packageFiles.some(f => f.endsWith('fr.json'))).toBe(true);
            });
            it('should not add duplicate files when the same bundle is added multiple times', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                await packageBuilder.addFiles([
                    'src/digitalExperiences/site/OrderSign1',
                    'src/digitalExperiences/site/OrderSign1/OrderSign1.digitalExperience-meta.xml',
                ]);

                const filesAdded = normalizePath([ ...(await packageBuilder.build()).files() ]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);
                const bundleEntry = manifest.types.find(t => t.name === 'DigitalExperienceBundle');
                const deEntry = manifest.types.find(t => t.name === 'DigitalExperience');

                expect(filesAdded.length).toEqual(6);
                expect(bundleEntry!.members.length).toEqual(1);
                expect(deEntry!.members.length).toEqual(2);
            });
        });
        describe('#replacements', () => {
            it('should apply replacements when defined as RegEx', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                packageBuilder.addReplacement({
                    token: /<(apiVersion)>[0-9]{2}.0<\/apiVersion>/g,
                    replacement: '<$1>75.0</$1>',
                    files: '**/*-meta.xml'
                });
                await packageBuilder.addFiles([ 'src' ]);

                const buildPackage = await packageBuilder.getPackage();
                const classMetaXml = buildPackage.getPackageData('classes/myClass.cls-meta.xml')?.data?.toString();
                const triggeretaXml = buildPackage.getPackageData('triggers/myTrigger.trigger-meta.xml')?.data?.toString();

                expect(classMetaXml).toEqual('<?xml version="1.0" encoding="UTF-8"?><ApexClass xmlns="http://soap.sforce.com/2006/04/metadata"><apiVersion>75.0</apiVersion></ApexClass>');
                expect(triggeretaXml).toEqual('<?xml version="1.0" encoding="UTF-8"?><ApexTrigger xmlns="http://soap.sforce.com/2006/04/metadata"><apiVersion>75.0</apiVersion></ApexTrigger>');
            });
            it('should apply replacements only to matching metadata types', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
                packageBuilder.addReplacement({
                    token: /<(apiVersion)>[0-9]{2}.0<\/apiVersion>/g,
                    replacement: '<$1>75.0</$1>',
                    files: '**/*-meta.xml',
                    types: ['ApexClass']
                });
                await packageBuilder.addFiles([ 'src' ]);

                const buildPackage = await packageBuilder.getPackage();
                const classMetaXml = buildPackage.getPackageData('classes/myClass.cls-meta.xml')?.data?.toString();
                const triggeretaXml = buildPackage.getPackageData('triggers/myTrigger.trigger-meta.xml')?.data?.toString();

                expect(classMetaXml).toEqual('<?xml version="1.0" encoding="UTF-8"?><ApexClass xmlns="http://soap.sforce.com/2006/04/metadata"><apiVersion>75.0</apiVersion></ApexClass>');
                expect(triggeretaXml).toEqual('<?xml version="1.0" encoding="UTF-8"?><ApexTrigger xmlns="http://soap.sforce.com/2006/04/metadata"><apiVersion>51.0</apiVersion></ApexTrigger>');
            });
        });
    });
});