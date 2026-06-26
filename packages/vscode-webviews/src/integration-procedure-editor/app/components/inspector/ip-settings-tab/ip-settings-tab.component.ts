import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { VlocodeAutocompleteInputComponent } from '../../../../../shared/components/autocomplete-input/autocomplete-input.component';
import { VlocodeKeyValueMapEditorComponent, type VlocodeKeyValueEntry } from '../../../../../shared/components/key-value-map-editor/key-value-map-editor.component';
import { inputChecked, inputValue } from '../../../../../shared/utils/dom-events';
import { isDataMapperAction } from '../../../models/element-templates';
import type {
    DataRaptorInputParameter,
    DataRaptorInputParameterFieldChange,
    ElementFieldChange,
    HeaderFieldChange,
    IntegrationProcedureElement,
    IntegrationProcedureModel,
    MapEntriesChange,
    PropertyValueChange,
    ReferenceOpen,
    ReferenceKind
} from '../../../models/integration-procedure.model';
import { mapEntries, stringifyValue } from '../../../models/property-set';

@Component({
    selector: 'ip-settings-tab',
    standalone: true,
    imports: [VlocodeAutocompleteInputComponent, CommonModule, VlocodeKeyValueMapEditorComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './ip-settings-tab.component.html'
})
export class IpSettingsTabComponent {
    readonly apexClassOptions = input<readonly string[]>([]);
    readonly dataMapperOptions = input<readonly string[]>([]);
    readonly dataRaptorInputParameters = input<readonly DataRaptorInputParameter[]>([]);
    readonly model = input.required<IntegrationProcedureModel>();
    readonly propertySet = input.required<Record<string, unknown>>();
    readonly selectedElement = input<IntegrationProcedureElement | undefined>();

    readonly dataRaptorParameterAdd = output<void>();
    readonly dataRaptorParameterChange = output<DataRaptorInputParameterFieldChange>();
    readonly dataRaptorParameterDelete = output<number>();
    readonly elementFieldChange = output<ElementFieldChange>();
    readonly headerFieldChange = output<HeaderFieldChange>();
    readonly mapEntriesChange = output<MapEntriesChange>();
    readonly propertyChange = output<PropertyValueChange>();
    readonly referenceOpen = output<ReferenceOpen>();

    protected readonly inputChecked = inputChecked;
    protected readonly inputValue = inputValue;
    protected readonly isDataMapperAction = isDataMapperAction;

    protected entries(mapName: string) {
        return mapEntries(this.propertySet(), mapName);
    }

    protected emitMapEntries(mapName: string, entries: VlocodeKeyValueEntry[]) {
        this.mapEntriesChange.emit({ mapName, entries });
    }

    protected openReference(kind: ReferenceKind, name: string) {
        const trimmedName = name.trim();
        if (trimmedName) {
            this.referenceOpen.emit({ kind, name: trimmedName });
        }
    }

    protected propertyChecked(field: string) {
        return this.propertySet()[field] === true;
    }

    protected propertyValue(field: string) {
        return stringifyValue(this.propertySet()[field]);
    }
}
