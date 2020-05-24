import { ApexLexer } from './apexLexer';

interface ParserNode {
    type: string;
    begin: number;
    end: number;
}

interface VariableDeclarationNode extends ParserNode {
    type: 'VariableDeclaration';
    declarations: VariableDeclaratorNode[];
    kind: string; // type of variable
}

interface VariableDeclaratorNode extends ParserNode {
    type: 'VariableDeclarator';
    id: IdentifierNode;
    init: ParserNode;
}

interface LiteralNode extends ParserNode {
    type: 'Literal';
}

interface IdentifierNode extends ParserNode {
    type: 'Identifier';
    name: string;
}

interface ConditionalStatementNode extends ParserNode {
    type: 'ConditionalStatement';
    test: string;
}

class ApexParser {

    constructor(public readonly lexer: ApexLexer) {
    }

    /**
     * Convert APEX code into an AST
     * @param input 
     */
    public parse(input: string) {
        for(const token of this.lexer.parse(input)) {
        }
    }
}