import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { VlocodeJsonEditorComponent } from '../../../../shared/components/json-editor/json-editor.component';
import type { DataMapperPreviewDebug } from '../../models/datamapper.model';

@Component({
    selector: 'dm-preview-panel',
    standalone: true,
    imports: [VlocodeJsonEditorComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './preview-panel.component.html'
})
export class PreviewPanelComponent {
    readonly inputJson = input.required<string>();
    readonly outputJson = input.required<string>();
    readonly inputError = input<string | undefined>();
    readonly executionError = input<string | undefined>();
    readonly debug = input<DataMapperPreviewDebug | undefined>();
    readonly running = input(false);

    readonly inputJsonChange = output<string>();
    readonly runPreview = output<void>();

    protected readonly queryCount = computed(() => this.debug()?.queries.length ?? 0);
    protected readonly warningCount = computed(() => this.debug()?.warnings?.length ?? 0);
    protected readonly resultCount = computed(() => this.debug()?.queries.reduce((total, query) => total + query.resultCount, 0) ?? 0);
    protected readonly totalDuration = computed(() => this.formatDuration(this.debug()?.totalDurationMs ?? 0));

    protected formatDuration(durationMs: number) {
        return `${Math.max(0, Math.round(durationMs))} ms`;
    }
}
