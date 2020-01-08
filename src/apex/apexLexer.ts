import gelex = require('gelex');

interface LexerScanner {
    peek(): string;
    scan(): string;
    seek(position: number): void;
    psoition(): number;
};

interface LexerRule {
    first(): string;
    match (scanner : LexerScanner): string;
}

interface LexerToken {
    type: string;
    value: string;
    begin: number;
    end: number;
}

interface GrammarDefinition {
    lexer(text: string): {
       next(): LexerToken
    };
}

class ApexInlineSoqlRule implements LexerRule {
    public first() { 
        return '['; 
    };

    public match (scanner : LexerScanner) {
        if (scanner.peek() !== '[') {
            return null;
        }

        // Basic SOQL lexing
        let result = '';
        let quoted = false, escaped = false;
        while (true) {
            const char = scanner.scan();
            if (char === '[') {
                continue;
            } else if (char === ']') {
                break;
            } else if (!escaped && char === '\'') {
                quoted = !quoted;
            } else {
                result += char;
            }
            if (quoted && char === '\\') {
                escaped = true;
            } else if (escaped) {
                escaped = false;
            }
        }
        
        // SOQL always containbs a Select statement
        if (result.match(/\s*select/mi)) {
            return result.trim(); 
        }
        return null;
    };
}

/**
 * Lexer for the Salesforce APEX programming language
 */
export class ApexLexer {

    constructor(public readonly grammer?: GrammarDefinition) {
        if (!grammer) {
            this.grammer = this.initializeApexGrammar();
        }
    }
    
    /**
     * Create an APEX lang definition that has a lexer function to return a token stream.
     */
    protected initializeApexGrammar() : GrammarDefinition {
        const def = gelex.definition();
        def.defineComment('/*', '*/');
        def.defineComment('//');
        def.defineText('value.string', '\'', '\'',
            {
                escape: '\\',
                escaped: { 'n': '\n', 'r': '\r', 't': '\t' }
            }
        );
        def.define('sqol', new ApexInlineSoqlRule());
        def.define('delimiter', [ '{', '}', ',', ';' ]);
        def.define('braces', [ '(', ')', '<', '>', '[', ']' ]);
        def.define('keyword', [ 'for', 'if', 'else', 'switch', 'throw', 'try', 'catch', 'finally', 'this', 'while', 'do' ]);
        def.define('keyword.soql', [ 'insert', 'update', 'delete' ]);
        def.define('modifier.access', [ 'public', 'private', 'protected', 'global' ]);
        def.define('modifier', [ 'virtual', 'abstract', 'transient', 'static' ]);
        def.define('primitive', [ 'Boolean', 'String', 'Decimal', 'Object' ]);
        def.define('operator', [ '+', '-', '*', '/', '==', '>=', '<=', '>', '<', '!', '|', '||', '&', '&&', '++', '--', '?', ':' ]);
        def.define('assignment', [ '=', '=>' ]);
        def.define('value.decimal', '[0-9][0-9]*\\.[0-9]+');
        def.define('value.integer', '[0-9][0-9]*');
        def.define('value.boolean', 'true|false');
        def.define('cast', '([a-zA-Z][a-zA-Z_]*)', (value: string) => value.substring(1,-1));
        def.define('ctor', 'new [a-zA-Z][a-zA-Z_]*');
        def.define('accessor', [ '.' ]);                
        def.define('annotation', '@[a-zA-Z][a-zA-Z_]*');
        def.define('name', '[a-zA-Z][a-zA-Z0-9_]*');
        return def;
    }

    /**
     * Tokenize the input string into LexerToken's token accoring to the grammar definition.
     * @param input Input string to tokenize
     */
    public* parse(input: string) : Generator<LexerToken, void, void> {
        const lexer = this.grammer.lexer(input);
        let token : LexerToken;
        while (token = lexer.next()) {
            yield token;
        } 
    }
}