import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AutocompleteInputComponent } from '../autocomplete-input/autocomplete-input.component';
import type { DataMapperItem, DataMapperKind, FieldSuggestion, LoadObjectGroup } from '../../models/datamapper.model';
import { inputPath, outputPath } from '../../models/datamapper-paths';
import { loadObjectLabel } from '../../models/load-objects';

interface TransformValueMappingPair {
    source: string;
    target: string;
}

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
        this.itemChange.emit({ ...this.item(), InputObjectName: undefined, InputFieldName: path });
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

    protected transformValueMappings(): TransformValueMappingPair[] {
        const value = this.item().TransformValuesMappings ?? this.item().TransformValueMappings ?? this.item().transformValuesMappings;
        const parsed = typeof value === 'string' && value.trim() ? parseJsonObject(value) : value;
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return [];
        }
        return Object.entries(parsed as Record<string, unknown>).map(([source, target]) => ({
            source,
            target: target === undefined || target === null ? '' : String(target)
        }));
    }

    protected addTransformValueMapping() {
        this.setTransformValueMappings([...this.transformValueMappings(), { source: '', target: '' }]);
    }

    protected updateTransformValueMapping(index: number, field: keyof TransformValueMappingPair, value: string) {
        const pairs = this.transformValueMappings();
        pairs[index] = { ...pairs[index], [field]: value };
        this.setTransformValueMappings(pairs);
    }

    protected deleteTransformValueMapping(index: number) {
        const pairs = this.transformValueMappings().filter((_, itemIndex) => itemIndex !== index);
        this.setTransformValueMappings(pairs);
    }

    private setTransformValueMappings(pairs: TransformValueMappingPair[]) {
        const mappings = Object.fromEntries(pairs.map(pair => [pair.source, pair.target]));
        this.itemChange.emit({
            ...this.item(),
            TransformValueMappings: undefined,
            transformValuesMappings: undefined,
            TransformValuesMappings: Object.keys(mappings).length ? JSON.stringify(mappings) : '{ }'
        });
    }
}

function parseJsonObject(value: string): unknown {
    try {
        return JSON.parse(value);
    } catch {
        return undefined;
    }
}
