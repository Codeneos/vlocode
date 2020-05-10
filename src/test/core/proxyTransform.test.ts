import { expect } from 'chai';
import 'mocha';
import { transformPropertyProxy } from 'lib/util/object';

describe('PropertyTransformHandler', () => {   

    function toLowerCase(target: any, property: any) {
        return Object.keys(target).find(key => key.toLowerCase() == property.toLowerCase());
    }

    describe('transformPropertyProxy', () => { 
        const testObject = {
            Array: [
                { Key: 'ArrayKey' }
            ],
            Nested: { 
                Key: 'NestedKey' 
            },
            MutateMe: 'Test'
        };
        it("nested objects fields should be accessible and wrapped", function() {
            const sut = transformPropertyProxy(testObject, toLowerCase);
            expect(sut.nested.key).equals(testObject.Nested.Key);
        });
        it("objects in nested arrays should be accessible and wrapped", function() {
            const sut = transformPropertyProxy(testObject, toLowerCase);
            expect(sut.array[0].key).equals(testObject.Array[0].Key);
        });
        it("array mutations should apply to target", function() {
            const target = [];
            const sut = transformPropertyProxy<any[]>(target, toLowerCase);
            
            sut.push('test1');
            sut.push('test2');
            sut.pop();
            sut[0] = 'test3';

            expect(target[0]).equals('test3');
            expect(sut[0]).equals('test3');
            expect(sut.length).equals(1);
            expect(target.length).equals(1);
        });
        it("object mutations existing properties should apply to target", function() {
            const sut = transformPropertyProxy(testObject, toLowerCase);
            sut.mutateme = 'Test1';
            expect(testObject.MutateMe).equals('Test1');
        });
    });

});