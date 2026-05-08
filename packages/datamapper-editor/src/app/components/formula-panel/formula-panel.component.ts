import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AutocompleteInputComponent } from '../autocomplete-input/autocomplete-input.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { FormulaEditorComponent } from '../formula-editor/formula-editor.component';
import type { DataMapperItem, FieldSuggestion } from '../../models/datamapper.model';

@Component({
    selector: 'dm-formula-panel',
    standalone: true,
    imports: [AutocompleteInputComponent, EmptyStateComponent, FormulaEditorComponent, FormsModule],
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
    readonly deleteFormulaRequested = output<DataMapperItem>();

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
}
