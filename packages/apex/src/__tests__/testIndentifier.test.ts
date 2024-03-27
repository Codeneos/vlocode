import 'jest';

import { Logger, MemoryFileSystem } from '@vlocode/core';
import { TestIdentifier } from '../testIndentifier';

describe('TestIdentifier', () => {

    const mockFs = new MemoryFileSystem({
        'src/classes/MyClass.cls': 'class MyClass { MyClass2 dependency = new MyClass2(); }',
        'src/classes/MyClassTest.cls': '@isTest class MyClassTest { @isTest static void test() { new MyClass(); } }',
        'src/classes/MyClass2.cls': 'class MyClass2 { }',
        'src/classes/MyClassTest2.cls': '@isTest class MyClassTest2 { @isTest static void test() { new MyClass2(); } }',
    });

    describe('loadApexClasses', () => {
        it('should load Apex classes and populate testClasses map', async () => {
            // Arrange
            const folders = ['src/classes'];
            const testIdentifier = new TestIdentifier(mockFs, Logger.null);

            // Act
            await testIdentifier.loadApexClasses(folders);

            // Assert
            expect(testIdentifier['testClasses'].size).toBe(2);
            expect(testIdentifier['apexClassesByName'].size).toBe(4);
            expect(testIdentifier['fileToApexClass'].size).toBe(4);

            expect(testIdentifier['testClasses'].get('myclasstest')?.classCoverage).toEqual(['myclass']);
            expect(testIdentifier['testClasses'].get('myclasstest2')?.classCoverage).toEqual(['myclass2']);
        });
    });

    describe('getTestClasses', () => {
        it('should retrieve test classes that cover a given class', async () => {
            // Arrange
            const folders = ['src/classes'];
            const testIdentifier = new TestIdentifier(mockFs, Logger.null);

            // Act
            await testIdentifier.loadApexClasses(folders);
            const result = testIdentifier.getTestClasses('MyClass');

            // Assert
            expect(result?.length).toBe(1);
            expect(result).toEqual(['MyClassTest']);
        });
    });
});