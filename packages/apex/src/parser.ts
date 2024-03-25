import { CommonTokenStream, CharStream, ParserATNSimulator, LexerATNSimulator }  from 'antlr4ng';

import { ApexCompilationUnit, ApexTypeRef } from "./types";
import { TypeRefCollector } from "./visitors/typeRefCollector";
import { CompilationUnitVisitor } from "./visitors/compilationUnitVisitor";
import { BufferStream } from "./streams";
import { ApexParser, ApexLexer, CompilationUnitContext, TriggerUnitContext } from "./grammar";

/**
 * APEX Source code parser and lexer. Provides methods to parse APEX source
 * code into an abstract syntax tree (AST) and to get all referenced types in the source code.
 *
 * @example
 * ```typescript
 * // cu will hold an abstract representation of the code structure of the source files
 * // multiple source files can be parsed at once by concatenating them
 * const cu = new Parser('public class MyClass { } public class OtherClass { }').getCodeStructure();
 * // refs will hold an array of ll external references: [ 'MyClass', 'BaseClass' ];
 * const refs = new Parser('public class MyClass extends BaseClass { private MyOtherClass other; }').getReferencedTypes();
 * ```
 */
export class Parser {

    private lexer: ApexLexer;
    private parser: ApexParser;
    private cu: CompilationUnitContext | TriggerUnitContext;

    constructor(private input: Buffer | string) {
    }

    /**
     * Parse a piece of Apex code into an abstract representation of the code structure of an APEX source files. 
     * Returns a {@link ApexCompilationUnit} object that contains all classes and interfaces defined in the source text. The 
     * source text can be a single file or multiple files concatenated or an array of source texts.
     * @param code Apex code to parse as a string or buffer (or an array of strings or buffers)
     * @returns An {@link ApexCompilationUnit} describing the code structure
     */
    public getCodeStructure(): ApexCompilationUnit {
        return this.parseAsCompilationUnit().accept(new CompilationUnitVisitor())!;
    }

    /**
     * Get all referenced types in the specified code
     * @param code Apex code to parse
     * @param options Options to control which types are returned
     * @returns An array of unique `ApexTypeRef` objects
     */
    public getReferencedTypes(options?: { excludeSystemTypes?: boolean }): ApexTypeRef[] {
        return this.parseAsCompilationUnit().accept(new TypeRefCollector(options))!;
    }

    private parseAsCompilationUnit() {
        if (!this.cu) {
            this.cu = this.getParser().compilationUnit();
        }
        return this.cu;
    }

    private getParser(): ApexParser {
        if (!this.parser) {
            const tokens = new CommonTokenStream(this.getLexer());
            this.parser = new ApexParser(tokens);
        }
        this.parser.reset();
		return this.parser;
    }

    private getLexer(): ApexLexer {
        if (!this.lexer) {
            this.lexer = new ApexLexer(this.createInputStream());
        }
        return this.lexer;
    }

    private createInputStream() {
        if (typeof this.input === 'string') {
            return CharStream.fromString(this.input);
        }
        return new BufferStream(this.input);
    }
}