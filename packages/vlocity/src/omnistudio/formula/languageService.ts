import {
    OMNISTUDIO_FORMULA_CONSTANTS,
    OMNISTUDIO_FORMULA_FUNCTIONS,
    OMNISTUDIO_FORMULA_FUNCTIONS_BY_NAME,
    OMNISTUDIO_FORMULA_OPERATORS
} from './registry';
import type {
    OmniStudioFormulaCompletion,
    OmniStudioFormulaDiagnostic,
    OmniStudioFormulaHover,
    OmniStudioFormulaLanguageContext,
    OmniStudioFormulaPathSuggestion,
    OmniStudioFormulaSignatureHelp
} from './types';

const MAX_PATH_COMPLETIONS = 80;
const MAX_TOTAL_COMPLETIONS = 160;
const pathSuggestionCache = new WeakMap<readonly OmniStudioFormulaPathSuggestion[], NormalizedPathSuggestion[]>();

export class OmniStudioFormulaLanguageService {
    public getCompletions(expression: string, offset: number, context: OmniStudioFormulaLanguageContext = {}): OmniStudioFormulaCompletion[] {
        const range = completionRange(expression, offset);
        const rawPrefix = expression.slice(range.start, offset);
        return this.getCompletionsForPrefix(rawPrefix, range.start, range.end, context, {
            pathTrigger: expression[offset - 1] === '%'
        });
    }

    public getCompletionsForPrefix(
        rawPrefix: string,
        start: number,
        end: number,
        context: OmniStudioFormulaLanguageContext = {},
        options: { pathTrigger?: boolean } = {}
    ): OmniStudioFormulaCompletion[] {
        const prefix = rawPrefix.toUpperCase().replace(/^%/, '');
        const range = { start, end };
        const completingPath = rawPrefix.startsWith('%') || options.pathTrigger === true;
        const completions = new Array<OmniStudioFormulaCompletion>();

        if (!completingPath) {
            for (const definition of OMNISTUDIO_FORMULA_FUNCTIONS) {
                if (definition.name.startsWith(prefix)) {
                    completions.push({
                        label: definition.name,
                        insertText: `${definition.name}($0)`,
                        kind: 'function',
                        detail: definition.signature,
                        documentation: definition.description,
                        start: range.start,
                        end: range.end
                    });
                }
            }

            for (const operator of OMNISTUDIO_FORMULA_OPERATORS) {
                if (operator.startsWith(prefix)) {
                    completions.push({
                        label: operator,
                        insertText: operator,
                        kind: 'operator',
                        detail: 'Formula operator',
                        start: range.start,
                        end: range.end
                    });
                }
            }

            for (const constant of OMNISTUDIO_FORMULA_CONSTANTS) {
                if (constant.startsWith(prefix)) {
                    completions.push({
                        label: constant,
                        insertText: constant,
                        kind: 'constant',
                        detail: 'Formula constant',
                        start: range.start,
                        end: range.end
                    });
                }
            }
        }

        const paths = context.paths;
        if (paths?.length && shouldCompletePaths(rawPrefix, prefix, options.pathTrigger === true)) {
            const pathCompletions = matchingPathCompletions(paths, prefix, range);
            completions.push(...pathCompletions);
        }

        return completions.slice(0, MAX_TOTAL_COMPLETIONS);
    }

    public clearCompletionCache(paths?: readonly OmniStudioFormulaPathSuggestion[]): void {
        if (paths) {
            pathSuggestionCache.delete(paths);
        }
    }

    public getSignatureHelp(expression: string, offset: number): OmniStudioFormulaSignatureHelp | undefined {
        const call = findActiveCall(expression, offset);
        if (!call) {
            return undefined;
        }
        const definition = OMNISTUDIO_FORMULA_FUNCTIONS_BY_NAME[call.name.toUpperCase()];
        if (!definition) {
            return undefined;
        }
        return {
            name: definition.name,
            signature: definition.signature,
            documentation: definition.description,
            activeParameter: Math.min(call.argumentIndex, Math.max(definition.arguments.length - 1, 0)),
            parameters: definition.arguments
        };
    }

    public getHover(expression: string, offset: number): OmniStudioFormulaHover | undefined {
        const range = wordRange(expression, offset);
        if (!range) {
            return undefined;
        }
        const value = expression.slice(range.start, range.end).toUpperCase();
        const definition = OMNISTUDIO_FORMULA_FUNCTIONS_BY_NAME[value];
        if (definition) {
            return {
                contents: [`**${definition.signature}**`, definition.description ?? 'OmniStudio formula function'],
                start: range.start,
                end: range.end
            };
        }
        if (OMNISTUDIO_FORMULA_CONSTANTS.includes(value)) {
            return {
                contents: [`**${value}**`, 'OmniStudio formula constant'],
                start: range.start,
                end: range.end
            };
        }
        if (OMNISTUDIO_FORMULA_OPERATORS.includes(value)) {
            return {
                contents: [`**${value}**`, 'OmniStudio formula operator'],
                start: range.start,
                end: range.end
            };
        }
        return undefined;
    }

    public validate(expression: string): OmniStudioFormulaDiagnostic[] {
        const diagnostics = new Array<OmniStudioFormulaDiagnostic>();
        const stack = new Array<number>();
        let quote: string | undefined;
        let escape = false;

        for (let index = 0; index < expression.length; index++) {
            const char = expression[index];
            if (quote) {
                if (escape) {
                    escape = false;
                } else if (char === '\\') {
                    escape = true;
                } else if (char === quote) {
                    quote = undefined;
                }
                continue;
            }
            if (char === '"' || char === '\'') {
                quote = char;
                continue;
            }
            if (char === '(') {
                stack.push(index);
            } else if (char === ')') {
                const start = stack.pop();
                if (start === undefined) {
                    diagnostics.push(error('Unexpected closing parenthesis', index, index + 1));
                }
            }
        }

        if (quote) {
            diagnostics.push(error('Unterminated string literal', Math.max(expression.length - 1, 0), expression.length));
        }
        for (const start of stack) {
            diagnostics.push(error('Unclosed opening parenthesis', start, start + 1));
        }

        const calls = expression.matchAll(/\b([A-Za-z_][A-Za-z0-9_.$]*)\s*\(/g);
        for (const match of calls) {
            const name = match[1].toUpperCase();
            const definition = OMNISTUDIO_FORMULA_FUNCTIONS_BY_NAME[name];
            const start = match.index ?? 0;
            if (!definition) {
                diagnostics.push(error(`Unknown OmniStudio formula function: ${match[1]}`, start, start + match[1].length));
            }
        }

        const topLevel = findCompleteTopLevelCall(expression);
        if (topLevel) {
            const definition = OMNISTUDIO_FORMULA_FUNCTIONS_BY_NAME[topLevel.name.toUpperCase()];
            if (definition && ((definition.minArgs !== undefined && topLevel.argumentCount < definition.minArgs) || (definition.maxArgs !== undefined && topLevel.argumentCount > definition.maxArgs))) {
                diagnostics.push(error(`${definition.name} expects ${formatArgCount(definition.minArgs, definition.maxArgs)} argument(s)`, topLevel.start, topLevel.end));
            }
        }

        return diagnostics;
    }
}

interface NormalizedPathSuggestion {
    readonly path: string;
    readonly label: string;
    readonly detail?: string;
    readonly normalizedPath: string;
    readonly normalizedLabel: string;
}

function shouldCompletePaths(rawPrefix: string, prefix: string, pathTrigger: boolean) {
    return rawPrefix.startsWith('%') || pathTrigger || prefix.length >= 2;
}

function matchingPathCompletions(
    paths: readonly OmniStudioFormulaPathSuggestion[],
    prefix: string,
    range: { start: number; end: number }
) {
    const normalized = normalizedPathSuggestions(paths);
    const completions = new Array<OmniStudioFormulaCompletion>();

    for (const suggestion of normalized) {
        if (suggestion.normalizedPath.startsWith(prefix) || suggestion.normalizedLabel.startsWith(prefix)) {
            completions.push(pathCompletion(suggestion, range));
            if (completions.length >= MAX_PATH_COMPLETIONS) {
                return completions;
            }
        }
    }

    if (prefix.length >= 2) {
        for (const suggestion of normalized) {
            if (
                !suggestion.normalizedPath.startsWith(prefix)
                && !suggestion.normalizedLabel.startsWith(prefix)
                && (suggestion.normalizedPath.includes(prefix) || suggestion.normalizedLabel.includes(prefix))
            ) {
                completions.push(pathCompletion(suggestion, range));
                if (completions.length >= MAX_PATH_COMPLETIONS) {
                    break;
                }
            }
        }
    }

    return completions;
}

function normalizedPathSuggestions(paths: readonly OmniStudioFormulaPathSuggestion[]) {
    let normalized = pathSuggestionCache.get(paths);
    if (!normalized) {
        normalized = paths.map(suggestion => {
            const label = suggestion.label ?? suggestion.path;
            return {
                path: suggestion.path,
                label,
                detail: suggestion.detail ?? suggestion.path,
                normalizedPath: suggestion.path.toUpperCase(),
                normalizedLabel: label.toUpperCase()
            };
        });
        pathSuggestionCache.set(paths, normalized);
    }
    return normalized;
}

function pathCompletion(suggestion: NormalizedPathSuggestion, range: { start: number; end: number }): OmniStudioFormulaCompletion {
    return {
        label: suggestion.label,
        insertText: `%${suggestion.path}%`,
        kind: 'path',
        detail: suggestion.detail,
        start: range.start,
        end: range.end
    };
}

function error(message: string, start: number, end: number): OmniStudioFormulaDiagnostic {
    return { message, start, end: Math.max(end, start + 1), severity: 'error' };
}

function completionRange(expression: string, offset: number) {
    const range = wordRange(expression, offset);
    if (range) {
        return range;
    }
    return { start: offset, end: offset };
}

function wordRange(expression: string, offset: number): { start: number; end: number } | undefined {
    let start = offset;
    let end = offset;
    while (start > 0 && /[A-Za-z0-9_.$:%]/.test(expression[start - 1])) {
        start--;
    }
    while (end < expression.length && /[A-Za-z0-9_.$:%]/.test(expression[end])) {
        end++;
    }
    return start === end ? undefined : { start, end };
}

function findActiveCall(expression: string, offset: number): { name: string; argumentIndex: number } | undefined {
    let depth = 0;
    for (let index = offset - 1; index >= 0; index--) {
        const char = expression[index];
        if (char === ')') {
            depth++;
        } else if (char === '(') {
            if (depth > 0) {
                depth--;
                continue;
            }
            const nameMatch = expression.slice(0, index).match(/([A-Za-z_][A-Za-z0-9_.$]*)\s*$/);
            if (!nameMatch) {
                return undefined;
            }
            return {
                name: nameMatch[1],
                argumentIndex: countArguments(expression.slice(index + 1, offset))
            };
        }
    }
    return undefined;
}

function countArguments(text: string): number {
    let depth = 0;
    let count = 0;
    let quote: string | undefined;
    let escape = false;
    for (const char of text) {
        if (quote) {
            if (escape) {
                escape = false;
            } else if (char === '\\') {
                escape = true;
            } else if (char === quote) {
                quote = undefined;
            }
            continue;
        }
        if (char === '"' || char === '\'') {
            quote = char;
        } else if (char === '(') {
            depth++;
        } else if (char === ')') {
            depth--;
        } else if (char === ',' && depth === 0) {
            count++;
        }
    }
    return count;
}

function findCompleteTopLevelCall(expression: string): { name: string; argumentCount: number; start: number; end: number } | undefined {
    const match = expression.match(/^\s*([A-Za-z_][A-Za-z0-9_.$]*)\s*\(([\s\S]*)\)\s*$/);
    if (!match) {
        return undefined;
    }
    const body = match[2];
    return {
        name: match[1],
        argumentCount: body.trim() ? countArguments(body) + 1 : 0,
        start: match.index ?? 0,
        end: expression.length
    };
}

function formatArgCount(minArgs?: number, maxArgs?: number) {
    if (minArgs === maxArgs) {
        return String(minArgs ?? 0);
    }
    if (maxArgs === undefined) {
        return `${minArgs ?? 0}+`;
    }
    return `${minArgs ?? 0}-${maxArgs}`;
}
