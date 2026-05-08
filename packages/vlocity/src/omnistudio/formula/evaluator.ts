import { getDataMapperPathValue } from '../../datamapper/path';
import {
    OMNISTUDIO_FORMULA_RUNTIME_FUNCTIONS,
    compare,
    containsIgnoreCase,
    toArrayValue,
    toNumber
} from './functions/runtimeFunctions';
import { OMNISTUDIO_FORMULA_CONSTANTS } from './registry';
import type {
    OmniStudioFormulaContext,
    OmniStudioFormulaNode,
    OmniStudioFormulaRuntimeContext,
    OmniStudioFormulaToken,
    OmniStudioFormulaTokenType
} from './types';

export { OMNISTUDIO_FORMULA_RUNTIME_FUNCTIONS } from './functions/runtimeFunctions';
export type { OmniStudioFormulaFunction } from './functions/runtimeFunctions';
export type { OmniStudioFormulaNode, OmniStudioFormulaRuntimeContext } from './types';

const formulaConstantNames = new Set<string>(OMNISTUDIO_FORMULA_CONSTANTS);
const wordOperators = new Set(['AND', 'OR', 'NOT', 'LIKE', 'NOTLIKE']);
const symbolOperators = ['&&', '||', '==', '!=', '<=', '>=', '<>', '~=', '+', '-', '*', '/', '%', '^', '=', '<', '>', '!'];

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

export class OmniStudioFormulaEvaluator {
    public parse(expression: string): OmniStudioFormulaNode {
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

    public async evaluate(expression: string, context: OmniStudioFormulaContext): Promise<unknown> {
        return this.evaluateAst(this.parse(expression), context);
    }

    public async evaluateAst(node: OmniStudioFormulaNode, context: OmniStudioFormulaContext): Promise<unknown> {
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

    private async evaluateCall(node: Extract<OmniStudioFormulaNode, { type: 'call' }>, context: OmniStudioFormulaContext): Promise<unknown> {
        const name = node.name.toUpperCase();
        const runtimeContext: OmniStudioFormulaRuntimeContext = { ...context, evaluator: this };
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
                throw new Error(`OmniStudio FUNCTION(${functionName}) requires a functionRegistry`);
            }
            const [functionName, functionArgs] = normalizeFunctionInvocation(args);
            return context.functionRegistry.invoke(functionName, functionArgs, context);
        }
        const args = await Promise.all(node.args.map(arg => this.evaluateAst(arg, context)));
        const fn = OMNISTUDIO_FORMULA_RUNTIME_FUNCTIONS[name];
        if (!fn) {
            throw new Error(`Unsupported OmniStudio formula function: ${node.name}`);
        }
        return fn(args, runtimeContext);
    }

    private async evaluateFilter(args: readonly OmniStudioFormulaNode[], context: OmniStudioFormulaContext): Promise<unknown[]> {
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

    private visit(node: OmniStudioFormulaNode, visitor: (node: OmniStudioFormulaNode) => void): void {
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
    private readonly tokens: OmniStudioFormulaToken[];
    private index = 0;

    constructor(expression: string) {
        this.tokens = new FormulaTokenizer(expression).tokenize();
    }

    public parse(): OmniStudioFormulaNode {
        const expression = this.parseExpression(0);
        this.expect('eof');
        return expression;
    }

    private parseExpression(minPrecedence: number): OmniStudioFormulaNode {
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

    private parsePrefix(): OmniStudioFormulaNode {
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
                const args = new Array<OmniStudioFormulaNode>();
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
        throw new Error(`Unexpected token in OmniStudio formula: ${token.value}`);
    }

    private isWordOperator(token: OmniStudioFormulaToken) {
        return token.type === 'identifier' && wordOperators.has(token.value.toUpperCase());
    }

    private accept(type: OmniStudioFormulaTokenType, value?: string) {
        const token = this.peek();
        if (token.type === type && (value === undefined || token.value === value)) {
            this.index++;
            return true;
        }
        return false;
    }

    private expect(type: OmniStudioFormulaTokenType, value?: string) {
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

    public tokenize(): OmniStudioFormulaToken[] {
        const tokens = new Array<OmniStudioFormulaToken>();
        while (this.index < this.expression.length) {
            const char = this.expression[this.index];
            if (/\s/.test(char)) {
                this.index++;
                continue;
            }
            if (char === ',') {
                tokens.push({ type: 'comma', value: char, start: this.index, end: this.index + 1 });
                this.index++;
                continue;
            }
            if (char === '(' || char === ')') {
                tokens.push({ type: 'paren', value: char, start: this.index, end: this.index + 1 });
                this.index++;
                continue;
            }
            if (char === '\'' || char === '"') {
                const start = this.index;
                tokens.push({ type: 'string', value: this.readString(char), start, end: this.index });
                continue;
            }
            if (char === '%' && this.expression.indexOf('%', this.index + 1) !== -1) {
                const start = this.index;
                tokens.push({ type: 'variable', value: this.readPercentVariable(), start, end: this.index });
                continue;
            }
            if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(this.expression[this.index + 1]))) {
                const start = this.index;
                tokens.push({ type: 'number', value: this.readNumber(), start, end: this.index });
                continue;
            }
            const start = this.index;
            const operator = this.readOperator();
            if (operator) {
                tokens.push({ type: 'operator', value: operator, start, end: this.index });
                continue;
            }
            tokens.push({ type: 'identifier', value: this.readIdentifier(), start, end: this.index });
        }
        tokens.push({ type: 'eof', value: '<eof>', start: this.index, end: this.index });
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
        throw new Error('Unterminated string literal in OmniStudio formula');
    }

    private readPercentVariable() {
        this.index++;
        const start = this.index;
        while (this.index < this.expression.length && this.expression[this.index] !== '%') {
            this.index++;
        }
        if (this.expression[this.index] !== '%') {
            throw new Error('Unterminated percent path in OmniStudio formula');
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
        const operator = symbolOperators.find(candidate => this.expression.startsWith(candidate, this.index));
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
            throw new Error(`Unexpected character in OmniStudio formula: ${this.expression[this.index]}`);
        }
        return this.expression.slice(start, this.index);
    }
}

function resolveFormulaConstant(path: string): unknown {
    const normalized = path.trim().toUpperCase();
    switch (normalized) {
        case '$VLOCITY.NULL':
        case 'NULL':
            return null;
        case '$VLOCITY.TRUE':
        case 'TRUE':
            return true;
        case '$VLOCITY.FALSE':
        case 'FALSE':
            return false;
        default:
            return formulaConstantNames.has(normalized) ? normalized : undefined;
    }
}

function normalizeFunctionInvocation(args: unknown[]): [string, unknown[]] {
    if (args.length >= 2 && typeof args[1] === 'string') {
        return [`${String(args[0] ?? '')}.${args[1]}`, args.slice(2)];
    }
    return [String(args[0] ?? ''), args.slice(1)];
}
