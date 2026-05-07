export interface DataMapperPathToken {
    readonly name: string;
    readonly index?: number | 'n';
}

export interface DataMapperPathContext {
    readonly arrayIndex?: number;
}

export function splitDataMapperPath(path: string | undefined): string[] {
    return String(path ?? '').split(':').map(part => part.trim()).filter(Boolean);
}

export function joinDataMapperPath(parts: readonly string[]) {
    return parts.filter(Boolean).join(':');
}

export function parseDataMapperPath(path: string | undefined): DataMapperPathToken[] {
    return splitDataMapperPath(path).map(segment => {
        const indexMatch = segment.match(/^(.*)\|(\d+|n)$/i);
        if (!indexMatch) {
            return { name: segment };
        }
        return {
            name: indexMatch[1],
            index: indexMatch[2].toLowerCase() === 'n' ? 'n' : Number(indexMatch[2])
        };
    });
}

export function getDataMapperPathValue(source: unknown, path: string | undefined, context?: DataMapperPathContext): unknown {
    if (!path) {
        return source;
    }
    return getValueByTokens(source, parseDataMapperPath(path), context);
}

export function getRecordFieldValue(record: unknown, fieldPath: string | undefined, context?: DataMapperPathContext): unknown {
    if (!fieldPath) {
        return record;
    }
    if (!record || typeof record !== 'object') {
        return undefined;
    }
    const owner = record as Record<string, unknown>;
    if (fieldPath in owner) {
        return owner[fieldPath];
    }
    const dotValue = getObjectPathValue(record, fieldPath, '.', context);
    if (dotValue !== undefined) {
        return dotValue;
    }
    return getDataMapperPathValue(record, fieldPath, context);
}

export function setDataMapperPathValue(target: Record<string, unknown>, path: string, value: unknown): void {
    const tokens = parseDataMapperPath(path);
    if (!tokens.length) {
        return;
    }
    let owner: Record<string, unknown> = target;
    for (const token of tokens.slice(0, -1)) {
        const key = token.name;
        const current = owner[key];
        if (!current || typeof current !== 'object' || Array.isArray(current)) {
            owner[key] = {};
        }
        owner = owner[key] as Record<string, unknown>;
        if (token.index !== undefined) {
            throw new Error(`Cannot set indexed DataMapper path segment: ${key}`);
        }
    }
    owner[tokens[tokens.length - 1].name] = value;
}

export function setRecordFieldValue(record: Record<string, unknown>, fieldPath: string, value: unknown): void {
    if (fieldPath in record || !fieldPath.includes('.')) {
        record[fieldPath] = value;
        return;
    }
    const parts = fieldPath.split('.').filter(Boolean);
    let owner = record;
    for (const part of parts.slice(0, -1)) {
        const current = owner[part];
        if (!current || typeof current !== 'object' || Array.isArray(current)) {
            owner[part] = {};
        }
        owner = owner[part] as Record<string, unknown>;
    }
    owner[parts[parts.length - 1]] = value;
}

export function pathStartsWith(path: readonly string[], prefix: readonly string[]) {
    return prefix.every((part, index) => path[index] === part);
}

export function longestCommonPrefix(paths: readonly string[][]) {
    if (!paths.length) {
        return [];
    }
    const result = new Array<string>();
    const [first] = paths;
    for (let index = 0; index < first.length; index++) {
        const segment = first[index];
        if (paths.every(path => path[index] === segment)) {
            result.push(segment);
        } else {
            break;
        }
    }
    return result;
}

function getValueByTokens(source: unknown, tokens: readonly DataMapperPathToken[], context?: DataMapperPathContext): unknown {
    let value = source;
    for (const token of tokens) {
        value = getObjectSegment(value, token.name, context);
        if (token.index !== undefined) {
            if (!Array.isArray(value)) {
                return undefined;
            }
            value = value[token.index === 'n' ? context?.arrayIndex ?? 0 : token.index];
        }
        if (value === undefined || value === null) {
            return value;
        }
    }
    return value;
}

function getObjectPathValue(source: unknown, path: string, separator: string, context?: DataMapperPathContext): unknown {
    let value = source;
    for (const part of path.split(separator).filter(Boolean)) {
        value = getObjectSegment(value, part, context);
        if (value === undefined || value === null) {
            return value;
        }
    }
    return value;
}

function getObjectSegment(source: unknown, segment: string, context?: DataMapperPathContext): unknown {
    if (Array.isArray(source)) {
        return source.map((item, index) => getObjectSegment(item, segment, { arrayIndex: index })).filter(value => value !== undefined);
    }
    if (!source || typeof source !== 'object') {
        return undefined;
    }
    const owner = source as Record<string, unknown>;
    if (segment in owner) {
        return owner[segment];
    }
    const lowerSegment = segment.toLowerCase();
    const matchingKey = Object.keys(owner).find(key => key.toLowerCase() === lowerSegment);
    if (matchingKey) {
        return owner[matchingKey];
    }
    if (segment === 'n') {
        return context?.arrayIndex;
    }
    return undefined;
}
