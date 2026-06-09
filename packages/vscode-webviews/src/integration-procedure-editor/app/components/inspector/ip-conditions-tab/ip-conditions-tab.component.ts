import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { VlocodeFormulaEditorComponent } from '../../../../../shared/components/formula-editor/formula-editor.component';
import { inputChecked } from '../../../../../shared/utils/dom-events';
import type { IntegrationProcedureElement, PropertyValueChange } from '../../../models/integration-procedure.model';
import { stringifyValue } from '../../../models/property-set';

@Component({
    selector: 'ip-conditions-tab',
    standalone: true,
    imports: [VlocodeFormulaEditorComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './ip-conditions-tab.component.html'
})
export class IpConditionsTabComponent {
    readonly propertySet = input.required<Record<string, unknown>>();
    readonly selectedElement = input<IntegrationProcedureElement | undefined>();

    readonly procedurePropertyChange = output<PropertyValueChange>();
    readonly propertyChange = output<PropertyValueChange>();

    protected readonly inputChecked = inputChecked;

    protected propertyChecked(field: string) {
        return this.propertySet()[field] === true;
    }

    protected propertyValue(field: string) {
        return stringifyValue(this.propertySet()[field]);
    }

    protected updateExecutionFormula(value: string) {
        if (this.selectedElement()) {
            this.propertyChange.emit({ field: 'executionConditionalFormula', value });
        } else {
            this.procedurePropertyChange.emit({ field: 'show', value });
        }
    }
}
