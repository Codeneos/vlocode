import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
    selector: 'vlocode-empty-state',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="vlocode-empty-state" [class.vlocode-empty-state--page]="page()" [class.vlocode-empty-state--inline]="inline()" [attr.role]="role()">
            @if (icon()) {
                <span class="codicon codicon-{{ icon() }} vlocode-empty-state__icon" aria-hidden="true"></span>
            }
            <h2>{{ title() }}</h2>
            @if (message()) {
                <p>{{ message() }}</p>
            }
            @if (actionLabel()) {
                <button type="button" class="vlocode-button vlocode-button--primary" (click)="action.emit()">
                    @if (actionIcon()) {
                        <span class="codicon codicon-{{ actionIcon() }}" aria-hidden="true"></span>
                    }
                    {{ actionLabel() }}
                </button>
            }
            <ng-content />
        </section>
    `
})
export class VlocodeEmptyStateComponent {
    readonly actionIcon = input<string>();
    readonly actionLabel = input<string>();
    readonly icon = input<string>();
    readonly inline = input(false);
    readonly message = input<string>();
    readonly page = input(false);
    readonly role = input<string | null>(null);
    readonly title = input.required<string>();

    readonly action = output<void>();
}
