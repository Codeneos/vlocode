import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { elementSummary, GROUP_TYPES, iconForType } from '../../../models/element-templates';
import type { DropPosition, ElementTemplate, FlowNode, InsertContext } from '../../../models/integration-procedure.model';
import { IpInsertMenuComponent } from '../ip-insert-menu/ip-insert-menu.component';

@Component({
    selector: 'ip-flow-node',
    standalone: true,
    imports: [CommonModule, IpInsertMenuComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './ip-flow-node.component.html'
})
export class IpFlowNodeComponent {
    readonly draggedKey = input<string | undefined>();
    readonly dropPosition = input<DropPosition | undefined>();
    readonly dropTargetKey = input<string | undefined>();
    readonly insertContext = input<InsertContext | undefined>();
    readonly insertFilter = input('');
    readonly insertTemplates = input.required<ElementTemplate[]>();
    readonly node = input.required<FlowNode>();
    readonly selectedKey = input<string | undefined>();

    readonly addChildElement = output<string>();
    readonly addSelectedElement = output<string>();
    readonly closeInsertPicker = output<void>();
    readonly deleteRequested = output<string>();
    readonly dragEnd = output<void>();
    readonly elementDragLeave = output<string>();
    readonly elementDragOver = output<{ key: string; event: DragEvent }>();
    readonly elementDragStart = output<{ key: string; event: DragEvent }>();
    readonly elementDrop = output<{ key: string; event: DragEvent }>();
    readonly groupDragOver = output<{ key: string; event: DragEvent }>();
    readonly groupDrop = output<{ key: string; event: DragEvent }>();
    readonly insertDragOver = output<{ key: string; event: DragEvent }>();
    readonly insertDrop = output<{ key: string; event: DragEvent }>();
    readonly insertFilterChange = output<string>();
    readonly openInsertPicker = output<{ afterKey?: string; parentKey?: string }>();
    readonly selectElement = output<string>();

    protected readonly elementSummary = elementSummary;
    protected readonly iconForType = iconForType;

    protected isGroup(type: string) {
        return GROUP_TYPES.has(type);
    }

    protected isInsertPickerOpen(afterKey?: string, parentKey?: string) {
        const context = this.insertContext();
        return context?.afterKey === afterKey && context?.parentKey === parentKey;
    }

    protected hasSelectedDescendant(node: FlowNode) {
        const selectedKey = this.selectedKey();
        return !!selectedKey && this.hasDescendant(node, selectedKey);
    }

    protected hasOpenInsertMenu(node: FlowNode) {
        const context = this.insertContext();
        const targetKey = context?.parentKey ?? context?.afterKey;
        return !!targetKey && (targetKey === node.element.key || this.hasDescendant(node, targetKey));
    }

    private hasDescendant(node: FlowNode, key: string): boolean {
        return node.children.some(child => child.element.key === key || this.hasDescendant(child, key));
    }
}
