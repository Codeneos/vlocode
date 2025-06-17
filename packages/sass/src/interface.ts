export interface SassCompileResult {
    /**
     * Compiled CSS
     */
    css: string;
    /**
     * Source map
     */
    sourceMap?: object;
    /**
     * the URLs that were used during the compilation
     */
    loadedUrls: string[];
}

/**
 * SASS compiler options
 */
export interface SassCompileOptions {
    // extra include paths considered by the importer
    importer: {
        includePaths?: string[];
    };
    // Format output: nested, expanded, compact, compressed
    style?: 'expanded' | 'compressed';
}

/**
 * Describes a sass compiler
 */
export abstract class SassCompiler {
    /**
     * Compile SASS source string into CSS; returns a SASS compiler result with the result CSS or with an error when compilation is not successful.
     * @param source sass-source code to compile
     * @param options Extra options to pass the the compiler
     */
    abstract compile(source: string, options?: SassCompileOptions): Promise<SassCompileResult>;
}

