import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { VlocodeFormulaInputComponent } from '../formula-input/formula-input.component';
import { inputValue } from '../../utils/dom-events';

export interface VlocodeKeyValueEntry {
    key: string;
    value: string;
}

@Component({
    selector: 'vlo-key-value-map-editor',
    standalone: true,
    imports: [VlocodeFormulaInputComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './key-value-map-editor.component.html'
})
export class VlocodeKeyValueMapEditorComponent {
    readonly emptyMessage = input('No entries configured.');
    readonly entries = input<readonly VlocodeKeyValueEntry[]>([]);
    readonly formulaEnabled = input(true);
    readonly title = input.required<string>();

    readonly entriesChange = output<VlocodeKeyValueEntry[]>();

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
        this.patchEntry(index, { [part]: value });
    }

    protected updateEntryValue(index: number, value: string) {
        this.patchEntry(index, { value });
    }

    private patchEntry(index: number, patch: Partial<VlocodeKeyValueEntry>) {
        this.entriesChange.emit(this.entries().map((entry, entryIndex) =>
            entryIndex === index ? { ...entry, ...patch } : entry
        ));
    }

    protected deleteEntry(index: number) {
        this.entriesChange.emit(this.entries().filter((_entry, entryIndex) => entryIndex !== index));
    }
}
