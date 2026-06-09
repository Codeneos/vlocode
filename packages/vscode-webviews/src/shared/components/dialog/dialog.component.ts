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
    selector: 'vlo-dialog',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dialog.component.html'
})
export class VlocodeDialogComponent {
    readonly cancelLabel = input('Cancel');
    readonly confirmIcon = input<string>();
    readonly confirmLabel = input('Confirm');
    readonly icon = input<string>();
    readonly message = input('');
    readonly showClose = input(false);
    readonly showDefaultActions = input(true);
    readonly size = input<'default' | 'wide'>('default');
    readonly title = input.required<string>();
    readonly type = input<VlocodeDialogType>('info');

    readonly cancel = output<void>();
    readonly confirm = output<void>();

    protected readonly titleId = `vlo-dialog-title-${nextDialogId++}`;
    protected readonly iconName = computed(() => this.icon() ?? DIALOG_ICONS[this.type()]);
    protected readonly confirmIconName = computed(() => this.confirmIcon() ?? DIALOG_ICONS[this.type()]);
}
