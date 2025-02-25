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
            const [ ifBlock, elseBlock ] = myMethod.blocks!;
            expect(myMethod.localVariables.sort()).toMatchObject([
                { name: 'localVar1', type: { name: 'String', isSystemType: true } },
                { name: 'localVar2', type: { name: 'String', isSystemType: true } }
            ]);
            expect(ifBlock.localVariables).toMatchObject([
                { name: 'nested', type: { name: 'MyClass' } }
            ]);
            expect(elseBlock.localVariables).toMatchObject([
                { name: 'nested', type: { name: 'OtherClass' } }
            ]);
            expect([...new Set(myMethod.refs.map(r => r.name))].sort()).toEqual([
                'MyClass', 'OtherClass', 'String'
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
        it('should not parse catch parameters as references', () => {
            // Arrange
            const code = `
                public class MyClass {
                    public void fn(String a) {
                        AuraHandledException ex = new AuraHandledException(new Class());
                        try {
                        } catch(AuraHandledException e) {
                            ex = e;
                        }
                        ex.Asserter.isNotNull(ex);
                        Assert.isNotNull(ex);
                    }
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const [ myClass ] = actualCodeStructure.classes;
            const [ fn ] = myClass.methods;
            expect(fn.name).toEqual('fn');
            expect(fn.parameters.length).toEqual(1);
            expect(fn.refs.map(r => r.name).sort()).toEqual([
                'Assert', 'AuraHandledException', 'AuraHandledException', 'Class', 'String'
            ]);
        });
        it('should not parse local variables as references', () => {
            // Arrange
            const code = `
                public class MyClass {
                    Object local1 = null;
                    public void fn(String a) {
                        if (local1 != null) {
                            local2.someProperty.fn();
                        } else {
                            local2 = this.local1;
                            local1 = new ExternalClass();
                        }
                    } 
                    Object local2 = null;
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const [ myClass ] = actualCodeStructure.classes;
            const [ fn ] = myClass.methods;
            expect(fn.name).toEqual('fn');
            expect(fn.parameters.length).toEqual(1);
            expect(fn.refs.map(r => r.name).sort()).toEqual([
                'ExternalClass', 'String'
            ]);
        });
        it('should include namespaces in parsed references', () => {
            // Arrange
            const code = `
                public class MyClass {
                    public void myMethod() {
                        System.Assert.isTrue(true, 'true');
                        OtherClass.Value = 1;
                    }
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const [ myMethod ] = actualCodeStructure.classes[0].methods;
            expect([...new Set(myMethod.refs.map(r => r.name))].sort()).toEqual([
                'OtherClass',
                'System.Assert'
            ]);
        });
        it('should parse abstract method', () => {
            // Arrange
            const code = `
                public abstract class MyClass {
                    public abstract void myMethod(String arg);
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const methods = actualCodeStructure.classes[0].methods;
            expect(methods.length).toEqual(1);
            expect(methods[0]).toMatchObject({ name: 'myMethod', isAbstract: true, returnType: { name: 'void' } });
            expect(methods[0].parameters).toMatchObject([{ name: 'arg', type: { name: 'String' } }]);
        });
        it('should parse array parameters correctly', () => {
            // Arrange
            const code = `
                public class MyClass {
                    public void myMethod(String[] args) { }
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const methods = actualCodeStructure.classes[0].methods;
            expect(methods.length).toEqual(1);
            expect(methods[0]).toMatchObject({ name: 'myMethod', returnType: { name: 'void' } });
            expect(methods[0].parameters).toMatchObject([{ name: 'args', type: { name: 'String', isArray: true } }]);
        });
        it('should parse generic Map-type parameters correctly', () => {
            // Arrange
            const code = `
                public class MyClass {
                    public void myMethod(Map<String, Object> args) { }
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const methods = actualCodeStructure.classes[0].methods;
            expect(methods.length).toEqual(1);
            expect(methods[0]).toMatchObject({ name: 'myMethod', returnType: { name: 'void' } });
            expect(methods[0].parameters).toMatchObject([{ name: 'args', type: { name: 'Map' } }]);
            expect(methods[0].parameters[0].type.genericArguments).toMatchObject([
                { name: 'String', isSystemType: true },
                { name: 'Object', isSystemType: true }
            ]);
        });
        it('should parse nested generic types parameters correctly', () => {
            // Arrange
            const code = `
                public class MyClass {
                    public void myMethod(List<Map<String, String[]>> args) { }
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const methods = actualCodeStructure.classes[0].methods;
            expect(methods.length).toEqual(1);
            expect(methods[0]).toMatchObject({ name: 'myMethod', returnType: { name: 'void' } });
            expect(methods[0].parameters).toMatchObject([{ name: 'args', type: { name: 'List' } }]);
            expect(methods[0].parameters[0].type.genericArguments).toMatchObject([
                { name: 'Map' }
            ]);
            expect(methods[0].parameters[0].type.genericArguments?.[0].genericArguments).toMatchObject([
                { name: 'String', isSystemType: true },
                { name: 'String', isArray: true }
            ]);
        });
        it('should parse interfaces', () => {
            // Arrange
            const code = `
                public interface MyInterface {
                    String myMethod1();
                    void myMethod2(String myArg);
                    void myMethod3(String[] args);
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            const methods = actualCodeStructure.interfaces[0].methods;
            expect(methods.length).toEqual(3);
            expect(methods[0]).toMatchObject({ name: 'myMethod1', returnType: { name: 'String' } });
            expect(methods[1]).toMatchObject({ name: 'myMethod2', returnType: { name: 'void' } });
            expect(methods[2]).toMatchObject({ name: 'myMethod3', returnType: { name: 'void' } });
            expect(methods[1].parameters).toMatchObject([{ name: 'myArg', type: { name: 'String', isArray: false } }]);
            expect(methods[2].parameters).toMatchObject([{ name: 'args', type: { name: 'String', isArray: true } }]);
        });

        it('should parse trigger', () => {
            // Arrange
            const code = `
                trigger MyTrigger on MyObject__c (after insert) {
                    new TriggerDispatcher(
                        new TriggerEventHandler(new MyHandler(), -1, false)
                    ).dispatch();
                }
            `;

            // Act
            const actualCodeStructure = new Parser(code).getCodeStructure();

            // Assert
            expect(actualCodeStructure.triggers?.length).toEqual(1);
            expect(actualCodeStructure.triggers?.[0]).toMatchObject({
                name: 'MyTrigger',
                sobject: 'MyObject__c'
            });
            expect(actualCodeStructure.triggers?.[0].triggerEvents).toMatchObject([
                { type: 'after', operation: 'insert' }
            ]);
        });
    });
});