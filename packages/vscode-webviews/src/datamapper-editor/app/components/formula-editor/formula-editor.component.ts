import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { OmniStudioFormulaLanguageService } from '@vlocode/vlocity/omnistudio/formula/languageService';

import { MonacoEditorComponent, monaco } from '../monaco-editor/monaco-editor.component';
import {
    OMNISTUDIO_FORMULA_LANGUAGE_ID,
    registerOmniStudioFormulaLanguage
} from '../../formula/omnistudio-formula-monaco';

const languageService = new OmniStudioFormulaLanguageService();

@Component({
    selector: 'dm-formula-editor',
    standalone: true,
    imports: [MonacoEditorComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <dm-monaco-editor
            [language]="languageId"
            [value]="value()"
            [readOnly]="readOnly()"
            [ariaLabel]="ariaLabel()"
            [options]="editorOptions"
            [markers]="markers()"
            markerOwner="dm-formula-editor"
            (editorReady)="handleEditorReady($event)"
            (valueChange)="valueChange.emit($event)" />
    `
})
export class FormulaEditorComponent {
    readonly value = input('');
    readonly readOnly = input(false);
    readonly ariaLabel = input('Formula editor');

    readonly valueChange = output<string>();

    private readonly destroyRef = inject(DestroyRef);

    protected readonly languageId = OMNISTUDIO_FORMULA_LANGUAGE_ID;
    protected readonly diagnosticValue = signal('');
    protected readonly editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
        bracketPairColorization: { enabled: false },
        guides: {
            bracketPairs: false,
            bracketPairsHorizontal: false
        },
        matchBrackets: 'near',
        occurrencesHighlight: 'off',
        quickSuggestions: { other: true, comments: false, strings: false },
        quickSuggestionsDelay: 80,
        selectionHighlight: false,
        suggest: {
            filterGraceful: true,
            localityBonus: true,
            preview: false,
            showInlineDetails: false,
            showStatusBar: false,
            showWords: false
        },
        suggestOnTriggerCharacters: true
    };
    protected readonly markers = computed(() => languageService.validate(this.diagnosticValue()).map(diagnostic => {
        const value = this.diagnosticValue();
        const start = offsetToPosition(value, diagnostic.start);
        const end = offsetToPosition(value, diagnostic.end);
        return {
            message: diagnostic.message,
            severity: diagnostic.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
            startLineNumber: start.lineNumber,
            startColumn: start.column,
            endLineNumber: end.lineNumber,
            endColumn: end.column
        };
    }));

    constructor() {
        registerOmniStudioFormulaLanguage(monaco);
        let validationTimer: number | undefined;
        effect(() => {
            const value = this.value();
            window.clearTimeout(validationTimer);
            validationTimer = window.setTimeout(() => this.diagnosticValue.set(value), 150);
        });
        this.destroyRef.onDestroy(() => window.clearTimeout(validationTimer));
    }

    protected handleEditorReady(editor: monaco.editor.IStandaloneCodeEditor) {
        const disposable = editor.onDidChangeModelContent(event => {
            if (this.readOnly()) {
                return;
            }
            const insertedText = event.changes.map(change => change.text).join('');
            if (/^[A-Za-z_$]$/.test(insertedText)) {
                editor.trigger('omnistudio-formula', 'editor.action.triggerSuggest', {});
            }
        });
        this.destroyRef.onDestroy(() => disposable.dispose());
    }
}

function offsetToPosition(value: string, offset: number) {
    const boundedOffset = Math.max(0, Math.min(offset, value.length));
    let lineNumber = 1;
    let column = 1;
    for (let index = 0; index < boundedOffset; index++) {
        if (value[index] === '\n') {
            lineNumber++;
            column = 1;
        } else {
            column++;
        }
    }
    return { lineNumber, column };
}
