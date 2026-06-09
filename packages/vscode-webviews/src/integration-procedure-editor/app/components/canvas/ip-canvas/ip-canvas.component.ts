import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { VlocodeEmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import type { DropPosition, ElementTemplate, FlowNode, InsertContext } from '../../../models/integration-procedure.model';
import { IpFlowNodeComponent } from '../ip-flow-node/ip-flow-node.component';

@Component({
    selector: 'ip-canvas',
    standalone: true,
    imports: [CommonModule, IpFlowNodeComponent, VlocodeEmptyStateComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './ip-canvas.component.html'
})
export class IpCanvasComponent {
    readonly draggedKey = input<string | undefined>();
    readonly dropPosition = input<DropPosition | undefined>();
    readonly dropTargetKey = input<string | undefined>();
    readonly emptyFlowDropKey = input.required<string>();
    readonly flowTree = input.required<FlowNode[]>();
    readonly insertContext = input<InsertContext | undefined>();
    readonly insertFilter = input('');
    readonly insertTemplates = input.required<ElementTemplate[]>();
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
    readonly emptyFlowDragLeave = output<void>();
    readonly emptyFlowDragOver = output<DragEvent>();
    readonly emptyFlowDrop = output<DragEvent>();
    readonly groupDragOver = output<{ key: string; event: DragEvent }>();
    readonly groupDrop = output<{ key: string; event: DragEvent }>();
    readonly insertDragOver = output<{ key: string; event: DragEvent }>();
    readonly insertDrop = output<{ key: string; event: DragEvent }>();
    readonly insertFilterChange = output<string>();
    readonly openInsertPicker = output<{ afterKey?: string; parentKey?: string }>();
    readonly openPalette = output<void>();
    readonly selectElement = output<string>();
    readonly selectProcedure = output<void>();
}
