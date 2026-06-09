import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { VlocodeKeyValueMapEditorComponent, type VlocodeKeyValueEntry } from '../../../../../shared/components/key-value-map-editor/key-value-map-editor.component';
import { inputChecked } from '../../../../../shared/utils/dom-events';
import type { MapEntriesChange, PropertyValueChange } from '../../../models/integration-procedure.model';
import { mapEntries } from '../../../models/property-set';

@Component({
    selector: 'ip-failure-tab',
    standalone: true,
    imports: [VlocodeKeyValueMapEditorComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './ip-failure-tab.component.html'
})
export class IpFailureTabComponent {
    readonly propertySet = input.required<Record<string, unknown>>();

    readonly mapEntriesChange = output<MapEntriesChange>();
    readonly propertyChange = output<PropertyValueChange>();

    protected readonly inputChecked = inputChecked;

    protected entries(mapName: string) {
        return mapEntries(this.propertySet(), mapName);
    }

    protected emitMapEntries(mapName: string, entries: VlocodeKeyValueEntry[]) {
        this.mapEntriesChange.emit({ mapName, entries });
    }

    protected propertyChecked(field: string) {
        return this.propertySet()[field] === true;
    }
}
