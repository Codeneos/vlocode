import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AutocompleteInputComponent } from '../autocomplete-input/autocomplete-input.component';
import type { DataMapperItem, DataMapperKind, FieldSuggestion, LoadObjectGroup } from '../../models/datamapper.model';
import { inputPath, outputPath } from '../../models/datamapper-paths';
import { loadObjectLabel } from '../../models/load-objects';

@Component({
    selector: 'dm-mapping-panel',
    standalone: true,
    imports: [AutocompleteInputComponent, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './mapping-panel.component.html'
})
export class MappingPanelComponent {
    readonly mapperKind = input.required<DataMapperKind>();
    readonly mappingItems = input.required<DataMapperItem[]>();
    readonly filteredMappingItems = input.required<DataMapperItem[]>();
    readonly mappingFilter = input.required<string>();
    readonly sourceSuggestions = input.required<FieldSuggestion[]>();
    readonly outputSuggestions = input.required<FieldSuggestion[]>();
    readonly loadObjects = input<LoadObjectGroup[]>([]);

    readonly mappingFilterChange = output<string>();
    readonly createMappingRequested = output<void>();
    readonly insertMappingRequested = output<{ after: DataMapperItem; item: DataMapperItem }>();
    readonly editMappingRequested = output<DataMapperItem>();
    readonly updateMappingRequested = output<DataMapperItem>();
    readonly deleteMappingRequested = output<DataMapperItem>();

    protected readonly inputPath = inputPath;
    protected readonly outputPath = outputPath;
    protected readonly loadObjectLabel = loadObjectLabel;
    protected readonly sortKey = signal<'input' | 'output'>('output');
    protected readonly sortDirection = signal<1 | -1>(1);
    protected readonly editingKey = signal<string | undefined>(undefined);
    protected readonly draft = signal<DataMapperItem | undefined>(undefined);
    protected readonly insertAfterKey = signal<string | undefined>(undefined);

    protected readonly title = computed(() => this.mapperKind() === 'transform' ? 'Transforms' : 'Mapped Fields');
    protected readonly inputColumn = computed(() => this.mapperKind() === 'extract' ? 'Extract JSON Path' : 'JSON Input Path');
    protected readonly outputColumn = computed(() => this.mapperKind() === 'load' ? 'Domain Object Field' : 'JSON Output Path');
    protected readonly sortedMappingItems = computed(() => {
        const key = this.sortKey();
        const direction = this.sortDirection();
        const sorted = [...this.filteredMappingItems()].sort((a, b) => {
            const left = key === 'input' ? this.displayInputPath(a) : this.displayOutputPath(a);
            const right = key === 'input' ? this.displayInputPath(b) : this.displayOutputPath(b);
            return left.localeCompare(right) * direction;
        });
        const insertAfterKey = this.insertAfterKey();
        const draft = this.draft();
        if (!insertAfterKey || !draft) {
            return sorted;
        }
        const draftKey = this.rowKey(draft);
        const withoutDraft = sorted.filter(item => this.rowKey(item) !== draftKey);
        const index = withoutDraft.findIndex(item => this.rowKey(item) === insertAfterKey);
        withoutDraft.splice(index >= 0 ? index + 1 : withoutDraft.length, 0, draft);
        return withoutDraft;
    });

    protected setSort(key: 'input' | 'output') {
        if (!this.saveInlineEdit()) {
            return;
        }
        if (this.sortKey() === key) {
            this.sortDirection.update(direction => direction === 1 ? -1 : 1);
            return;
        }
        this.sortKey.set(key);
        this.sortDirection.set(1);
    }

    protected sortIcon(key: 'input' | 'output') {
        if (this.sortKey() !== key) {
            return 'swap';
        }
        return this.sortDirection() === 1 ? 'up' : 'down';
    }

    protected displayInputPath(item: DataMapperItem) {
        return this.mapperKind() === 'load' ? item.InputFieldName || '' : inputPath(item);
    }

    protected displayOutputPath(item: DataMapperItem) {
        if (this.mapperKind() === 'load') {
            return `${item.OutputCreationSequence || 1} - ${item.OutputObjectName || 'Object'}.${item.OutputFieldName || ''}`;
        }
        return outputPath(item);
    }

    protected handleRowDoubleClick(item: DataMapperItem) {
        if (!this.isEditing(item)) {
            this.beginInlineEdit(item);
        }
    }

    protected createMapping() {
        if (this.saveInlineEdit()) {
            this.createMappingRequested.emit();
        }
    }

    protected insertMappingAfter(item: DataMapperItem) {
        if (this.saveInlineEdit()) {
            const inserted = this.createEmptyMapping(item);
            this.insertAfterKey.set(this.rowKey(item));
            this.editingKey.set(this.rowKey(inserted));
            this.draft.set(inserted);
            this.insertMappingRequested.emit({ after: item, item: inserted });
        }
    }

    protected beginInlineEdit(item: DataMapperItem) {
        if (!this.saveInlineEdit()) {
            return;
        }
        this.editingKey.set(this.rowKey(item));
        this.draft.set({ ...item });
    }

    protected isEditing(item: DataMapperItem) {
        return this.editingKey() === this.rowKey(item);
    }

    protected saveInlineEdit() {
        const draft = this.draft();
        if (!draft) {
            return true;
        }
        if (!this.canSave(draft)) {
            return false;
        }
        this.updateMappingRequested.emit(draft);
        this.cancelInlineEdit();
        return true;
    }

    protected cancelInlineEdit() {
        this.editingKey.set(undefined);
        this.draft.set(undefined);
        this.insertAfterKey.set(undefined);
    }

    protected canSaveDraft() {
        const draft = this.draft();
        return draft ? this.canSave(draft) : false;
    }

    protected setDraftInputPath(path: string) {
        const draft = this.draft();
        if (!draft) {
            return;
        }
        if (this.mapperKind() === 'load') {
            this.draft.set({ ...draft, InputFieldName: path });
            return;
        }
        this.draft.set({ ...draft, InputObjectName: undefined, InputFieldName: path });
    }

    protected setDraftOutputPath(path: string) {
        const draft = this.draft();
        if (draft) {
            this.draft.set({ ...draft, OutputFieldName: path, OutputObjectName: 'json' });
        }
    }

    protected setDraftLoadObject(sequence: string | number) {
        const draft = this.draft();
        if (!draft) {
            return;
        }
        const loadObject = this.loadObjects().find(group => Number(group.sequence) === Number(sequence));
        this.draft.set({
            ...draft,
            OutputCreationSequence: Number(sequence) || draft.OutputCreationSequence || 1,
            OutputObjectName: loadObject?.outputObjectName || draft.OutputObjectName
        });
    }

    protected setDraftLoadField(field: string) {
        const draft = this.draft();
        if (draft) {
            this.draft.set({ ...draft, OutputFieldName: field });
        }
    }

    protected selectedDraftLoadObject() {
        const draft = this.draft();
        if (!draft) {
            return '';
        }
        return draft.OutputCreationSequence || this.loadObjects().find(group => group.outputObjectName === draft.OutputObjectName)?.sequence || '';
    }

    protected canSave(item: DataMapperItem) {
        return this.mapperKind() === 'load' ? !!item.OutputFieldName : !!outputPath(item);
    }

    protected rowKey(item: DataMapperItem) {
        return String(item.GlobalKey ?? `${inputPath(item)}:${outputPath(item)}:${item.OutputCreationSequence ?? ''}`);
    }

    private createEmptyMapping(previous?: DataMapperItem): DataMapperItem {
        return {
            GlobalKey: crypto.randomUUID?.() ?? `${Date.now()}`,
            IsDisabled: false,
            IsRequiredForUpsert: false,
            IsUpsertKey: false,
            OutputCreationSequence: this.mapperKind() === 'load'
                ? (previous?.OutputCreationSequence ?? this.loadObjects()[0]?.sequence ?? 1)
                : undefined,
            OutputObjectName: this.mapperKind() === 'load'
                ? (previous?.OutputObjectName ?? this.loadObjects()[0]?.outputObjectName ?? '')
                : 'json',
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransformItem'
        };
    }
}
