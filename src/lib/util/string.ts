import * as expressions from 'angular-expressions';
import cache from './cache';
import { singleton } from './singleton';

/**
 * Compares strings for equality; by default comparisons are case insensitive
 * @param a String a
 * @param b String b
 * @param insensitive Wether or not to do a case insensitive or case-sensitive comparison
 */
export function stringEquals(a : string, b: string, caseInsensitive: boolean = true) : boolean {
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

export function format(formatStr: string, ...args: any[]) {
    return args.reduce((str, arg, i) => str.replace(new RegExp(`\\{${i}\\}`, 'g'), arg), formatStr);
}

/**
 * Helper to allow cache decorator to be used.
 */
class ExpressionCache {
    @cache(-1)
    public compile(expr: string) : (context: any) => string {
        return expressions.compile(expr);
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
export function formatString(stringFormat: string, contextValues: {}) : string {
    return stringFormat.replace(/\${(.+?(.*?))}/gm, match => {
        const key = /\${(.+?(.*?))}/g.exec(match)[1];
        return contextValues[key] === undefined ? match : contextValues[key];
    });
}