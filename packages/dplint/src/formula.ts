import { JsonObject } from './types';

type Value = string | number | boolean | null | undefined;
type Expression = (record: JsonObject) => Value;
interface Token { text: string; position: number; kind: 'number' | 'string' | 'name' | 'symbol' | 'end' }

const functions: Record<string, { min: number; max: number; run: (...args: Value[]) => Value }> = {
    ISBLANK: { min: 1, max: 1, run: v => v === null || v === undefined || v === '' },
    BLANKVALUE: { min: 2, max: 2, run: (v, fallback) => v === null || v === undefined || v === '' ? fallback : v },
    TEXT: { min: 1, max: 1, run: v => String(v ?? '') },
    VALUE: { min: 1, max: 1, run: v => number(v) },
    LEN: { min: 1, max: 1, run: v => string(v).length },
    LOWER: { min: 1, max: 1, run: v => string(v).toLowerCase() },
    UPPER: { min: 1, max: 1, run: v => string(v).toUpperCase() },
    TRIM: { min: 1, max: 1, run: v => string(v).trim() },
    CONTAINS: { min: 2, max: 2, run: (v, search) => string(v).includes(string(search)) },
    BEGINS: { min: 2, max: 2, run: (v, search) => string(v).startsWith(string(search)) },
    ISPICKVAL: { min: 2, max: 2, run: (v, expected) => v === expected },
    ABS: { min: 1, max: 1, run: v => Math.abs(number(v)) },
    MIN: { min: 1, max: Infinity, run: (...args) => Math.min(...args.map(number)) },
    MAX: { min: 1, max: Infinity, run: (...args) => Math.max(...args.map(number)) }
};

function number(value: Value): number {
    if ((typeof value !== 'number' && typeof value !== 'string') || value === '' || !Number.isFinite(Number(value))) {
        throw new Error(`Expected a finite number, received ${String(value)}`);
    }
    return Number(value);
}

function string(value: Value): string {
    if (value === null || value === undefined) { return ''; }
    if (typeof value !== 'string') { throw new Error('Expected text; use TEXT() to convert values'); }
    return value;
}

export function formulaBoolean(value: unknown): boolean {
    if (typeof value !== 'boolean') { throw new Error(`Expected a Boolean result, received ${String(value)}`); }
    return value;
}

/** Compile a small, deterministic Salesforce-style expression without executing JavaScript. */
export function compileFormula(source: string): Expression {
    const tokens: Token[] = [];
    const pattern = /\s+|\d+(?:\.\d+)?|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*|<>|!=|<=|>=|==|&&|\|\||[=<>+*/&!(),%-]/gy;
    let offset = 0;
    while (offset < source.length) {
        pattern.lastIndex = offset;
        const match = pattern.exec(source);
        if (!match) { throw new Error(`Unexpected character at column ${offset + 1}`); }
        const text = match[0];
        if (!/^\s/.test(text)) {
            tokens.push({ text, position: offset, kind: /^\d/.test(text) ? 'number' : /^["']/.test(text) ? 'string' : /^[A-Za-z_$]/.test(text) ? 'name' : 'symbol' });
        }
        offset = pattern.lastIndex;
    }
    tokens.push({ text: '', position: offset, kind: 'end' });
    let cursor = 0;
    const peek = () => tokens[cursor].text.toUpperCase();
    const take = () => tokens[cursor++];
    const expect = (text: string) => {
        if (peek() !== text) { throw new Error(`Expected ${text} at column ${tokens[cursor].position + 1}`); }
        take();
    };
    const precedence: Record<string, number> = { OR: 1, '||': 1, AND: 2, '&&': 2, '=': 3, '==': 3, '!=': 3, '<>': 3, '<': 3, '>': 3, '<=': 3, '>=': 3, '&': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6 };

    function primary(): Expression {
        const token = take();
        const name = token.text.toUpperCase();
        if (token.kind === 'number') { return () => Number(token.text); }
        if (token.kind === 'string') {
            const value = token.text.slice(1, -1).replace(/\\([\\"'nrt])/g, (_, char: string) => ({ n: '\n', r: '\r', t: '\t' }[char] ?? char));
            return () => value;
        }
        if (name === '(') { const inner = expression(); expect(')'); return inner; }
        if (['!', 'NOT', '-', '+'].includes(name)) {
            const inner = expression(7);
            return r => name === '-' ? -number(inner(r)) : name === '+' ? number(inner(r)) : !formulaBoolean(inner(r));
        }
        if (token.kind !== 'name') { throw new Error(`Expected an expression at column ${token.position + 1}`); }
        if (peek() === '(') {
            take();
            const args: Expression[] = [];
            if (peek() !== ')') {
                args.push(expression());
                while (peek() === ',') { take(); args.push(expression()); }
            }
            expect(')');
            const special = { IF: [3, 3], AND: [1, Infinity], OR: [1, Infinity] }[name];
            const fn = Object.hasOwn(functions, name) ? functions[name] : undefined;
            if (!special && !fn) { throw new Error(`Unknown function ${name}`); }
            const [min, max] = special ?? [fn!.min, fn!.max];
            if (args.length < min || args.length > max) { throw new Error(`Invalid argument count for ${name}`); }
            if (name === 'IF') { return r => formulaBoolean(args[0](r)) ? args[1](r) : args[2](r); }
            if (name === 'AND') { return r => args.every(arg => formulaBoolean(arg(r))); }
            if (name === 'OR') { return r => args.some(arg => formulaBoolean(arg(r))); }
            return r => fn!.run(...args.map(arg => arg(r)));
        }
        if (name === 'TRUE' || name === 'FALSE' || name === 'NULL') { return () => name === 'NULL' ? null : name === 'TRUE'; }
        const fields = token.text.replace(/^\$Record\./i, '').split('.');
        return record => {
            let value: unknown = record;
            for (const field of fields) {
                if (!value || typeof value !== 'object') { return undefined; }
                const key = Object.keys(value).find(key => key.toLowerCase() === field.toLowerCase());
                value = key === undefined ? undefined : value[key];
            }
            if (value !== null && typeof value === 'object') { throw new Error(`Field ${token.text} is not a scalar value`); }
            return value as Value;
        };
    }

    function expression(min = 1): Expression {
        let left = primary();
        while (Object.hasOwn(precedence, peek()) && precedence[peek()] >= min) {
            const op = take().text.toUpperCase();
            const a = left;
            const b = expression(precedence[op] + 1);
            left = r => {
                const x = a(r);
                if (op === 'AND' || op === '&&') { return formulaBoolean(x) && formulaBoolean(b(r)); }
                if (op === 'OR' || op === '||') { return formulaBoolean(x) || formulaBoolean(b(r)); }
                const y = b(r);
                switch (op) {
                    case '=': case '==': return (x ?? null) === (y ?? null);
                    case '!=': case '<>': return (x ?? null) !== (y ?? null);
                    case '&': return String(x ?? '') + String(y ?? '');
                    case '+': return number(x) + number(y);
                    case '-': return number(x) - number(y);
                    case '*': return number(x) * number(y);
                    case '/': case '%':
                        if (number(y) === 0) { throw new Error('Division by zero'); }
                        return op === '/' ? number(x) / number(y) : number(x) % number(y);
                    case '<': return number(x) < number(y);
                    case '>': return number(x) > number(y);
                    case '<=': return number(x) <= number(y);
                    case '>=': return number(x) >= number(y);
                    default: throw new Error(`Unknown operator ${op}`);
                }
            };
        }
        return left;
    }
    const result = expression();
    if (tokens[cursor].kind !== 'end') { throw new Error(`Unexpected token at column ${tokens[cursor].position + 1}`); }
    return result;
}
