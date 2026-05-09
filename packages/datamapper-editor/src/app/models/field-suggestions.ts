import type { DataMapperItem, ExtractGroup, FieldSuggestion } from './datamapper.model';
import { inputPath } from './datamapper-paths';

export function uniqueSuggestions(fields: FieldSuggestion[]): FieldSuggestion[] {
    const seen = new Set<string>();
    return fields
        .filter(field => {
            const key = field.path.toLowerCase();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        })
        .sort((a, b) => a.path.localeCompare(b.path));
}

export function pathSuggestions(values: Iterable<unknown>): FieldSuggestion[] {
    const result: FieldSuggestion[] = [];
    for (const value of values) {
        if (!value) {
            continue;
        }
        const path = String(value);
        result.push({ path, name: path });
    }
    return result;
}

export function extractSourceSuggestions(
    sourceFields: FieldSuggestion[],
    extractionGroups: ExtractGroup[],
    formulaItems: DataMapperItem[],
    items: DataMapperItem[]
): FieldSuggestion[] {
    const fieldsByObject = groupSourceFieldsByObject(sourceFields);
    const suggestions: FieldSuggestion[] = [];

    for (const group of extractionGroups) {
        const extractPath = group.outputFieldName?.trim();
        const objectName = group.inputObjectName?.trim();
        if (!extractPath || !objectName) {
            continue;
        }
        suggestions.push({
            objectName,
            name: extractPath.split(':').pop() ?? extractPath,
            label: 'Extract object path',
            path: extractPath
        });
        for (const field of fieldsByObject.get(objectName.toLowerCase()) ?? []) {
            suggestions.push({ ...field, objectName, path: `${extractPath}:${field.name}` });
        }
    }

    for (const formula of formulaItems) {
        const formulaPath = String(formula.FormulaResultPath ?? '').trim();
        if (formulaPath) {
            suggestions.push({ name: formulaPath.split(':').pop() ?? formulaPath, label: 'Formula result path', path: formulaPath });
        }
    }

    for (const item of items) {
        const path = sourcePathForItem(item, extractionGroups);
        if (path) {
            suggestions.push({ path, name: path.split(':').pop() ?? path });
        }
    }

    return uniqueSuggestions(suggestions);
}

function groupSourceFieldsByObject(sourceFields: FieldSuggestion[]) {
    const fieldsByObject = new Map<string, FieldSuggestion[]>();
    for (const field of sourceFields) {
        const objectName = field.objectName ?? sourceFieldObjectFromPath(field.path);
        if (!objectName) {
            continue;
        }
        const key = objectName.toLowerCase();
        const fields = fieldsByObject.get(key);
        if (fields) {
            fields.push(field);
        } else {
            fieldsByObject.set(key, [field]);
        }
    }
    return fieldsByObject;
}

function sourceFieldObjectFromPath(path: string) {
    const separator = path.indexOf(':');
    return separator > 0 ? path.slice(0, separator) : undefined;
}

function sourcePathForItem(item: DataMapperItem, extractionGroups: ExtractGroup[]) {
    const inputFieldName = String(item.InputFieldName ?? '').trim();
    if (!inputFieldName || inputFieldName.includes(':')) {
        return inputFieldName;
    }
    const inputObjectName = String(item.InputObjectName ?? '').trim();
    if (!inputObjectName) {
        return inputFieldName;
    }
    const matches = extractionGroups.filter(group => group.inputObjectName?.toLowerCase() === inputObjectName.toLowerCase());
    if (matches.length === 1 && matches[0].outputFieldName) {
        return `${matches[0].outputFieldName}:${inputFieldName}`;
    }
    return inputPath(item);
}
