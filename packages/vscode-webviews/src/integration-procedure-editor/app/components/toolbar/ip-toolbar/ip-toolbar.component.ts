import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { VlocodeEditorHeaderComponent, type VlocodeHeaderMetaItem } from '../../../../../shared/components/editor-header/editor-header.component';
import type { IntegrationProcedureModel } from '../../../models/integration-procedure.model';

@Component({
    selector: 'ip-toolbar',
    standalone: true,
    imports: [VlocodeEditorHeaderComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './ip-toolbar.component.html'
})
export class IpToolbarComponent {
    readonly deploying = input(false);
    readonly model = input.required<IntegrationProcedureModel>();
    readonly openingSalesforce = input(false);
    readonly problemsCount = input(0);
    readonly refreshing = input(false);
    readonly saving = input(false);

    readonly deploy = output<void>();
    readonly openSalesforce = output<void>();
    readonly refresh = output<void>();
    readonly save = output<void>();
    readonly selectProcedure = output<void>();
    readonly viewSource = output<void>();

    protected readonly metaItems = computed<VlocodeHeaderMetaItem[]>(() => {
        const model = this.model();
        const meta: VlocodeHeaderMetaItem[] = [];
        if (model.header.type && model.header.subType) {
            meta.push({ value: `${model.header.type}/${model.header.subType}` });
        }
        if (model.header.versionNumber) {
            meta.push({ value: `v${model.header.versionNumber}` });
        }
        meta.push({ value: model.sourceFormat.toUpperCase() });
        meta.push({ value: model.runtime });
        if (this.problemsCount()) {
            const count = this.problemsCount();
            meta.push({ value: `${count} problem${count === 1 ? '' : 's'}`, tone: 'warning' });
        }
        return meta;
    });
}
