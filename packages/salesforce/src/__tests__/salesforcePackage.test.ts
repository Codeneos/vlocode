import 'jest';

import { Logger, MemoryFileSystem, container } from '@vlocode/core';
import ZipArchive from 'jszip';
import { XML } from '@vlocode/util';
import { SalesforcePackage } from '../deploy';

function buildXml(rootName: string, data?: any) {
    return XML.stringify({
        [rootName]: {
            $: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
            ...(data || {})
        }
    });
}

function buildMetadataXml(rootName: string, apiVersion: string, data?: any) {
    return buildXml(rootName, {
        apiVersion,
        ...(data || {})
    });
}

describe('SalesforcePackageBuilder', () => {
    const apiVersion = '58.0';
    const mockFs = new MemoryFileSystem({
        'src/classes/MyClass.cls': 'class MyClass { }',
        'src/classes/MyClass.cls-meta.xml': buildMetadataXml('ApexClass', apiVersion),
        'src/classes/MyClassTest.cls': 'class @isTest MyClassTest { @isTest static void test() { } }',
        'src/classes/MyClassTest.cls-meta.xml': buildMetadataXml('ApexClass', apiVersion),
        'src/classes/MyClass2.cls': 'class MyClass2 { }',
        'src/classes/MyClass2.cls-meta.xml': buildMetadataXml('ApexClass', apiVersion),
        'src/classes/MyClassTest2.cls': 'class @isTest MyClassTest2 { @isTest static void test() { } }',
        'src/classes/MyClassTest2.cls-meta.xml': buildMetadataXml('ApexClass', apiVersion),
    });

    beforeAll(() =>  container.add(Logger.null));

    describe('#getTestClasses', () => {
        it('should return classes annotated as test', () => {
            const sfPackage = new SalesforcePackage(apiVersion);
            sfPackage.add([
                {
                    componentType: 'ApexClass',
                    componentName: 'MyClass',
                    packagePath: 'src/classes/MyClass.cls',
                    data: `class MyClass { }`
                },
                {
                    componentType: 'ApexClass',
                    componentName: 'MyClassTest',
                    packagePath: 'src/classes/MyClassTest.cls',
                    data: `class @isTest MyClassTest { @isTest static void test() { } }`
                },
                {
                    componentType: 'ApexClass',
                    componentName: 'MyClassTest2',
                    packagePath: 'src/classes/MyClassTest2.cls',
                    data: `class @isTest MyClassTest2 { @isTest static void test() { } }`
                }
            ]);

            const testClasses = sfPackage.getTestClasses();
            expect(testClasses).toEqual([ 'MyClassTest', 'MyClassTest2' ]);
        });
        it('should return test classes that have data without fs', () => {
            const sfPackage = new SalesforcePackage(apiVersion);
            sfPackage.add([
                {
                    componentType: 'ApexClass',
                    componentName: 'MyClassTest',
                    packagePath: 'src/classes/MyClassTest.cls',
                    fsPath: 'src/classes/MyClassTest.cls',
                },
                {
                    componentType: 'ApexClass',
                    componentName: 'MyClassTest2',
                    packagePath: 'src/classes/MyClassTest2.cls',
                    data: `class @isTest MyClassTest2 { @isTest static void test() { } }`
                }
            ]);

            const testClasses = sfPackage.getTestClasses();
            expect(testClasses).toEqual([ 'MyClassTest2' ]);
        });
        it('should return all test classes when called with fs', async () => {
            const sfPackage = new SalesforcePackage(apiVersion);
            sfPackage.add([
                {
                    componentType: 'ApexClass',
                    componentName: 'MyClassTest',
                    packagePath: 'src/classes/MyClassTest.cls',
                    fsPath: 'src/classes/MyClassTest.cls',
                },
                {
                    componentType: 'ApexClass',
                    componentName: 'MyClassTest2',
                    packagePath: 'src/classes/MyClassTest2.cls',
                    data: `class @isTest MyClassTest2 { @isTest static void test() { } }`
                }
            ]);

            const testClasses = await sfPackage.getTestClasses({ fs: mockFs });
            expect(testClasses).toEqual([ 'MyClassTest', 'MyClassTest2' ]);
        });
    });

    describe('#fromBuffer', () => {
        it('should load package data from a pure Salesforce package buffer', async () => {
            const sfPackage = new SalesforcePackage(apiVersion);
            sfPackage.add([
                {
                    componentType: 'ApexClass',
                    componentName: 'MyClass',
                    packagePath: 'classes/MyClass.cls',
                    data: 'global class MyClass { }'
                },
                {
                    componentType: 'ApexClass',
                    componentName: 'MyClass',
                    packagePath: 'classes/MyClass.cls-meta.xml',
                    data: buildMetadataXml('ApexClass', apiVersion)
                }
            ]);

            const packageBuffer = await sfPackage.getBuffer();
            const packageZip = await ZipArchive.loadAsync(packageBuffer);
            expect(packageZip.file('.vlocode-package.json')).toBeNull();

            const loadedPackage = await SalesforcePackage.fromBuffer(packageBuffer);
            expect(loadedPackage.getComponent('ApexClass', 'MyClass').files.length).toEqual(2);
            expect(loadedPackage.getPackageData('classes/MyClass.cls')?.data?.toString()).toEqual('global class MyClass { }');
            expect(loadedPackage.getSourceFile('classes/MyClass.cls')).toBeUndefined();
        });

        it('should load package when .vlocode-package.json is not present', async () => {
            const sfPackage = new SalesforcePackage(apiVersion);
            sfPackage.add({
                componentType: 'ApexClass',
                componentName: 'MyClass',
                packagePath: 'classes/MyClass.cls',
                data: 'global class MyClass { }'
            });

            const packageBuffer = await (await sfPackage.generateArchive()).generateAsync({
                type: 'nodebuffer',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 4
                }
            });
            const packageZip = await ZipArchive.loadAsync(packageBuffer);
            expect(packageZip.file('.vlocode-package.json')).toBeNull();

            const loadedPackage = await SalesforcePackage.fromBuffer(packageBuffer);
            expect(loadedPackage.manifest.list('ApexClass')).toEqual([ 'MyClass' ]);
            expect(loadedPackage.getPackageData('classes/MyClass.cls')?.data?.toString()).toEqual('global class MyClass { }');
        });
    });

    describe('#getBuffer', () => {
        it('should not include .vlocode-package.json metadata file', async () => {
            const sfPackage = new SalesforcePackage(apiVersion);
            sfPackage.add({
                componentType: 'ApexClass',
                componentName: 'MyClass',
                packagePath: 'classes/MyClass.cls',
                data: 'global class MyClass { }'
            });

            const packageBuffer = await sfPackage.getBuffer(4);
            const packageZip = await ZipArchive.loadAsync(packageBuffer);
            expect(packageZip.file('.vlocode-package.json')).toBeNull();
        });
    });

    describe('#toRetrieveResultPackage', () => {
        it('should convert to retrieve result package with valid manifest and files', async () => {
            const sfPackage = new SalesforcePackage(apiVersion);
            sfPackage.add([
                {
                    componentType: 'ApexClass',
                    componentName: 'MyClass',
                    packagePath: 'classes/MyClass.cls',
                    data: 'global class MyClass { }'
                },
                {
                    componentType: 'ApexClass',
                    componentName: 'MyClass',
                    packagePath: 'classes/MyClass.cls-meta.xml',
                    data: buildMetadataXml('ApexClass', apiVersion)
                },
                {
                    componentType: 'DashboardFolder',
                    componentName: 'MyFolder',
                    packagePath: 'dashboards/MyFolder-meta.xml',
                    data: buildXml('DashboardFolder', { name: 'MyFolder', accessType: 'Public', publicFolderAccess: 'ReadWrite' })
                }
            ]);
            sfPackage.addDestructiveChange('ApexClass', 'RemoveMe', 'post');

            const retrievePackage = await sfPackage.toRetrieveResultPackage();
            expect(retrievePackage.success).toBe(true);

            const manifest = await retrievePackage.getManifest();
            expect(manifest.list('ApexClass')).toEqual([ 'MyClass' ]);
            expect(manifest.list('DashboardFolder')).toEqual([ 'MyFolder' ]);

            const componentNames = retrievePackage.componentNames();
            expect(componentNames).toEqual(expect.arrayContaining([
                'ApexClass/MyClass',
                'DashboardFolder/MyFolder'
            ]));

            const retrieveFiles = retrievePackage.getFiles();

            const classFiles = retrieveFiles
                .filter(file => file.componentType === 'ApexClass' && file.componentName === 'MyClass')
                .map(file => file.packagePath)
                .sort();
            expect(classFiles).toEqual([
                'classes/MyClass.cls',
                'classes/MyClass.cls-meta.xml'
            ]);

            const metadataOnlyFiles = retrieveFiles
                .filter(file => file.componentType === 'DashboardFolder' && file.componentName === 'MyFolder')
                .map(file => file.packagePath);
            expect(metadataOnlyFiles).toEqual([ 'dashboards/MyFolder-meta.xml' ]);

            const retrievePaths = retrieveFiles.map(file => file.packagePath);
            expect(retrievePaths).not.toContain('destructiveChangesPre.xml');
            expect(retrievePaths).not.toContain('destructiveChangesPost.xml');
            expect(retrievePaths).not.toContain('.vlocode-package.json');
        });

        it('should pass through fs option and fail without it for fsPath-only entries', async () => {
            const sfPackage = new SalesforcePackage(apiVersion);
            sfPackage.add({
                componentType: 'ApexClass',
                componentName: 'MyClass',
                packagePath: 'classes/MyClass.cls',
                fsPath: 'src/classes/MyClass.cls',
            });

            await expect(sfPackage.toRetrieveResultPackage()).rejects
                .toThrow('Specify a file system to read data from when including files based on their file system path.');

            const retrievePackage = await sfPackage.toRetrieveResultPackage({ fs: mockFs });
            expect(retrievePackage.success).toBe(true);
            expect(
                retrievePackage.getFiles(file => file.componentType === 'ApexClass' && file.componentName === 'MyClass').length
            ).toEqual(1);
        });
    });
});
