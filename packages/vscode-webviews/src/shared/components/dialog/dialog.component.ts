import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type VlocodeDialogType = 'danger' | 'info' | 'success' | 'warning';

const DIALOG_ICONS: Record<VlocodeDialogType, string> = {
    danger: 'trash',
    info: 'info',
    success: 'check',
    warning: 'warning'
};

let nextDialogId = 0;

@Component({
    selector: 'vlocode-dialog',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="vlocode-dialog-backdrop" role="presentation" (click)="cancel.emit()"></div>
        <section
            class="vlocode-dialog vlocode-dialog--{{ type() }}"
            role="dialog"
            aria-modal="true"
            [attr.aria-labelledby]="titleId"
            (click)="$event.stopPropagation()">
            <header class="vlocode-dialog__header">
                <span class="vlocode-dialog__icon" aria-hidden="true">
                    <span class="codicon codicon-{{ iconName() }}"></span>
                </span>
                <div class="vlocode-dialog__copy">
                    <h2 [id]="titleId">{{ title() }}</h2>
                    @if (message()) {
                        <p>{{ message() }}</p>
                    }
                </div>
            </header>
            <ng-content />
            <footer class="vlocode-dialog__footer">
                <button type="button" class="vlocode-button" (click)="cancel.emit()">
                    {{ cancelLabel() }}
                </button>
                <button type="button" class="vlocode-button vlocode-button--{{ type() }}" (click)="confirm.emit()">
                    <span class="codicon codicon-{{ confirmIconName() }}" aria-hidden="true"></span>
                    {{ confirmLabel() }}
                </button>
            </footer>
        </section>
    `
})
export class VlocodeDialogComponent {
    readonly cancelLabel = input('Cancel');
    readonly confirmIcon = input<string>();
    readonly confirmLabel = input('Confirm');
    readonly icon = input<string>();
    readonly message = input('');
    readonly title = input.required<string>();
    readonly type = input<VlocodeDialogType>('info');

    readonly cancel = output<void>();
    readonly confirm = output<void>();

    protected readonly titleId = `vlocode-dialog-title-${nextDialogId++}`;
    protected readonly iconName = computed(() => this.icon() ?? DIALOG_ICONS[this.type()]);
    protected readonly confirmIconName = computed(() => this.confirmIcon() ?? DIALOG_ICONS[this.type()]);
}
