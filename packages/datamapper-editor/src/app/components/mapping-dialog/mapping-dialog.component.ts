import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AutocompleteInputComponent } from '../autocomplete-input/autocomplete-input.component';
import type { DataMapperItem, DataMapperKind, FieldSuggestion, LoadObjectGroup } from '../../models/datamapper.model';
import { inputPath, outputPath } from '../../models/datamapper-paths';
import { loadObjectLabel } from '../../models/load-objects';

@Component({
    selector: 'dm-mapping-dialog',
    standalone: true,
    imports: [AutocompleteInputComponent, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './mapping-dialog.component.html'
})
export class MappingDialogComponent {
    readonly mapperKind = input.required<DataMapperKind>();
    readonly item = input.required<DataMapperItem>();
    readonly editIndex = input.required<number>();
    readonly sourceSuggestions = input.required<FieldSuggestion[]>();
    readonly outputSuggestions = input.required<FieldSuggestion[]>();
    readonly loadObjects = input<LoadObjectGroup[]>([]);
    readonly domainObjectSuggestions = input<FieldSuggestion[]>([]);
    readonly dataTypes = input.required<string[]>();

    readonly itemChange = output<DataMapperItem>();
    readonly cancel = output<void>();
    readonly saveMapping = output<DataMapperItem>();
    readonly saveAndAddAnother = output<DataMapperItem>();

    protected readonly inputPath = inputPath;
    protected readonly outputPath = outputPath;
    protected readonly loadObjectLabel = loadObjectLabel;
    protected readonly title = computed(() => this.editIndex() === -1 ? 'Create Mapping' : 'Edit Mapping');
    protected readonly isCreating = computed(() => this.editIndex() === -1);
    protected readonly inputLabel = computed(() => this.mapperKind() === 'extract' ? 'Extract JSON Path' : 'JSON Input Path');
    protected readonly outputLabel = computed(() => this.mapperKind() === 'load' ? 'Domain Object Field' : 'JSON Output Path');
    protected readonly dataTypeSuggestions = computed<FieldSuggestion[]>(() =>
        this.dataTypes().map(type => ({ name: type, path: type, label: type }))
    );

    protected setInputPath(path: string) {
        if (this.mapperKind() === 'load') {
            this.itemChange.emit({ ...this.item(), InputFieldName: path });
            return;
        }
        const item = this.item();
        const separator = path.lastIndexOf(':');
        const objectName = separator >= 0 ? path.slice(0, separator) : item.InputObjectName;
        const fieldName = separator >= 0 ? path.slice(separator + 1) : path;
        this.itemChange.emit({ ...item, InputObjectName: objectName, InputFieldName: fieldName });
    }

    protected setOutputPath(path: string) {
        this.itemChange.emit({ ...this.item(), OutputFieldName: path, OutputObjectName: 'json' });
    }

    protected setLoadObject(sequence: string | number) {
        const loadObject = this.loadObjects().find(group => Number(group.sequence) === Number(sequence));
        this.itemChange.emit({
            ...this.item(),
            OutputCreationSequence: Number(sequence) || this.item().OutputCreationSequence || 1,
            OutputObjectName: loadObject?.outputObjectName || this.item().OutputObjectName
        });
    }

    protected setDomainObjectName(outputObjectName: string) {
        this.itemChange.emit({ ...this.item(), OutputObjectName: outputObjectName });
    }

    protected setLoadField(field: string) {
        this.itemChange.emit({ ...this.item(), OutputFieldName: field });
    }

    protected selectedLoadObject() {
        return this.item().OutputCreationSequence || this.loadObjects().find(group => group.outputObjectName === this.item().OutputObjectName)?.sequence || '';
    }

    protected setValue(key: keyof DataMapperItem, value: unknown) {
        this.itemChange.emit({ ...this.item(), [key]: value });
    }
}
