import 'jest';
import { Parser } from '../parser';

describe('ApexParser', () => {
    describe('#getCodeStructure', () => {
        it('should parse local variable declarations', () => {
            // Arrange
            const code = `
                public class MyClass {
                    public void myMethod() {
                        String localVar1 = null;
                        String localVar2 = null;
                        if (localVar1 == localVar2) {
                            MyClass nested = new MyClass();
                        } else {
                            OtherClass nested = new OtherClass();
                        }
                    }
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const [ myMethod ] = actualCodeStructure.classes[0].methods;
            expect(myMethod.localVariables.sort()).toMatchObject([
                { name: 'localVar1', type: { name: 'String', isSystemType: true } },
                { name: 'localVar2', type: { name: 'String', isSystemType: true } },
                { name: 'nested', type: { name: 'MyClass', isSystemType: false } },
                { name: 'nested', type: { name: 'OtherClass', isSystemType: false } },
            ]);
        });
        it('should parse class variable declarations', () => {
            // Arrange
            const code = `
                public class MyClass {
                    PRIVATE String classLocal1 = null;
                    protected String classLocal2 = null;
                    final MyClass nested = new MyClass();
                    protected static String staticValue = null;
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const [ myClass ] = actualCodeStructure.classes;
            expect(myClass.fields.sort()).toMatchObject([
                { name: 'classLocal1', access: 'private',  type: { name: 'String' } },
                { name: 'classLocal2', access: 'protected',type: { name: 'String' } },
                { name: 'nested', isFinal: true, type: { name: 'MyClass' } },
                { name: 'staticValue', isStatic: true, access: 'protected', type: { name: 'String' } },
            ]);
            expect(myClass.refs.map(r => r.name).sort()).toEqual(['MyClass', 'String' ]);
        });
        it('should parse implemented interfaces', () => {
            // Arrange
            const code = `
                public class MyClass implements Interface1, Interface2 {
                    public void myMethod() {
                    }
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const [ myClass ] = actualCodeStructure.classes;
            expect(myClass.implements.map(r => r.name).sort()).toEqual(['Interface1', 'Interface2']);
        });
        it('should parse properties', () => {
            // Arrange
            const code = `
                public class MyClass {

                    public String myProperty1 { get; set; } // Auto generated backing fields

                    public String myProperty2 {
                        get {
                            return null;
                        }
                    } // Readonly property
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const [ myClass ] = actualCodeStructure.classes;
            const [ myProperty1, myProperty2 ] = myClass.properties.sort();

            expect(myProperty1).toMatchObject({
                name: 'myProperty1',
                access: 'public',
                type: {
                    name: 'String',
                    isSystemType: true
                },
                sourceRange: {
                    start: { line: 4, column: 21 },
                    stop: { line: 4, column: 60 }
                }
            });

            expect(myProperty2).toMatchObject({
                name: 'myProperty2',
                access: 'public',
                type: {
                    name: 'String',
                    isSystemType: true
                },
                sourceRange: {
                    start: { line: 6, column: 21 },
                    stop: { line: 10, column: 22 }
                }
            });
        });
        it('should extract static member access as references', () => {
            // Arrange
            const code = `
                public class MyClass {
                    public void myMethod() {
                        String methodLocal = null;
                        ExternalClass1.externalMethod1();
                        this.localMethod2();
                        ExternalClass3.variable.method();
                    }
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const [ myClass ] = actualCodeStructure.classes;
            const [ myMethod ] = actualCodeStructure.classes[0].methods;
            expect(myMethod.refs.sort()).toMatchObject([
                { name: 'String', isSystemType: true },
                { name: 'ExternalClass1', isSystemType: false },
                { name: 'ExternalClass3', isSystemType: false }
            ]);
            expect(myClass.refs.map(r => r.name).sort()).toEqual([
                'ExternalClass1', 'ExternalClass3', 'String' 
            ]);
        });
        it('should extract constructed types as references', () => {
            // Arrange
            const code = `
                public class MyClass {
                    public void myMethod() {
                        for(Object a : new ExternalClass1().getThings()) {
                            new ExternalClass2().externalMethod1();
                        }
                    }
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const [ myMethod ] = actualCodeStructure.classes[0].methods;
            expect(myMethod.refs.sort()).toMatchObject([
                { name: 'ExternalClass1', isSystemType: false },
                { name: 'ExternalClass2', isSystemType: false }
            ]);
        });
        it('should extract parameters types passed to constructed as references', () => {
            // Arrange
            const code = `
                public class MyClass {
                    public void myMethod() {
                        new ExternalClass1(new ExternalClass2(new ExternalClass3()));
                    }
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const [ myClass ] = actualCodeStructure.classes;
            const [ myMethod ] = actualCodeStructure.classes[0].methods;
            expect(myMethod.refs.sort()).toMatchObject([
                { name: 'ExternalClass1', isSystemType: false },
                { name: 'ExternalClass2', isSystemType: false },
                { name: 'ExternalClass3', isSystemType: false }
            ]);
            expect(myClass.refs.map(r => r.name).sort()).toEqual([
                'ExternalClass1', 'ExternalClass2', 'ExternalClass3'
            ]);
        });
        it('should extract extended types as references', () => {
            // Arrange
            const code = `
                public class MyClass extends ExternalClass1 {
                    public void myMethod() {
                    }
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const [ myClass ] = actualCodeStructure.classes;
            expect(myClass.refs.map(r => r.name).sort()).toEqual(['ExternalClass1']);
        });
        it('should extract refs from property getter/setter', () => {
            // Arrange
            const code = `
                public class MyClass {
                    public String myProperty1 {
                        get {
                            return new ExternalClass1().externalMethod1();
                        }
                        set {
                            value.externalMethod2();
                            ExternalClass2.staticValue = value;
                            while(true) {
                                if (false) {
                                    new ExternalClass3().test(value);
                                }
                            }
                        }
                    }
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const [ myClass ] = actualCodeStructure.classes;
            const [ myProperty1 ] = actualCodeStructure.classes[0].properties;
            expect(myProperty1.getter!.refs!.sort()).toMatchObject([
                { name: 'ExternalClass1' },
            ]);
            expect(myProperty1.setter!.refs!.sort()).toMatchObject([
                { name: 'ExternalClass2' },
                { name: 'ExternalClass3' },
            ]);
            expect(myClass.refs.map(r => r.name).sort()).toEqual([
                'ExternalClass1', 'ExternalClass2', 'ExternalClass3', 'String'
            ]);
        });
        it('should parse ?? operator', () => {
            // Arrange
            const code = `
                public class MyClass {
                    public Object fn() {
                        return new BaseClass() ?? new OtherClass();
                    }
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const [ myClass ] = actualCodeStructure.classes;
            const [ fn ] = myClass.methods;
            expect(fn.refs.map(r => r.name).sort()).toEqual([
                'BaseClass', 'OtherClass'
            ]);
        });
    });
});