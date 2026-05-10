import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AutocompleteInputComponent } from '../autocomplete-input/autocomplete-input.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import type { DataMapperItem, ExtractGroup, FieldSuggestion } from '../../models/datamapper.model';
import { FILTER_OPERATORS, isSpecialFilter } from '../../models/extract-groups';
import { newGlobalKey } from '../../models/items';

@Component({
    selector: 'dm-extract-panel',
    standalone: true,
    imports: [AutocompleteInputComponent, EmptyStateComponent, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './extract-panel.component.html'
})
export class ExtractPanelComponent {
    readonly groups = input.required<ExtractGroup[]>();
    readonly objectSuggestions = input.required<FieldSuggestion[]>();
    readonly sourceSuggestions = input.required<FieldSuggestion[]>();

    readonly createExtractionRequested = output<void>();
    readonly insertExtractionRequested = output<ExtractGroup>();
    readonly updateGroupRequested = output<ExtractGroup>();
    readonly moveGroupRequested = output<{ group: ExtractGroup; direction: -1 | 1 }>();
    readonly deleteGroupRequested = output<ExtractGroup>();

    protected readonly filterOperators = FILTER_OPERATORS;
    protected readonly isSpecialFilter = isSpecialFilter;

    protected updateObject(group: ExtractGroup, value: string) {
        const objectName = value.includes(':') ? value.slice(0, value.indexOf(':')) : value;
        this.updateGroup(group, group.items.map(item => ({ ...item, InputObjectName: objectName })));
    }

    protected updatePath(group: ExtractGroup, value: string) {
        this.updateGroup(group, group.items.map(item => ({ ...item, OutputFieldName: value, OutputObjectName: 'json' })));
    }

    protected updateFilter(group: ExtractGroup, item: DataMapperItem, key: keyof DataMapperItem, value: unknown) {
        const nextValue = key === 'InputFieldName' && typeof value === 'string'
            ? this.normalizeFieldName(group, value)
            : value;
        this.updateGroup(group, group.items.map(row => row === item ? { ...row, [key]: nextValue } : row));
    }

    protected setJoiner(group: ExtractGroup, item: DataMapperItem, joiner: 'AND' | 'OR') {
        const previousGroup = Number(group.items[group.items.indexOf(item) - 1]?.FilterGroup ?? 0);
        const filterGroup = joiner === 'AND' ? previousGroup : previousGroup + 1;
        this.updateFilter(group, item, 'FilterGroup', filterGroup);
    }

    protected addCondition(group: ExtractGroup, joiner: 'AND' | 'OR' = 'AND') {
        const last = group.items[group.items.length - 1];
        const filterGroup = joiner === 'OR'
            ? Math.max(0, ...group.items.map(item => Number(item.FilterGroup || 0))) + 1
            : Number(last?.FilterGroup || 0);
        this.updateGroup(group, [
            ...group.items,
            this.createFilterItem(group, { FilterGroup: filterGroup })
        ]);
    }

    protected addSpecialFilter(group: ExtractGroup, operator: 'LIMIT' | 'OFFSET' | 'ORDER BY') {
        this.updateGroup(group, [
            ...group.items,
            this.createFilterItem(group, { FilterOperator: operator, InputFieldName: '', FilterValue: '', FilterGroup: 0 })
        ]);
    }

    protected deleteFilter(group: ExtractGroup, item: DataMapperItem) {
        const remaining = group.items.filter(row => row !== item);
        if (remaining.length) {
            this.updateGroup(group, remaining);
        } else {
            this.deleteGroupRequested.emit(group);
        }
    }

    protected joinerFor(group: ExtractGroup, index: number) {
        if (index === 0) {
            return '';
        }
        const previous = Number(group.items[index - 1]?.FilterGroup || 0);
        const current = Number(group.items[index]?.FilterGroup || 0);
        return current === previous ? 'AND' : 'OR';
    }

    private createFilterItem(group: ExtractGroup, item: Partial<DataMapperItem>): DataMapperItem {
        return {
            GlobalKey: newGlobalKey(),
            InputObjectName: group.inputObjectName,
            InputObjectQuerySequence: group.sequence,
            OutputFieldName: group.outputFieldName,
            OutputObjectName: 'json',
            FilterOperator: '=',
            IsDisabled: false,
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransformItem',
            ...item
        };
    }

    private normalizeFieldName(group: ExtractGroup, value: string) {
        const prefix = `${group.inputObjectName}:`;
        return value.startsWith(prefix) ? value.slice(prefix.length) : value;
    }

    private updateGroup(group: ExtractGroup, items: DataMapperItem[]) {
        this.updateGroupRequested.emit({
            ...group,
            inputObjectName: items[0]?.InputObjectName,
            outputFieldName: items[0]?.OutputFieldName,
            items
        });
    }
}
