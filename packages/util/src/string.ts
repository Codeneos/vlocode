import { compileFunction } from './compiler';
import { getObjectProperty } from './object';

/**
 * Compares strings for equality; by default comparisons are case insensitive
 * @param a String a
 * @param b String b
 * @param caseInsensitive Wether or not to do a case insensitive or case-sensitive comparison
 */
export function stringEquals(a : string | undefined | null, b: string | undefined | null, options?: { caseInsensitive: boolean } | boolean) : boolean {
    if (a === b) {
        return true;
    }
    if (a === null || a === undefined) {
        return false;
    }
    if (b === null || b === undefined) {
        return false;
    }
    if (options === undefined || options === true || (options && options.caseInsensitive)) {
        return b.toLowerCase() === a.toLowerCase();
    }
    return false;
}

/**
 * Case insensetive tring equals comparison that supports string arrays as well as single strings.
 * Comparisons are case insensitive, and the comparison is true if any of the strings in the array match the specified string.
 * @param a String a to compare
 * @param b String b to compare or array of strings to compare against a
 * @returns `true` if a matches any of the strings in b, `false` otherwise
 */
export function stringEqualsIgnoreCase(a : string | undefined | null, b: string | string[] | undefined | null) : boolean {
    if (typeof a === 'string') {
        if (typeof b === 'string') {
            return b.toLowerCase() === a.toLowerCase();
        } else if (Array.isArray(b)) {
            return b.some(e => e.toLowerCase() === a.toLowerCase());
        }
        // A is string but b is not a string and not an array so never equal
        return false;
    }
    // Only equal if a strict equals b
    return a === b;
}

/**
 * Checks if the specified string {@link a} ends with the specified string {@link based}.
 * By default the comparison is case sensitive unless specified otherwise by setting the `caseInsensitive` option to `true`.
 * If either string is null or undefined returns `false`.
 * @param a String a
 * @param b String b
 * @param options Options
 * @param options.caseInsensitive Wether or not to do a case insensitive or case-sensitive comparison
 */
export function endsWith(a: string | undefined | null, b: string | undefined | null, options?: { caseInsensitive: boolean }): boolean {
    if (a === null || a === undefined) {
        return false;
    }
    if (b === null || b === undefined) {
        return false;
    }
    if (options?.caseInsensitive) {
        return a.toLowerCase().endsWith(b.toLowerCase());
    }
    return a.endsWith(b);
}

export function format(formatStr: string, ...args: any[]) {
    return args.reduce((str, arg, i) => str.replace(new RegExp(`\\{${i}\\}`, 'g'), arg), formatStr);
}

/**
 * Evaluates an angular expression on the specified scope.
 * @param expr Format string
 * @param contextValues context values supplied
 */
export function evalExpr(expr: string, contextValues: any) : string {
    const updatedContext = compileFunction(`$$result = ${expr}`)(contextValues, false);
    return updatedContext.$$result;
}

/**
 * Evaluates ES6 like template string using the specified contest
 * @param expr Format string
 * @param contextValues context values supplied
 */
export function evalTemplate(expr: string, contextValues: any) : string {
    const updatedContext = compileFunction(`$$result = \`${expr}\``)(contextValues, false);
    return updatedContext.$$result;
}

/**
 * Format string using the specified context values supporting simple ES6 string interpolation at run-time.
 * - ES6 interpolated string `Bar ${foo}`  with context values `{foo: 'bar'}` results in `Bar bar`
 * - Using named context valyes `Bar ${foo}`  with context values `{foo: 'bar'}` results in `Bar bar`
 * @param stringFormat Format string
 * @param contextValues context values supplied
 */
export function formatString(stringFormat: string, contextValues?: any) : string {
    return stringFormat.replace(/\$?{(.+?(.*?))}/gm, (match, key) => {
        const value = getObjectProperty(contextValues, key);
        return value === undefined ? match : (typeof value === 'string' ? value : `${value}`);
    });
}

/**
 * Returns section of the string before occurrence of the specified delimiter; in case the delimiter does not occur returns the whole string
 * @param value Value
 * @param delimiter Delimiter string passed ot split
 */
export function substringBefore(value: string, delimiter: string | RegExp): string {
    if (typeof delimiter === 'string') {
        // parse as string
        const indexOfDelimiter = value.indexOf(delimiter);
        if (indexOfDelimiter && indexOfDelimiter >= 0) {
            return value.substring(0, indexOfDelimiter);
        }
        return value;
    }
    return value.split(delimiter, 1).shift()!;
}

/**
 * Returns section of the string before occurrence of the last specified delimiter; in case the delimiter does not occur returns the whole string
 * @param value Value
 * @param delimiter Delimiter string passed ot split
 */
export function substringBeforeLast(value: string, delimiter: string): string {
    // parse as string
    const indexOfDelimiter = value.lastIndexOf(delimiter);
    if (indexOfDelimiter && indexOfDelimiter >= 0) {
        return value.substring(0, indexOfDelimiter);
    }
    return value;
}

/**
 * Returns section of the string after the last occurrence of the specified delimiter; in case the delimiter does not occur returns the whole string
 * @param value Value
 * @param delimiter Delimiter string passed ot split
 */
export function substringAfterLast(value: string, delimiter: string | RegExp): string {
    if (typeof delimiter === 'string') {
        // parse as string
        const indexOfDelimiter = value.lastIndexOf(delimiter);
        if (indexOfDelimiter && indexOfDelimiter >= 0) {
            return value.substring(indexOfDelimiter + delimiter.length);
        }
        return value;
    }
    return value.split(delimiter).pop()!;
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
export function joinLimit(parts: any[], limit: number, delimiter: string = ',') : string[] {
    const result = new Array<string>();

    if (!delimiter) {
        delimiter = '';
    }

    for (const item of parts) {
        const element = String(item);
        const lastIndex = result.length ? result.length - 1 : 0;
        if (!result[lastIndex] || result[lastIndex].length + delimiter.length + element.length > limit) {
            result[result.length] = element;
        } else {
            result[lastIndex] += delimiter + element;
        }
    }

    return result;
}

const escapedCharacters = {
    '&': '&amp;',
    '"': '&quot;',
    '\'': '&#39;',
    '<': '&lt;',
    '>': '&gt;'
}

/**
 * Escapes &, ", ', <, > to their HTML entities.
 * @param value Value to escape
 * @returns Escaped value
 */
export function escapeHtmlEntity(value: string) {
    return value.replace(/[&"'<>]/g, c => escapedCharacters[c] ?? c);
}

/**
 * Normalizes a name to a lower `camelCase` format removing any special characters and spaces:
 * - `OM_Rule` becomes `omRule`
 * - `Xml-parser` becomes `xmlParser`
 * - `my named prop` becomes `myNamedProp`
 * @param name name to convert to lower camel case
 */
export function lowerCamelCase(name: string, options?: { forceLowerCase?: boolean }) : string {
    let normalized = '';
    let nextUpper = false;
    for (let index = 0; index < name.length; index++) {
        const char = name.charAt(index);
        if ((char === ' ' || char === '-' || char === '_') && normalized.length > 0) {
            nextUpper = true;
        } else if (isAlphaNumericChar(name.charCodeAt(index))) {
            // Skip any other special character
            continue;
        } else if(nextUpper) {
            normalized += char.toUpperCase();
            nextUpper = false;
        } else {
            normalized += normalized.length === 0 || options?.forceLowerCase ? char.toLowerCase() : char;
        }
    }
    return normalized;
}

/**
 * Checks if the specified character is an alpha numeric character
 * @param char Character point to check
 * @returns `true` when the character is an alpha numeric character otherwise `false`
 */
export function isAlphaNumericChar(char: number) : boolean {
    return !((char > 47 && char < 58) || (char > 64 && char < 91) || (char > 96 && char < 123));
}

export function isUppercaseChar(char: number) : boolean {
    return char > 64 && char < 91;
}

export function isLowercaseChar(char: number) : boolean {
    return char > 96 && char < 123;
}

export function isNumericChar(char: number) : boolean {
    return char > 47 && char < 58;
}

export function isAlphaNumeric(name: string) : boolean {
    for (let index = 0; index < name.length; index++) {
        if (!isAlphaNumericChar(name.charCodeAt(index))) {
            return false;
        }
    }
    return true;
}

/**
 * Encode URL parameters according to RFC3986 using %-encoding.
 * Encodes spaces as `+`.
 * @remarks differs from {@link encodeURIComponent} in also encoding `!`, `'`, `(`, `)`, and `*`
 * @param str String value to encode
 * @returns encoded string
 */
export function encodeRFC3986URI(str: string) {
    return str.replace(
        /[:/?#[\]@!$'()*+,;=%& ]/g,
        c => c === ' ' ? '+' : `%${c.charCodeAt(0).toString(16).toUpperCase()}`
    );
}