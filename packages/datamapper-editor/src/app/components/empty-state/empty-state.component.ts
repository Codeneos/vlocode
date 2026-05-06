import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
    selector: 'dm-empty-state',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './empty-state.component.html'
})
export class EmptyStateComponent {
    readonly title = input.required<string>();
    readonly message = input<string>();
    readonly role = input<string | null>(null);
    readonly actionLabel = input<string>();
    readonly page = input(false);

    readonly action = output<void>();
}
