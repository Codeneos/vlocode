import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AutocompleteInputComponent } from '../autocomplete-input/autocomplete-input.component';
import { DataMapperCardComponent } from '../data-mapper-card/data-mapper-card.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { FormulaEditorComponent } from '../formula-editor/formula-editor.component';
import type { DataMapperItem, FieldSuggestion } from '../../models/datamapper.model';

@Component({
    selector: 'dm-formula-panel',
    standalone: true,
    imports: [AutocompleteInputComponent, DataMapperCardComponent, EmptyStateComponent, FormulaEditorComponent, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './formula-panel.component.html'
})
export class FormulaPanelComponent {
    readonly items = input.required<DataMapperItem[]>();
    readonly outputSuggestions = input.required<FieldSuggestion[]>();

    readonly createFormulaRequested = output<void>();
    readonly insertFormulaRequested = output<DataMapperItem>();
    readonly updateFormulaRequested = output<{ item: DataMapperItem; updatedItem: DataMapperItem }>();
    readonly moveFormulaRequested = output<{ item: DataMapperItem; direction: -1 | 1 }>();
    readonly reorderFormulaRequested = output<{ item: DataMapperItem; target: DataMapperItem }>();
    readonly deleteFormulaRequested = output<DataMapperItem>();

    protected readonly draggedKey = signal<string | undefined>(undefined);
    protected readonly dropTargetKey = signal<string | undefined>(undefined);

    protected startDrag(item: DataMapperItem, index: number, event: DragEvent) {
        const key = this.itemKey(item, index);
        this.draggedKey.set(key);
        event.dataTransfer?.setData('text/plain', key);
        event.dataTransfer?.setDragImage?.(event.currentTarget as Element, 24, 24);
    }

    protected dragOver(item: DataMapperItem, index: number, event: DragEvent) {
        if (!this.draggedKey() || this.draggedKey() === this.itemKey(item, index)) {
            return;
        }
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'move';
        this.dropTargetKey.set(this.itemKey(item, index));
    }

    protected dropOnFormula(target: DataMapperItem, index: number, event: DragEvent) {
        event.preventDefault();
        const draggedKey = this.draggedKey();
        const dragged = this.items().find((item, itemIndex) => this.itemKey(item, itemIndex) === draggedKey);
        if (dragged && dragged !== target) {
            this.reorderFormulaRequested.emit({ item: dragged, target });
        }
        this.endDrag();
    }

    protected endDrag() {
        this.draggedKey.set(undefined);
        this.dropTargetKey.set(undefined);
    }

    protected updateFormula(item: DataMapperItem, key: keyof DataMapperItem, value: unknown) {
        this.updateFormulaRequested.emit({
            item,
            updatedItem: {
                ...item,
                [key]: key === 'FormulaSequence' ? Number(value) || item.FormulaSequence : value,
                OutputCreationSequence: item.OutputCreationSequence ?? 0,
                OutputFieldName: 'Formula',
                OutputObjectName: 'Formula',
                VlocityDataPackType: item.VlocityDataPackType ?? 'SObject',
                VlocityRecordSObjectType: item.VlocityRecordSObjectType ?? 'OmniDataTransformItem'
            }
        });
    }

    protected itemKey(item: DataMapperItem, index: number) {
        return String(item.GlobalKey ?? item.FormulaSequence ?? index);
    }
}
