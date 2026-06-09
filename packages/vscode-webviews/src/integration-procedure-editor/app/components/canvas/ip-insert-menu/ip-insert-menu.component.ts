import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { inputValue } from '../../../../../shared/utils/dom-events';
import { TEMPLATE_FAMILIES } from '../../../models/element-templates';
import type { ElementTemplate } from '../../../models/integration-procedure.model';

@Component({
    selector: 'ip-insert-menu',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './ip-insert-menu.component.html'
})
export class IpInsertMenuComponent {
    readonly filter = input('');
    readonly templates = input.required<ElementTemplate[]>();

    readonly addTemplate = output<string>();
    readonly close = output<void>();
    readonly filterChange = output<string>();

    protected readonly templateFamilies = TEMPLATE_FAMILIES;

    protected templatesForFamily(family: ElementTemplate['family']) {
        return this.templates().filter(template => template.family === family);
    }

    protected readonly inputValue = inputValue;
}
