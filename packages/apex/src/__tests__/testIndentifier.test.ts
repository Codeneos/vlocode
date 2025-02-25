import 'jest';

import { Logger, MemoryFileSystem } from '@vlocode/core';
import { TestIdentifier } from '../testIdentifier';
import { Apex } from '../apex';

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
            const testIdentifier = new TestIdentifier(new Apex(mockFs), Logger.null);

            // Act
            await testIdentifier.loadApexClasses(folders);

            // Assert
            expect(testIdentifier['testClasses'].size).toBe(2);
            expect(testIdentifier['apexClassesByName'].size).toBe(4);

            expect(testIdentifier['testClasses'].has('myclasstest1')).toBeTruthy();
            expect(testIdentifier['testClasses'].has('myclasstest2')).toBeTruthy();
        });
    });

    describe('getTestClasses', () => {
        it('should retrieve test classes that cover a given class', async () => {
            // Arrange
            const folders = ['src/classes'];
            const testIdentifier = new TestIdentifier(new Apex(mockFs), Logger.null);

            // Act
            await testIdentifier.loadApexClasses(folders);
            const result = await testIdentifier.findImpactedTests(['src/classes/MyClass.cls']);

            // Assert
            expect(result?.length).toBe(1);
            expect(result).toEqual(['MyClassTest']);
        });
    });
});