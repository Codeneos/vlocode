export type QueryBinary = { left: QueryBinary | string, operator: string, right: QueryBinary | string };

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
    OFFSET = 'offset', 
    FOR = 'for' 
};

/**
 * List of all query reserved keywords derrived from the QueryKeywords enum
 */
const queryKeywords = Object.freeze(Object.values(QueryKeywords));

interface SalesforceQuery {
    sobjectType: string;
    fieldList: string[];
    whereCondition?: QueryBinary | string;
    limit?: number;
    offset?: number;
    orderBy?: string[];
    groupBy?: string[];
}

export class QueryFormatter {
    public static format(query: SalesforceQuery) {
        return new QueryFormatter().format(query);
    }

    private format(query: SalesforceQuery) {
        const queryParts = [
            `${QueryKeywords.SELECT} ${this.formatFieldList(query.fieldList)} ${QueryKeywords.FROM} ${query.sobjectType}`
        ];

        if (query.whereCondition) {
            queryParts.push(`${QueryKeywords.WHERE} ${this.formatCondition(query.whereCondition)}`);
        }

        if (query.groupBy) {
            queryParts.push(`${QueryKeywords.GROUP_BY} ${this.formatFieldList(query.groupBy)}`);
        }

        if (query.orderBy) {
            queryParts.push(`${QueryKeywords.ORDER_BY} ${this.formatFieldList(query.orderBy)}`);
        }

        if (query.limit) {
            queryParts.push(`${QueryKeywords.LIMIT} ${query.limit}`);
        }

        if (query.offset) {
            queryParts.push(`${QueryKeywords.OFFSET} ${query.offset}`);
        }

        return queryParts.join(' ');
    }

    private formatCondition(condition: QueryBinary | string) {
        if (typeof condition === 'string') {
            return condition;
        }        
        return `${this.formatCondition(condition.left)} ${condition.operator} ${this.formatCondition(condition.right)}`
    }

    private formatFieldList(fields: string[]) {
        return fields.join(', ');
    }
}

export class QueryParser implements SalesforceQuery {

    public readonly parser: Parser;

    public sobjectType: string;
    public fieldList: string[];
    public whereCondition?: QueryBinary;
    public limit?: number;
    public offset?: number;
    public orderBy?: string[];
    public groupBy?: string[];

    private constructor(public readonly queryString: string, private index: number = 0) {
        this.parser = new Parser(queryString);
    }

    public static parse(queryString: string) {
        return new QueryParser(queryString).parse();
    }

    private parse(): SalesforceQuery {
        while(this.parser.hasMore()) {
            if (this.parser.acceptKeyword(QueryKeywords.SELECT)) {
                this.fieldList = this.parseFieldsList(this.parser.createParser());
            } else if (this.parser.acceptKeyword(QueryKeywords.WHERE)) {
                this.whereCondition = this.parseQueryCondition(this.parser.createParser())
            } else if (this.parser.acceptKeyword(QueryKeywords.FROM)) {
                this.sobjectType = this.parser.expectMatch(/\s*(\w+)\s*/).trim();
            } else if (this.parser.acceptKeyword(QueryKeywords.GROUP_BY)) {
                this.groupBy = this.parseFieldsList(this.parser.createParser());
            } else if (this.parser.acceptKeyword(QueryKeywords.ORDER_BY)) {
                this.orderBy = this.parseFieldsList(this.parser.createParser());
            } else if (this.parser.acceptKeyword(QueryKeywords.LIMIT)) {
                this.limit = Number(this.parser.expectMatch(/\s*(\d+)\s*/));
            } else if (this.parser.acceptKeyword(QueryKeywords.OFFSET)) {
                this.offset = Number(this.parser.expectMatch(/\s*(\d+)\s*/));
            } else {
                this.parser.skip();
            }
        }

        return this;
    }

    public static parseFieldsList(query: string) {
        return new QueryParser('').parseFieldsList(new Parser(query));
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

    public static parseQueryCondition(query: string) {
        return new QueryParser('').parseQueryCondition(new Parser(query));
    }    

    private parseQueryCondition(parser: Parser) {
        let backBuffer = '';

        while(parser.hasMore()) {
            const operator = parser.acceptKeyword('or', 'and');
            if (operator) {
                const left = this.parseQueryCondition(new Parser(backBuffer));
                const right = this.parseQueryCondition(parser);
                if (!right || !left) {
                    throw new Error(`Inconsisten query condition at: ${parser.input}`);
                }
                return { left, operator, right };
            } else if(parser.matchKeyword(...queryKeywords)) {                
                break;
            }
            
            const blockMatch = parser.acceptNextBlock('(', ')', true);
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

        return backBuffer?.trim();
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
     * Skip input until the especified expr. doesn't match anymore
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
     * Accept all currently read characters and move the cosumed index to the read index
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

    public acceptKeyword(...options: string[]): string | undefined {
        const match = this.matchKeyword(...options);
        if (match) {
            return this.accept(match.length);
        }
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
        let openingIndex = this.index - blockOpening.length;

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