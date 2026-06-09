import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { VlocodeEmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { inputValue } from '../../../../../shared/utils/dom-events';
import { iconForType, TEMPLATE_FAMILIES } from '../../../models/element-templates';
import type { DropPosition, ElementTemplate, FlowRow, LeftTab, Problem } from '../../../models/integration-procedure.model';

@Component({
    selector: 'ip-rail',
    standalone: true,
    imports: [CommonModule, VlocodeEmptyStateComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './ip-rail.component.html'
})
export class IpRailComponent {
    readonly activeTab = input.required<LeftTab>();
    readonly collapsed = input(false);
    readonly dragEnd = output<void>();
    readonly draggedKey = input<string | undefined>();
    readonly draggedTemplateType = input<string | undefined>();
    readonly dropPosition = input<DropPosition | undefined>();
    readonly dropTargetKey = input<string | undefined>();
    readonly outlineFilter = input('');
    readonly outlineRows = input.required<FlowRow[]>();
    readonly paletteFilter = input('');
    readonly problems = input.required<Problem[]>();
    readonly selectedKey = input<string | undefined>();
    readonly templates = input.required<ElementTemplate[]>();

    readonly activeTabChange = output<LeftTab>();
    readonly elementDragLeave = output<string>();
    readonly elementDragOver = output<{ key: string; event: DragEvent }>();
    readonly elementDragStart = output<{ key: string; event: DragEvent }>();
    readonly elementDrop = output<{ key: string; event: DragEvent }>();
    readonly outlineFilterChange = output<string>();
    readonly paletteFilterChange = output<string>();
    readonly selectElement = output<string>();
    readonly selectProblem = output<Problem>();
    readonly selectProcedure = output<void>();
    readonly templateDragStart = output<{ type: string; event: DragEvent }>();
    readonly toggleCollapsed = output<void>();

    protected readonly iconForType = iconForType;
    protected readonly tabs: Array<{ icon: string; id: LeftTab; label: string }> = [
        { id: 'outline', icon: 'list-tree', label: 'Outline' },
        { id: 'add', icon: 'add', label: 'Palette' },
        { id: 'problems', icon: 'warning', label: 'Problems' }
    ];
    protected readonly templateFamilies = TEMPLATE_FAMILIES;
    protected readonly templatesByFamily = computed(() => {
        const groups = new Map<ElementTemplate['family'], ElementTemplate[]>();
        for (const template of this.templates()) {
            const familyTemplates = groups.get(template.family) ?? [];
            familyTemplates.push(template);
            groups.set(template.family, familyTemplates);
        }
        return groups;
    });

    protected familyTemplates(family: ElementTemplate['family']) {
        return this.templatesByFamily().get(family) ?? [];
    }

    protected readonly inputValue = inputValue;
}
