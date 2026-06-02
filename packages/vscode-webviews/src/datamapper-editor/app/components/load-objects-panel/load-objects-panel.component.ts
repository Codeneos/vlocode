import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DataMapperCardComponent } from '../data-mapper-card/data-mapper-card.component';
import { AutocompleteInputComponent } from '../../../../shared/components/autocomplete-input/autocomplete-input.component';
import { VlocodeEmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import type { DataMapperItem, FieldSuggestion, LoadObjectGroup } from '../../models/datamapper.model';
import { newGlobalKey } from '../../models/items';
import { loadObjectLabel } from '../../models/load-objects';

@Component({
    selector: 'dm-load-objects-panel',
    standalone: true,
    imports: [AutocompleteInputComponent, DataMapperCardComponent, FormsModule, VlocodeEmptyStateComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './load-objects-panel.component.html'
})
export class LoadObjectsPanelComponent {
    readonly groups = input.required<LoadObjectGroup[]>();
    readonly objectSuggestions = input.required<FieldSuggestion[]>();

    readonly createObjectRequested = output<void>();
    readonly insertObjectRequested = output<LoadObjectGroup>();
    readonly updateGroupRequested = output<LoadObjectGroup>();
    readonly moveGroupRequested = output<{ group: LoadObjectGroup; direction: -1 | 1 }>();
    readonly deleteGroupRequested = output<LoadObjectGroup>();

    protected readonly loadObjectLabel = loadObjectLabel;

    protected updateObjectName(group: LoadObjectGroup, outputObjectName: string) {
        this.emitGroup(group, [...group.items, ...group.links].map(item => ({ ...item, OutputObjectName: outputObjectName })));
    }

    protected updateLink(group: LoadObjectGroup, item: DataMapperItem, key: keyof DataMapperItem, value: unknown) {
        this.emitGroup(group, [...group.items, ...group.links].map(row => row === item ? { ...row, [key]: value } : row));
    }

    protected addLink(group: LoadObjectGroup) {
        if (group.sequence <= 1) {
            return;
        }
        this.emitGroup(group, [
            ...group.items,
            ...group.links,
            {
                GlobalKey: newGlobalKey(),
                OutputObjectName: group.outputObjectName,
                OutputCreationSequence: group.sequence,
                LinkedObjectSequence: Math.max(1, group.sequence - 1),
                FilterOperator: '=',
                IsDisabled: false,
                VlocityDataPackType: 'SObject',
                VlocityRecordSObjectType: 'OmniDataTransformItem'
            }
        ]);
    }

    protected deleteLink(group: LoadObjectGroup, item: DataMapperItem) {
        this.emitGroup(group, [...group.items, ...group.links].filter(row => row !== item));
    }

    private emitGroup(group: LoadObjectGroup, rows: DataMapperItem[]) {
        this.updateGroupRequested.emit({
            ...group,
            outputObjectName: rows[0]?.OutputObjectName ?? group.outputObjectName,
            items: rows.filter(item => Number(item.LinkedObjectSequence || 0) === 0),
            links: rows.filter(item => Number(item.LinkedObjectSequence || 0) > 0)
        });
    }
}
