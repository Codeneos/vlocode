import { ChangeDetectionStrategy, Component, computed, effect, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { EmptyStateComponent } from './app/components/empty-state/empty-state.component';
import { ExtractPanelComponent } from './app/components/extract-panel/extract-panel.component';
import { FormulaPanelComponent } from './app/components/formula-panel/formula-panel.component';
import { LoadObjectsPanelComponent } from './app/components/load-objects-panel/load-objects-panel.component';
import { MappingDialogComponent } from './app/components/mapping-dialog/mapping-dialog.component';
import { MappingPanelComponent } from './app/components/mapping-panel/mapping-panel.component';
import type { DataMapperItem, DataMapperModel, EditorState, ExtractGroup, FieldSuggestion, LoadObjectGroup, TabId } from './app/models/datamapper.model';
import { firstTab, getDataMapperKind, getDataMapperSubtitle, getTabs } from './app/models/datamapper-kind';
import { createExtractGroups, extractGroupId, isExtractionItem, nextExtractSequence, normalizeExtractSequences } from './app/models/extract-groups';
import { createLoadObjectGroups, isFormulaItem, isLoadItem, isLoadMappingItem, loadObjectGroupId, nextLoadSequence, normalizeLoadSequences } from './app/models/load-objects';
import { inputPath, outputPath } from './app/models/datamapper-paths';

declare const acquireVsCodeApi: undefined | (() => VsCodeApi);

interface VsCodeApi {
    postMessage(message: WebviewToExtensionMessage): void;
}

type ExtensionToWebviewMessage =
    | { type: 'load'; state: EditorState }
    | { type: 'fields'; sourceFields: FieldSuggestion[]; outputFields: FieldSuggestion[]; error?: string }
    | { type: 'error'; message: string };

type WebviewToExtensionMessage =
    | { type: 'ready' }
    | { type: 'save'; model: DataMapperModel }
    | { type: 'deploy'; model: DataMapperModel }
    | { type: 'openSalesforce' }
    | { type: 'refresh' }
    | { type: 'refreshFields'; model: DataMapperModel; objects: string[] };

const EMPTY_MODEL: DataMapperModel = {
    header: {},
    items: [],
    sourceFormat: 'json',
    title: 'DataMapper'
};

const DATA_TYPES = [
    'Boolean',
    'Currency',
    'CurrencyRounded',
    'Date(MM/dd/yyyy)',
    'Double',
    'Integer',
    'JSON',
    'List<Decimal>',
    'List<Double>',
    'List<Integer>',
    'List<Map>',
    'List<String>',
    'Long',
    'String'
];

@Component({
    selector: 'vlocode-datamapper-editor',
    standalone: true,
    imports: [
        EmptyStateComponent,
        ExtractPanelComponent,
        FormulaPanelComponent,
        LoadObjectsPanelComponent,
        MappingDialogComponent,
        MappingPanelComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './app/app.component.html'
})
export class AppComponent {
    protected readonly dataTypes = DATA_TYPES;
    protected readonly activeTab = signal<TabId>('extract');
    protected readonly model = signal<DataMapperModel>(EMPTY_MODEL);
    protected readonly sourceFields = signal<FieldSuggestion[]>([]);
    protected readonly outputFields = signal<FieldSuggestion[]>([]);
    protected readonly error = signal<string | undefined>(undefined);
    protected readonly mappingFilter = signal('');
    protected readonly saving = signal(false);
    protected readonly deploying = signal(false);
    protected readonly openingSalesforce = signal(false);
    protected readonly refreshing = signal(false);
    protected readonly hasLoaded = signal(false);
    protected readonly fieldMetadataLoading = signal(false);
    protected readonly editing = signal<DataMapperItem | undefined>(undefined);
    protected readonly editIndex = signal(-1);

    private readonly vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : undefined;
    private lastFieldObjectsKey = '';

    protected readonly mapperKind = computed(() => getDataMapperKind(this.model()));
    protected readonly mapperSubtitle = computed(() => getDataMapperSubtitle(this.model(), this.mapperKind()));
    protected readonly tabs = computed(() => getTabs(this.mapperKind()));
    protected readonly extractionGroups = computed(() => createExtractGroups(this.model().items));
    protected readonly loadObjectGroups = computed(() => createLoadObjectGroups(this.model().items));
    protected readonly loading = computed(() => !this.hasLoaded() || this.fieldMetadataLoading() || this.refreshing());
    protected readonly loadingTitle = computed(() => {
        if (!this.hasLoaded()) {
            return 'Loading DataMapper';
        }
        if (this.refreshing()) {
            return 'Refreshing DataMapper';
        }
        return 'Loading field metadata';
    });
    protected readonly loadingMessage = computed(() => {
        if (!this.hasLoaded()) {
            return 'Reading the DataMapper and fetching field metadata.';
        }
        if (this.refreshing()) {
            return 'Refreshing the source file from the selected org.';
        }
        return 'Fetching Salesforce object fields for autocomplete.';
    });
    private readonly fieldMetadataObjects = computed(() => this.fieldObjectNamesForModel(this.model()));

    protected readonly formulaItems = computed(() =>
        this.model().items
            .filter(isFormulaItem)
            .sort((a, b) => Number(a.FormulaSequence || 0) - Number(b.FormulaSequence || 0))
    );

    protected readonly mappingItems = computed(() => {
        if (this.mapperKind() === 'load') {
            return this.model().items.filter(isLoadMappingItem);
        }
        return this.model().items.filter(item => !!item.OutputFieldName && item.OutputObjectName !== 'Formula' && !isExtractionItem(item));
    });

    protected readonly filteredMappingItems = computed(() => {
        const filter = this.mappingFilter().trim().toLowerCase();
        const items = this.mappingItems();
        if (!filter) {
            return items;
        }
        return items.filter(item => `${inputPath(item)} ${outputPath(item)}`.toLowerCase().includes(filter));
    });

    protected readonly sourceSuggestions = computed(() => this.uniqueSuggestions([
        ...this.sourceFields(),
        ...this.model().items
            .map(item => inputPath(item))
            .filter(Boolean)
            .map(path => ({ path, name: path }))
    ]));

    protected readonly objectSuggestions = computed(() => this.uniqueSuggestions([
        ...this.sourceFields()
            .map(field => field.objectName)
            .filter(Boolean)
            .map(objectName => ({ path: String(objectName), name: String(objectName) })),
        ...this.model().items
            .map(item => item.InputObjectName)
            .filter(Boolean)
            .map(objectName => ({ path: String(objectName), name: String(objectName) }))
    ]));

    protected readonly outputSuggestions = computed(() => this.uniqueSuggestions([
        ...this.outputFields(),
        ...this.model().items
            .map(item => outputPath(item))
            .filter(Boolean)
            .map(path => ({ path, name: path }))
    ]));

    protected readonly domainObjectSuggestions = computed(() => this.uniqueSuggestions([
        ...this.loadObjectGroups().map(group => ({
            path: String(group.outputObjectName || ''),
            name: String(group.outputObjectName || '')
        })).filter(field => field.path),
        ...this.model().items
            .map(item => item.OutputObjectName)
            .filter(Boolean)
            .map(objectName => ({ path: String(objectName), name: String(objectName) }))
    ]));

    constructor() {
        window.addEventListener('message', event => this.handleMessage(event.data as ExtensionToWebviewMessage));
        effect(() => {
            if (!this.hasLoaded()) {
                return;
            }

            const objects = this.fieldMetadataObjects();
            const key = objects.join('\u001f');
            if (!key) {
                this.fieldMetadataLoading.set(false);
                this.lastFieldObjectsKey = '';
                return;
            }

            if (key !== this.lastFieldObjectsKey) {
                this.lastFieldObjectsKey = key;
                if (!this.vscode) {
                    this.fieldMetadataLoading.set(false);
                    return;
                }
                this.fieldMetadataLoading.set(true);
                this.vscode.postMessage({ type: 'refreshFields', model: this.model(), objects });
            }
        });
        if (this.vscode) {
            this.vscode.postMessage({ type: 'ready' });
        } else {
            this.hasLoaded.set(true);
        }
    }

    protected requestReload() {
        this.error.set(undefined);
        this.hasLoaded.set(false);
        this.fieldMetadataLoading.set(false);
        this.vscode?.postMessage({ type: 'ready' });
    }

    protected save() {
        this.saving.set(true);
        this.vscode?.postMessage({ type: 'save', model: this.model() });
        window.setTimeout(() => this.saving.set(false), 500);
    }

    protected deploy() {
        this.deploying.set(true);
        this.vscode?.postMessage({ type: 'deploy', model: this.model() });
        window.setTimeout(() => this.deploying.set(false), 1000);
    }

    protected openSalesforce() {
        this.openingSalesforce.set(true);
        this.vscode?.postMessage({ type: 'openSalesforce' });
        window.setTimeout(() => this.openingSalesforce.set(false), 1000);
    }

    protected refresh() {
        this.refreshing.set(true);
        this.vscode?.postMessage({ type: 'refresh' });
        if (!this.vscode) {
            window.setTimeout(() => this.refreshing.set(false), 1000);
        }
    }

    protected createMapping() {
        this.editIndex.set(-1);
        this.editing.set(this.createMappingItem());
    }

    protected createFormula(afterItem?: DataMapperItem) {
        const item: DataMapperItem = {
            GlobalKey: crypto.randomUUID?.() ?? `${Date.now()}`,
            FormulaExpression: '',
            FormulaResultPath: '',
            FormulaSequence: afterItem ? Number(afterItem.FormulaSequence || 0) + 0.5 : this.nextFormulaSequence(),
            IsDisabled: false,
            IsRequiredForUpsert: false,
            IsUpsertKey: false,
            Name: this.model().title,
            OutputCreationSequence: 0,
            OutputFieldName: 'Formula',
            OutputObjectName: 'Formula',
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransformItem'
        };
        this.model.update(model => ({ ...model, items: this.normalizeFormulaSequences([...model.items, item]) }));
    }

    protected createExtraction(afterGroup?: ExtractGroup) {
        const sequence = afterGroup ? afterGroup.sequence + 0.5 : nextExtractSequence(this.model().items);
        const item: DataMapperItem = {
            GlobalKey: crypto.randomUUID?.() ?? `${Date.now()}`,
            FilterGroup: 0,
            FilterOperator: '=',
            InputObjectQuerySequence: sequence,
            IsDisabled: false,
            OutputObjectName: 'json',
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransformItem'
        };
        this.model.update(model => ({ ...model, items: normalizeExtractSequences([...model.items, item]) }));
    }

    protected createLoadObject() {
        const sequence = nextLoadSequence(this.model().items);
        this.createLoadObjectAtSequence(sequence);
    }

    protected insertLoadObjectAfter(group: LoadObjectGroup) {
        this.createLoadObjectAtSequence(group.sequence + 0.5);
    }

    private createLoadObjectAtSequence(sequence: number) {
        const item: DataMapperItem = {
            GlobalKey: crypto.randomUUID?.() ?? `${Date.now()}`,
            OutputCreationSequence: sequence,
            OutputObjectName: '',
            IsDisabled: false,
            IsRequiredForUpsert: false,
            IsUpsertKey: false,
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransformItem'
        };
        this.model.update(model => ({ ...model, items: normalizeLoadSequences([...model.items, item]) }));
    }

    protected updateExtractionGroup(group: ExtractGroup) {
        const items = this.model().items.filter(item => {
            if (!isExtractionItem(item)) {
                return true;
            }
            return extractGroupId(item) !== group.id;
        });
        items.push(...group.items);
        this.model.update(model => ({ ...model, items: normalizeExtractSequences(items) }));
    }

    protected deleteExtractionGroup(group: ExtractGroup) {
        const existingKeys = new Set(group.items.map(item => item.GlobalKey).filter(Boolean));
        const items = this.model().items.filter(item => item.GlobalKey ? !existingKeys.has(item.GlobalKey) : extractGroupId(item) !== group.id);
        this.model.update(model => ({ ...model, items: normalizeExtractSequences(items) }));
    }

    protected moveExtractionGroup(group: ExtractGroup, direction: -1 | 1) {
        const groups = this.extractionGroups();
        const index = groups.findIndex(candidate => candidate.id === group.id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= groups.length) {
            return;
        }
        [groups[index], groups[target]] = [groups[target], groups[index]];
        const sequenceByKey = new Map<string, number>();
        groups.forEach((candidate, groupIndex) => {
            for (const item of candidate.items) {
                sequenceByKey.set(String(item.GlobalKey ?? extractGroupId(item)), groupIndex + 1);
            }
        });
        this.model.update(model => ({
            ...model,
            items: model.items.map(item => isExtractionItem(item)
                ? { ...item, InputObjectQuerySequence: sequenceByKey.get(String(item.GlobalKey ?? extractGroupId(item))) ?? item.InputObjectQuerySequence }
                : item)
        }));
    }

    protected updateLoadObjectGroup(group: LoadObjectGroup) {
        const rows = [...group.items, ...group.links];
        const items = this.model().items.filter(item => {
            if (!isLoadItem(item)) {
                return true;
            }
            return loadObjectGroupId(item) !== group.id;
        });
        items.push(...rows);
        this.model.update(model => ({ ...model, items: normalizeLoadSequences(items) }));
    }

    protected deleteLoadObjectGroup(group: LoadObjectGroup) {
        const rows = [...group.items, ...group.links];
        const existingKeys = new Set(rows.map(item => item.GlobalKey).filter(Boolean));
        const items = this.model().items.filter(item => item.GlobalKey ? !existingKeys.has(item.GlobalKey) : loadObjectGroupId(item) !== group.id);
        this.model.update(model => ({ ...model, items: normalizeLoadSequences(items) }));
    }

    protected moveLoadObjectGroup(group: LoadObjectGroup, direction: -1 | 1) {
        const groups = this.loadObjectGroups();
        const index = groups.findIndex(candidate => candidate.id === group.id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= groups.length) {
            return;
        }
        [groups[index], groups[target]] = [groups[target], groups[index]];
        const sequenceByKey = new Map<string, number>();
        groups.forEach((candidate, groupIndex) => {
            for (const item of [...candidate.items, ...candidate.links]) {
                sequenceByKey.set(String(item.GlobalKey ?? loadObjectGroupId(item)), groupIndex + 1);
            }
        });
        this.model.update(model => ({
            ...model,
            items: model.items.map(item => isLoadItem(item)
                ? { ...item, OutputCreationSequence: sequenceByKey.get(String(item.GlobalKey ?? loadObjectGroupId(item))) ?? item.OutputCreationSequence }
                : item)
        }));
    }

    protected editMapping(item: DataMapperItem) {
        this.editIndex.set(this.model().items.indexOf(item));
        this.editing.set({ ...item });
    }

    protected deleteMapping(item: DataMapperItem) {
        this.deleteItem(item);
    }

    protected updateEditing(item: DataMapperItem) {
        this.editing.set(item);
    }

    protected cancelEdit() {
        this.editing.set(undefined);
        this.editIndex.set(-1);
    }

    protected applyEdit(item: DataMapperItem) {
        if (this.mapperKind() === 'load' ? !item.OutputFieldName : !outputPath(item)) {
            return;
        }

        this.upsertMappingItem(item, this.editIndex());
        this.cancelEdit();
    }

    protected applyEditAndCreateNext(item: DataMapperItem) {
        if (this.mapperKind() === 'load' ? !item.OutputFieldName : !outputPath(item)) {
            return;
        }

        this.upsertMappingItem(item, this.editIndex());
        this.editIndex.set(-1);
        this.editing.set(this.createMappingItem(item));
    }

    protected saveMappingRow(item: DataMapperItem) {
        this.upsertMappingItem(item, this.model().items.findIndex(candidate => this.isSameItem(candidate, item)));
    }

    private upsertMappingItem(item: DataMapperItem, index: number) {
        const items = [...this.model().items];
        if (index >= 0) {
            items[index] = item;
        } else {
            items.push(item);
        }
        this.model.update(model => ({ ...model, items }));
    }

    protected updateFormula(item: DataMapperItem) {
        const formulaItem: DataMapperItem = {
            ...item,
            FormulaSequence: Number(item.FormulaSequence || this.nextFormulaSequence()),
            OutputCreationSequence: item.OutputCreationSequence ?? 0,
            OutputFieldName: 'Formula',
            OutputObjectName: 'Formula',
            VlocityDataPackType: item.VlocityDataPackType ?? 'SObject',
            VlocityRecordSObjectType: item.VlocityRecordSObjectType ?? 'OmniDataTransformItem'
        };
        this.model.update(model => ({
            ...model,
            items: model.items.map(candidate => this.isSameItem(candidate, item) ? formulaItem : candidate)
        }));
    }

    protected moveFormula(item: DataMapperItem, direction: -1 | 1) {
        const formulas = this.formulaItems();
        const index = formulas.findIndex(candidate => this.isSameItem(candidate, item));
        const target = index + direction;
        if (index < 0 || target < 0 || target >= formulas.length) {
            return;
        }
        [formulas[index], formulas[target]] = [formulas[target], formulas[index]];
        const sequenceByKey = new Map<string, number>();
        formulas.forEach((formula, formulaIndex) => sequenceByKey.set(this.itemKey(formula), formulaIndex + 1));
        this.model.update(model => ({
            ...model,
            items: model.items.map(candidate => isFormulaItem(candidate)
                ? { ...candidate, FormulaSequence: sequenceByKey.get(this.itemKey(candidate)) ?? candidate.FormulaSequence }
                : candidate)
        }));
    }

    protected deleteFormula(item: DataMapperItem) {
        this.deleteItem(item);
    }

    protected insertFormulaAfter(item: DataMapperItem) {
        this.createFormula(item);
    }

    private handleMessage(message: ExtensionToWebviewMessage) {
        if (message.type === 'error') {
            this.error.set(message.message);
            this.fieldMetadataLoading.set(false);
            this.refreshing.set(false);
            return;
        }
        if (message.type === 'fields') {
            this.error.set(message.error);
            this.sourceFields.set(message.sourceFields);
            this.outputFields.set(message.outputFields);
            this.fieldMetadataLoading.set(false);
            return;
        }
        if (message.type === 'load') {
            this.error.set(message.state.error);
            this.model.set(message.state.model);
            this.sourceFields.set(message.state.sourceFields);
            this.outputFields.set(message.state.outputFields);
            this.lastFieldObjectsKey = this.fieldObjectNamesForModel(message.state.model).join('\u001f');
            this.hasLoaded.set(true);
            this.fieldMetadataLoading.set(false);
            this.refreshing.set(false);
            const visibleTabs = getTabs(getDataMapperKind(message.state.model)).map(tab => tab.id);
            if (!visibleTabs.includes(this.activeTab())) {
                this.activeTab.set(firstTab(getDataMapperKind(message.state.model)));
            }
        }
    }

    private uniqueSuggestions(fields: FieldSuggestion[]) {
        const seen = new Set<string>();
        return fields.filter(field => {
            const key = field.path.toLowerCase();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        }).sort((a, b) => a.path.localeCompare(b.path));
    }

    private deleteItem(item: DataMapperItem) {
        this.model.update(model => ({
            ...model,
            items: model.items.filter(candidate => {
                return !this.isSameItem(candidate, item);
            })
        }));
    }

    private nextFormulaSequence() {
        return this.formulaItems().reduce((max, item) => Math.max(max, Number(item.FormulaSequence || 0)), 0) + 1;
    }

    private normalizeFormulaSequences(items: DataMapperItem[]) {
        const formulas = items
            .filter(isFormulaItem)
            .sort((a, b) => Number(a.FormulaSequence || 0) - Number(b.FormulaSequence || 0));
        formulas.forEach((item, index) => item.FormulaSequence = index + 1);
        return items;
    }

    private isSameItem(candidate: DataMapperItem, item: DataMapperItem) {
        if (item.GlobalKey && candidate.GlobalKey) {
            return candidate.GlobalKey === item.GlobalKey;
        }
        return candidate === item;
    }

    private itemKey(item: DataMapperItem) {
        return String(item.GlobalKey ?? `${item.FormulaSequence ?? ''}:${item.FormulaResultPath ?? ''}:${item.FormulaExpression ?? ''}`);
    }

    private createMappingItem(previous?: DataMapperItem): DataMapperItem {
        return {
            GlobalKey: crypto.randomUUID?.() ?? `${Date.now()}`,
            IsDisabled: false,
            IsRequiredForUpsert: false,
            IsUpsertKey: false,
            OutputCreationSequence: this.mapperKind() === 'load'
                ? (previous?.OutputCreationSequence ?? this.loadObjectGroups()[0]?.sequence ?? 1)
                : undefined,
            OutputObjectName: this.mapperKind() === 'load'
                ? (previous?.OutputObjectName ?? this.loadObjectGroups()[0]?.outputObjectName ?? '')
                : 'json',
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransformItem'
        };
    }

    private fieldObjectNamesForModel(model: DataMapperModel) {
        const kind = getDataMapperKind(model);
        const objectNames = new Set<string>();
        for (const item of model.items) {
            if (kind !== 'load' && item.InputObjectName) {
                objectNames.add(String(item.InputObjectName));
            }
            if (kind === 'load' && item.OutputObjectName) {
                objectNames.add(String(item.OutputObjectName));
            }
        }
        return [...objectNames].sort((a, b) => a.localeCompare(b));
    }
}

bootstrapApplication(AppComponent, {
    providers: [provideZonelessChangeDetection()]
}).catch(error => console.error(error));
