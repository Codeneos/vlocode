export interface SassCompileSuccessResult {
    /**
     * status 0 means everything is ok, any other value means an error occurred
     */
    status: 0;
    /**
     * Compiled CSS
     */
    text: string;
    /**
     * Source map
     */
    map: any;
    /**
     * the files that were used during the compilation
     */
    files: string[];
}

/**
 * Unrestful compiler result
 */
export interface SassCompileErrorResult {
    status: 1;
    file: string;
    line: number;
    column: number;
    message: string;
    formatted: string;
}

/**
 * Describes a sass compiler
 */
export abstract class SassCompiler {
    /**
     * Compile SASS source string into CSS; returns a SASS compiler result with the result CSS or with an error when compilation is not successful.
     * @param source sass-source code to compile
     * @param options Sass.js options (see SASS.js for details)
     */
    abstract compile(source: string, options?: any): Promise<SassCompileSuccessResult | SassCompileErrorResult>;
}


