import { container } from "@vlocode/core";
import { lazy } from "@vlocode/util";
import assert = require("assert");
import { NamespaceService } from "./namespaceService";

export type QueryUnary = { left?: undefined, operator: string, right: QueryBinary | QueryUnary | string };
export type QueryBinary = { left: QueryBinary | QueryUnary | string, operator: string, right: QueryBinary | QueryUnary | string };

export function isQueryUnary(operator: string | QueryBinary | QueryUnary): operator is QueryUnary {
    return typeof operator === 'object' && operator.left === undefined;
}

export function isQueryBinary(operator: string | QueryBinary | QueryUnary): operator is QueryBinary {
    return typeof operator === 'object' && operator.left !== undefined;
}

/**
 * Enum of SOQL query reserved keywords
 */
enum QueryKeywords {
    SELECT = 'select',
    WHERE = 'where',
    FROM = 'from',
    GROUP_BY = 'group by',
    ORDER_BY = 'order by',
    LIMIT = 'limit',
    WITH = 'with',
    OFFSET = 'offset',
    FOR = 'for'
}

enum QueryOperators {
    INCLUDES = 'includes',
    EXCLUDES = 'excludes',
    NOT_IN = 'not in',
    IN = 'in',
    LIKE = 'like',
    EQUALS = '=',
    NOT_EQUALS = '!=',
    LESS_THEN = '<',
    LESS_OR_EQUAL = '<=',
    GREATER_THAN = '>',
    GREATER_OR_EQUAL = '>='
}

enum QueryModifiers {
    SECURITY_ENFORCED = 'SECURITY_ENFORCED',
    SYSTEM_MODE = 'SYSTEM_MODE',
    USER_MODE = 'USER_MODE'
}

/**
 * List of all query reserved keywords derived from the QueryKeywords enum
 */
const queryKeywords = Object.freeze(Object.values(QueryKeywords));

/**
 * List of all query operators derived from the QueryOperators enum
 */
const queryOperators = Object.freeze(Object.values(QueryOperators));

export interface SalesforceQueryData {
    sobjectType: string;
    fieldList: string[];
    whereCondition?: QueryBinary | QueryUnary | string;
    limit?: number;
    offset?: number;
    orderBy?: string[];
    orderByDirection?: 'asc' | 'desc';
    groupBy?: string[];
    visibilityContext?: string;
    mode?: 'system' | 'user';
    securityEnforced?: boolean;
}

export class QueryFormatter {

    constructor(private readonly namespace: NamespaceService = lazy(() => container.get(NamespaceService))) {
    }

    public static format(query: SalesforceQueryData) {
        return new QueryFormatter().format(query);
    }

    private format(query: SalesforceQueryData) {
        const queryParts = [
            `${QueryKeywords.SELECT} ${this.formatFieldList(query.fieldList)}`,
            `${QueryKeywords.FROM} ${this.updateNamespace(query.sobjectType)}`
        ];

        if (query.whereCondition) {
            queryParts.push(`${QueryKeywords.WHERE} ${this.formatCondition(query.whereCondition)}`);
        }

        if (query.securityEnforced) {
            assert(!query.mode && !query.visibilityContext, 'Cannot use security enforced with mode or visibility context');
            queryParts.push(`${QueryKeywords.WITH} SECURITY_ENFORCED`);
        } else if (query.mode) {
            assert(!query.visibilityContext, 'Cannot use mode with visibility context');
            queryParts.push(`${QueryKeywords.WITH} ${query.mode.toUpperCase()}_MODE`);
        } else if (query.visibilityContext) {
            queryParts.push(`${QueryKeywords.WITH} RecordVisibilityContext (${query.visibilityContext})`);
        }

        if (query.groupBy) {
            queryParts.push(`${QueryKeywords.GROUP_BY} ${this.formatFieldList(query.groupBy)}`);
        }

        if (query.orderBy) {
            queryParts.push(`${QueryKeywords.ORDER_BY} ${this.formatFieldList(query.orderBy)}`);
            if (query.orderByDirection) {
                queryParts.push(query.orderByDirection);
            }
        }

        if (query.limit) {
            queryParts.push(`${QueryKeywords.LIMIT} ${query.limit}`);
        }

        if (query.offset) {
            queryParts.push(`${QueryKeywords.OFFSET} ${query.offset}`);
        }

        return queryParts.join(' ');
    }

    private formatCondition(condition: QueryBinary | QueryUnary | string, previousCondition?: QueryBinary | QueryUnary): string {
        let formattedCondition = '';
        if (typeof condition === 'string') {
            formattedCondition = this.updateNamespace(condition);
        } else if (isQueryUnary(condition)) {
            formattedCondition = `${condition.operator} (${this.formatCondition(condition.right, condition)})`
        } else {
            formattedCondition = `${this.formatCondition(condition.left, condition)} ${condition.operator} ${this.formatCondition(condition.right, condition)}`
        }

        if (typeof condition === 'object' && previousCondition && previousCondition?.operator !== condition.operator) {
            return `(${formattedCondition})`;
        }
        return formattedCondition;
    }

    private formatFieldList(fields: string[]) {
        const uniqueFields = new Map(fields.map(field => ([
            this.updateNamespace(field).toLowerCase(),
            this.updateNamespace(field),
        ])));

        return [...uniqueFields.values()].join(', ');
    }

    private updateNamespace(value: string) {
        return value && this.namespace ? this.namespace.updateNamespace(value) : value;
    }
}

export class QueryParser implements SalesforceQueryData {

    public readonly parser: Parser;

    public sobjectType: string;
    public fieldList: string[];
    public whereCondition?: QueryBinary | QueryUnary | string;
    public limit?: number;
    public offset?: number;
    public orderBy?: string[];
    public groupBy?: string[];
    public visibilityContext?: string;
    public mode?: 'system' | 'user';
    public securityEnforced?: boolean;

    private constructor(public readonly queryString: string, private index: number = 0) {
        this.parser = new Parser(queryString);
    }

    public static parse(queryString: string) {
        return new QueryParser(queryString).parse();
    }

    private parse(): SalesforceQueryData {
        while(this.parser.hasMore()) {
            if (this.parser.acceptKeyword(QueryKeywords.SELECT)) {
                this.fieldList = this.parseFieldsList(this.parser.createParser());
            } else if (this.parser.acceptKeyword(QueryKeywords.WHERE)) {
                this.whereCondition = this.parseQueryCondition(this.parser.createParser())
            } else if (this.parser.acceptKeyword(QueryKeywords.FROM)) {
                this.sobjectType = this.parser.expectMatch(/\s*([^ ]+)\s*/).trim();
            } else if (this.parser.acceptKeyword(QueryKeywords.GROUP_BY)) {
                this.groupBy = this.parseFieldsList(this.parser.createParser());
            } else if (this.parser.acceptKeyword(QueryKeywords.ORDER_BY)) {
                this.orderBy = this.parseFieldsList(this.parser.createParser());
            } else if (this.parser.acceptKeyword(QueryKeywords.LIMIT)) {
                this.limit = Number(this.parser.expectMatch(/\s*(\d+)\s*/));
            } else if (this.parser.acceptKeyword(QueryKeywords.OFFSET)) {
                this.offset = Number(this.parser.expectMatch(/\s*(\d+)\s*/));
            } else if (this.parser.acceptKeyword(QueryKeywords.WITH)) {
                this.parseWithCondition(this.parser.createParser());
            } else {
                this.parser.skip();
            }
        }

        return this;
    }

    private parseWithCondition(parser: Parser): void {
        parser.expectWhitespaceCharacters();
        if (parser.acceptKeyword('RecordVisibilityContext')) {
            assert(!this.mode && !this.securityEnforced, 'Cannot use visibility context with mode or security enforced');
            this.visibilityContext = this.parseVisibilityContext(parser);
        } else if (parser.acceptKeyword('DATA CATEGORY')) {
            throw new Error('Parsing of queries With Data Category is not supported');
        } else {
            if (parser.acceptKeyword('SECURITY_ENFORCED')) {
                assert(!this.mode && !this.visibilityContext, 'Cannot use SECURITY_ENFORCED with mode or visibility context');
                this.securityEnforced = true;
            } else if (parser.acceptKeyword('USER_MODE')) {
                assert(!this.visibilityContext && this.securityEnforced === undefined, 'Cannot use USER_MODE with visibility context or security enforced');
                this.mode = 'user';
            } else if (parser.acceptKeyword('SYSTEM_MODE')) {
                assert(!this.visibilityContext && this.securityEnforced === undefined, 'Cannot use SYSTEM_MODE with visibility context or security enforced');
                this.mode = 'system';
            } else {
                throw new Error(`Invalid SOQL With condition: ${parser.left}`);
            }
        }
    }

    private parseVisibilityContext(parser: Parser) {
        const recordVisibility = parser.acceptNextBlock('(', ')', true);
        // TODO: Validate record visibility context fields and parse to concrete object
        if (!recordVisibility) {
            throw new Error(`Invalid SOQL record visibility context: ${parser.left}`);
        }
        return recordVisibility;
    }

    public static parseFieldsList(this: void, query: string) {
        return QueryParser.prototype.parseFieldsList(new Parser(query));
    }

    private parseFieldsList(parser: Parser): string[] {
        const fields = new Array<string>();
        let backBuffer = '';

        while(parser.hasMore()) {
            if (parser.acceptMatch(',')) {
                fields.push(backBuffer.trim());
                backBuffer = '';
                continue;
            } else if(parser.matchKeyword(...queryKeywords)) {
                break;
            }

            const blockMatch = parser.acceptNextBlock('(', ')', false);
            if (blockMatch) {
                fields.push(blockMatch);
            } else {
                backBuffer += parser.read();
            }
        }

        if (backBuffer.trim()) {
            fields.push(backBuffer.trim())
        }

        return fields;
    }

    public static parseQueryCondition(this: void, query: string) {
        return QueryParser.prototype.parseQueryCondition(new Parser(query));
    }

    private parseQueryCondition(parser: Parser): string | QueryBinary | QueryUnary {
        let backBuffer = '';

        while(parser.hasMore()) {
            const operator = parser.acceptKeyword('or', 'and');
            if (operator) {
                const left = this.parseQueryCondition(new Parser(backBuffer));
                const right = this.parseQueryCondition(parser);
                if (!right || !left) {
                    throw new Error(`Inconsistent query condition at: ${parser.input}`);
                }
                return { left, operator, right };
            } else if(parser.matchKeyword(...queryKeywords)) {
                break;
            }

            if (!backBuffer.trim() && parser.acceptMatch('not')) {
                const right = this.parseQueryCondition(parser);
                return { operator: 'not', right };
            }

            const blockMatch = !backBuffer.trim() && parser.acceptNextBlock('(', ')', true);
            if (blockMatch) {
                if (backBuffer.trim()) {
                    throw new Error(`Back buffer should be empty at the start of a new block`);
                }
                const left = this.parseQueryCondition(new Parser(blockMatch));
                const operator = parser.skipMatch(/\s+/s).acceptKeyword('or', 'and');
                if (operator) {
                    const right = this.parseQueryCondition(parser);
                    return { left, operator, right };
                } else {
                    return left;
                }
            } else {
                backBuffer += parser.read();
            }
        }

        return backBuffer.trim();
    }
}

class Parser {

    constructor(public readonly input: string, public index: number = 0) {
    }

    public createParser() {
        return new Parser(this.input, this.index);
    }

    public get current() {
        return this.input[this.index];
    }

    public get parsed() {
        return this.input.slice(0, this.index);
    }

    public get left() {
        return this.input.slice(this.index);
    }

    public get last() {
        return this.index > 0 ? this.input[this.index - 1] : undefined;
    }

    /**
     * Move the stream ahead the specified number of characters
     * @param count Number of characters to move
     * @returns
     */
    public read(count = 1): string | undefined {
        if (!this.hasMore()) {
            return undefined;
        }
        const str = this.input.substring(this.index, this.index + count);
        this.index += count;
        return str;
    }

    public peek(count = 1): string {
        return this.input.substring(this.index, this.index + count);
    }

    public skip(count: number = 1) {
        this.index += count;
        return this;
    }

    /**
     * Skip input until the specified expr. doesn't match anymore
     * @param expr
     */
    public skipMatch(expr: RegExp) {
        while(this.hasMore()) {
            const isMatch = expr.exec(this.left);
            if (isMatch && isMatch.index === 0) {
                this.skip(isMatch[0].length);
            } else {
                break;
            }
        }
        return this;
    }

    /**
     * Accept all currently read characters and move the consumed index to the read index
     * @param trimCount Number of characters to trim from the end
     * @returns
     */
    public accept(count: number) {
        const str = this.input.substring(this.index, this.index + count);
        this.index += count;
        return str;
    }

    public acceptMatch(...options: (string | RegExp)[]): string | undefined {
        for (const option of options) {
            if (typeof option === 'string') {
                if (this.lookAhead(option.length).toLowerCase() === option.toLowerCase()) {
                    return this.accept(option.length);
                }
            } else {
                const match = option.exec(this.left);
                if (match?.index === 0) {
                    this.skip(match[0].length);
                    return match[1] ?? match[0];
                }
            }
        }
    }

    public acceptKeyword<K extends string>(...options: K[]): K | undefined {
        const match = this.matchKeyword(...options);
        if (match) {
            return this.accept(match.length) as K;
        }
    }

    public expectWhitespaceCharacters(): this {
        if (!this.acceptMatch(/\s+/s)) {
            throw new Error(`Expected whitespace at: ${this.left.substring(0, 10)}`);
        }
        return this;
    }

    public expectMatch(...options: (string | RegExp)[]): string {
        const match = this.acceptMatch(...options);
        if (match === undefined) {
            const expectedMatches = options.map(o => typeof o === 'string' ? o : o.source)
            throw new Error(`Expected "${this.left.substring(0, 10)}" to match: ${JSON.stringify(expectedMatches)}`);
        }
        return match;
    }

    public acceptNextBlock(blockOpening: string, blockClosing: string, trimOpeningAndClosing: boolean = true) {
        if (!this.acceptMatch(blockOpening)) {
            return;
        }

        let blockLevel = 1;
        const openingIndex = this.index - blockOpening.length;

        while(this.hasMore()) {
            if (this.acceptMatch(blockOpening)) {
                blockLevel++;
            } else if (this.acceptMatch(blockClosing)) {
                if (--blockLevel === 0) {
                    const block = this.input.substring(openingIndex, this.index);
                    return trimOpeningAndClosing ? block.slice(blockOpening.length, -blockClosing.length) : block;
                }
            } else {
                this.skip();
            }
        }

        throw new Error(`Parser error; expected block closing '${blockClosing}' after opening at column ${openingIndex}`);
    }

    public hasMore() {
        return this.index < this.input.length;
    }

    private lookAhead(len: number) {
        return this.input.substring(this.index, this.index + len);
    }

    public match(...options: string[]) {
        for (const option of options) {
            if (this.lookAhead(option.length).toLowerCase() === option.toLowerCase()) {
                return option;
            }
        }
    }

    public matchKeyword(...options: string[]) {
        const match = this.match(...options);
        if (match) {
            const peek = this.input.substring(this.index + match.length, this.index + match.length + 1);
            const spacePreFixed = !this.last || /\s/.test(this.last);
            const spacePostFixed = !peek || /\s/.test(peek);
            if (spacePreFixed && spacePostFixed) {
                return match;
            }
        }
    }
}