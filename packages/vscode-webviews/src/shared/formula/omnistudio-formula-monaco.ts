import { OmniStudioFormulaLanguageService } from '@vlocode/vlocity/omnistudio/formula/languageService';
import { OMNISTUDIO_FORMULA_CONSTANTS, OMNISTUDIO_FORMULA_FUNCTIONS, OMNISTUDIO_FORMULA_OPERATORS } from '@vlocode/vlocity/omnistudio/formula/registry';
import type { OmniStudioFormulaArgumentDefinition } from '@vlocode/vlocity/omnistudio/formula/types';
import type { monaco } from '../components/monaco-editor/monaco-editor.component';

export const OMNISTUDIO_FORMULA_LANGUAGE_ID = 'omnistudio-formula';

const languageService = new OmniStudioFormulaLanguageService();
let registered = false; 
const formulaCompletionTriggers = [
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$_'
];

export function registerOmniStudioFormulaLanguage(monacoApi: typeof monaco) {
    if (registered) {
        return;
    }
    registered = true;

    monacoApi.languages.register({ id: OMNISTUDIO_FORMULA_LANGUAGE_ID });
    monacoApi.languages.setLanguageConfiguration(OMNISTUDIO_FORMULA_LANGUAGE_ID, {
        comments: {},
        brackets: [['(', ')']],
        wordPattern: /[$A-Za-z_][\w.$|]*/,
        autoClosingPairs: [
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: '\'', close: '\'' },
            { open: '%', close: '%' }
        ],
        surroundingPairs: [
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: '\'', close: '\'' },
            { open: '%', close: '%' }
        ]
    });
    monacoApi.languages.setMonarchTokensProvider(OMNISTUDIO_FORMULA_LANGUAGE_ID, {
        ignoreCase: true,
        functions: OMNISTUDIO_FORMULA_FUNCTIONS.map(definition => definition.name),
        constants: OMNISTUDIO_FORMULA_CONSTANTS,
        operators: OMNISTUDIO_FORMULA_OPERATORS,
        defaultToken: 'identifier',
        tokenizer: {
            root: [
                [/%[^%\r\n]*%/, 'variable'],
                [/"([^"\\]|\\.)*$/, 'string.invalid'],
                [/'([^'\\]|\\.)*$/, 'string.invalid'],
                [/"/, { token: 'string.quote', bracket: '@open', next: '@string_double' }],
                [/'/, { token: 'string.quote', bracket: '@open', next: '@string_single' }],
                [/\d+(\.\d+)?/, 'number'],
                [/[(),]/, 'delimiter'],
                [/[+\-*/%^=!<>~|&]+/, 'operator'],
                [/[A-Za-z_$][\w.$]*/, {
                    cases: {
                        '@functions': 'keyword',
                        '@constants': 'constant',
                        '@operators': 'operator',
                        '@default': 'identifier'
                    }
                }],
                [/\s+/, 'white']
            ],
            string_double: [
                [/[^\\"]+/, 'string'],
                [/\\./, 'string.escape'],
                [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
            ],
            string_single: [
                [/[^\\']+/, 'string'],
                [/\\./, 'string.escape'],
                [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
            ]
        }
    });

    monacoApi.languages.registerCompletionItemProvider(OMNISTUDIO_FORMULA_LANGUAGE_ID, {
        triggerCharacters: formulaCompletionTriggers,
        provideCompletionItems(model, position, _completionContext, token) {
            const range = completionRangeAtPosition(model, position);
            const rawPrefix = model.getLineContent(position.lineNumber).slice(range.startColumn - 1, position.column - 1);
            const completions = languageService.getCompletionsForPrefix(
                rawPrefix,
                range.startColumn,
                range.endColumn
            );
            if (token.isCancellationRequested) {
                return { suggestions: [] };
            }
            const suggestions = completions.map(completion => ({
                label: completion.label,
                kind: completionKind(monacoApi, completion.kind),
                insertText: completion.insertText,
                insertTextRules: completion.kind === 'function' ? monacoApi.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
                filterText: completion.label,
                command: completion.kind === 'function'
                    ? { id: 'editor.action.triggerParameterHints', title: 'Show parameter info' }
                    : undefined,
                range: {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: completion.start,
                    endColumn: completion.end
                }
            }));
            return { suggestions };
        }
    });

    monacoApi.languages.registerSignatureHelpProvider(OMNISTUDIO_FORMULA_LANGUAGE_ID, {
        signatureHelpTriggerCharacters: ['(', ','],
        signatureHelpRetriggerCharacters: [','],
        provideSignatureHelp(model, position) {
            const help = languageService.getSignatureHelp(model.getValue(), model.getOffsetAt(position));
            if (!help) {
                return undefined;
            }
            return {
                value: {
                    activeSignature: 0,
                    activeParameter: help.activeParameter,
                    signatures: [{
                        label: help.signature,
                        documentation: signatureDocumentation(help.documentation, help.parameters),
                        parameters: help.parameters.map(parameter => ({
                            label: parameter.name,
                            documentation: parameterDocumentation(parameter)
                        }))
                    }]
                },
                dispose() {
                }
            };
        }
    });

    monacoApi.languages.registerHoverProvider(OMNISTUDIO_FORMULA_LANGUAGE_ID, {
        provideHover(model, position) {
            const hover = languageService.getHover(model.getValue(), model.getOffsetAt(position));
            if (!hover) {
                return undefined;
            }
            return {
                contents: hover.contents.map(value => ({ value })),
                range: monacoApi.Range.fromPositions(model.getPositionAt(hover.start), model.getPositionAt(hover.end))
            };
        }
    });
}

function signatureDocumentation(
    description: string | undefined,
    parameters: readonly OmniStudioFormulaArgumentDefinition[]
) {
    const lines = new Array<string>();
    if (description) {
        lines.push(description);
    }
    if (parameters.length) {
        lines.push('', '**Parameters**');
        lines.push(...parameters.map(parameter => {
            const qualifiers = [
                parameter.optional ? 'optional' : undefined,
                parameter.variadic ? 'variadic' : undefined
            ].filter(Boolean).join(', ');
            return `- \`${parameter.name}\`${qualifiers ? ` (${qualifiers})` : ''}`;
        }));
    }
    return { value: lines.join('\n') };
}

function parameterDocumentation(parameter: OmniStudioFormulaArgumentDefinition) {
    const parts = new Array<string>();
    if (parameter.description) {
        parts.push(parameter.description);
    }
    if (parameter.optional) {
        parts.push('Optional parameter.');
    }
    if (parameter.variadic) {
        parts.push('Can be repeated.');
    }
    return parts.length ? { value: parts.join('\n\n') } : undefined;
}

function completionRangeAtPosition(model: monaco.editor.ITextModel, position: monaco.Position) {
    const line = model.getLineContent(position.lineNumber);
    let startColumn = position.column;
    let endColumn = position.column;
    while (startColumn > 1 && /[A-Za-z0-9_.$:%|]/.test(line[startColumn - 2])) {
        startColumn--;
    }
    while (endColumn <= line.length && /[A-Za-z0-9_.$:%|]/.test(line[endColumn - 1])) {
        endColumn++;
    }
    return { startColumn, endColumn };
}

function completionKind(monacoApi: typeof monaco, kind: string) {
    switch (kind) {
        case 'function':
            return monacoApi.languages.CompletionItemKind.Function;
        case 'operator':
            return monacoApi.languages.CompletionItemKind.Operator;
        case 'constant':
            return monacoApi.languages.CompletionItemKind.Constant;
        case 'path':
            return monacoApi.languages.CompletionItemKind.Variable;
        default:
            return monacoApi.languages.CompletionItemKind.Text;
    }
}
