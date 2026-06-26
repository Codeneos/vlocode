import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

export type VlocodeDesignerCardVariant = 'default' | 'extract' | 'formula' | 'load';

@Component({
    selector: 'vlo-designer-card',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './designer-card.component.html'
})
export class VlocodeDesignerCardComponent {
    readonly actionsLabel = input<string | undefined>(undefined);
    readonly disabled = input(false);
    readonly draggable = input(false);
    readonly dragging = input(false);
    readonly dropTarget = input(false);
    readonly icon = input.required<string>();
    readonly subtitle = input.required<string>();
    readonly title = input.required<string>();
    readonly toggleName = input.required<string>();
    readonly variant = input<VlocodeDesignerCardVariant>('default');

    readonly cardDragEnd = output<DragEvent>();
    readonly cardDragOver = output<DragEvent>();
    readonly cardDragStart = output<DragEvent>();
    readonly cardDrop = output<DragEvent>();

    protected readonly expanded = signal(false);

    protected toggleExpanded(event?: MouseEvent) {
        event?.stopPropagation();
        this.expanded.update(expanded => !expanded);
    }

    protected toggleExpandedFromHeader(event: MouseEvent) {
        if (this.isInteractiveHeaderTarget(event.target)) {
            return;
        }
        this.toggleExpanded(event);
    }

    protected toggleLabel() {
        return `${this.expanded() ? 'Collapse' : 'Expand'} ${this.toggleName()}`;
    }

    private isInteractiveHeaderTarget(target: EventTarget | null) {
        return target instanceof Element && !!target.closest('.vlo-designer-card__actions, button, a, input, select, textarea, [role="button"]');
    }
}
