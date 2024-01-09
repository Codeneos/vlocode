import { CommonTokenStream, CharStreams }  from 'antlr4ng';

import { ApexCompilationUnit, ApexTypeRef } from "./types";
import { TypeRefCollector } from "./visitors/typeRefCollector";
import { CompilationUnitVisitor } from "./visitors/compilationUnitVisitor";
import { BufferStream, CaseInsensitiveCharStream } from "./streams";
import { ApexParser, ApexLexer } from "./grammar";

/**
 * APEX Source code parser and lexer. Provides methods to parse APEX source
 * code into an abstract syntax tree (AST) and to get all referenced types in the source code.
 * 
 * @example
 * ```typescript
 * const parser = new Parser();
 * // cu will hold an abstract representation of the code structure of the source files
 * // multiple source files can be parsed at once by concatenating them
 * const cu = parser.getCodeStructure('public class MyClass { } public class OtherClass { }');
 * // refs will hold an array of ll external references: [ 'MyClass', 'BaseClass' ];
 * const refs = parser.getReferencedTypes('public class MyClass extends BaseClass { private MyOtherClass other; }');
 * ```
 */
export class Parser {

    private lexer: ApexLexer;
    private parser: ApexParser;

    /**
     * Parse a piece of Apex code into an abstract representation of the code structure of an APEX source files. 
     * Returns a {@link ApexCompilationUnit} object that contains all classes and interfaces defined in the source text. The 
     * source text can be a single file or multiple files concatenated or an array of source texts.
     * @param code Apex code to parse as a string or buffer (or an array of strings or buffers)
     * @returns An {@link ApexCompilationUnit} describing the code structure
     */
    public getCodeStructure(input: string | Buffer | string[] | Buffer[]): ApexCompilationUnit {
        const cuVisitor = new CompilationUnitVisitor();
        return Array.isArray(input)
            ? this.mergeCompilationUnits(
                input.map((code: string | Buffer) => this.parseAsCompilationUnit(code).accept(cuVisitor)!)
            )
            : this.parseAsCompilationUnit(input).accept(cuVisitor)!;
    }

    /**
     * Get all referenced types in the specified code
     * @param code Apex code to parse
     * @param options Options to control which types are returned
     * @returns An array of unique `ApexTypeRef` objects
     */
    public getReferencedTypes(code: string | Buffer, options?: { excludeSystemTypes?: boolean }): ApexTypeRef[] {
        return this.parseAsCompilationUnit(code).accept(new TypeRefCollector(options))!;
    }

    private parseAsCompilationUnit(code: string | Buffer) {
        const parser = this.createParser(code);
        const cu = parser.compilationUnit();
        if (!cu) {
            throw new Error('Failed to parse Apex code');
        }
        return cu;
    }

    private createParser(code: string | Buffer): ApexParser {
        const tokens = new CommonTokenStream(this.getLexer(code));

        if (!this.parser) {
            this.parser = new ApexParser(tokens);
        } else {
            this.parser.reset();
            this.parser.tokenStream = tokens;
        }

		return this.parser;
    }

    private getLexer(code: string | Buffer): ApexLexer {
        const cis = new CaseInsensitiveCharStream(this.getInputStream(code));

        if (!this.lexer) {
            this.lexer = new ApexLexer(cis);
        } else {
            this.lexer.reset();
            this.lexer._input = cis;
        }

        return this.lexer;
    }

    private getInputStream(code: string | Buffer) {
        if (typeof code === 'string') {
            return CharStreams.fromString(code);
        }
        return new BufferStream(code);
    }

    private mergeCompilationUnits(cus: ApexCompilationUnit[]): ApexCompilationUnit {
        return cus.reduce((result, cu) => this.mergeCompilationUnitWith(result, cu));
    }

    private mergeCompilationUnitWith(a: ApexCompilationUnit, b: ApexCompilationUnit): ApexCompilationUnit {
        return {
            classes: a.classes.concat(b.classes),
            interfaces: a.interfaces.concat(b.interfaces)
        };
    }
}