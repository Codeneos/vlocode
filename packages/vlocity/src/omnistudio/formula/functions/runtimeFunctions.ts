import { randomUUID } from 'crypto';
import { getDataMapperPathValue } from '../../../datamapper/path';
import type { OmniStudioFormulaContext, OmniStudioFormulaRuntimeContext } from '../types';

export type OmniStudioFormulaFunction = (args: unknown[], context: OmniStudioFormulaRuntimeContext) => unknown | Promise<unknown>;

export const OMNISTUDIO_FORMULA_RUNTIME_FUNCTIONS: Record<string, OmniStudioFormulaFunction> = {
    ABS: args => Math.abs(toNumber(args[0])),
    ADDDAY: args => addDate(args[0], { days: toNumber(args[1]) }),
    ADDMONTH: args => addDate(args[0], { months: toNumber(args[1]) }),
    ADDYEAR: args => addDate(args[0], { years: toNumber(args[1]) }),
    AGE: (args, context) => age(args[0], currentDate(context)),
    AGEON: args => age(args[0], toDate(args[1])),
    AVG: args => average(flattenValues(args)),
    BASE64ENCODE: args => Buffer.from(String(args[0] ?? ''), 'utf8').toString('base64'),
    CASE: args => caseValue(args),
    CEILING: args => Math.ceil(toNumber(args[0])),
    CONCAT: args => args.map(value => value ?? '').join(''),
    CONTAINS: args => String(args[0] ?? '').includes(String(args[1] ?? '')),
    COUNT: args => flattenValues(args).length,
    COUNTQUERY: async (args, context) => {
        if (!context.queryRunner) {
            throw new Error('COUNTQUERY requires a queryRunner');
        }
        return (await context.queryRunner.query(String(args[0] ?? ''))).length;
    },
    CURRENCY: args => toNumber(args[0]),
    DATE: args => toIsoDate(new Date(Date.UTC(Number(args[0]), toNumber(args[1]) - 1, Number(args[2])))),
    DATEDIFF: args => Math.trunc((toDate(args[1]).getTime() - toDate(args[0]).getTime()) / 86400000),
    DATETIMETOUNIX: args => toDate(args[0]).getTime(),
    DATETIME: args => toDate(args[0]).toISOString(),
    DAY: args => toDate(args[0]).getUTCDate(),
    DESERIALIZE: args => deserializeJson(args[0]),
    ENDSWITH: args => String(args[0] ?? '').endsWith(String(args[1] ?? '')),
    EOM: args => endOfMonth(args[0]),
    EQUALS: args => compare(args[0], args[1]) === 0,
    FIND: args => String(args[1] ?? '').indexOf(String(args[0] ?? '')),
    FLOOR: args => Math.floor(toNumber(args[0])),
    FORMAT: args => formatString(String(args[0] ?? ''), args.slice(1)),
    FORMATCURRENCY: args => new Intl.NumberFormat('en-US', { style: 'currency', currency: String(args[1] ?? 'USD') }).format(toNumber(args[0])),
    FORMATDATE: args => toIsoDate(toDate(args[0])),
    FORMATDATETIME: (args, context) => formatDateTime(args[0], args[1], args[2] ?? context.timezone),
    FORMATDATETIMEGMT: args => formatDateTime(args[0], args[2], args[1], true),
    GENERATEGLOBALKEY: args => `${args[0] ?? ''}${randomUUID()}`,
    GET: args => getDataMapperPathValue(args[0], String(args[1] ?? '')),
    HOUR: args => getDatePart(args[0], 'hour'),
    IFBLANK: args => isBlank(args[0]) ? args[1] : args[0],
    IFNULL: args => args[0] === null || args[0] === undefined ? args[1] : args[0],
    ISBLANK: args => isBlank(args[0]),
    ISNOTBLANK: args => !isBlank(args[0]),
    ISNOTNULL: args => args[0] !== null && args[0] !== undefined,
    ISNULL: args => args[0] === null || args[0] === undefined,
    JOIN: args => joinValues(args),
    JSONPATH: args => getDataMapperPathValue(args[0], String(args[1] ?? '').replace(/^\$\./, '').replace(/\./g, ':')),
    LEFT: args => String(args[0] ?? '').slice(0, toNumber(args[1])),
    LENGTH: args => Array.isArray(args[0]) ? args[0].length : String(args[0] ?? '').length,
    LIST: args => args.length === 0 ? [] : args.length === 1 && Array.isArray(args[0]) ? args[0] : args,
    LISTMERGE: args => listMerge(args),
    LISTMERGEPRIMARY: args => listMerge(args, { primaryOnly: true }),
    LISTSIZE: args => listSize(args),
    LOWER: args => String(args[0] ?? '').toLowerCase(),
    MAPTOLIST: args => mapToList(args[0]),
    MAX: args => Math.max(...flattenValues(args).map(toNumber)),
    MAXSTRING: args => maxString(flattenValues(args)),
    MIN: args => Math.min(...flattenValues(args).map(toNumber)),
    MINUTE: args => getDatePart(args[0], 'minute'),
    MOD: args => toNumber(args[0]) % toNumber(args[1]),
    MONTH: args => toDate(args[0]).getUTCMonth() + 1,
    NOW: (args, context) => args[0] ? formatDateTime(currentDate(context), args[0], context.timezone) : currentDate(context).toISOString(),
    POWER: args => Math.pow(toNumber(args[0]), toNumber(args[1])),
    QUERY: async (args, context) => {
        if (!context.queryRunner) {
            throw new Error('QUERY requires a queryRunner');
        }
        return context.queryRunner.query(String(args[0] ?? ''));
    },
    RANDOM: () => Math.random(),
    REPLACE: args => String(args[0] ?? '').replaceAll(String(args[1] ?? ''), String(args[2] ?? '')),
    RESERIALIZE: args => reserialize(args[0]),
    RIGHT: args => String(args[0] ?? '').slice(-toNumber(args[1])),
    ROUND: args => round(toNumber(args[0]), toNumber(args[1] ?? 0), args[2]),
    SECOND: args => getDatePart(args[0], 'second'),
    SERIALIZE: args => JSON.stringify(args[0]),
    SORTBY: args => sortBy(args),
    SPLIT: args => String(args[0] ?? '').split(String(args[1] ?? ',')),
    STARTSWITH: args => String(args[0] ?? '').startsWith(String(args[1] ?? '')),
    STRING: args => args[0] === null || args[0] === undefined ? '' : String(args[0]),
    STRINGINDEXOF: args => String(args[0] ?? '').indexOf(String(args[1] ?? '')),
    SUBSTRING: args => substring(args),
    SQRT: args => Math.sqrt(toNumber(args[0])),
    SUM: args => flattenValues(args).reduce<number>((sum, value) => sum + toNumber(value), 0),
    TIMEDIFF: args => timeDiff(args[0], args[1]),
    TODAY: (_args, context) => toIsoDate(currentDate(context)),
    TOSTRING: args => args[0] === null || args[0] === undefined ? '' : String(args[0]),
    TRIM: args => String(args[0] ?? '').trim(),
    UNIXTODATETIME: args => unixToDateTime(args[0], args[1]),
    UPPER: args => String(args[0] ?? '').toUpperCase(),
    URLENCODE: args => encodeURIComponent(String(args[0] ?? '')),
    VALUE: args => toNumber(args[0]),
    VALUELOOKUP: args => valueLookup(args),
    YEAR: args => toDate(args[0]).getUTCFullYear()
};

export function toNumber(value: unknown): number {
    if (value === null || value === undefined || value === '') {
        return 0;
    }
    return Number(value);
}

export function compare(left: unknown, right: unknown): number {
    if (left === right) {
        return 0;
    }
    if (left === null || left === undefined) {
        return -1;
    }
    if (right === null || right === undefined) {
        return 1;
    }
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
        return leftNumber === rightNumber ? 0 : leftNumber > rightNumber ? 1 : -1;
    }
    return String(left).toLocaleLowerCase().localeCompare(String(right).toLocaleLowerCase());
}

export function containsIgnoreCase(left: unknown, right: unknown): boolean {
    return String(left ?? '').toLocaleLowerCase().includes(String(right ?? '').toLocaleLowerCase());
}

function isBlank(value: unknown) {
    return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

export function toArrayValue(value: unknown) {
    return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

function flattenValues(values: unknown[]): unknown[] {
    return values.flatMap(value => Array.isArray(value) ? flattenValues(value) : [value]);
}

function listSize(args: unknown[]) {
    if (!args.length) {
        return 0;
    }
    return args.length === 1 ? toArrayValue(args[0]).length : flattenValues(args).length;
}

function listMerge(args: unknown[], options?: { primaryOnly?: boolean }) {
    const firstListIndex = args.findIndex(Array.isArray);
    if (firstListIndex < 0) {
        return [];
    }
    const keys = args
        .slice(0, firstListIndex)
        .flatMap(key => String(key ?? '').split(','))
        .map(key => key.trim())
        .filter(Boolean);
    const lists = args.slice(firstListIndex).map(toArrayValue);
    const merged = new Array<unknown>();
    const byMergeKey = new Map<string, Record<string, unknown>>();
    for (const [listIndex, list] of lists.entries()) {
        for (const item of list) {
            if (!isPlainRecord(item) || !keys.length) {
                if (!options?.primaryOnly || listIndex === 0) {
                    merged.push(item);
                }
                continue;
            }
            const mergeKey = buildMergeKey(item, keys);
            const existing = mergeKey ? byMergeKey.get(mergeKey) : undefined;
            if (existing) {
                Object.assign(existing, item);
                continue;
            }
            if (options?.primaryOnly && listIndex > 0) {
                continue;
            }
            const copy = { ...item };
            if (mergeKey) {
                byMergeKey.set(mergeKey, copy);
            }
            merged.push(copy);
        }
    }
    return merged;
}

function substring(args: unknown[]) {
    const value = String(args[0] ?? '');
    const start = resolveSubstringIndex(value, args[1], 0, 'start');
    if (args[2] === undefined) {
        return value.slice(start);
    }
    const end = resolveSubstringIndex(value, args[2], value.length, 'end');
    return value.slice(start, end);
}

function caseValue(args: unknown[]) {
    const [value, ...branches] = args;
    for (let index = 0; index < branches.length - 1; index += 2) {
        if (compare(value, branches[index]) === 0) {
            return branches[index + 1];
        }
    }
    return branches.length % 2 === 1 ? branches[branches.length - 1] : undefined;
}

function average(values: unknown[]) {
    return values.length ? values.reduce<number>((sum, value) => sum + toNumber(value), 0) / values.length : 0;
}

function formatString(format: string, values: unknown[]) {
    return format.replace(/\{(\d+)\}/g, (_match, index) => String(values[Number(index)] ?? ''));
}

function round(value: number, decimals: number, direction?: unknown) {
    const factor = Math.pow(10, decimals);
    const scaled = value * factor;
    switch (String(direction ?? 'HALF_UP').toUpperCase()) {
        case 'UP':
            return (scaled < 0 ? Math.floor(scaled) : Math.ceil(scaled)) / factor;
        case 'DOWN':
            return (scaled < 0 ? Math.ceil(scaled) : Math.floor(scaled)) / factor;
        case 'CEILING':
            return Math.ceil(scaled) / factor;
        case 'FLOOR':
            return Math.floor(scaled) / factor;
        case 'HALF_DOWN':
            return roundHalf(scaled, false) / factor;
        case 'HALF_EVEN':
            return roundHalfEven(scaled) / factor;
        case 'HALF_UP':
        default:
            return Math.round(scaled) / factor;
    }
}

function currentDate(context: OmniStudioFormulaContext) {
    return typeof context.now === 'function' ? context.now() : context.now ?? new Date();
}

function toDate(value: unknown) {
    if (value instanceof Date) {
        return value;
    }
    if (typeof value === 'number') {
        return new Date(value);
    }
    const normalized = normalizeDateString(String(value ?? ''));
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function addDate(value: unknown, delta: { days?: number; months?: number; years?: number }) {
    const date = toDate(value);
    if (delta.days) {
        date.setUTCDate(date.getUTCDate() + delta.days);
    }
    if (delta.months) {
        date.setUTCMonth(date.getUTCMonth() + delta.months);
    }
    if (delta.years) {
        date.setUTCFullYear(date.getUTCFullYear() + delta.years);
    }
    return date.toISOString();
}

function toIsoDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

function deserializeJson(value: unknown) {
    if (value && typeof value === 'object') {
        return value;
    }
    const json = String(value ?? 'null');
    return json.trim() ? JSON.parse(json) : null;
}

function reserialize(value: unknown) {
    return JSON.stringify(deserializeJson(value));
}

function joinValues(args: unknown[]) {
    if (!args.length) {
        return '';
    }
    if (Array.isArray(args[0]) && args.length <= 2) {
        return args[0].join(String(args[1] ?? ','));
    }
    const token = String(args[args.length - 1] ?? ',');
    return args.slice(0, -1).map(value => value ?? '').join(token);
}

function mapToList(value: unknown) {
    if (Array.isArray(value)) {
        return value;
    }
    if (isPlainRecord(value)) {
        return Object.values(value);
    }
    return value === undefined || value === null ? [] : [value];
}

function maxString(values: unknown[]) {
    return values.map(value => String(value ?? '')).sort((a, b) => a.localeCompare(b)).at(-1) ?? '';
}

function sortBy(args: unknown[]) {
    const list = toArrayValue(args[0]);
    const rawKeys = args.slice(1);
    const descending = rawKeys.length > 0 && isDescendingMarker(rawKeys[rawKeys.length - 1]);
    const keys = (descending ? rawKeys.slice(0, -1) : rawKeys).map(key => String(key ?? '').replace(/^:/, '')).filter(Boolean);
    return [...list].sort((left, right) => {
        for (const key of keys) {
            const result = compare(getDataMapperPathValue(left, key), getDataMapperPathValue(right, key));
            if (result !== 0) {
                return descending ? -result : result;
            }
        }
        return 0;
    });
}

function valueLookup(args: unknown[]) {
    const [startNode, ...nodes] = args;
    const start = typeof startNode === 'string' ? deserializeMaybeJson(startNode) : startNode;
    return getDataMapperPathValue(start, nodes.map(node => String(node ?? '')).join(':'));
}

function deserializeMaybeJson(value: string) {
    const trimmed = value.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        return value;
    }
    try {
        return JSON.parse(trimmed);
    } catch {
        return value;
    }
}

function timeDiff(first: unknown, second: unknown) {
    return toDate(first).getTime() - toDate(second).getTime();
}

function unixToDateTime(value: unknown, format?: unknown) {
    const timestamp = toNumber(value);
    const millis = Math.abs(timestamp) < 100000000000 ? timestamp * 1000 : timestamp;
    const date = new Date(millis);
    return format ? formatDateTime(date, format, 'UTC') : date.toISOString();
}

function getDatePart(value: unknown, part: 'hour' | 'minute' | 'second') {
    const date = toDate(value);
    if (part === 'hour') {
        return date.getUTCHours();
    }
    if (part === 'minute') {
        return date.getUTCMinutes();
    }
    return date.getUTCSeconds();
}

function endOfMonth(value: unknown) {
    const date = toDate(value);
    return toIsoDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)));
}

function age(birthDate: unknown, onDate: Date) {
    const birth = toDate(birthDate);
    let years = onDate.getUTCFullYear() - birth.getUTCFullYear();
    const beforeBirthday = onDate.getUTCMonth() < birth.getUTCMonth()
        || (onDate.getUTCMonth() === birth.getUTCMonth() && onDate.getUTCDate() < birth.getUTCDate());
    if (beforeBirthday) {
        years--;
    }
    return years;
}

function formatDateTime(value: unknown, format: unknown, timezone?: unknown, forceUtc = false) {
    const date = toDate(value);
    const pattern = String(format ?? '');
    if (!pattern) {
        return date.toISOString();
    }
    const parts = dateTimeParts(date, forceUtc ? 'UTC' : timezone);
    return pattern
        .replace(/yyyy|YYYY/g, parts.year)
        .replace(/MM/g, parts.month)
        .replace(/dd|DD/g, parts.day)
        .replace(/HH/g, parts.hour)
        .replace(/mm/g, parts.minute)
        .replace(/ss/g, parts.second)
        .replace(/SSS/g, parts.millisecond);
}

function dateTimeParts(date: Date, timezone?: unknown) {
    const timeZone = String(timezone ?? '').trim();
    if (!timeZone) {
        return {
            year: pad(date.getUTCFullYear(), 4),
            month: pad(date.getUTCMonth() + 1),
            day: pad(date.getUTCDate()),
            hour: pad(date.getUTCHours()),
            minute: pad(date.getUTCMinutes()),
            second: pad(date.getUTCSeconds()),
            millisecond: pad(date.getUTCMilliseconds(), 3)
        };
    }
    let parts: Record<string, string>;
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        parts = Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]));
    } catch {
        return dateTimeParts(date);
    }
    return {
        year: parts.year ?? '1970',
        month: parts.month ?? '01',
        day: parts.day ?? '01',
        hour: parts.hour === '24' ? '00' : parts.hour ?? '00',
        minute: parts.minute ?? '00',
        second: parts.second ?? '00',
        millisecond: pad(date.getUTCMilliseconds(), 3)
    };
}

function normalizeDateString(value: string) {
    const trimmed = value.trim();
    const timeOnly = trimmed.match(/^T?(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?Z?)$/);
    if (timeOnly) {
        return `1970-01-01T${ensureUtcSuffix(timeOnly[1])}`;
    }
    const slashDate = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(T.*)?$/);
    if (slashDate) {
        const [, month, day, year, time] = slashDate;
        return `${year}-${pad(month)}-${pad(day)}${time ? ensureUtcSuffix(time) : 'T00:00:00.000Z'}`.replace(/:(\d{3})Z$/, '.$1Z');
    }
    const normalized = trimmed.replace(/:(\d{3})(Z?)$/, '.$1$2');
    if (/^\d{4}-\d{2}-\d{2}T/.test(normalized) && !/(Z|[+-]\d{2}:?\d{2})$/.test(normalized)) {
        return `${normalized}Z`;
    }
    return normalized;
}

function ensureUtcSuffix(value: string) {
    return /(Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`;
}

function resolveSubstringIndex(value: string, rawIndex: unknown, fallback: number, mode: 'start' | 'end') {
    if (rawIndex === undefined || rawIndex === null || rawIndex === '') {
        return fallback;
    }
    if (typeof rawIndex === 'number' || /^-?\d+$/.test(String(rawIndex))) {
        const index = Number(rawIndex);
        if (index < 0 || index > value.length) {
            return mode === 'start' ? 0 : value.length;
        }
        return index;
    }
    const found = value.indexOf(String(rawIndex));
    if (found < 0) {
        return fallback;
    }
    return mode === 'start' ? found : Math.max(0, found - 1);
}

function buildMergeKey(item: Record<string, unknown>, keys: string[]) {
    const values = keys.map(key => getDataMapperPathValue(item, key));
    if (values.some(value => value === undefined || value === null)) {
        return undefined;
    }
    return values.map(value => String(value).toLocaleLowerCase()).join('\u001f');
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isDescendingMarker(value: unknown) {
    return [':DSC', 'DSC', ':DESC', 'DESC'].includes(String(value ?? '').toUpperCase());
}

function roundHalf(value: number, up: boolean) {
    const sign = Math.sign(value) || 1;
    const abs = Math.abs(value);
    const floor = Math.floor(abs);
    const fraction = abs - floor;
    if (fraction > 0.5 || (up && fraction === 0.5)) {
        return sign * (floor + 1);
    }
    return sign * floor;
}

function roundHalfEven(value: number) {
    const sign = Math.sign(value) || 1;
    const abs = Math.abs(value);
    const floor = Math.floor(abs);
    const fraction = abs - floor;
    if (fraction > 0.5) {
        return sign * (floor + 1);
    }
    if (fraction < 0.5) {
        return sign * floor;
    }
    return sign * (floor % 2 === 0 ? floor : floor + 1);
}

function pad(value: number | string, length = 2) {
    return String(value).padStart(length, '0');
}
