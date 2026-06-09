import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
    selector: 'vlo-empty-state',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './empty-state.component.html'
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
