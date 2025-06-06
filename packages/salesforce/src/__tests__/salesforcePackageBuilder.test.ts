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
    });

    beforeAll(() =>  container.registerAs(Logger.null, Logger));

    describe('#addFiles', () => {
        describe('#lwcComponent', () => {
            it('should add all related parts when adding the meta file', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
            it('should not add the same file multiple times when adding all bundled files', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
                await packageBuilder.addFiles([ 'src/objects/PetersCustomObject__c']);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(manifest.types).toStrictEqual([
                    { name:'CustomObject', members: [ 'PetersCustomObject__c' ] },
                    { name:'CustomField', members: [ 'PetersCustomObject__c.PetersField__c' ] },
                    { name:'ListView', members: [ 'PetersCustomObject__c.What_A_View' ] }
                ]);
            });
            it('should merge source from fragments into parent', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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

                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, settingsFsMock);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
                await packageBuilder.addFiles([ 'src/destructiveChangesPost.xml' ]);

                const filesAdded = normalizePath(Object.keys((await packageBuilder.getPackage().generateArchive()).files));
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).toEqual(2); // includes package.xml
                expect(filesAdded).toEqual(expect.arrayContaining([ 'destructiveChangesPost.xml' ]));
                expect(manifest.types.length).toEqual(0);
            });
            it('should merge multiple destructive changes into single package file', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
                await packageBuilder.addFiles([ 'src' ]);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest();

                expect(filesAdded).toEqual(expect.arrayContaining([
                    'src/lwc/test/test.js-meta.xml',
                    'src/aura/test/test.cmp-meta.xml',
                    'src/classes/myClass.cls-meta.xml',
                    'src/triggers/myTrigger.trigger-meta.xml',
                ]));
                expect(manifest.list().length).toEqual(9);
                expect(manifest.list('AuraDefinitionBundle').length).toEqual(1);
                expect(manifest.list('LightningComponentBundle').length).toEqual(1);
                expect(manifest.list('ApexClass').length).toEqual(1);
                expect(manifest.list('ApexTrigger').length).toEqual(1);
                expect(manifest.list('CustomObject').length).toEqual(1);
                expect(manifest.list('CustomField').length).toEqual(1);
                expect(manifest.list('ListView').length).toEqual(1);
                expect(manifest.list('Dashboard').length).toEqual(2);
            });
        });
        describe('#dashboards', () => {
            it('should add dashboards folders with -meta.xml suffix', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
        describe('#replacements', () => {
            it('should apply replacements when defined as RegEx', async () => {
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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
                const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion, mockFs);
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