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
        const code = `return (context.message = context.message.replace('World', 'Vlocode'));`;
        const compiledFn = compileFunction(code, { mode: 'vm' });
        expect(compiledFn).toBeInstanceOf(Function);

        const context = { message: 'Hello, World!' };
        const result = compiledFn(context);
        expect(result).toBe('Hello, Vlocode!');
        expect(context.message).toBe('Hello, World!');
    });

    it('should compile code with mutable context', () => {
        const code = 'context.counter++;';
        const compiledFn = compileFunction(code, { mode: 'sandbox' });
        expect(compiledFn).toBeInstanceOf(Function);

        const context = { counter: 0 };
        const result = compiledFn(context, true);
        expect(result).toBeUndefined();
        expect(context.counter).toBe(1);
    });
});