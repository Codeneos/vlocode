import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

type DataMapperCardVariant = 'extract' | 'formula' | 'load';

@Component({
    selector: 'dm-data-mapper-card',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <article
            class="dm-card"
            [class.dm-card--extract]="variant() === 'extract'"
            [class.dm-card--formula]="variant() === 'formula'"
            [class.dm-card--load]="variant() === 'load'"
            [class.dm-card--collapsed]="!expanded()"
            [class.dm-card--disabled]="disabled()"
            [class.dm-card--dragging]="dragging()"
            [class.dm-card--drop-target]="dropTarget()"
            [attr.draggable]="draggable() ? 'true' : null"
            (dragstart)="cardDragStart.emit($event)"
            (dragover)="cardDragOver.emit($event)"
            (drop)="cardDrop.emit($event)"
            (dragend)="cardDragEnd.emit($event)">
            <header class="dm-card__header">
                <button type="button" class="dm-card__toggle" [attr.aria-expanded]="expanded()" [attr.aria-label]="toggleLabel()" (click)="toggleExpanded()">
                    <span class="codicon" [class.codicon-chevron-down]="expanded()" [class.codicon-chevron-right]="!expanded()" aria-hidden="true"></span>
                </button>
                <span [ngClass]="['dm-card__icon', 'codicon', 'codicon-' + icon()]" aria-hidden="true"></span>
                <div class="dm-card__title">
                    <h2>{{ title() }}</h2>
                    <p>{{ subtitle() }}</p>
                </div>
                <div class="dm-card__actions" [attr.aria-label]="actionsLabel()">
                    <ng-content select="[dmCardAction]"></ng-content>
                </div>
            </header>
            @if (expanded()) {
                <ng-content select="[dmCardBody]"></ng-content>
            }
        </article>
    `
})
export class DataMapperCardComponent {
    readonly variant = input.required<DataMapperCardVariant>();
    readonly icon = input.required<string>();
    readonly title = input.required<string>();
    readonly subtitle = input.required<string>();
    readonly toggleName = input.required<string>();
    readonly actionsLabel = input<string | undefined>(undefined);
    readonly disabled = input(false);
    readonly draggable = input(false);
    readonly dragging = input(false);
    readonly dropTarget = input(false);

    readonly cardDragStart = output<DragEvent>();
    readonly cardDragOver = output<DragEvent>();
    readonly cardDrop = output<DragEvent>();
    readonly cardDragEnd = output<DragEvent>();

    protected readonly expanded = signal(false);

    protected toggleExpanded() {
        this.expanded.update(expanded => !expanded);
    }

    protected toggleLabel() {
        return `${this.expanded() ? 'Collapse' : 'Expand'} ${this.toggleName()}`;
    }
}
