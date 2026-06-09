import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, effect, inject, input, output, viewChild } from '@angular/core';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import 'monaco-editor/esm/vs/editor/contrib/clipboard/browser/clipboard.js';
import 'monaco-editor/esm/vs/editor/contrib/dropOrPasteInto/browser/copyPasteContribution.js';
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js';
import 'monaco-editor/esm/vs/editor/contrib/hover/browser/hoverContribution.js';
import 'monaco-editor/esm/vs/editor/contrib/parameterHints/browser/parameterHints.js';
import 'monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController.js';
import 'monaco-editor/esm/vs/language/json/monaco.contribution.js';

type MonacoGlobal = typeof globalThis & {
    MonacoEnvironment?: monaco.Environment;
};

const compactEditorDefaults: monaco.editor.IStandaloneEditorConstructionOptions = {
    automaticLayout: true,
    fixedOverflowWidgets: true,
    folding: false,
    glyphMargin: false,
    lineDecorationsWidth: 8,
    lineNumbersMinChars: 3,
    minimap: { enabled: false },
    overviewRulerLanes: 0,
    renderLineHighlight: 'line',
    scrollBeyondLastLine: false,
    scrollbar: {
        alwaysConsumeMouseWheel: false,
        horizontal: 'auto',
        horizontalScrollbarSize: 10,
        useShadows: false,
        vertical: 'auto',
        verticalScrollbarSize: 10
    },
    tabSize: 2,
    wordBasedSuggestions: 'off',
    wordWrap: 'on',
    wrappingIndent: 'same'
};

function compactEditorOptions(options: monaco.editor.IStandaloneEditorConstructionOptions = {}): monaco.editor.IStandaloneEditorConstructionOptions {
    return {
        ...compactEditorDefaults,
        ...options,
        scrollbar: {
            ...compactEditorDefaults.scrollbar,
            ...options.scrollbar,
            alwaysConsumeMouseWheel: false
        }
    };
}

(globalThis as MonacoGlobal).MonacoEnvironment = {
    getWorker: (_workerId: string, label: string) => {
        if (label === 'json') {
            return new Worker(new URL('./monaco-json.worker', import.meta.url), { type: 'module' });
        }
        return new Worker(new URL('./monaco-editor.worker', import.meta.url), { type: 'module' });
    }
};

function getVscodeThemeBase(): monaco.editor.BuiltinTheme {
    if (document.body.classList.contains('vscode-high-contrast-light')) {
        return 'hc-light';
    }
    if (document.body.classList.contains('vscode-high-contrast')) {
        return 'hc-black';
    }
    return document.body.classList.contains('vscode-light') ? 'vs' : 'vs-dark';
}

function applyVscodeTheme() {
    monaco.editor.setTheme(getVscodeThemeBase());
}

@Component({
    selector: 'vlo-monaco-editor',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: '<div class="vlo-monaco-editor" #host></div>'
})
export class VlocodeMonacoEditorComponent implements AfterViewInit {
    readonly value = input('');
    readonly language = input('plaintext');
    readonly readOnly = input(false);
    readonly ariaLabel = input('Editor');
    readonly options = input<monaco.editor.IStandaloneEditorConstructionOptions>({});
    readonly markers = input<monaco.editor.IMarkerData[]>([]);
    readonly markerOwner = input('vlo-monaco-editor');

    readonly valueChange = output<string>();
    readonly editorReady = output<monaco.editor.IStandaloneCodeEditor>();

    private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
    private readonly destroyRef = inject(DestroyRef);
    private editor?: monaco.editor.IStandaloneCodeEditor;
    private applyingExternalValue = false;
    private themeObserver?: MutationObserver;

    constructor() {
        effect(() => {
            const nextValue = this.value();
            const editor = this.editor;
            if (!editor) {
                return;
            }
            if (editor.getValue() !== nextValue) {
                this.applyingExternalValue = true;
                editor.setValue(nextValue);
                this.applyingExternalValue = false;
            }
        });

        effect(() => {
            const language = this.language();
            const model = this.editor?.getModel();
            if (model && model.getLanguageId() !== language) {
                monaco.editor.setModelLanguage(model, language);
            }
        });

        effect(() => {
            this.editor?.updateOptions({
                ...compactEditorOptions(this.options()),
                readOnly: this.readOnly()
            });
        });

        effect(() => {
            const markers = this.markers();
            const owner = this.markerOwner();
            const model = this.editor?.getModel();
            if (model) {
                monaco.editor.setModelMarkers(model, owner, markers);
            }
        });
    }

    ngAfterViewInit() {
        const bodyStyles = getComputedStyle(document.body);
        const editorFontSize = Number.parseFloat(bodyStyles.getPropertyValue('--vscode-editor-font-size'));
        const uiFontSize = Number.parseFloat(bodyStyles.getPropertyValue('--vscode-font-size'));
        applyVscodeTheme();

        this.editor = monaco.editor.create(this.host().nativeElement, {
            ...compactEditorOptions(this.options()),
            value: this.value(),
            language: this.language(),
            readOnly: this.readOnly(),
            ariaLabel: this.ariaLabel(),
            fontFamily: bodyStyles.getPropertyValue('--vscode-editor-font-family').trim()
                || bodyStyles.getPropertyValue('--vscode-font-family').trim()
                || undefined,
            fontSize: Number.isFinite(editorFontSize) && editorFontSize > 0
                ? editorFontSize
                : Number.isFinite(uiFontSize) && uiFontSize > 0 ? uiFontSize : undefined
        });
        let pendingThemeRefresh = false;
        const refreshTheme = () => {
            if (pendingThemeRefresh) {
                return;
            }
            pendingThemeRefresh = true;
            requestAnimationFrame(() => {
                pendingThemeRefresh = false;
                applyVscodeTheme();
            });
        };
        this.themeObserver = new MutationObserver(refreshTheme);
        this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        this.editor.onDidChangeModelContent(() => {
            if (!this.readOnly() && !this.applyingExternalValue) {
                this.valueChange.emit(this.editor?.getValue() ?? '');
            }
        });

        this.editorReady.emit(this.editor);
        this.destroyRef.onDestroy(() => {
            const model = this.editor?.getModel();
            if (model) {
                monaco.editor.setModelMarkers(model, this.markerOwner(), []);
            }
            this.editor?.dispose();
            this.editor = undefined;
            this.themeObserver?.disconnect();
            this.themeObserver = undefined;
        });
    }
}

export { monaco };
