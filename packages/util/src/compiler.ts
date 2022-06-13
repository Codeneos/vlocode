import * as vm from 'vm';
import { singleton } from './singleton';
import { cache } from './cache';

/**
 * Helper to allow cache decorator to be used for compiled code
 */
class Compiler {

    @cache({ unwrapPromise: true })
    public compile(code: string, options?: { mode: 'vm' | 'sandbox' }) : (context?: any, contextMutable?: boolean) => any {
        let compiledFn : (context: any) => any;
        if (options?.mode === 'sandbox') {
            compiledFn = new Function('sandbox', `with (context) { ${code} }`) as typeof compiledFn;
        } else {
            const script = new vm.Script(code);
            compiledFn = script.runInNewContext.bind(script);
        }

        return function (context?: any, contextMutable?: boolean) {
            const sandboxValues = contextMutable ? context : {};
            const sandboxContext = new Proxy(context ?? {}, {
                get(target, prop) {
                    return sandboxValues[prop] ?? target[prop];
                },
                set(target, prop, value) {
                    sandboxValues[prop] = value;
                    return true;
                }
            });
            compiledFn(sandboxContext);
            return sandboxValues;
        };
    }
}

/**
 * Compiles the specified code as sandboxed function 
 * @param code JS code
 * @param options specifies how to compile the function
 * @returns 
 */
export function compileFunction(code: string, options?: { mode: 'vm' | 'sandbox' }) {
    return singleton(Compiler).compile(code, options);
}