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

    /**
     * Format structured query data into a SOQL query that can be executed against Salesforce.
     * @param query Query data to format
     * @returns Formatted SOQL query
     */
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

    /**
     * Parse the query and extract the SObject type from the query string. If the QueryParser fails to parse the query, it will fallback to a regex matching.
     * @param queryString SOQL string
     * @returns SObject type of the SOQL or undefined if the query is not a SOQL query
     */
    public static getSObjectType(this: void, queryString: string) {
        try {
            return QueryParser.parse(queryString).sobjectType;
        } catch(err) {
            // Fallback to regex matching -- not as accurate as the parser
            return queryString.match(/\s+from\s+(\w+)/i)?.[1];
        }
    }

    /**
     * Parse an `SOQL` string and return a SalesforceQueryData object containing the decomposed query.
     *
     * The parser will try to parse the query as accurately as possible, but it will not validate the query.
     * If it encounters an unexpected keyword or operator the parser will not throw an error when in the root expression
     * but will instead return the part of the query that it was able to parse.
     * 
     * The parser will throw an error if it encounters an unexpected keyword or operator in a sub-expression or 
     * if the query is not starting with `SELECT` and lacking the `FROM` keyword.
     *
     * This parser supports the following parts of a SOQL query:
     * - field list
     * - sobject type
     * - where condition
     * - limit and offset
     * - order by
     * - group by
     * - visibility context
     * - query mode
     *  -security enforced
     *
     * To convert the decomposed query back to a `SOQL` string see {@link QueryFormatter.format} which converts a SalesforceQueryData object back to an `SOQL` string.
     *
     * _Sub-queries and nested-queries are not parsed and will be stored as a string in the field list or condition_
     * @param queryString `SOQL` string to parse
     * @returns Decomposed query that can be analyzed and modified.
     */
    public static parse(this: void, queryString: string) {
        return new QueryParser(queryString).parse();
    }

    private parse(): SalesforceQueryData {
        if (this.parser.expectKeyword(QueryKeywords.SELECT)) {
            this.fieldList = this.parseFieldList(this.parser);
        }

        if (this.parser.expectKeyword(QueryKeywords.FROM)) {
            this.sobjectType = this.parser.expectMatch(/\s*([^ ]+)\s*/).trim();
        }

        if (this.parser.acceptKeyword(QueryKeywords.WHERE)) {
            this.whereCondition = this.parseConditionExpression(this.parser)
        }

        if (this.parser.acceptKeyword(QueryKeywords.WITH)) {
            this.parseWithExpression(this.parser);
        }

        if (this.parser.acceptKeyword(QueryKeywords.GROUP_BY)) {
            this.groupBy = this.parseFieldList(this.parser);
        }

        if (this.parser.acceptKeyword(QueryKeywords.ORDER_BY)) {
            this.orderBy = this.parseFieldList(this.parser);
        }

        if (this.parser.acceptKeyword(QueryKeywords.LIMIT)) {
            this.limit = Number(this.parser.expectMatch(/\s*(\d+)\s*/));
        }

        if (this.parser.acceptKeyword(QueryKeywords.OFFSET)) {
            this.offset = Number(this.parser.expectMatch(/\s*(\d+)\s*/));
        }

        return this;
    }

    private parseWithExpression(parser: Parser): void {
        parser.skipWhitespace();
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
        const recordVisibility = parser.acceptBlock('(', ')', true);
        // TODO: Validate record visibility context fields and parse to concrete object
        if (!recordVisibility) {
            throw new Error(`Invalid SOQL record visibility context: ${parser.left}`);
        }
        return recordVisibility;
    }

    public static parseFieldsList(this: void, query: string) {
        return QueryParser.prototype.parseFieldList(new Parser(query));
    }

    private parseFieldList(parser: Parser): string[] {
        const fields = new Array<string>();

        while(parser.skipWhitespace().hasMore()) {
            const block = parser.acceptBlock('(', ')', false);
            if (block) {
                fields.push(block);
            } else {
                fields.push(parser.expectMatch(/[^,\s]+(\s+as\s+[\w]+)?/).trim());
            }

            if (!parser.skipWhitespace().acceptMatch(',')) {
                break;
            }
        }

        return fields;
    }

    public static parseQueryCondition(this: void, query: string) {
        return QueryParser.prototype.parseConditionExpression(new Parser(query));
    }

    private parseConditionExpression(parser: Parser): string | QueryBinary | QueryUnary | undefined {
        if (!parser.skipWhitespace().hasMore() || parser.skipWhitespace().matchKeyword(...queryKeywords)) {
            return;
        }

        const block = parser.skipWhitespace().acceptBlock('(', ')', true);
        const left = block ? this.parseConditionExpression(new Parser(block)) : this.parseFieldExpression(parser);

        const logicalOp = parser.skipWhitespace().acceptKeyword('or', 'and');
        if (!logicalOp) {
            return left;
        }

        const right = this.parseConditionExpression(parser);
        if (!right) {
            throw new Error(`Unexpected logical operator "${logicalOp}" in condition expression at column ${parser.index}: ${parser.input}`);
        }
        return { left, operator: logicalOp, right };
    }

    private parseFieldExpression(parser: Parser): string | QueryBinary | QueryUnary {
        if (parser.skipWhitespace().acceptMatch('not')) {
            const right = this.parseConditionExpression(parser);
            if (!right) {
                throw new Error(`Expected condition expression after negation at column ${parser.index}: ${parser.input}`);
            }
            return { operator: 'not', right };
        }

        const left = parser.skipWhitespace().expectMatch(/[%\w.]+/);
        const operator = parser.skipWhitespace().expectMatch(...queryOperators).toLowerCase();

        if (operator === QueryOperators.IN || operator === QueryOperators.NOT_IN ||
            operator === QueryOperators.INCLUDES || operator === QueryOperators.EXCLUDES) {
            const right = parser.skipWhitespace().expectBlock('(', ')', false);
            return `${left} ${operator} ${right}`;
            // For now do not decompose the field expression into an object
            // return { left, operator, right };
        }

        const right = this.parseLiteral(parser);
        return `${left} ${operator} ${right}`;
        // For now do not decompose the field expression into an object
        //return { left, operator, right };
    }

    private parseLiteral(parser: Parser): string {
        parser.skipWhitespace();
        const literal = parser.acceptQuoted('\'', '\\') ?? parser.acceptMatch(/[^\s]+/);
        if (!literal) {
            throw new Error(`Expected string, number or boolean literal at column ${parser.index}: ${parser.left}`);
        }
        return String(literal);
    }

    private parseNumericLiteral(parser: Parser): number | undefined {
        const numericLiteral = parser.acceptMatch(/[-+\s]?(([0-9]*(\.[0-9]+))|([0-9]+(\.[0-9]+)?))(e[-+]?[0-9]+)?/i);
        if (numericLiteral) {
            return Number(numericLiteral);
        }
    }
}

class Parser {

    public quoteCharacter: string | RegExp = '\'';
    public escapeCharacter: string = '\\';

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

    public skipWhitespace() {
        return this.skipMatch(/\s+/);
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

    /**
     * Scan for the specified keyword and return the keyword if found and move the index to the end of the keyword.
     *
     * If the keyword is not found, the position of the parser is reset to the start position of the scan operation.
     *
     * @param options Keywords to scan for
     * @returns The keyword found or undefined when none of the keywords were found
     */
    public scanKeyword<K extends string>(...options: K[]): K | undefined {
        const scanStartIndex = this.index;
        while(this.hasMore()) {
            const keyword = this.acceptKeyword(...options);
            if (keyword) {
                return keyword;
            }
        }
        this.index = scanStartIndex;
    }

    public expectKeyword<K extends string>(...options: K[]): K | undefined {
        const match = this.acceptKeyword(...options);
        if (!match) {
            throw new Error(`Expected keyword(s) "${options.join(', ')}" at column ${this.index} instead saw "${this.left.substring(0, 10)}"`);
        }
        return match;
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

    public expectMatch<K extends string>(...options: K[]): K;
    public expectMatch(...options: RegExp[]): string;
    public expectMatch(...options: (string | RegExp)[]): string {
        const match = this.acceptMatch(...options);
        if (match === undefined) {
            const expectedMatches = options.map(o => typeof o === 'string' ? o : o.source)
            throw new Error(`Expected "${this.left.substring(0, 10)}" to match: ${JSON.stringify(expectedMatches)}`);
        }
        return match;
    }

    public expectQuoted(quote: string | RegExp, escapeCharacter: string) {
        const quoted = this.acceptQuoted(quote, escapeCharacter);
        if (quoted === undefined) {
            throw new Error(`Parser error; expected quoted string at: ${this.left.substring(0, 10)}`);
        }
        return quoted;
    }

    public acceptQuoted(quote: string | RegExp = this.quoteCharacter, escapeCharacter: string = this.escapeCharacter) {
        const openingMatch = this.acceptMatch(quote);
        if (!openingMatch) {
            return;
        }
        const openingIndex = this.index - openingMatch.length;

        while(this.hasMore()) {
            if (this.acceptMatch(escapeCharacter)) {
                this.skip(1);
            } else if (this.acceptMatch(quote)) {
                return this.input.substring(openingIndex, this.index);
            } else {
                this.skip(1);
            }
        }

        throw new Error(`Parser error; expected string literal closing character '${quote}' after opening at column ${openingIndex}`);
    }

    public expectBlock(blockOpening: string, blockClosing: string, trimOpeningAndClosing: boolean = true) {
        const block = this.acceptBlock(blockOpening, blockClosing, trimOpeningAndClosing);
        if (block === undefined) {
            throw new Error(`Parser error; expected block starting with '${blockOpening}'`);
        }
        return block;
    }

    public acceptBlock(blockOpening: string, blockClosing: string, trimOpeningAndClosing: boolean = true) {
        if (!this.acceptMatch(blockOpening)) {
            return;
        }

        let blockLevel = 1;
        const openingIndex = this.index - blockOpening.length;

        while(this.hasMore()) {
            if (this.acceptQuoted(this.quoteCharacter)) {
                continue;
            }
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