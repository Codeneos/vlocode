import { randomUUID } from 'crypto';
import { getDataMapperPathValue } from './path';
import type { DataMapperFormulaContext } from './types';

export type DataMapperFormulaNode =
    | { type: 'literal'; value: unknown }
    | { type: 'variable'; path: string }
    | { type: 'unary'; operator: string; argument: DataMapperFormulaNode }
    | { type: 'binary'; operator: string; left: DataMapperFormulaNode; right: DataMapperFormulaNode }
    | { type: 'call'; name: string; args: DataMapperFormulaNode[] };

type TokenType = 'number' | 'string' | 'identifier' | 'variable' | 'operator' | 'paren' | 'comma' | 'eof';

interface FormulaToken {
    readonly type: TokenType;
    readonly value: string;
}

interface FunctionRuntimeContext extends DataMapperFormulaContext {
    evaluator: DataMapperFormulaEvaluator;
}

const binaryPrecedence = new Map<string, number>([
    ['OR', 1], ['||', 1],
    ['AND', 2], ['&&', 2],
    ['LIKE', 3], ['NOTLIKE', 3], ['~=', 3],
    ['=', 4], ['==', 4], ['!=', 4], ['<>', 4],
    ['<', 5], ['<=', 5], ['>', 5], ['>=', 5],
    ['+', 6], ['-', 6],
    ['*', 7], ['/', 7], ['%', 7],
    ['^', 8]
]);

export class DataMapperFormulaEvaluator {
    public parse(expression: string): DataMapperFormulaNode {
        return new FormulaParser(expression).parse();
    }

    public dependencies(expression: string): string[] {
        const paths = new Set<string>();
        this.visit(this.parse(expression), node => {
            if (node.type === 'variable') {
                if (resolveFormulaConstant(node.path) === undefined) {
                    paths.add(node.path);
                }
            }
        });
        return [...paths];
    }

    public async evaluate(expression: string, context: DataMapperFormulaContext): Promise<unknown> {
        return this.evaluateAst(this.parse(expression), context);
    }

    public async evaluateAst(node: DataMapperFormulaNode, context: DataMapperFormulaContext): Promise<unknown> {
        switch (node.type) {
            case 'literal':
                return node.value;
            case 'variable':
                {
                    const value = context.resolvePath(node.path);
                    return value === undefined ? resolveFormulaConstant(node.path) : value;
                }
            case 'unary':
                return this.evaluateUnary(node.operator, await this.evaluateAst(node.argument, context));
            case 'binary':
                return this.evaluateBinary(node.operator, await this.evaluateAst(node.left, context), await this.evaluateAst(node.right, context));
            case 'call':
                return this.evaluateCall(node, context);
        }
    }

    private async evaluateCall(node: Extract<DataMapperFormulaNode, { type: 'call' }>, context: DataMapperFormulaContext): Promise<unknown> {
        const name = node.name.toUpperCase();
        const runtimeContext: FunctionRuntimeContext = { ...context, evaluator: this };
        if (name === 'IF') {
            const condition = await this.evaluateAst(node.args[0], context);
            return this.truthy(condition)
                ? node.args[1] ? this.evaluateAst(node.args[1], context) : undefined
                : node.args[2] ? this.evaluateAst(node.args[2], context) : undefined;
        }
        if (name === 'FILTER') {
            return this.evaluateFilter(node.args, context);
        }
        if (name === 'FUNCTION') {
            const args = await Promise.all(node.args.map(arg => this.evaluateAst(arg, context)));
            if (!context.functionRegistry) {
                const functionName = String(args[0] ?? '');
                throw new Error(`DataMapper FUNCTION(${functionName}) requires a functionRegistry`);
            }
            const [functionName, functionArgs] = normalizeFunctionInvocation(args);
            return context.functionRegistry.invoke(functionName, functionArgs, context);
        }
        const args = await Promise.all(node.args.map(arg => this.evaluateAst(arg, context)));
        const fn = formulaFunctions[name];
        if (!fn) {
            throw new Error(`Unsupported DataMapper formula function: ${node.name}`);
        }
        return fn(args, runtimeContext);
    }

    private async evaluateFilter(args: readonly DataMapperFormulaNode[], context: DataMapperFormulaContext): Promise<unknown[]> {
        const list = toArrayValue(await this.evaluateAst(args[0], context));
        const predicate = args[1];
        if (!predicate) {
            return list;
        }
        const filtered = new Array<unknown>();
        for (const [index, item] of list.entries()) {
            const predicateValue = await this.evaluateAst(predicate, {
                ...context,
                source: item,
                resolvePath: path => {
                    const itemValue = getDataMapperPathValue(item, path, { arrayIndex: index });
                    return itemValue === undefined ? context.resolvePath(path) : itemValue;
                }
            });
            if (this.truthy(predicateValue)) {
                filtered.push(item);
            }
        }
        return filtered;
    }

    private evaluateUnary(operator: string, value: unknown): unknown {
        switch (operator.toUpperCase()) {
            case '!':
            case 'NOT':
                return !this.truthy(value);
            case '-':
                return -toNumber(value);
            case '+':
                return toNumber(value);
            default:
                throw new Error(`Unsupported unary operator: ${operator}`);
        }
    }

    private evaluateBinary(operator: string, left: unknown, right: unknown): unknown {
        switch (operator.toUpperCase()) {
            case '+':
                return typeof left === 'string' || typeof right === 'string' ? `${left ?? ''}${right ?? ''}` : toNumber(left) + toNumber(right);
            case '-':
                return toNumber(left) - toNumber(right);
            case '*':
                return toNumber(left) * toNumber(right);
            case '/':
                return toNumber(left) / toNumber(right);
            case '%':
                return toNumber(left) % toNumber(right);
            case '^':
                return Math.pow(toNumber(left), toNumber(right));
            case '=':
            case '==':
                return compare(left, right) === 0;
            case '~=':
                return compare(left, right) === 0;
            case '!=':
            case '<>':
                return compare(left, right) !== 0;
            case '<':
                return compare(left, right) < 0;
            case '<=':
                return compare(left, right) <= 0;
            case '>':
                return compare(left, right) > 0;
            case '>=':
                return compare(left, right) >= 0;
            case 'AND':
            case '&&':
                return this.truthy(left) && this.truthy(right);
            case 'OR':
            case '||':
                return this.truthy(left) || this.truthy(right);
            case 'LIKE':
                return containsIgnoreCase(left, right);
            case 'NOTLIKE':
                return !containsIgnoreCase(left, right);
            default:
                throw new Error(`Unsupported binary operator: ${operator}`);
        }
    }

    private truthy(value: unknown) {
        return !(value === false || value === null || value === undefined || value === '' || value === 0);
    }

    private visit(node: DataMapperFormulaNode, visitor: (node: DataMapperFormulaNode) => void): void {
        visitor(node);
        if (node.type === 'unary') {
            this.visit(node.argument, visitor);
        } else if (node.type === 'binary') {
            this.visit(node.left, visitor);
            this.visit(node.right, visitor);
        } else if (node.type === 'call') {
            node.args.forEach(arg => this.visit(arg, visitor));
        }
    }
}

class FormulaParser {
    private readonly tokens: FormulaToken[];
    private index = 0;

    constructor(expression: string) {
        this.tokens = new FormulaTokenizer(expression).tokenize();
    }

    public parse(): DataMapperFormulaNode {
        const expression = this.parseExpression(0);
        this.expect('eof');
        return expression;
    }

    private parseExpression(minPrecedence: number): DataMapperFormulaNode {
        let left = this.parsePrefix();
        for (;;) {
            const token = this.peek();
            if (token.type !== 'operator' && !this.isWordOperator(token)) {
                break;
            }
            const operator = token.value.toUpperCase();
            const precedence = binaryPrecedence.get(operator);
            if (precedence === undefined || precedence < minPrecedence) {
                break;
            }
            this.next();
            const right = this.parseExpression(precedence + 1);
            left = { type: 'binary', operator: token.value, left, right };
        }
        return left;
    }

    private parsePrefix(): DataMapperFormulaNode {
        const token = this.next();
        if (token.type === 'number') {
            return { type: 'literal', value: Number(token.value) };
        }
        if (token.type === 'string') {
            return { type: 'literal', value: token.value };
        }
        if (token.type === 'variable') {
            return { type: 'variable', path: token.value };
        }
        if (token.type === 'operator' && ['!', '-', '+'].includes(token.value)) {
            return { type: 'unary', operator: token.value, argument: this.parseExpression(9) };
        }
        if (this.isWordOperator(token) && token.value.toUpperCase() === 'NOT') {
            return { type: 'unary', operator: token.value, argument: this.parseExpression(9) };
        }
        if (token.type === 'identifier') {
            const upper = token.value.toUpperCase();
            if (upper === 'TRUE') {
                return { type: 'literal', value: true };
            }
            if (upper === 'FALSE') {
                return { type: 'literal', value: false };
            }
            if (upper === 'NULL' || upper === '$VLOCITY.NULL') {
                return { type: 'literal', value: null };
            }
            if (this.accept('paren', '(')) {
                const args = new Array<DataMapperFormulaNode>();
                if (!this.accept('paren', ')')) {
                    do {
                        args.push(this.parseExpression(0));
                    } while (this.accept('comma'));
                    this.expect('paren', ')');
                }
                return { type: 'call', name: token.value, args };
            }
            return { type: 'variable', path: token.value };
        }
        if (token.type === 'paren' && token.value === '(') {
            const expression = this.parseExpression(0);
            this.expect('paren', ')');
            return expression;
        }
        throw new Error(`Unexpected token in DataMapper formula: ${token.value}`);
    }

    private isWordOperator(token: FormulaToken) {
        return token.type === 'identifier' && ['AND', 'OR', 'NOT', 'LIKE', 'NOTLIKE'].includes(token.value.toUpperCase());
    }

    private accept(type: TokenType, value?: string) {
        const token = this.peek();
        if (token.type === type && (value === undefined || token.value === value)) {
            this.index++;
            return true;
        }
        return false;
    }

    private expect(type: TokenType, value?: string) {
        const token = this.next();
        if (token.type !== type || (value !== undefined && token.value !== value)) {
            throw new Error(`Expected ${value ?? type} but found ${token.value}`);
        }
        return token;
    }

    private peek() {
        return this.tokens[this.index];
    }

    private next() {
        return this.tokens[this.index++];
    }
}

class FormulaTokenizer {
    private index = 0;

    constructor(private readonly expression: string) {
    }

    public tokenize(): FormulaToken[] {
        const tokens = new Array<FormulaToken>();
        while (this.index < this.expression.length) {
            const char = this.expression[this.index];
            if (/\s/.test(char)) {
                this.index++;
                continue;
            }
            if (char === ',') {
                tokens.push({ type: 'comma', value: char });
                this.index++;
                continue;
            }
            if (char === '(' || char === ')') {
                tokens.push({ type: 'paren', value: char });
                this.index++;
                continue;
            }
            if (char === '\'' || char === '"') {
                tokens.push({ type: 'string', value: this.readString(char) });
                continue;
            }
            if (char === '%' && this.expression.indexOf('%', this.index + 1) !== -1) {
                tokens.push({ type: 'variable', value: this.readPercentVariable() });
                continue;
            }
            if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(this.expression[this.index + 1]))) {
                tokens.push({ type: 'number', value: this.readNumber() });
                continue;
            }
            const operator = this.readOperator();
            if (operator) {
                tokens.push({ type: 'operator', value: operator });
                continue;
            }
            tokens.push({ type: 'identifier', value: this.readIdentifier() });
        }
        tokens.push({ type: 'eof', value: '<eof>' });
        return tokens;
    }

    private readString(quote: string) {
        this.index++;
        let value = '';
        while (this.index < this.expression.length) {
            const char = this.expression[this.index++];
            if (char === '\\') {
                value += this.expression[this.index++] ?? '';
            } else if (char === quote) {
                return value;
            } else {
                value += char;
            }
        }
        throw new Error('Unterminated string literal in DataMapper formula');
    }

    private readPercentVariable() {
        this.index++;
        const start = this.index;
        while (this.index < this.expression.length && this.expression[this.index] !== '%') {
            this.index++;
        }
        if (this.expression[this.index] !== '%') {
            throw new Error('Unterminated percent path in DataMapper formula');
        }
        const value = this.expression.slice(start, this.index);
        this.index++;
        return value;
    }

    private readNumber() {
        const start = this.index;
        while (/[0-9.]/.test(this.expression[this.index] ?? '')) {
            this.index++;
        }
        return this.expression.slice(start, this.index);
    }

    private readOperator() {
        const candidates = ['&&', '||', '==', '!=', '<=', '>=', '<>', '~=', '+', '-', '*', '/', '%', '^', '=', '<', '>', '!'];
        const operator = candidates.find(candidate => this.expression.startsWith(candidate, this.index));
        if (operator) {
            this.index += operator.length;
        }
        return operator;
    }

    private readIdentifier() {
        const start = this.index;
        while (this.index < this.expression.length && !/[\s(),+\-*/%^=!<>~]/.test(this.expression[this.index])) {
            this.index++;
        }
        if (start === this.index) {
            throw new Error(`Unexpected character in DataMapper formula: ${this.expression[this.index]}`);
        }
        return this.expression.slice(start, this.index);
    }
}

type FormulaFunction = (args: unknown[], context: FunctionRuntimeContext) => unknown | Promise<unknown>;

const formulaFunctions: Record<string, FormulaFunction> = {
    ABS: args => Math.abs(toNumber(args[0])),
    ADDDAY: args => addDate(args[0], { days: toNumber(args[1]) }),
    ADDMONTH: args => addDate(args[0], { months: toNumber(args[1]) }),
    ADDYEAR: args => addDate(args[0], { years: toNumber(args[1]) }),
    AGE: (args, context) => age(args[0], currentDate(context)),
    AGEON: args => age(args[0], toDate(args[1])),
    AVG: args => average(flattenValues(args)),
    BASE64ENCODE: args => Buffer.from(String(args[0] ?? ''), 'utf8').toString('base64'),
    CASE: args => caseValue(args),
    CEILING: args => Math.ceil(toNumber(args[0])),
    CONCAT: args => args.map(value => value ?? '').join(''),
    CONTAINS: args => String(args[0] ?? '').includes(String(args[1] ?? '')),
    COUNT: args => flattenValues(args).length,
    COUNTQUERY: async (args, context) => {
        if (!context.queryRunner) {
            throw new Error('COUNTQUERY requires a queryRunner');
        }
        return (await context.queryRunner.query(String(args[0] ?? ''))).length;
    },
    CURRENCY: args => toNumber(args[0]),
    DATE: args => toIsoDate(new Date(Date.UTC(Number(args[0]), toNumber(args[1]) - 1, Number(args[2])))),
    DATEDIFF: args => Math.trunc((toDate(args[1]).getTime() - toDate(args[0]).getTime()) / 86400000),
    DATETIMETOUNIX: args => toDate(args[0]).getTime(),
    DATETIME: args => toDate(args[0]).toISOString(),
    DAY: args => toDate(args[0]).getUTCDate(),
    DESERIALIZE: args => deserializeJson(args[0]),
    ENDSWITH: args => String(args[0] ?? '').endsWith(String(args[1] ?? '')),
    EOM: args => endOfMonth(args[0]),
    EQUALS: args => compare(args[0], args[1]) === 0,
    FIND: args => String(args[1] ?? '').indexOf(String(args[0] ?? '')),
    FLOOR: args => Math.floor(toNumber(args[0])),
    FORMAT: args => formatString(String(args[0] ?? ''), args.slice(1)),
    FORMATCURRENCY: args => new Intl.NumberFormat('en-US', { style: 'currency', currency: String(args[1] ?? 'USD') }).format(toNumber(args[0])),
    FORMATDATE: args => toIsoDate(toDate(args[0])),
    FORMATDATETIME: (args, context) => formatDateTime(args[0], args[1], args[2] ?? context.timezone),
    FORMATDATETIMEGMT: args => formatDateTime(args[0], args[2], args[1], true),
    GENERATEGLOBALKEY: args => `${args[0] ?? ''}${randomUUID()}`,
    GET: args => getDataMapperPathValue(args[0], String(args[1] ?? '')),
    HOUR: args => getDatePart(args[0], 'hour'),
    IFBLANK: args => isBlank(args[0]) ? args[1] : args[0],
    IFNULL: args => args[0] === null || args[0] === undefined ? args[1] : args[0],
    ISBLANK: args => isBlank(args[0]),
    ISNOTBLANK: args => !isBlank(args[0]),
    ISNOTNULL: args => args[0] !== null && args[0] !== undefined,
    ISNULL: args => args[0] === null || args[0] === undefined,
    JOIN: args => joinValues(args),
    JSONPATH: args => getDataMapperPathValue(args[0], String(args[1] ?? '').replace(/^\$\./, '').replace(/\./g, ':')),
    LEFT: args => String(args[0] ?? '').slice(0, toNumber(args[1])),
    LENGTH: args => Array.isArray(args[0]) ? args[0].length : String(args[0] ?? '').length,
    LIST: args => args.length === 0 ? [] : args.length === 1 && Array.isArray(args[0]) ? args[0] : args,
    LISTMERGE: args => listMerge(args),
    LISTMERGEPRIMARY: args => listMerge(args, { primaryOnly: true }),
    LISTSIZE: args => listSize(args),
    LOWER: args => String(args[0] ?? '').toLowerCase(),
    MAPTOLIST: args => mapToList(args[0]),
    MAX: args => Math.max(...flattenValues(args).map(toNumber)),
    MAXSTRING: args => maxString(flattenValues(args)),
    MIN: args => Math.min(...flattenValues(args).map(toNumber)),
    MINUTE: args => getDatePart(args[0], 'minute'),
    MOD: args => toNumber(args[0]) % toNumber(args[1]),
    MONTH: args => toDate(args[0]).getUTCMonth() + 1,
    NOW: (args, context) => args[0] ? formatDateTime(currentDate(context), args[0], context.timezone) : currentDate(context).toISOString(),
    POWER: args => Math.pow(toNumber(args[0]), toNumber(args[1])),
    QUERY: async (args, context) => {
        if (!context.queryRunner) {
            throw new Error('QUERY requires a queryRunner');
        }
        return context.queryRunner.query(String(args[0] ?? ''));
    },
    RANDOM: () => Math.random(),
    REPLACE: args => String(args[0] ?? '').replaceAll(String(args[1] ?? ''), String(args[2] ?? '')),
    RESERIALIZE: args => reserialize(args[0]),
    RIGHT: args => String(args[0] ?? '').slice(-toNumber(args[1])),
    ROUND: args => round(toNumber(args[0]), toNumber(args[1] ?? 0), args[2]),
    SECOND: args => getDatePart(args[0], 'second'),
    SERIALIZE: args => JSON.stringify(args[0]),
    SORTBY: args => sortBy(args),
    SPLIT: args => String(args[0] ?? '').split(String(args[1] ?? ',')),
    STARTSWITH: args => String(args[0] ?? '').startsWith(String(args[1] ?? '')),
    STRING: args => args[0] === null || args[0] === undefined ? '' : String(args[0]),
    STRINGINDEXOF: args => String(args[0] ?? '').indexOf(String(args[1] ?? '')),
    SUBSTRING: args => substring(args),
    SQRT: args => Math.sqrt(toNumber(args[0])),
    SUM: args => flattenValues(args).reduce<number>((sum, value) => sum + toNumber(value), 0),
    TIMEDIFF: args => timeDiff(args[0], args[1]),
    TODAY: (_args, context) => toIsoDate(currentDate(context)),
    TOSTRING: args => args[0] === null || args[0] === undefined ? '' : String(args[0]),
    TRIM: args => String(args[0] ?? '').trim(),
    UNIXTODATETIME: args => unixToDateTime(args[0], args[1]),
    UPPER: args => String(args[0] ?? '').toUpperCase(),
    URLENCODE: args => encodeURIComponent(String(args[0] ?? '')),
    VALUE: args => toNumber(args[0]),
    VALUELOOKUP: args => valueLookup(args),
    YEAR: args => toDate(args[0]).getUTCFullYear()
};

function resolveFormulaConstant(path: string): unknown {
    const normalized = path.trim().toUpperCase();
    if (normalized === '$VLOCITY.NULL' || normalized === 'NULL') {
        return null;
    }
    if (normalized === '$VLOCITY.TRUE' || normalized === 'TRUE') {
        return true;
    }
    if (normalized === '$VLOCITY.FALSE' || normalized === 'FALSE') {
        return false;
    }
    if ([
        'ASC', ':ASC', 'DSC', ':DSC', 'DESC', ':DESC',
        'UP', 'DOWN', 'HALF_UP', 'HALF_DOWN', 'HALF_EVEN', 'CEILING', 'FLOOR'
    ].includes(normalized)) {
        return normalized;
    }
    return undefined;
}

function normalizeFunctionInvocation(args: unknown[]): [string, unknown[]] {
    if (args.length >= 2 && typeof args[1] === 'string') {
        return [`${String(args[0] ?? '')}.${args[1]}`, args.slice(2)];
    }
    return [String(args[0] ?? ''), args.slice(1)];
}

function toNumber(value: unknown): number {
    if (value === null || value === undefined || value === '') {
        return 0;
    }
    return Number(value);
}

function compare(left: unknown, right: unknown): number {
    if (left === right) {
        return 0;
    }
    if (left === null || left === undefined) {
        return -1;
    }
    if (right === null || right === undefined) {
        return 1;
    }
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
        return leftNumber === rightNumber ? 0 : leftNumber > rightNumber ? 1 : -1;
    }
    return String(left).toLocaleLowerCase().localeCompare(String(right).toLocaleLowerCase());
}

function containsIgnoreCase(left: unknown, right: unknown): boolean {
    return String(left ?? '').toLocaleLowerCase().includes(String(right ?? '').toLocaleLowerCase());
}

function isBlank(value: unknown) {
    return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

function toArrayValue(value: unknown) {
    return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

function flattenValues(values: unknown[]): unknown[] {
    return values.flatMap(value => Array.isArray(value) ? flattenValues(value) : [value]);
}

function listSize(args: unknown[]) {
    if (!args.length) {
        return 0;
    }
    return args.length === 1 ? toArrayValue(args[0]).length : flattenValues(args).length;
}

function listMerge(args: unknown[], options?: { primaryOnly?: boolean }) {
    const firstListIndex = args.findIndex(Array.isArray);
    if (firstListIndex < 0) {
        return [];
    }
    const keys = args
        .slice(0, firstListIndex)
        .flatMap(key => String(key ?? '').split(','))
        .map(key => key.trim())
        .filter(Boolean);
    const lists = args.slice(firstListIndex).map(toArrayValue);
    const merged = new Array<unknown>();
    const byMergeKey = new Map<string, Record<string, unknown>>();
    for (const [listIndex, list] of lists.entries()) {
        for (const item of list) {
            if (!isPlainRecord(item) || !keys.length) {
                if (!options?.primaryOnly || listIndex === 0) {
                    merged.push(item);
                }
                continue;
            }
            const mergeKey = buildMergeKey(item, keys);
            const existing = mergeKey ? byMergeKey.get(mergeKey) : undefined;
            if (existing) {
                Object.assign(existing, item);
                continue;
            }
            if (options?.primaryOnly && listIndex > 0) {
                continue;
            }
            const copy = { ...item };
            if (mergeKey) {
                byMergeKey.set(mergeKey, copy);
            }
            merged.push(copy);
        }
    }
    return merged;
}

function substring(args: unknown[]) {
    const value = String(args[0] ?? '');
    const start = resolveSubstringIndex(value, args[1], 0, 'start');
    if (args[2] === undefined) {
        return value.slice(start);
    }
    const end = resolveSubstringIndex(value, args[2], value.length, 'end');
    return value.slice(start, end);
}

function caseValue(args: unknown[]) {
    const [value, ...branches] = args;
    for (let index = 0; index < branches.length - 1; index += 2) {
        if (compare(value, branches[index]) === 0) {
            return branches[index + 1];
        }
    }
    return branches.length % 2 === 1 ? branches[branches.length - 1] : undefined;
}

function average(values: unknown[]) {
    return values.length ? values.reduce<number>((sum, value) => sum + toNumber(value), 0) / values.length : 0;
}

function formatString(format: string, values: unknown[]) {
    return format.replace(/\{(\d+)\}/g, (_match, index) => String(values[Number(index)] ?? ''));
}

function round(value: number, decimals: number, direction?: unknown) {
    const factor = Math.pow(10, decimals);
    const scaled = value * factor;
    switch (String(direction ?? 'HALF_UP').toUpperCase()) {
        case 'UP':
            return (scaled < 0 ? Math.floor(scaled) : Math.ceil(scaled)) / factor;
        case 'DOWN':
            return (scaled < 0 ? Math.ceil(scaled) : Math.floor(scaled)) / factor;
        case 'CEILING':
            return Math.ceil(scaled) / factor;
        case 'FLOOR':
            return Math.floor(scaled) / factor;
        case 'HALF_DOWN':
            return roundHalf(scaled, false) / factor;
        case 'HALF_EVEN':
            return roundHalfEven(scaled) / factor;
        case 'HALF_UP':
        default:
            return Math.round(scaled) / factor;
    }
}

function currentDate(context: DataMapperFormulaContext) {
    return typeof context.now === 'function' ? context.now() : context.now ?? new Date();
}

function toDate(value: unknown) {
    if (value instanceof Date) {
        return value;
    }
    if (typeof value === 'number') {
        return new Date(value);
    }
    const normalized = normalizeDateString(String(value ?? ''));
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function addDate(value: unknown, delta: { days?: number; months?: number; years?: number }) {
    const date = toDate(value);
    if (delta.days) {
        date.setUTCDate(date.getUTCDate() + delta.days);
    }
    if (delta.months) {
        date.setUTCMonth(date.getUTCMonth() + delta.months);
    }
    if (delta.years) {
        date.setUTCFullYear(date.getUTCFullYear() + delta.years);
    }
    return date.toISOString();
}

function toIsoDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

function deserializeJson(value: unknown) {
    if (value && typeof value === 'object') {
        return value;
    }
    const json = String(value ?? 'null');
    return json.trim() ? JSON.parse(json) : null;
}

function reserialize(value: unknown) {
    return JSON.stringify(deserializeJson(value));
}

function joinValues(args: unknown[]) {
    if (!args.length) {
        return '';
    }
    if (Array.isArray(args[0]) && args.length <= 2) {
        return args[0].join(String(args[1] ?? ','));
    }
    const token = String(args[args.length - 1] ?? ',');
    return args.slice(0, -1).map(value => value ?? '').join(token);
}

function mapToList(value: unknown) {
    if (Array.isArray(value)) {
        return value;
    }
    if (isPlainRecord(value)) {
        return Object.values(value);
    }
    return value === undefined || value === null ? [] : [value];
}

function maxString(values: unknown[]) {
    return values.map(value => String(value ?? '')).sort((a, b) => a.localeCompare(b)).at(-1) ?? '';
}

function sortBy(args: unknown[]) {
    const list = toArrayValue(args[0]);
    const rawKeys = args.slice(1);
    const descending = rawKeys.length > 0 && isDescendingMarker(rawKeys[rawKeys.length - 1]);
    const keys = (descending ? rawKeys.slice(0, -1) : rawKeys).map(key => String(key ?? '').replace(/^:/, '')).filter(Boolean);
    return [...list].sort((left, right) => {
        for (const key of keys) {
            const result = compare(getDataMapperPathValue(left, key), getDataMapperPathValue(right, key));
            if (result !== 0) {
                return descending ? -result : result;
            }
        }
        return 0;
    });
}

function valueLookup(args: unknown[]) {
    const [startNode, ...nodes] = args;
    const start = typeof startNode === 'string' ? deserializeMaybeJson(startNode) : startNode;
    return getDataMapperPathValue(start, nodes.map(node => String(node ?? '')).join(':'));
}

function deserializeMaybeJson(value: string) {
    const trimmed = value.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        return value;
    }
    try {
        return JSON.parse(trimmed);
    } catch {
        return value;
    }
}

function timeDiff(first: unknown, second: unknown) {
    return toDate(first).getTime() - toDate(second).getTime();
}

function unixToDateTime(value: unknown, format?: unknown) {
    const timestamp = toNumber(value);
    const millis = Math.abs(timestamp) < 100000000000 ? timestamp * 1000 : timestamp;
    const date = new Date(millis);
    return format ? formatDateTime(date, format, 'UTC') : date.toISOString();
}

function getDatePart(value: unknown, part: 'hour' | 'minute' | 'second') {
    const date = toDate(value);
    if (part === 'hour') {
        return date.getUTCHours();
    }
    if (part === 'minute') {
        return date.getUTCMinutes();
    }
    return date.getUTCSeconds();
}

function endOfMonth(value: unknown) {
    const date = toDate(value);
    return toIsoDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)));
}

function age(birthDate: unknown, onDate: Date) {
    const birth = toDate(birthDate);
    let years = onDate.getUTCFullYear() - birth.getUTCFullYear();
    const beforeBirthday = onDate.getUTCMonth() < birth.getUTCMonth()
        || (onDate.getUTCMonth() === birth.getUTCMonth() && onDate.getUTCDate() < birth.getUTCDate());
    if (beforeBirthday) {
        years--;
    }
    return years;
}

function formatDateTime(value: unknown, format: unknown, timezone?: unknown, forceUtc = false) {
    const date = toDate(value);
    const pattern = String(format ?? '');
    if (!pattern) {
        return date.toISOString();
    }
    const parts = dateTimeParts(date, forceUtc ? 'UTC' : timezone);
    return pattern
        .replace(/yyyy|YYYY/g, parts.year)
        .replace(/MM/g, parts.month)
        .replace(/dd|DD/g, parts.day)
        .replace(/HH/g, parts.hour)
        .replace(/mm/g, parts.minute)
        .replace(/ss/g, parts.second)
        .replace(/SSS/g, parts.millisecond);
}

function dateTimeParts(date: Date, timezone?: unknown) {
    const timeZone = String(timezone ?? '').trim();
    if (!timeZone) {
        return {
            year: pad(date.getUTCFullYear(), 4),
            month: pad(date.getUTCMonth() + 1),
            day: pad(date.getUTCDate()),
            hour: pad(date.getUTCHours()),
            minute: pad(date.getUTCMinutes()),
            second: pad(date.getUTCSeconds()),
            millisecond: pad(date.getUTCMilliseconds(), 3)
        };
    }
    let parts: Record<string, string>;
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        parts = Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]));
    } catch {
        return dateTimeParts(date);
    }
    return {
        year: parts.year ?? '1970',
        month: parts.month ?? '01',
        day: parts.day ?? '01',
        hour: parts.hour === '24' ? '00' : parts.hour ?? '00',
        minute: parts.minute ?? '00',
        second: parts.second ?? '00',
        millisecond: pad(date.getUTCMilliseconds(), 3)
    };
}

function normalizeDateString(value: string) {
    const trimmed = value.trim();
    const timeOnly = trimmed.match(/^T?(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?Z?)$/);
    if (timeOnly) {
        return `1970-01-01T${ensureUtcSuffix(timeOnly[1])}`;
    }
    const slashDate = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(T.*)?$/);
    if (slashDate) {
        const [, month, day, year, time] = slashDate;
        return `${year}-${pad(month)}-${pad(day)}${time ? ensureUtcSuffix(time) : 'T00:00:00.000Z'}`.replace(/:(\d{3})Z$/, '.$1Z');
    }
    const normalized = trimmed.replace(/:(\d{3})(Z?)$/, '.$1$2');
    if (/^\d{4}-\d{2}-\d{2}T/.test(normalized) && !/(Z|[+-]\d{2}:?\d{2})$/.test(normalized)) {
        return `${normalized}Z`;
    }
    return normalized;
}

function ensureUtcSuffix(value: string) {
    return /(Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`;
}

function resolveSubstringIndex(value: string, rawIndex: unknown, fallback: number, mode: 'start' | 'end') {
    if (rawIndex === undefined || rawIndex === null || rawIndex === '') {
        return fallback;
    }
    if (typeof rawIndex === 'number' || /^-?\d+$/.test(String(rawIndex))) {
        const index = Number(rawIndex);
        if (index < 0 || index > value.length) {
            return mode === 'start' ? 0 : value.length;
        }
        return index;
    }
    const found = value.indexOf(String(rawIndex));
    if (found < 0) {
        return fallback;
    }
    return mode === 'start' ? found : Math.max(0, found - 1);
}

function buildMergeKey(item: Record<string, unknown>, keys: string[]) {
    const values = keys.map(key => getDataMapperPathValue(item, key));
    if (values.some(value => value === undefined || value === null)) {
        return undefined;
    }
    return values.map(value => String(value).toLocaleLowerCase()).join('\u001f');
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isDescendingMarker(value: unknown) {
    return [':DSC', 'DSC', ':DESC', 'DESC'].includes(String(value ?? '').toUpperCase());
}

function roundHalf(value: number, up: boolean) {
    const sign = Math.sign(value) || 1;
    const abs = Math.abs(value);
    const floor = Math.floor(abs);
    const fraction = abs - floor;
    if (fraction > 0.5 || (up && fraction === 0.5)) {
        return sign * (floor + 1);
    }
    return sign * floor;
}

function roundHalfEven(value: number) {
    const sign = Math.sign(value) || 1;
    const abs = Math.abs(value);
    const floor = Math.floor(abs);
    const fraction = abs - floor;
    if (fraction > 0.5) {
        return sign * (floor + 1);
    }
    if (fraction < 0.5) {
        return sign * floor;
    }
    return sign * (floor % 2 === 0 ? floor : floor + 1);
}

function pad(value: number | string, length = 2) {
    return String(value).padStart(length, '0');
}
