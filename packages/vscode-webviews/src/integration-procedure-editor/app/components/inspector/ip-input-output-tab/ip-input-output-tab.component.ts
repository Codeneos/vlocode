import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { VlocodeKeyValueMapEditorComponent, type VlocodeKeyValueEntry } from '../../../../../shared/components/key-value-map-editor/key-value-map-editor.component';
import { inputChecked, inputValue } from '../../../../../shared/utils/dom-events';
import type { MapEntriesChange, PropertyValueChange } from '../../../models/integration-procedure.model';
import { mapEntries, stringifyValue } from '../../../models/property-set';

@Component({
    selector: 'ip-input-output-tab',
    standalone: true,
    imports: [VlocodeKeyValueMapEditorComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './ip-input-output-tab.component.html'
})
export class IpInputOutputTabComponent {
    readonly propertySet = input.required<Record<string, unknown>>();

    readonly mapEntriesChange = output<MapEntriesChange>();
    readonly propertyChange = output<PropertyValueChange>();

    protected readonly inputChecked = inputChecked;
    protected readonly inputValue = inputValue;

    protected entries(mapName: string) {
        return mapEntries(this.propertySet(), mapName);
    }

    protected emitMapEntries(mapName: string, entries: VlocodeKeyValueEntry[]) {
        this.mapEntriesChange.emit({ mapName, entries });
    }

    protected propertyChecked(field: string) {
        return this.propertySet()[field] === true;
    }

    protected propertyValue(field: string) {
        return stringifyValue(this.propertySet()[field]);
    }
}
