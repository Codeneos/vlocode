import { cache } from './cache';
import { singleton } from './singleton';

/**
 * Compares strings for equality; by default comparisons are case insensitive
 * @param a String a
 * @param b String b
 * @param insensitive Wether or not to do a case insensitive or case-sensitive comparison
 */
export function stringEquals(a : string | undefined | null, b: string | undefined | null, caseInsensitive: boolean = true) : boolean {
    if (a === b) {
        return true;
    }
    if (a === null || a === undefined) {
        return false;
    }
    if (b === null || b === undefined) {
        return false;
    }
    if (caseInsensitive) {
        return b.toLowerCase() == a.toLowerCase();
    }
    return false;
}

/**
 * Determines if the string spcified ends with the other string, caseInsensitive by default
 * @param a String a
 * @param b String b
 * @param insensitive Wether or not to do a case insensitive or case-sensitive comparison
 */
export function endsWith(a : string | undefined | null, b: string | undefined | null, caseInsensitive: boolean = true) : boolean {
    if (a === null || a === undefined) {
        return false;
    }
    if (b === null || b === undefined) {
        return false;
    }
    if (caseInsensitive) {
        return b.toLowerCase().endsWith(a.toLowerCase());
    }
    return b.endsWith(a);
}

export function format(formatStr: string, ...args: any[]) {
    return args.reduce((str, arg, i) => str.replace(new RegExp(`\\{${i}\\}`, 'g'), arg), formatStr);
}

/**
 * Helper to allow cache decorator to be used.
 */
class ExpressionCache {

    private readonly expressions = require('angular-expressions');

    @cache(-1)
    public compile(expr: string) : (context: any) => string {
        return this.expressions.compile(expr);
    }
}

/**
 * Evaluates an angular expression on the specified scope.
 * @param expr Format string
 * @param contextValues context values supplied
 */
export function evalExpr(expr: string, contextValues: any) : string {
    return singleton(ExpressionCache).compile(expr)(contextValues);
}

/**
 * Format string using the specified context values; format: 'Bar ${foo}', with context values {foo: 'bar'} results in 'Bar bar'
 * @param stringFormat Format string
 * @param contextValues context values supplied
 */
export function formatString(stringFormat: string, contextValues?: any) : string {
    return stringFormat.replace(/\${(.+?(.*?))}/gm, match => {
        const key = /\${(.+?(.*?))}/g.exec(match)?.[1];
        return key === undefined || contextValues?.[key] === undefined ? match : contextValues[key];
    });
}

/**
 * Returns section of the string after the last occurrence of the specified delimiter; in case the delimiter does not occur returns the whole string
 * @param value Value
 * @param delimiter Delimiter string passed ot split
 * @param limit Maximum number of splits to execute
 */
export function substringAfterLast(value: string, delimiter: string | RegExp): string {
    const splitted = value.split(delimiter);
    return splitted[splitted.length - 1];
}

/**
 * Returns section of the string after the first occurrence of the specified delimiter; in case the delimiter does not occur returns the whole string
 * @param value Value
 * @param delimiter Delimiter string passed ot split
 */
export function substringAfter(value: string, delimiter: string | RegExp): string {
    if (typeof delimiter === 'string') {
        // parse as string
        const indexOfDelimiter = value.indexOf(delimiter);
        if (indexOfDelimiter && indexOfDelimiter >= 0) {
            return value.substring(indexOfDelimiter + delimiter.length);
        }
        return value;
    }
    // Parse as regex
    const matchOfDelimiter = delimiter.exec(value);
    if (matchOfDelimiter) {
        return value.substring(matchOfDelimiter.index + matchOfDelimiter[0].length);
    }
    return value;
}

/**
 * Joins array parts together in one or more strings based on the max size of the string
 * @param parts 
 * @param delimiter 
 * @param limit 
 */
export function joinLimit(parts: any[], limit: number, delimiter?: string) : string[] {
    const result = new Array<any>();
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < parts.length; i++) {
        const element = String(parts[i]);
        const resultIndex = (result.length || 1) - 1;
        // eslint-disable-next-line @typescript-eslint/tslint/config
        if (result[resultIndex] === undefined) {
            result[resultIndex] = element;
        } else {
            result[resultIndex] += (delimiter ?? '') + element;
        }

        if (result[resultIndex].length > limit && parts.length !== i-1) {
            result.push(undefined);
        }
    }
    return result;
}