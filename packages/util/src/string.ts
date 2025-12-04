/**
 * String utility functions for manipulating and comparing strings.
 * @module string
 */
import { compileFunction } from './compiler';
import { getObjectProperty } from './object';
import unidecode from 'unidecode';

/**
 * Compares strings for equality; by default comparisons are case insensitive
 * @param a String a
 * @param b String b
 * @param options Options or boolean indicating whether the comparison is case insensitive
 * @param options.caseInsensitive When `options` is an object, set to `true` to perform a case-insensitive comparison
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
 * Checks if the specified string `a` ends with the specified string `b`.
 * By default the comparison is case sensitive unless specified otherwise by setting the `caseInsensitive` option to `true`.
 * If either string is null or undefined returns `false`.
 * @param a String a
 * @param b String b
 * @param options Options
 * @param options.caseInsensitive Whether or not to do a case insensitive or case-sensitive comparison
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
    const fn = compileFunction(`return ${expr}`);
    return fn(contextValues, { allowUndefined: true, mutableContext: false });
}

/**
 * Evaluates ES6 like template string using the specified contest
 * @param expr Format string
 * @param contextValues context values supplied
 */
export function evalTemplate(expr: string, contextValues: any) : string {
    const fn = compileFunction(`return \`${expr}\``);
    return fn(contextValues, { allowUndefined: true, mutableContext: false });
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
 * Get the substring between the last occurrence of the specified start and end string. 
 * If the end string is not found the substring after the start string is returned.
 * If the start string is not found but the end of the string is found the substring before the end string is returned.
 * @param value value to search in
 * @param start start string
 * @param end end string
 * @returns 
 */
export function substringBetweenLast(value: string, start: string, end?: string): string {
    if (end === undefined) {
        return substringBetweenLast(value, start, start);
    }
    const indexOfEnd = value.lastIndexOf(end);
    if (indexOfEnd < 0) {
        return substringAfterLast(value, start);
    }
    value = value.substring(0, indexOfEnd);
    const indexOfStart = value.lastIndexOf(start);
    if (indexOfStart >= 0) {
        return value.substring(indexOfStart + start.length);
    }
    return value;
}

/**
 * Returns the first occurrence of the substring between the specified start and end needles.
 * If the start needle is not found, returns the original string.
 * If the end needle is not found, returns the substring from after the start needle to the end of the string.
 * @param value Input string
 * @param start The starting needle
 * @param end The ending needle
 */
export function substringBetween(value: string, start: string, end: string): string {
    const startIndex = value.indexOf(start);
    if (startIndex === -1) {
        return value;
    }
    const startPos = startIndex + start.length;
    const endIndex = value.indexOf(end, startPos);
    if (endIndex === -1) {
        return value.substring(startPos);
    }
    return value.substring(startPos, endIndex);
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

/**
 * Encode an object to a query string escaped for use in a URL
 * @param params Object with key value pairs to encode
 * @returns Encoded query string
 */
export function encodeQueryString(params: object): string {
    return Object.entries(params)
        .map(([v,k]) => k !== undefined ? `${v}=${encodeURIComponent(String(k))}` : k)
        .join('&');
}

/**
 * Returns a string with the specified unit pluralized based on the count.
 *
 * @param unit - The unit to be pluralized.
 * @param count - The count of the unit.
 * @returns The pluralized string.
 */
export function pluralize(unit: unknown, count: number | Array<unknown> | object) {
    count = Array.isArray(count) ? count.length : typeof count === 'object' ? Object.keys(count).length : count;
    const unitStr = `${unit}`;
    if (count === 1) {
        return `${count} ${unitStr}`;
    }
    let pluralUnit: string;
    if (unitStr.endsWith('y')) {
        pluralUnit = unitStr.substring(0, unitStr.length - 1) + 'ies';
    } else if (unitStr.endsWith('s')) {
        pluralUnit = unitStr + 'es';
    } else {
        pluralUnit = unitStr + 's';
    }
    return `${count} ${pluralUnit}`;
}

// Precompiled regexes for optimize normalizeName function
const vlocityNamespaceRegex = /(%vlocity_namespace%|vlocity_namespace)__/gi;
const vlocityRegex = /vlocity_([a-z]{2,4})__/gi;
const nonAlphaNumRegex = /[^A-Z0-9\\/_-]+/gi;
const multiDashRegex = /-+/g;
const multiHyphenUnderscoreRegex = /[-_]{2,}/g;
const leadingCharsRegex = /^[-_\\/]+/;
const trailingCharsRegex = /[-_\\/]+$/;

/**
 * Normalizes a given name string by performing the following transformations:
 * - Normalizes the string using Unicode Normalization Form D (NFD).
 * - Removes accents and diacritical marks.
 * - Removes occurrences of the Vlocity namespace.
 * - Removes occurrences of the Vlocity keyword.
 * - Replaces non-alphanumeric characters with a hyphen ('-').
 * - Replaces multiple consecutive hyphens with a single hyphen.
 * - Replaces multiple consecutive hyphens and underscores with a single underscore.
 * - Removes leading non-alphanumeric characters.
 * - Removes trailing non-alphanumeric characters.
 *
 * @param name - The name string to be normalized.
 * @returns The normalized name string.
 */
export function normalizeName(name: string) {
    return unidecode(name)
        .replace(vlocityNamespaceRegex, '')
        .replace(vlocityRegex, '')
        .replace(nonAlphaNumRegex, '-')
        .replace(multiDashRegex, '-')
        .replace(multiHyphenUnderscoreRegex, '_')
        .replace(leadingCharsRegex, '')
        .replace(trailingCharsRegex, '');
}

/**
 * Converts any value to a string representation.
 * 
 * @param value - The value to convert to a string
 * @returns A string representation of the input value
 * 
 * - If `undefined`, returns an empty string
 * - If already a string, returns it unchanged
 * - If a BigInt, converts to decimal string
 * - If a Date, converts to ISO string
 * - If an object, converts to JSON string
 * - For all other types, uses String() conversion
 */
export function asString(value: unknown): string {
    if (value === undefined) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (value instanceof BigInt) {
        return value.toString(10);
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}