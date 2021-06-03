/* eslint-disable camelcase */
import * as mockFs from 'mock-fs';
import * as sinon from 'sinon';
import { expect } from 'chai';
import 'mocha';

import * as constants from '@constants';
import * as xml2js from 'xml2js';
import { SalesforcePackageBuilder, SalesforcePackageType } from 'lib/salesforce/deploymentPackageBuilder';
import * as fs from 'lib/util/fs';
import SalesforceService from 'lib/salesforce/salesforceService';
import { container } from 'lib/core';
import { Logger } from 'lib/logging';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import { VlocityNamespaceService } from 'lib/vlocity/vlocityNamespaceService';
import QueryService from 'lib/salesforce/queryService';

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

function mockDep<T extends { new(): I }, I extends Object>(ctor?: T) : I
function mockDep<T extends { new(...args: any[]): I }, I extends Object>(ctor?: T) : I
function mockDep<I extends Object>() : I
function mockDep<I>() : I {
    return new Proxy({}, {
        get: (target, prop) => {
            console.debug(`mockDep->get(${String(prop)})`);
            return mockDep();
        },
        set: (target, prop, value) => {
            console.debug(`mockDep->set(${String(prop)}) = ${value}`);
            return true;
        },
        apply: (target, thisArg, argumentsList) => {
            console.debug(`mockDep->apply(${String(argumentsList)})`);
            return mockDep();
        }
    }) as any;
}

describe('SalesforcePackageBuilder', () => {
    const apiVersion = '51.0';

    beforeEach(() => {
        // setup fake FS for testing
        mockFs({
            // LWC
            'src/lwc/test/test.js-meta.xml': buildMetadataXml('LightningComponentBundle', { description: 'test', isExposed: false, masterLabel: 'Test' }),
            'src/lwc/test/test.html': '<template></template>',
            'src/lwc/test/test.js': 'import {LightningElement, api} from \'lwc\';',
            'src/lwc/test/support.js': 'import {LightningElement, api} from \'lwc\';',
            // Aura
            'src/aura/test/test.js-meta.xml': buildMetadataXml('AuraDefinitionBundle', { description: 'test' }),
            'src/aura/test/test.cmp': '<aura:component></aura:component>',
            'src/aura/test/testController.js': '({ onInit : function(component, event, helper) { } })',
            // APEX
            'src/classes/myClass.cls': 'global class MyClass { }',
            'src/classes/myClass.cls-meta.xml': buildMetadataXml('ApexClass'),
            // Trigger
            'src/triggers/myTrigger.trigger': 'trigger MyTrigger on Account (before insert, before update, after insert, after update) { }',
            'src/triggers/myTrigger.trigger-meta.xml': buildMetadataXml('ApexTrigger'),
        });
        // async reading not supported by mock-fs
        fs.options.mode = 'sync';
    });

    afterEach(mockFs.restore);

    const salesforceService = new SalesforceService(
        mockDep<JsForceConnectionProvider>(),
        mockDep(VlocityNamespaceService),
        mockDep(QueryService),
        Logger.null
    );

    describe('#addFiles', () => {
        describe('#lwcComponent', () => {
            it('should add all related parts when adding the meta file', async () => {
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, salesforceService, Logger.null);
                await packageBuilder.addFiles([ 'src/lwc/test/test.js-meta.xml']);

                const filesAdded = [...packageBuilder.getPackage().files()];
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
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, salesforceService, Logger.null);
                await packageBuilder.addFiles([ 'src/lwc/test/test.html']);

                const filesAdded = [...packageBuilder.getPackage().files()];
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
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, salesforceService, Logger.null);
                await packageBuilder.addFiles([ 'src/lwc/test/test.js']);

                const filesAdded = [...packageBuilder.getPackage().files()];
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
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, salesforceService, Logger.null);
                await packageBuilder.addFiles([ 'src/lwc/test' ]);

                const filesAdded = [...packageBuilder.getPackage().files()];
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
                const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy, salesforceService, Logger.null);
                await packageBuilder.addFiles([
                    'src/lwc/test/test.html',
                    'src/lwc/test/test.js-meta.xml',
                    'src/lwc/test/test.js',
                    'src/lwc/test/support.js'
                ]);

                const filesAdded = [...packageBuilder.getPackage().files()];
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
        // describe('#auraComponent', () => {
        //     it('cmp file should add all related parts', async () => {
        //         const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy);
        //         await packageBuilder.addFiles([ './src/aura/test/test.cmp']);

        //         const filesAdded = [...packageBuilder.getPackage().files()];
        //         const manifest = packageBuilder.getManifest().toJson(apiVersion);

        //         expect(filesAdded.length).equals(4);
        //         expect(filesAdded).includes.members([
        //             'src/aura/test/test.cmp',
        //             'src/aura/test/test.js-meta.xml',
        //             'src/aura/test/testController.js'
        //         ]);
        //         expect(manifest.types.length).equals(1);
        //         expect(manifest.types[0].name).equals('LightningComponentBundle');
        //         expect(manifest.types[0].members.length).equals(1);
        //         expect(manifest.types[0].members[0]).equals('test');
        //     });
        //     it('JS file should add all related parts', async () => {
        //         const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy);
        //         await packageBuilder.addFiles([ './src/lwc/test/test.js']);

        //         const filesAdded = [...packageBuilder.getPackage().files()];
        //         const manifest = packageBuilder.getManifest().toJson(apiVersion);

        //         expect(filesAdded.length).equals(4);
        //         expect(filesAdded).includes.members([
        //             'src/lwc/test/test.html',
        //             'src/lwc/test/test.js-meta.xml',
        //             'src/lwc/test/test.js',
        //             'src/lwc/test/support.js'
        //         ]);
        //         expect(manifest.types.length).equals(1);
        //         expect(manifest.types[0].name).equals('LightningComponentBundle');
        //         expect(manifest.types[0].members.length).equals(1);
        //         expect(manifest.types[0].members[0]).equals('test');
        //     });
        //     it('component folder should add all related parts', async () => {
        //         const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy);
        //         await packageBuilder.addFiles([ 'src/lwc/test ']);

        //         const filesAdded = [...packageBuilder.getPackage().files()];
        //         const manifest = packageBuilder.getManifest().toJson(apiVersion);

        //         expect(filesAdded.length).equals(4);
        //         expect(filesAdded).includes.members([
        //             'src/lwc/test/test.html',
        //             'src/lwc/test/test.js-meta.xml',
        //             'src/lwc/test/test.js',
        //             'src/lwc/test/support.js'
        //         ]);
        //         expect(manifest.types.length).equals(1);
        //         expect(manifest.types[0].name).equals('LightningComponentBundle');
        //         expect(manifest.types[0].members.length).equals(1);
        //         expect(manifest.types[0].members[0]).equals('test');
        //     });
        // });
    });
});