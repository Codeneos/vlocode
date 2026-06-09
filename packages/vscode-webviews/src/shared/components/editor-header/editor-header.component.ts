import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface VlocodeHeaderMetaItem {
    tone?: 'default' | 'warning';
    value: string;
}

@Component({
    selector: 'vlo-editor-header',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './editor-header.component.html'
})
export class VlocodeEditorHeaderComponent {
    readonly actionsLabel = input('Editor actions');
    readonly icon = input.required<string>();
    readonly iconInteractive = input(true);
    readonly iconTitle = input('Select root item');
    readonly meta = input<readonly VlocodeHeaderMetaItem[]>([]);
    readonly metaLabel = input('Editor metadata');
    readonly subtitle = input('');
    readonly title = input.required<string>();

    readonly iconClick = output<void>();
}
