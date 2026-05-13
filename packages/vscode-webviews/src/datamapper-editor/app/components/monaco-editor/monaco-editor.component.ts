import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, effect, inject, input, output, viewChild } from '@angular/core';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js';
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

const vscodeThemeName = 'vlocode-vscode';

const vscodeColorMap = {
    'editor.background': '--vscode-editor-background',
    'editor.foreground': '--vscode-editor-foreground',
    'editorCursor.foreground': '--vscode-editorCursor-foreground',
    'editorLineNumber.foreground': '--vscode-editorLineNumber-foreground',
    'editorLineNumber.activeForeground': '--vscode-editorLineNumber-activeForeground',
    'editor.selectionBackground': '--vscode-editor-selectionBackground',
    'editor.inactiveSelectionBackground': '--vscode-editor-inactiveSelectionBackground',
    'editor.selectionHighlightBackground': '--vscode-editor-selectionHighlightBackground',
    'editor.wordHighlightBackground': '--vscode-editor-wordHighlightBackground',
    'editor.wordHighlightStrongBackground': '--vscode-editor-wordHighlightStrongBackground',
    'editor.findMatchBackground': '--vscode-editor-findMatchBackground',
    'editor.findMatchHighlightBackground': '--vscode-editor-findMatchHighlightBackground',
    'editor.lineHighlightBackground': '--vscode-editor-lineHighlightBackground',
    'editor.lineHighlightBorder': '--vscode-editor-lineHighlightBorder',
    'editor.rangeHighlightBackground': '--vscode-editor-rangeHighlightBackground',
    'editorWhitespace.foreground': '--vscode-editorWhitespace-foreground',
    'editorIndentGuide.background': '--vscode-editorIndentGuide-background',
    'editorIndentGuide.activeBackground': '--vscode-editorIndentGuide-activeBackground',
    'editorIndentGuide.background1': '--vscode-editorIndentGuide-background1',
    'editorIndentGuide.activeBackground1': '--vscode-editorIndentGuide-activeBackground1',
    'editorBracketMatch.background': '--vscode-editorBracketMatch-background',
    'editorBracketMatch.border': '--vscode-editorBracketMatch-border',
    'editorWidget.background': '--vscode-editorWidget-background',
    'editorWidget.foreground': '--vscode-editorWidget-foreground',
    'editorWidget.border': '--vscode-editorWidget-border',
    'editorHoverWidget.background': '--vscode-editorHoverWidget-background',
    'editorHoverWidget.foreground': '--vscode-editorHoverWidget-foreground',
    'editorHoverWidget.border': '--vscode-editorHoverWidget-border',
    'editorSuggestWidget.background': '--vscode-editorSuggestWidget-background',
    'editorSuggestWidget.foreground': '--vscode-editorSuggestWidget-foreground',
    'editorSuggestWidget.border': '--vscode-editorSuggestWidget-border',
    'editorSuggestWidget.selectedBackground': '--vscode-editorSuggestWidget-selectedBackground',
    'editorSuggestWidget.highlightForeground': '--vscode-editorSuggestWidget-highlightForeground',
    'editorError.foreground': '--vscode-editorError-foreground',
    'editorWarning.foreground': '--vscode-editorWarning-foreground',
    'editorInfo.foreground': '--vscode-editorInfo-foreground',
    'editorGutter.background': '--vscode-editorGutter-background',
    'editorGutter.modifiedBackground': '--vscode-editorGutter-modifiedBackground',
    'editorGutter.addedBackground': '--vscode-editorGutter-addedBackground',
    'editorGutter.deletedBackground': '--vscode-editorGutter-deletedBackground',
    'editorOverviewRuler.border': '--vscode-editorOverviewRuler-border',
    'scrollbarSlider.background': '--vscode-scrollbarSlider-background',
    'scrollbarSlider.hoverBackground': '--vscode-scrollbarSlider-hoverBackground',
    'scrollbarSlider.activeBackground': '--vscode-scrollbarSlider-activeBackground',
    'focusBorder': '--vscode-focusBorder',
    'input.background': '--vscode-input-background',
    'input.foreground': '--vscode-input-foreground',
    'input.border': '--vscode-input-border',
    'list.hoverBackground': '--vscode-list-hoverBackground',
    'list.focusBackground': '--vscode-list-focusBackground',
    'list.activeSelectionBackground': '--vscode-list-activeSelectionBackground',
    'list.activeSelectionForeground': '--vscode-list-activeSelectionForeground'
} as const satisfies Record<string, string>;

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

function getVscodeThemeBase(): monaco.editor.BuiltinTheme {
    if (document.body.classList.contains('vscode-high-contrast-light')) {
        return 'hc-light';
    }
    if (document.body.classList.contains('vscode-high-contrast')) {
        return 'hc-black';
    }
    return document.body.classList.contains('vscode-light') ? 'vs' : 'vs-dark';
}

function getCssVariable(styles: CSSStyleDeclaration, name: string): string | undefined {
    const value = styles.getPropertyValue(name).trim();
    return value || undefined;
}

function readVscodeThemeColors(styles: CSSStyleDeclaration) {
    const colors: monaco.editor.IStandaloneThemeData['colors'] = {};
    for (const [monacoColor, vscodeVariable] of Object.entries(vscodeColorMap)) {
        const value = getCssVariable(styles, vscodeVariable);
        if (value) {
            colors[monacoColor] = value;
        }
    }
    return colors;
}

function defineAndApplyVscodeTheme(overflowWidgetsDomNode?: HTMLElement) {
    const bodyStyles = getComputedStyle(document.body);
    const base = getVscodeThemeBase();
    monaco.editor.defineTheme(vscodeThemeName, {
        base,
        inherit: true,
        rules: [],
        colors: readVscodeThemeColors(bodyStyles)
    });
    monaco.editor.setTheme(vscodeThemeName);

    overflowWidgetsDomNode?.classList.remove('vs', 'vs-dark', 'hc-black', 'hc-light');
    overflowWidgetsDomNode?.classList.add(base);
}

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
        const overflowWidgetsDomNode = getOverflowWidgetsNode();
        defineAndApplyVscodeTheme(overflowWidgetsDomNode);

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
        let pendingThemeRefresh = false;
        const refreshTheme = () => {
            if (pendingThemeRefresh) {
                return;
            }
            pendingThemeRefresh = true;
            requestAnimationFrame(() => {
                pendingThemeRefresh = false;
                defineAndApplyVscodeTheme(overflowWidgetsDomNode);
            });
        };
        this.themeObserver = new MutationObserver(refreshTheme);
        this.themeObserver.observe(document.body, { attributes: true });
        this.themeObserver.observe(document.documentElement, { attributes: true });

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
