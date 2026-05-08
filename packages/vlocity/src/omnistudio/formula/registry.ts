import type { OmniStudioFormulaFunctionDefinition } from './types';

const functionDefinitions: OmniStudioFormulaFunctionDefinition[] = [
    fn('ABS', 'ABS(number)', 'Returns the absolute value of a number.', ['number'], 1, 1),
    fn('ADDDAY', 'ADDDAY(date, days)', 'Adds days to a date.', ['date', 'days'], 2, 2),
    fn('ADDMONTH', 'ADDMONTH(date, months)', 'Adds months to a date.', ['date', 'months'], 2, 2),
    fn('ADDYEAR', 'ADDYEAR(date, years)', 'Adds years to a date.', ['date', 'years'], 2, 2),
    fn('AGE', 'AGE(date)', 'Returns the age in years at the current date.', ['date'], 1, 1),
    fn('AGEON', 'AGEON(date, onDate)', 'Returns the age in years at a specific date.', ['date', 'onDate'], 2, 2),
    fn('AVG', 'AVG(value, ...values)', 'Returns the average of numeric values.', ['value'], 1),
    fn('BASE64ENCODE', 'BASE64ENCODE(value)', 'Base64-encodes a string value.', ['value'], 1, 1),
    fn('CASE', 'CASE(value, match1, result1, ..., defaultValue)', 'Returns the matching CASE result.', ['value', 'match', 'result'], 3),
    fn('CEILING', 'CEILING(number)', 'Rounds a number up.', ['number'], 1, 1),
    fn('CONCAT', 'CONCAT(value, ...values)', 'Concatenates values into a string.', ['value'], 1),
    fn('CONTAINS', 'CONTAINS(value, search)', 'Returns true when a string contains the search value.', ['value', 'search'], 2, 2),
    fn('COUNT', 'COUNT(value, ...values)', 'Counts flattened values.', ['value'], 1),
    fn('COUNTQUERY', 'COUNTQUERY(soql)', 'Executes a SOQL query and returns the row count.', ['soql'], 1, 1),
    fn('CURRENCY', 'CURRENCY(value)', 'Converts a value to a number.', ['value'], 1, 1),
    fn('DATE', 'DATE(year, month, day)', 'Creates a date.', ['year', 'month', 'day'], 3, 3),
    fn('DATEDIFF', 'DATEDIFF(startDate, endDate)', 'Returns whole days between two dates.', ['startDate', 'endDate'], 2, 2),
    fn('DATETIME', 'DATETIME(value)', 'Converts a value to an ISO datetime string.', ['value'], 1, 1),
    fn('DATETIMETOUNIX', 'DATETIMETOUNIX(value)', 'Converts a datetime to Unix milliseconds.', ['value'], 1, 1),
    fn('DAY', 'DAY(date)', 'Returns the day of month.', ['date'], 1, 1),
    fn('DESERIALIZE', 'DESERIALIZE(json)', 'Parses a JSON string.', ['json'], 1, 1),
    fn('ENDSWITH', 'ENDSWITH(value, suffix)', 'Returns true when a string ends with a suffix.', ['value', 'suffix'], 2, 2),
    fn('EOM', 'EOM(date)', 'Returns the end of month date.', ['date'], 1, 1),
    fn('EQUALS', 'EQUALS(left, right)', 'Compares two values for equality.', ['left', 'right'], 2, 2),
    fn('FILTER', 'FILTER(list, predicate)', 'Filters a list using an expression predicate.', ['list', 'predicate'], 1, 2),
    fn('FIND', 'FIND(search, value)', 'Finds a substring index.', ['search', 'value'], 2, 2),
    fn('FLOOR', 'FLOOR(number)', 'Rounds a number down.', ['number'], 1, 1),
    fn('FORMAT', 'FORMAT(pattern, ...values)', 'Formats a string pattern.', ['pattern', 'value'], 1),
    fn('FORMATCURRENCY', 'FORMATCURRENCY(value, currency)', 'Formats a value as currency.', ['value', 'currency'], 1, 2),
    fn('FORMATDATE', 'FORMATDATE(date)', 'Formats a date.', ['date'], 1, 1),
    fn('FORMATDATETIME', 'FORMATDATETIME(dateTime, format, timezone)', 'Formats a datetime.', ['dateTime', 'format', 'timezone'], 1, 3),
    fn('FORMATDATETIMEGMT', 'FORMATDATETIMEGMT(dateTime, timezone, format)', 'Formats a GMT datetime.', ['dateTime', 'timezone', 'format'], 1, 3),
    fn('FUNCTION', 'FUNCTION(className, methodName, ...args)', 'Invokes an injected function registry.', ['className', 'methodName', 'arg'], 1),
    fn('GENERATEGLOBALKEY', 'GENERATEGLOBALKEY(prefix)', 'Generates a global key with an optional prefix.', ['prefix'], 0, 1),
    fn('GET', 'GET(object, path)', 'Gets a value from an object path.', ['object', 'path'], 2, 2),
    fn('HOUR', 'HOUR(time)', 'Returns the hour value.', ['time'], 1, 1),
    fn('IF', 'IF(condition, trueValue, falseValue)', 'Returns one value when condition is true and another when false.', ['condition', 'trueValue', 'falseValue'], 1, 3),
    fn('IFBLANK', 'IFBLANK(value, fallback)', 'Returns fallback when value is blank.', ['value', 'fallback'], 2, 2),
    fn('IFNULL', 'IFNULL(value, fallback)', 'Returns fallback when value is null.', ['value', 'fallback'], 2, 2),
    fn('ISBLANK', 'ISBLANK(value)', 'Returns true when value is blank.', ['value'], 1, 1),
    fn('ISNOTBLANK', 'ISNOTBLANK(value)', 'Returns true when value is not blank.', ['value'], 1, 1),
    fn('ISNOTNULL', 'ISNOTNULL(value)', 'Returns true when value is not null.', ['value'], 1, 1),
    fn('ISNULL', 'ISNULL(value)', 'Returns true when value is null.', ['value'], 1, 1),
    fn('JOIN', 'JOIN(value, ...values)', 'Joins values into a string.', ['value'], 1),
    fn('JSONPATH', 'JSONPATH(object, path)', 'Gets a JSON path value.', ['object', 'path'], 2, 2),
    fn('LEFT', 'LEFT(value, count)', 'Returns the left substring.', ['value', 'count'], 2, 2),
    fn('LENGTH', 'LENGTH(value)', 'Returns string or list length.', ['value'], 1, 1),
    fn('LIST', 'LIST(...values)', 'Creates a list.', ['value'], 0),
    fn('LISTMERGE', 'LISTMERGE(key, ...lists)', 'Merges lists by key.', ['key', 'list'], 2),
    fn('LISTMERGEPRIMARY', 'LISTMERGEPRIMARY(key, ...lists)', 'Merges primary list rows by key.', ['key', 'list'], 2),
    fn('LISTSIZE', 'LISTSIZE(value, ...values)', 'Returns list size.', ['value'], 1),
    fn('LOWER', 'LOWER(value)', 'Converts a string to lowercase.', ['value'], 1, 1),
    fn('MAPTOLIST', 'MAPTOLIST(map)', 'Converts a map to a list.', ['map'], 1, 1),
    fn('MAX', 'MAX(value, ...values)', 'Returns the maximum numeric value.', ['value'], 1),
    fn('MAXSTRING', 'MAXSTRING(value, ...values)', 'Returns the maximum string value.', ['value'], 1),
    fn('MIN', 'MIN(value, ...values)', 'Returns the minimum numeric value.', ['value'], 1),
    fn('MINUTE', 'MINUTE(time)', 'Returns the minute value.', ['time'], 1, 1),
    fn('MOD', 'MOD(left, right)', 'Returns the modulo result.', ['left', 'right'], 2, 2),
    fn('MONTH', 'MONTH(date)', 'Returns the month value.', ['date'], 1, 1),
    fn('NOW', 'NOW(format)', 'Returns the current datetime.', ['format'], 0, 1),
    fn('POWER', 'POWER(base, exponent)', 'Raises base to exponent.', ['base', 'exponent'], 2, 2),
    fn('QUERY', 'QUERY(soql)', 'Executes a SOQL query.', ['soql'], 1, 1),
    fn('RANDOM', 'RANDOM()', 'Returns a random number.', [], 0, 0),
    fn('REPLACE', 'REPLACE(value, search, replacement)', 'Replaces all occurrences in a string.', ['value', 'search', 'replacement'], 3, 3),
    fn('RESERIALIZE', 'RESERIALIZE(value)', 'Parses and serializes JSON.', ['value'], 1, 1),
    fn('RIGHT', 'RIGHT(value, count)', 'Returns the right substring.', ['value', 'count'], 2, 2),
    fn('ROUND', 'ROUND(value, precision, mode)', 'Rounds a number.', ['value', 'precision', 'mode'], 1, 3),
    fn('SECOND', 'SECOND(time)', 'Returns the second value.', ['time'], 1, 1),
    fn('SERIALIZE', 'SERIALIZE(value)', 'Serializes a value to JSON.', ['value'], 1, 1),
    fn('SORTBY', 'SORTBY(list, key, direction)', 'Sorts a list by key.', ['list', 'key', 'direction'], 2, 3),
    fn('SPLIT', 'SPLIT(value, delimiter)', 'Splits a string.', ['value', 'delimiter'], 1, 2),
    fn('SQRT', 'SQRT(number)', 'Returns the square root.', ['number'], 1, 1),
    fn('STARTSWITH', 'STARTSWITH(value, prefix)', 'Returns true when a string starts with a prefix.', ['value', 'prefix'], 2, 2),
    fn('STRING', 'STRING(value)', 'Converts a value to string.', ['value'], 1, 1),
    fn('STRINGINDEXOF', 'STRINGINDEXOF(value, search)', 'Returns the search substring index.', ['value', 'search'], 2, 2),
    fn('SUBSTRING', 'SUBSTRING(value, start, end)', 'Returns a substring.', ['value', 'start', 'end'], 2, 3),
    fn('SUM', 'SUM(value, ...values)', 'Sums numeric values.', ['value'], 1),
    fn('TIMEDIFF', 'TIMEDIFF(endTime, startTime)', 'Returns milliseconds between two times.', ['endTime', 'startTime'], 2, 2),
    fn('TODAY', 'TODAY()', 'Returns the current date.', [], 0, 0),
    fn('TOSTRING', 'TOSTRING(value)', 'Converts a value to string.', ['value'], 1, 1),
    fn('TRIM', 'TRIM(value)', 'Trims whitespace.', ['value'], 1, 1),
    fn('UNIXTODATETIME', 'UNIXTODATETIME(value, format)', 'Converts Unix milliseconds to datetime.', ['value', 'format'], 1, 2),
    fn('UPPER', 'UPPER(value)', 'Converts a string to uppercase.', ['value'], 1, 1),
    fn('URLENCODE', 'URLENCODE(value)', 'URL-encodes a string.', ['value'], 1, 1),
    fn('VALUE', 'VALUE(value)', 'Converts a value to number.', ['value'], 1, 1),
    fn('VALUELOOKUP', 'VALUELOOKUP(map, key, childKey)', 'Looks up a nested value.', ['map', 'key', 'childKey'], 2, 3),
    fn('YEAR', 'YEAR(date)', 'Returns the year value.', ['date'], 1, 1)
];

export const OMNISTUDIO_FORMULA_FUNCTIONS = Object.freeze(functionDefinitions);
export const OMNISTUDIO_FORMULA_FUNCTIONS_BY_NAME = Object.freeze(Object.fromEntries(
    functionDefinitions.map(definition => [definition.name, definition])
)) as Readonly<Record<string, OmniStudioFormulaFunctionDefinition>>;

export const OMNISTUDIO_FORMULA_OPERATORS = Object.freeze([
    'OR', '||', 'AND', '&&', 'LIKE', 'NOTLIKE', '~=', '=', '==', '!=', '<>', '<', '<=', '>', '>=', '+', '-', '*', '/', '%', '^', 'NOT', '!'
]);

export const OMNISTUDIO_FORMULA_CONSTANTS = Object.freeze([
    'TRUE', 'FALSE', 'NULL', '$VLOCITY.TRUE', '$VLOCITY.FALSE', '$VLOCITY.NULL', ':ASC', ':DSC', ':DESC', 'UP', 'DOWN', 'HALF_UP', 'HALF_DOWN', 'HALF_EVEN', 'CEILING', 'FLOOR'
]);

function fn(
    name: string,
    signature: string,
    description: string,
    args: string[],
    minArgs?: number,
    maxArgs?: number
): OmniStudioFormulaFunctionDefinition {
    return {
        name,
        signature,
        description,
        arguments: args.map((arg, index) => ({
            name: arg.replace(/^\.\.\./, ''),
            optional: maxArgs !== undefined && index + 1 > (minArgs ?? args.length),
            variadic: arg.startsWith('...')
        })),
        minArgs,
        maxArgs
    };
}
