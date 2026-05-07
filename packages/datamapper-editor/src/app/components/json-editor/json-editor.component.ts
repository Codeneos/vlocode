import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, effect, inject, input, output, viewChild } from '@angular/core';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import 'monaco-editor/esm/vs/language/json/monaco.contribution.js';

type MonacoGlobal = typeof globalThis & {
    MonacoEnvironment?: monaco.Environment;
};

function createEditorWorker() {
    return new Worker(new URL('./monaco-editor.worker', import.meta.url), { type: 'module' });
}

function createJsonWorker() {
    return new Worker(new URL('./monaco-json.worker', import.meta.url), { type: 'module' });
}

(globalThis as MonacoGlobal).MonacoEnvironment = {
    getWorker: (_workerId: string, label: string) => label === 'json'
        ? createJsonWorker()
        : createEditorWorker()
};

@Component({
    selector: 'dm-json-editor',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: '<div class="dm-json-editor" #host></div>'
})
export class JsonEditorComponent implements AfterViewInit {
    readonly value = input('');
    readonly readOnly = input(false);
    readonly ariaLabel = input('JSON editor');

    readonly valueChange = output<string>();

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
            const readOnly = this.readOnly();
            this.editor?.updateOptions({ readOnly });
        });
    }

    ngAfterViewInit() {
        this.editor = monaco.editor.create(this.host().nativeElement, {
            value: this.value(),
            language: 'json',
            readOnly: this.readOnly(),
            ariaLabel: this.ariaLabel(),
            automaticLayout: true,
            minimap: { enabled: false },
            renderLineHighlight: 'line',
            scrollBeyondLastLine: false,
            tabSize: 2,
            wordWrap: 'on'
        });
        monaco.editor.setTheme(this.monacoTheme());

        this.editor.onDidChangeModelContent(() => {
            if (!this.readOnly() && !this.applyingExternalValue) {
                this.valueChange.emit(this.editor?.getValue() ?? '');
            }
        });

        this.destroyRef.onDestroy(() => {
            this.editor?.dispose();
            this.editor = undefined;
        });
    }

    private monacoTheme() {
        if (document.body.classList.contains('vscode-high-contrast')) {
            return 'hc-black';
        }
        if (document.body.classList.contains('vscode-light')) {
            return 'vs';
        }
        return 'vs-dark';
    }
}
