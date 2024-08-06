import * as vm from 'vm';
import { singleton } from './singleton';
import { cache } from './cache';
import { unique } from './collection';
import { randomUUID } from 'crypto';

/**
 * Helper to allow cache decorator to be used for compiled code
 */
class Compiler {

    @cache({ unwrapPromise: true })
    public compile(code: string, options?: { mode: 'vm' | 'sandbox' }) : (context?: any, contextMutable?: boolean) => any {
        let compiledFn : (context: any) => any;
        if (options?.mode === 'sandbox') {
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            compiledFn = new Function('context', `with (context) { ${code}; }`) as typeof compiledFn;
        } else {
            const resultVar = '_' + randomUUID().replace(/-/g, '');
            const script = new vm.Script(`${resultVar} = (() => { with (context) { ${code}; } })()`);
            compiledFn = (context) => {
                const scriptContext = {
                    context,
                    [resultVar]: undefined
                };
                vm.createContext(scriptContext);
                script.runInContext(scriptContext);
                return scriptContext[resultVar];
            } 
        }

        return function (context?: any, contextMutable?: boolean): any {
            const sandboxValues = {};
            const sandboxContext = new Proxy(context, {
                get(target, prop) {
                    return sandboxValues[prop] ?? target[prop];
                },
                set(target, prop, value) {
                    (contextMutable ? target : sandboxValues)[prop] = value;
                    return true;
                },
                getOwnPropertyDescriptor(target, prop) {
                    return sandboxValues[prop] !== undefined 
                        ? Reflect.getOwnPropertyDescriptor(sandboxValues, prop) 
                        : Reflect.getOwnPropertyDescriptor(target, prop) 
                },
                ownKeys(target) {
                    return contextMutable 
                        ? Reflect.ownKeys(target) 
                        : [
                            ...unique([
                                ...Reflect.ownKeys(target), 
                                ...Reflect.ownKeys(sandboxValues)
                            ])
                        ];
                }
            });
            return compiledFn(sandboxContext);
        };
    }
}

/**
 * Compiles the specified code as sandboxed function. The compiled function can be executed with a context object.
 * Optionally the context object can be mutable, allowing the compiled code to modify the context object.
 *
 * @usage
 * ```typescript
 * const context = { counter: 0 };
 * const code = 'return context.coounter++;';
 * const compiledFn = compileFunction(code, { mode: 'sandbox' });
 * expect(compiledFn(context, true)).toBe(1);
 * expect(context.counter).toBe(1);
 * ````
 *
 * @param code JS code
 * @param options specifies how to compile the function
 * @returns 
 */
export function compileFunction(code: string, options?: { mode: 'vm' | 'sandbox' }) {
    return singleton(Compiler).compile(code, options);
}