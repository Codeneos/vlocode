
declare module 'sass' {

    type ImporterReturnType = { file: string } | { contents: string } | Error | null;

    interface Importer {
        (url: string, prev: string, done: (data: ImporterReturnType) => void): ImporterReturnType | void;
    }

    interface Options {
        file?: string;
        data?: string;
        importer?: Importer | Importer[];
        functions?: { [key: string]: Function };
        includePaths?: string[];
        indentedSyntax?: boolean;
        indentType?: string;
        indentWidth?: number;
        linefeed?: string;
        omitSourceMapUrl?: boolean;
        outFile?: string;
        outputStyle?: "compact" | "compressed" | "expanded" | "nested";
        precision?: number;
        sourceComments?: boolean;
        sourceMap?: boolean | string;
        sourceMapContents?: boolean;
        sourceMapEmbed?: boolean;
        sourceMapRoot?: string;
    }

    interface SassError extends Error {
        message: string;
        line: number;
        column: number;
        status: number;
        file: string;
    }

    interface Result {
        css: Buffer;
        map: Buffer;
        stats: {
            entry: string;
            start: number;
            end: number;
            duration: number;
            includedFiles: string[];
        }
    }

    export function render(options: Options, callback: (err: SassError, result: Result) => any): void;
    export function renderSync(options: Options): Result;
}