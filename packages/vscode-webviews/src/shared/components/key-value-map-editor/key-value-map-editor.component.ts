import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { VlocodeDialogComponent } from '../dialog/dialog.component';
import { VlocodeFormulaEditorComponent } from '../formula-editor/formula-editor.component';
import { inputValue } from '../../utils/dom-events';

export interface VlocodeKeyValueEntry {
    key: string;
    value: string;
}

interface FormulaEditorState {
    entry: VlocodeKeyValueEntry;
    index: number;
}

@Component({
    selector: 'vlo-key-value-map-editor',
    standalone: true,
    imports: [VlocodeFormulaEditorComponent, VlocodeDialogComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './key-value-map-editor.component.html'
})
export class VlocodeKeyValueMapEditorComponent {
    readonly emptyMessage = input('No entries configured.');
    readonly entries = input<readonly VlocodeKeyValueEntry[]>([]);
    readonly formulaEnabled = input(true);
    readonly title = input.required<string>();

    readonly entriesChange = output<VlocodeKeyValueEntry[]>();

    protected readonly formulaEditor = signal<FormulaEditorState | undefined>(undefined);
    protected readonly formulaError = signal<string | undefined>(undefined);
    protected readonly inputValue = inputValue;
    protected readonly keys = computed(() => new Set(this.entries().map(entry => entry.key)));

    protected addEntry() {
        const keys = this.keys();
        const base = 'key';
        let key = base;
        let index = 1;
        while (keys.has(key)) {
            key = `${base}${++index}`;
        }
        this.entriesChange.emit([...this.entries(), { key, value: '' }]);
    }

    protected updateEntry(index: number, part: keyof VlocodeKeyValueEntry, event: Event) {
        const value = this.inputValue(event);
        this.entriesChange.emit(this.entries().map((entry, entryIndex) =>
            entryIndex === index ? { ...entry, [part]: value } : entry
        ));
    }

    protected deleteEntry(index: number) {
        this.entriesChange.emit(this.entries().filter((_entry, entryIndex) => entryIndex !== index));
    }

    protected openFormulaEditor(entry: VlocodeKeyValueEntry, index: number) {
        this.formulaEditor.set({ entry: { ...entry }, index });
        this.formulaError.set(undefined);
    }

    protected closeFormulaEditor() {
        this.formulaEditor.set(undefined);
        this.formulaError.set(undefined);
    }

    protected updateFormulaEditorKey(event: Event) {
        this.patchFormulaEditor({ key: this.inputValue(event) });
    }

    protected updateFormulaEditorValue(value: string) {
        this.patchFormulaEditor({ value });
    }

    protected applyFormulaEditor() {
        const editor = this.formulaEditor();
        if (!editor) {
            return;
        }
        const key = editor.entry.key.trim();
        if (!key) {
            this.formulaError.set('Key is required.');
            return;
        }
        if (this.entries().some((entry, index) => index !== editor.index && entry.key === key)) {
            this.formulaError.set(`"${key}" already exists.`);
            return;
        }
        this.entriesChange.emit(this.entries().map((entry, index) =>
            index === editor.index ? { key, value: editor.entry.value } : entry
        ));
        this.closeFormulaEditor();
    }

    private patchFormulaEditor(patch: Partial<VlocodeKeyValueEntry>) {
        const editor = this.formulaEditor();
        if (editor) {
            this.formulaEditor.set({ ...editor, entry: { ...editor.entry, ...patch } });
            this.formulaError.set(undefined);
        }
    }
}
