//type Constructor<T extends new (...args: any) => any> = new (...args: any[]) => InstanceType<T>;
type Constructor = new (...args: any[]) => any;

export abstract class Decorator<T extends Constructor>{ 
    protected inner: InstanceType<T>;
}

/**
 * Extend a class with a decorate(ClassName) to create a decorator class that accepts any original target of T and returns
 * a decorated class that by default redirects all calls to the target of the decorator (called inner) and allows the decorator itself to
 * extend the original class overriding any function.
 * 
 * The benefit of this is that you don't need ot manually redirect all calls not decorated to the decorator and that you don't need to define an
 * interface.
 * 
 * This class is fully TS compatible and will provided valid TypeScript type hinting about the decorated class, the inner class property as well as
 * 
 * Sample:
 * ```js
 * class Foo { 
 *   constructor(public name: string) { }
 *   getName() { return `Foo's name: ${this.name}` }
 * }
 * 
 * class FooDecorator extends decorate(Foo) {
 *   getName() { return `Foo's Decorated name: ${this.name?.toUpperCase()}` }
 * }
 * 
 * const foo = new FooDecorator(new Foo('bar'));
 * foo.getName();
 * ```
 * 
 * @param classProto Class prototype to decorate
 * @returns 
 */
export function decorate<T extends Constructor>(classProto: T): new (inner: InstanceType<T>) => InstanceType<T> & Decorator<T> {
    // @ts-ignore
    return class Decorator {
        constructor(protected inner: InstanceType<T>) {
            return new Proxy(this, {
                get: (target, p) => {
                    if (p === 'inner') {
                        return inner;
                    }
                    return target[p] ?? inner[p];
                },
                set: (target, p, value) => {
                    if (inner[p]) {
                        inner[p] = value;
                    } else {
                        target[p] = value;
                    }
                    return true;
                },
                getPrototypeOf: () => Object.getPrototypeOf(inner),
                preventExtensions: () => true,
                ownKeys: (target) => [...new Set([...Reflect.ownKeys(inner), ...Reflect.ownKeys(target)])]
            });
        }
    };
}

// class Foo { 
//   constructor(public name: string) { }
//   getName() { return `Foo's name: ${this.name}` }
// }

// class FooDecorator extends decorate(Foo) {
//   getName() { return `Foo's Decorated name: ${this.name?.toUpperCase()}` }
// }

// const foo = new FooDecorator(new Foo('bar'));