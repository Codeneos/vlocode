import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { iconForType } from '../../../models/element-templates';
import type {
    DataRaptorInputParameter,
    DataRaptorInputParameterFieldChange,
    ElementFieldChange,
    HeaderFieldChange,
    InspectorTab,
    IntegrationProcedureElement,
    IntegrationProcedureModel,
    MapEntriesChange,
    PropertyValueChange
} from '../../../models/integration-procedure.model';
import type { monaco } from '../../../../../shared/components/monaco-editor/monaco-editor.component';
import { IpConditionsTabComponent } from '../ip-conditions-tab/ip-conditions-tab.component';
import { IpFailureTabComponent } from '../ip-failure-tab/ip-failure-tab.component';
import { IpInputOutputTabComponent } from '../ip-input-output-tab/ip-input-output-tab.component';
import { IpJsonTabComponent } from '../ip-json-tab/ip-json-tab.component';
import { IpSettingsTabComponent } from '../ip-settings-tab/ip-settings-tab.component';

@Component({
    selector: 'ip-inspector',
    standalone: true,
    imports: [
        CommonModule,
        IpConditionsTabComponent,
        IpFailureTabComponent,
        IpInputOutputTabComponent,
        IpJsonTabComponent,
        IpSettingsTabComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './ip-inspector.component.html'
})
export class IpInspectorComponent {
    readonly activeTab = input.required<InspectorTab>();
    readonly apexClassOptions = input<readonly string[]>([]);
    readonly collapsed = input(false);
    readonly dataMapperOptions = input<readonly string[]>([]);
    readonly dataRaptorInputParameters = input<readonly DataRaptorInputParameter[]>([]);
    readonly inspectorTabs = input.required<Array<{ id: InspectorTab; label: string }>>();
    readonly jsonDraft = input.required<string>();
    readonly jsonEditorOptions = input.required<monaco.editor.IStandaloneEditorConstructionOptions>();
    readonly jsonError = input<string | undefined>();
    readonly jsonTargetLabel = input.required<string>();
    readonly model = input.required<IntegrationProcedureModel>();
    readonly propertySet = input.required<Record<string, unknown>>();
    readonly selectedElement = input<IntegrationProcedureElement | undefined>();

    readonly activeTabChange = output<InspectorTab>();
    readonly applyJson = output<void>();
    readonly dataRaptorParameterAdd = output<void>();
    readonly dataRaptorParameterChange = output<DataRaptorInputParameterFieldChange>();
    readonly dataRaptorParameterDelete = output<number>();
    readonly deleteRequested = output<string>();
    readonly duplicateElement = output<string>();
    readonly elementFieldChange = output<ElementFieldChange>();
    readonly headerFieldChange = output<HeaderFieldChange>();
    readonly jsonDraftChange = output<string>();
    readonly mapEntriesChange = output<MapEntriesChange>();
    readonly procedurePropertyChange = output<PropertyValueChange>();
    readonly propertyChange = output<PropertyValueChange>();
    readonly resizeKeydown = output<KeyboardEvent>();
    readonly resizeStart = output<PointerEvent>();
    readonly toggleCollapsed = output<void>();

    protected readonly iconForType = iconForType;
}
