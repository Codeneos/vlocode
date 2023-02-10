/* eslint-disable @typescript-eslint/require-await */
import 'jest';
import { afterHook, beforeHook, decorate, errorHook } from '../decorator';

describe('decorator', () => {
    it('should override the original function of the decorated class', () => {
        class Foo {
            constructor(public name: string) { }
            getName() { return `Foo's name: ${this.name}` }
        }

        const decorated = class extends decorate(Foo) {
            getName() { return `Foo's Decorated name: ${this.name?.toUpperCase()}` }
        }
        
        const sut = new decorated(new Foo('bar'));

        expect(sut.name).toEqual('bar');
        expect(sut.getName()).toEqual(`Foo's Decorated name: BAR`);
    });
    it('should return true when using instanceof against the original class', () => {
        class Foo { }
        const decorated = class extends decorate(Foo) { }

        expect(new decorated(new Foo()) instanceof Foo).toBe(true);
    });
    it('should return true for has..in extended properties', () => {
        class Foo { public fooProp = 'foo'; }
        const decorated = class extends decorate(Foo) { public barProp = 'foo'; }

        expect('barProp' in new decorated(new Foo())).toBe(true);
        expect('fooProp' in new decorated(new Foo())).toBe(true);
    });
    it('should allow calling original methods', () => {
        class Foo { foo() { return `foo`; } }
        const decorated = class extends decorate(Foo) { bar() { return `bar`; } }

        expect(new decorated(new Foo()).foo()).toBe('foo');
        expect(new decorated(new Foo()).bar()).toBe('bar');
    });
    it('should be able to call overwritten methods on base class using super keyword', () => {
        class Foo { bar() { return `foo`; } }
        const decorated = class extends decorate(Foo) { bar() { return `bar: ${super.bar()}`; } }

        expect(new decorated(new Foo()).bar()).toBe('bar: foo');
    });
    it('should call before hook when defined', () => {
        class Foo { bar() { return `foo`; } }
        const decorated = class extends decorate(Foo) { 
            public counter = 0;
            protected [beforeHook](): void {
                this.counter++;
            } 
        }

        const sut = new decorated(new Foo());

        expect(sut.bar()).toBe('foo');
        expect(sut.counter).toBe(1);
    });
    it('should call after hook when defined', () => {
        class Foo { bar() { return `foo`; } }
        const decorated = class extends decorate(Foo) { 
            protected [afterHook](name: string, _args: any[], result: any): any {
                if (typeof result === 'string') {
                    return result.toUpperCase();
                }
                return result;
            } 
        }
        expect(new decorated(new Foo()).bar()).toBe('FOO');
    });
    it('should call after hook when defined', () => {
        class Foo { bar() { throw new Error('foo') } }
        const decorated = class extends decorate(Foo) { 
            protected [errorHook](name: string, _args: any[], error: any): any {
                return `ERR ${name}: ${error.message}`;
            }
        }
        expect(new decorated(new Foo()).bar()).toBe('ERR bar: foo');
    });
    it('should access inner class through inner property', () => {
        class Foo { foo() { return `foo`; } }
        const decorated = class extends decorate(Foo) { bar() { return `bar`; } }
        
        const sut = new decorated(new Foo());

        expect(sut['inner']).toBeInstanceOf(Foo);
        expect(sut['inner'].foo()).toBe('foo');
    });
    it('should be able to get inner class values through property', () => {
        class Foo { public value = 'a' }
        const decorated = class extends decorate(Foo) { 
            public get b() { return this.value; }
            public a = 'b';
            public c = 'b';

            constructor(inner: Foo) { 
                super(inner); 
                this.a = this.b;
                this.c = this.value;
            } 
        }
        
        const sut = new decorated(new Foo());

        expect(sut.b).toBe('a');
        expect(sut.c).toBe('a');
        expect(sut.a).toBe('a');
    });
    it('should be able to set inner class values through property', () => {
        class Foo { public value = 'a' }
        const decorated = class extends decorate(Foo) { 
            public get b() { return this.value; }
            public set b(value) { this.value = value; }
            constructor(inner: Foo) { 
                super(inner);
            } 
        }
        
        const inner = new Foo();
        const sut = new decorated(inner);

        sut.b = 'b';
        expect(inner.value).toBe('b');
        expect(sut.b).toBe('b');
    });
    it('should be able to delete properties', () => {
        class Foo { public value: string | undefined = 'a' }
        const decorated = class extends decorate(Foo) { 
            constructor(inner: Foo) { 
                super(inner);
                delete this.value;
            } 
        }
        
        const inner = new Foo();
        const sut = new decorated(inner);

        expect(inner.value).toBe(undefined);
        expect(sut.value).toBe(undefined);
    });
    it('should be able to define properties in decorated class', () => {
        class Foo { }
        const decorated = class extends decorate(Foo) {  }
        
        const inner = new Foo();
        const sut = new decorated(inner);

        Object.defineProperty(sut, 'prop', { value: 'test' });

        expect(inner['prop']).toBe(undefined);
        expect(sut['prop']).toBe('test');
        expect('prop' in inner).toBe(false);
        expect('prop' in sut).toBe(true);
    });
    it('should be able to access dynamically defined properties on inner class after creation', () => {
        class Foo { }
        const decorated = class extends decorate(Foo) {  }
        
        const inner = new Foo();
        const sut = new decorated(inner);

        Object.defineProperty(inner, 'prop', { value: 'test' });

        expect(inner['prop']).toBe('test');
        expect(sut['prop']).toBe('test');
        expect('prop' in inner).toBe(true);
        expect('prop' in sut).toBe(true);
    });
});