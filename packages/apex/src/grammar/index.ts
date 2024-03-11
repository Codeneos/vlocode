export * from './ApexParser';
export * from './ApexLexer';
export * from './ApexParserListener';
export * from './ApexParserVisitor';

// Export context types
//export * from './parser';

// // Augment ParseTree to add accept method
// declare module "antlr4" {
//     interface ParseTree2 {
//         readonly text: string;
//         readonly start: Token;
//         readonly end: Token;
//         readonly parent: this | undefined;
//         readonly children: ReadonlyArray<ParseTree>;

//         accept<T>(visitor: ParseTreeVisitor<T>): T;
//         getSourceInterval(): string;

//         getChildCount(): Number;
//         getChild(i: number): ParseTree;

//         getTokens(): Token[];
//         getToken(i: number): Token;

//         isEmpty(): Boolean;
//         toString(): string;
//         toStringTree(): string;
//     }
// }