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
 * SASS compiler error result
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
 * SASS compiler options
 */
export interface SassCompilerOptions {
    // extra include paths considered by the importer
    importer: {
        includePaths?: string[];
        [key: string]: any;
    };
    // Format output: nested, expanded, compact, compressed
    style?: 'nested' | 'expanded' | 'compact' | 'compressed';
    // Decimal point precision for outputting fractional numbers
    // (-1 will use the libsass default, which currently is 5)
    precision?: number;
    // If you want inline source comments
    comments?: boolean;
    // String to be used for indentation
    indent?: string;
    // String to be used to for line feeds
    linefeed?: string;
}

export interface SassImportRequest {
    /** path libsass wants to load (content of »@import "<path>";«) */
    current?: string;
    /** absolute path of previously imported file ("stdin" if first) */
    previous?: string;
    /** currentPath resolved against previousPath */
    resolved?: string;
    /** absolute path in file system, null if not found */
    path?: string;
    /** value of options.importer */
    options?: any;
}

export interface SassImportResponse {
    /** the content to use instead of loading a file */
    content?: string;
    /** he absolute path to load from file system */
    path?: string;
    /** the error message to print and abort the compilation */
    error?: any;
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
    abstract compile(source: string, options?: SassCompilerOptions): Promise<SassCompileSuccessResult | SassCompileErrorResult>;
}


