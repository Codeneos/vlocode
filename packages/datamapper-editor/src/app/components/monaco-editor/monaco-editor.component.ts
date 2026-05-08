import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, effect, inject, input, output, viewChild } from '@angular/core';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import 'monaco-editor/esm/vs/editor/contrib/hover/browser/hoverContribution.js';
import 'monaco-editor/esm/vs/editor/contrib/parameterHints/browser/parameterHints.js';
import 'monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController.js';
import 'monaco-editor/esm/vs/language/json/monaco.contribution.js';

type MonacoGlobal = typeof globalThis & {
    MonacoEnvironment?: monaco.Environment;
};

const compactEditorDefaults: monaco.editor.IStandaloneEditorConstructionOptions = {
    allowOverflow: true,
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

let overflowWidgetsNode: HTMLElement | undefined;

function getOverflowWidgetsNode() {
    if (!overflowWidgetsNode || !document.body.contains(overflowWidgetsNode)) {
        overflowWidgetsNode = document.createElement('div');
        overflowWidgetsNode.className = 'monaco-editor dm-monaco-overflow-widgets';
        document.body.appendChild(overflowWidgetsNode);
    }
    return overflowWidgetsNode;
}

(globalThis as MonacoGlobal).MonacoEnvironment = {
    getWorker: (_workerId: string, label: string) => {
        if (label === 'json') {
            return new Worker(new URL('./monaco-json.worker', import.meta.url), { type: 'module' });
        }
        return new Worker(new URL('./monaco-editor.worker', import.meta.url), { type: 'module' });
    }
};

@Component({
    selector: 'dm-monaco-editor',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: '<div class="dm-monaco-editor" #host></div>'
})
export class MonacoEditorComponent implements AfterViewInit {
    readonly value = input('');
    readonly language = input('plaintext');
    readonly readOnly = input(false);
    readonly ariaLabel = input('Editor');
    readonly options = input<monaco.editor.IStandaloneEditorConstructionOptions>({});
    readonly markers = input<monaco.editor.IMarkerData[]>([]);
    readonly markerOwner = input('dm-monaco-editor');

    readonly valueChange = output<string>();
    readonly editorReady = output<monaco.editor.IStandaloneCodeEditor>();

    private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
    private readonly destroyRef = inject(DestroyRef);
    private editor?: monaco.editor.IStandaloneCodeEditor;
    private applyingExternalValue = false;

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
                ...this.options(),
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
        const theme = document.body.classList.contains('vscode-high-contrast')
            ? 'hc-black'
            : document.body.classList.contains('vscode-light') ? 'vs' : 'vs-dark';
        const overflowWidgetsDomNode = getOverflowWidgetsNode();

        this.editor = monaco.editor.create(this.host().nativeElement, {
            ...compactEditorDefaults,
            value: this.value(),
            language: this.language(),
            readOnly: this.readOnly(),
            ariaLabel: this.ariaLabel(),
            fontFamily: bodyStyles.getPropertyValue('--vscode-editor-font-family').trim()
                || bodyStyles.getPropertyValue('--vscode-font-family').trim()
                || undefined,
            fontSize: Number.isFinite(editorFontSize) && editorFontSize > 0
                ? editorFontSize
                : Number.isFinite(uiFontSize) && uiFontSize > 0 ? uiFontSize : undefined,
            overflowWidgetsDomNode,
            ...this.options()
        });
        monaco.editor.setTheme(theme);
        overflowWidgetsDomNode.classList.remove('vs', 'vs-dark', 'hc-black');
        overflowWidgetsDomNode.classList.add(theme);

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
        });
    }
}

export { monaco };
