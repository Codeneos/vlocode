import { compileFunction } from '../compiler';

describe('Compiler', () => {
    it('should compile code using vm mode', () => {
        const code = 'return 1 + 1;';
        const compiledFn = compileFunction(code, { mode: 'vm' });
        expect(compiledFn).toBeInstanceOf(Function);

        const result = compiledFn();
        expect(result).toBe(2);
    });

    it('should compile code using sandbox mode', () => {
        const code = 'return 1 + 1;';
        const compiledFn = compileFunction(code, { mode: 'sandbox' });
        expect(compiledFn).toBeInstanceOf(Function);

        const result = compiledFn();
        expect(result).toBe(2);
    });

    it('should compile code with context', () => {
        const code = `return (message = message.replace('World', 'Vlocode'));`;
        const compiledFn = compileFunction(code, { mode: 'vm' });
        expect(compiledFn).toBeInstanceOf(Function);

        const context = { message: 'Hello, World!' };
        const result = compiledFn(context);
        expect(result).toBe('Hello, Vlocode!');
        expect(context.message).toBe('Hello, World!');
    });

    it('should compile code with mutable context', () => {
        const code = 'counter++;';
        const compiledFn = compileFunction(code, { mode: 'sandbox' });
        expect(compiledFn).toBeInstanceOf(Function);

        const context = { counter: 0 };
        const result = compiledFn(context, { mutableContext: true });
        expect(result).toBeUndefined();
        expect(context.counter).toBe(1);
    });

    it('should throw error when accessing undefined properties', () => {
        const code = 'counter2++;';
        const compiledFn = compileFunction(code, { mode: 'sandbox' });
        expect(compiledFn).toBeInstanceOf(Function);

        const context = { counter: 0 };
        let error: Error | undefined;
        try {
            compiledFn(context, { mutableContext: true, allowUndefined: false });
        } catch (e: any) {
            error = e;
        }
        expect(error).toBeDefined();
    });

    it('should not throw error when accessing undefined properties with allowUndefined = true', () => {
        const code = 'counter2 = 1;';
        const compiledFn = compileFunction(code, { mode: 'sandbox' });
        expect(compiledFn).toBeInstanceOf(Function);

        const context = { counter: 0 };
        let error: Error | undefined;
        try {
            compiledFn(context, { mutableContext: true, allowUndefined: true });
        } catch (e: any) {
            error = e;
        }
        expect(error).toBeUndefined();
        expect(context['counter2']).toBe(1);
    });
});