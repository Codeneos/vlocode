import 'jest';

import { Logger, MemoryFileSystem, container } from '@vlocode/core';
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
});