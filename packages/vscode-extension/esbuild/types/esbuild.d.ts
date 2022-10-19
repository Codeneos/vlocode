import { Type } from "js-yaml";

/**
 * ESBuild types as exported from esbuild documentation.
 */
export interface OnResolveArgs {
    path: string;
    importer: string;
    namespace: string;
    resolveDir: string;
    kind: ResolveKind;
    pluginData: any;
}

export type ResolveKind =
    | 'entry-point'
    | 'import-statement'
    | 'require-call'
    | 'dynamic-import'
    | 'require-resolve'
    | 'import-rule'
    | 'url-token';

export interface OnResolveResult {
    errors?: Message[];
    external?: boolean;
    namespace?: string;
    path?: string;
    pluginData?: any;
    pluginName?: string;
    sideEffects?: boolean;
    suffix?: string;
    warnings?: Message[];
    watchDirs?: string[];
    watchFiles?: string[];
}

export interface OnLoadOptions {
    filter: RegExp;
    namespace?: string;
}

export interface OnLoadArgs {
    path: string;
    namespace: string;
    suffix: string;
    pluginData: any;
}

export interface OnLoadResult {
    contents?: string | Uint8Array;
    errors?: Message[];
    loader?: string;
    pluginData?: any;
    pluginName?: string;
    resolveDir?: string;
    warnings?: Message[];
    watchDirs?: string[];
    watchFiles?: string[];
}

export interface Message {
    text: string;
    location?: Location;
    detail?: any; // The original error from a JavaScript plugin, if applicable
}

export interface Location {
    file: string;
    namespace?: string;
    line: number; // 1-based
    column: number; // 0-based, in bytes
    length?: number; // in bytes
    lineText: string;
}

type PluginFnResult<T> = T | undefined | Promise<T | undefined>

export interface SetupArgs {
    onResolve(filter: { filter: RegExp, namespace?: string }, fn: (args: OnResolveArgs) => PluginFnResult<OnResolveResult>): void;
    onLoad(filter: { filter: RegExp, namespace?: string }, fn: (args: OnLoadArgs) => PluginFnResult<OnResolveResult>): void;
}

export interface Plugin {
    name: string;
    setup(build: SetupArgs): void;
}
