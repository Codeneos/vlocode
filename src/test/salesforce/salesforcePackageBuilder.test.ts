/* eslint-disable camelcase */
import { expect } from 'chai';
import 'mocha';

import * as constants from '@constants';
import * as xml2js from 'xml2js';
import { SalesforcePackageBuilder, SalesforcePackageType } from 'lib/salesforce/deploymentPackageBuilder';
import SalesforceService from 'lib/salesforce/salesforceService';
import { Logger } from 'lib/logging';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import { VlocityNamespaceService } from 'lib/vlocity/vlocityNamespaceService';
import QueryService from 'lib/salesforce/queryService';
import { mockDep, normalizePath } from 'test/helpers';
import { MemoryFileSystem } from 'lib/core/fs';

function buildXml(rootName: string, data?: any) {
    const xmlBuilder = new xml2js.Builder(constants.MD_XML_OPTIONS);
    return xmlBuilder.buildObject({
        [rootName]: {
            $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
            ...(data || {})
        }
    });
}


function buildMetadataXml(rootName: string, data?: any) {
    const xmlBuilder = new xml2js.Builder(constants.MD_XML_OPTIONS);
    return xmlBuilder.buildObject({
        [rootName]: {
            $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
            apiVersion: '51.0',
            ...(data || {})
        }
    });
}

// function getFileType(value: fs.Dirent | fs.Stats) {
//     if (value.isDirectory()) {
//         return vscode.FileType.Directory;
//     } else if (value.isSymbolicLink()) {
//         return vscode.FileType.SymbolicLink;
//     } else if (value.isFile()) {
//         return vscode.FileType.File;
//     }
//     return vscode.FileType.Unknown;
// }

// function getFileStat(value: fs.Stats) : vscode.FileStat {
//     return {
//         type: getFileType(value),
//         mtime: value.mtimeMs,
//         ctime: value.ctimeMs,
//         size: value.size
//     };
// }

// const vsCodeMockFs = {
//     stat: async (uri: vscode.Uri) => getFileStat(await fs.stat(uri.fsPath)),
//     readFile: (uri: vscode.Uri) => fs.readFile(uri.fsPath),
//     delete: async (uri: vscode.Uri) => fs.promises.rm(uri.fsPath),
//     rename: (source: vscode.Uri, target: vscode.Uri) => fs.rename(source.fsPath, target.fsPath),
//     createDirectory: (uri: vscode.Uri) => fs.ensureDir(uri.fsPath),
//     readDirectory: (uri: vscode.Uri) => fs.readdir(uri.fsPath, { withFileTypes: true })
//         .then(r => r.map(f => [ f.name, getFileType(f) ] )),
// };


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
        // Destructive changes
        'src/destructiveChangesPost.xml': buildXml('Package', { types: [ { name: 'ApexClass', members: [ 'a', 'b' ] } ] }),
        'src/destructiveChangesPost2.xml': buildXml('Package', { types: [ { name: 'ApexClass', members: [ 'a', 'b' ] } ] }),
        'src/destructiveChangesPre.xml': buildXml('Package', { types: [ { name: 'ApexClass', members: [ 'c', 'd' ] } ] }),
        'src/destructiveChanges.xml': buildXml('Package', { types: [ { name: 'ApexClass', members: [ 'g', 'h' ] } ] }),
    });

    const salesforceService = new SalesforceService(
        mockDep<JsForceConnectionProvider>(),
        mockDep(VlocityNamespaceService),
        mockDep(QueryService),
        Logger.null
    );

    describe('#addFiles', () => {
        describe('#lwcComponent', () => {
            it('should add all related parts when adding the meta file', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, mockFs, Logger.null);
                await packageBuilder.addFiles([ 'src/lwc/test/test.js-meta.xml']);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).equals(4);
                expect(filesAdded).includes.members([
                    'src/lwc/test/test.html',
                    'src/lwc/test/test.js-meta.xml',
                    'src/lwc/test/test.js',
                    'src/lwc/test/support.js'
                ]);
                expect(manifest.types.length).equals(1);
                expect(manifest.types[0].name).equals('LightningComponentBundle');
                expect(manifest.types[0].members.length).equals(1);
                expect(manifest.types[0].members[0]).equals('test');
            });
            it('should add all related parts when adding the HTML file', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, mockFs, Logger.null);
                await packageBuilder.addFiles([ 'src/lwc/test/test.html']);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).equals(4);
                expect(filesAdded).includes.members([
                    'src/lwc/test/test.html',
                    'src/lwc/test/test.js-meta.xml',
                    'src/lwc/test/test.js',
                    'src/lwc/test/support.js'
                ]);
                expect(manifest.types.length).equals(1);
                expect(manifest.types[0].name).equals('LightningComponentBundle');
                expect(manifest.types[0].members.length).equals(1);
                expect(manifest.types[0].members[0]).equals('test');
            });
            it('should add all related parts when adding a the JS file', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, mockFs, Logger.null);
                await packageBuilder.addFiles([ 'src/lwc/test/test.js']);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).equals(4);
                expect(filesAdded).includes.members([
                    'src/lwc/test/test.html',
                    'src/lwc/test/test.js-meta.xml',
                    'src/lwc/test/test.js',
                    'src/lwc/test/support.js'
                ]);
                expect(manifest.types.length).equals(1);
                expect(manifest.types[0].name).equals('LightningComponentBundle');
                expect(manifest.types[0].members.length).equals(1);
                expect(manifest.types[0].members[0]).equals('test');
            });
            it('should add all related parts when adding a component folder ', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, mockFs, Logger.null);
                await packageBuilder.addFiles([ 'src/lwc/test' ]);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).equals(4);
                expect(filesAdded).includes.members([
                    'src/lwc/test/test.html',
                    'src/lwc/test/test.js-meta.xml',
                    'src/lwc/test/test.js',
                    'src/lwc/test/support.js'
                ]);
                expect(manifest.types.length).equals(1);
                expect(manifest.types[0].name).equals('LightningComponentBundle');
                expect(manifest.types[0].members.length).equals(1);
                expect(manifest.types[0].members[0]).equals('test');
            });
            it('should not add the same file multiple times when adding all bundled files', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, mockFs, Logger.null);
                await packageBuilder.addFiles([
                    'src/lwc',
                    'src/lwc/test/test.html',
                    'src/lwc/test/test.js-meta.xml',
                    'src/lwc/test/test.js',
                    'src/lwc/test/support.js'
                ]);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).equals(4);
                expect(filesAdded).includes.members([
                    'src/lwc/test/test.html',
                    'src/lwc/test/test.js-meta.xml',
                    'src/lwc/test/test.js',
                    'src/lwc/test/support.js'
                ]);
                expect(manifest.types.length).equals(1);
                expect(manifest.types[0].name).equals('LightningComponentBundle');
                expect(manifest.types[0].members.length).equals(1);
                expect(manifest.types[0].members[0]).equals('test');
            });
        });
        describe('#auraComponent', () => {
            it('cmp file should add all related parts', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, mockFs, Logger.null);
                await packageBuilder.addFiles([ 'src/aura/test/test.cmp']);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).equals(3);
                expect(filesAdded).includes.members([
                    'src/aura/test/test.cmp',
                    'src/aura/test/test.cmp-meta.xml',
                    'src/aura/test/testController.js'
                ]);
                expect(manifest.types.length).equals(1);
                expect(manifest.types[0].name).equals('AuraDefinitionBundle');
                expect(manifest.types[0].members.length).equals(1);
                expect(manifest.types[0].members[0]).equals('test');
            });
            it('JS file should add all related parts', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, mockFs, Logger.null);
                await packageBuilder.addFiles([ 'src/aura/test/testController.js']);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).equals(3);
                expect(filesAdded).includes.members([
                    'src/aura/test/test.cmp',
                    'src/aura/test/test.cmp-meta.xml',
                    'src/aura/test/testController.js'
                ]);
                expect(manifest.types.length).equals(1);
                expect(manifest.types[0].name).equals('AuraDefinitionBundle');
                expect(manifest.types[0].members.length).equals(1);
                expect(manifest.types[0].members[0]).equals('test');
            });
            it('component folder should add all related parts', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, mockFs, Logger.null);
                await packageBuilder.addFiles([ 'src/aura/test' ]);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).equals(3);
                expect(filesAdded).includes.members([
                    'src/aura/test/test.cmp',
                    'src/aura/test/test.cmp-meta.xml',
                    'src/aura/test/testController.js'
                ]);
                expect(manifest.types.length).equals(1);
                expect(manifest.types[0].name).equals('AuraDefinitionBundle');
                expect(manifest.types[0].members.length).equals(1);
                expect(manifest.types[0].members[0]).equals('test');
            });
        });
        describe('#apexClass', () => {
            it('should add all class file when only meta selected', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, mockFs, Logger.null);
                await packageBuilder.addFiles([ 'src/classes/myClass.cls']);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).equals(2);
                expect(filesAdded).includes.members([
                    'src/classes/myClass.cls',
                    'src/classes/myClass.cls-meta.xml'
                ]);
                expect(manifest.types.length).equals(1);
                expect(manifest.types[0].name).equals('ApexClass');
                expect(manifest.types[0].members.length).equals(1);
                expect(manifest.types[0].members[0]).equals('myClass');
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

                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, settingsFsMock, Logger.null);
                await packageBuilder.addFiles([
                    'main/default/app/settings/Account.settings',
                    'main/default/app/settings/Address.settings',
                    'main/default/app/settings/BusinessHours.settings'
                ]);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).equals(3);
                expect(filesAdded).includes.members([
                    'main/default/app/settings/Account.settings',
                    'main/default/app/settings/Address.settings',
                    'main/default/app/settings/BusinessHours.settings'
                ]);
                expect(manifest.types.length).equals(1);
                expect(manifest.types[0].name).equals('Settings');
                expect(manifest.types[0].members.length).equals(3);
                expect(manifest.types[0].members).members([
                    'Account',
                    'Address',
                    'BusinessHours'
                ]);
            });
        });
        describe('#destructiveChanges', () => {
            it('should add changes to deployment as-is', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, mockFs, Logger.null);
                await packageBuilder.addFiles([ 'src/destructiveChangesPost.xml' ]);

                const filesAdded = normalizePath(Object.keys((await packageBuilder.getPackage().generateArchive()).files));
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).equals(2); // includes package.xml
                expect(filesAdded).includes.members([ 'destructiveChangesPost.xml' ]);
                expect(manifest.types.length).equals(0);
            });
            it('should merge multiple changes into single package file', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, mockFs, Logger.null);
                await packageBuilder.addFiles([
                    'src/destructiveChangesPost.xml',
                    'src/destructiveChangesPost2.xml'
                ]);

                const filesAdded = normalizePath(Object.keys((await packageBuilder.getPackage().generateArchive()).files));
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).equals(2);
                expect(filesAdded).includes.members([ 'destructiveChangesPost.xml' ]);
                expect(manifest.types.length).equals(0);
            });
            it('should merge default destructive changes as pre', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, mockFs, Logger.null);
                await packageBuilder.addFiles([
                    'src/destructiveChanges.xml'
                ]);

                const filesAdded = normalizePath(Object.keys((await packageBuilder.getPackage().generateArchive()).files));
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).equals(2);
                expect(filesAdded).includes.members([ 'destructiveChangesPre.xml' ]);
                expect(manifest.types.length).equals(0);
            });
            it('should merge multiple destructive changes types in 2 separate files', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, mockFs, Logger.null);
                await packageBuilder.addFiles([
                    'src/destructiveChanges.xml',
                    'src/destructiveChangesPre.xml',
                    'src/destructiveChangesPost.xml'
                ]);

                const filesAdded = normalizePath(Object.keys((await packageBuilder.getPackage().generateArchive()).files));
                const manifest = packageBuilder.getManifest().toJson(apiVersion);

                expect(filesAdded.length).equals(3);
                expect(filesAdded).includes.members([
                    'destructiveChangesPre.xml',
                    'destructiveChangesPost.xml'
                ]);
                expect(manifest.types.length).equals(0);
            });
        });
        describe('#mixed', () => {
            it('should add all deployable objects', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, mockFs, Logger.null);
                await packageBuilder.addFiles([ 'src' ]);

                const filesAdded = normalizePath([...packageBuilder.getPackage().files()]);
                const manifest = packageBuilder.getManifest();

                expect(filesAdded).includes.members([
                    'src/lwc/test/test.js-meta.xml',
                    'src/aura/test/test.cmp-meta.xml',
                    'src/classes/myClass.cls-meta.xml',
                    'src/triggers/myTrigger.trigger-meta.xml',
                ]);
                expect(manifest.list().length).equals(4);
                expect(manifest.list('AuraDefinitionBundle').length).equals(1);
                expect(manifest.list('LightningComponentBundle').length).equals(1);
                expect(manifest.list('ApexClass').length).equals(1);
                expect(manifest.list('ApexTrigger').length).equals(1);
            });
        });
    });
});