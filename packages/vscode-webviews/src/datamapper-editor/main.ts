import { ChangeDetectionStrategy, Component, computed, effect, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { EmptyStateComponent } from './app/components/empty-state/empty-state.component';
import { ExtractPanelComponent } from './app/components/extract-panel/extract-panel.component';
import { FormulaPanelComponent } from './app/components/formula-panel/formula-panel.component';
import { LoadObjectsPanelComponent } from './app/components/load-objects-panel/load-objects-panel.component';
import { MappingDialogComponent } from './app/components/mapping-dialog/mapping-dialog.component';
import { MappingPanelComponent } from './app/components/mapping-panel/mapping-panel.component';
import { PreviewPanelComponent } from './app/components/preview-panel/preview-panel.component';
import type { DataMapperItem, DataMapperModel, DataMapperPreviewDebug, DataMapperPreviewResult, EditorState, ExtractGroup, FieldSuggestion, LoadObjectGroup, TabId } from './app/models/datamapper.model';
import { firstTab, getDataMapperKind, getDataMapperSubtitle, getTabs } from './app/models/datamapper-kind';
import { createExtractGroups, extractGroupId, isExtractionItem, nextExtractSequence, normalizeExtractSequences } from './app/models/extract-groups';
import { createLoadObjectGroups, isLoadItem, isLoadMappingItem, loadObjectGroupId, nextLoadSequence, normalizeLoadSequences } from './app/models/load-objects';
import { isFormulaItem, nextFormulaSequence, normalizeFormulaSequences } from './app/models/formulas';
import { inputPath, outputPath } from './app/models/datamapper-paths';
import { createMappingItem, newGlobalKey } from './app/models/items';
import { extractSourceSuggestions, pathSuggestions, uniqueSuggestions } from './app/models/field-suggestions';

declare const acquireVsCodeApi: undefined | (() => VsCodeApi);

interface VsCodeApi {
    postMessage(message: WebviewToExtensionMessage): void;
}

type ExtensionToWebviewMessage =
    | { type: 'load'; state: EditorState }
    | { type: 'fields'; objectSuggestions?: FieldSuggestion[]; sourceFields: FieldSuggestion[]; outputFields: FieldSuggestion[]; error?: string }
    | { type: 'previewResult'; result: DataMapperPreviewResult }
    | { type: 'previewError'; message: string; debug?: DataMapperPreviewDebug }
    | { type: 'error'; message: string };

type WebviewToExtensionMessage =
    | { type: 'ready' }
    | { type: 'change'; model: DataMapperModel }
    | { type: 'save'; model: DataMapperModel }
    | { type: 'deploy'; model: DataMapperModel }
    | { type: 'openSalesforce' }
    | { type: 'refresh' }
    | { type: 'refreshFields'; model: DataMapperModel; objects: string[] }
    | { type: 'preview'; model: DataMapperModel; input: unknown };

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
        MappingPanelComponent,
        PreviewPanelComponent
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
    protected readonly sObjectSuggestions = signal<FieldSuggestion[]>([]);
    protected readonly error = signal<string | undefined>(undefined);
    protected readonly mappingFilter = signal('');
    protected readonly saving = signal(false);
    protected readonly deploying = signal(false);
    protected readonly openingSalesforce = signal(false);
    protected readonly refreshing = signal(false);
    protected readonly previewRunning = signal(false);
    protected readonly previewInputJson = signal('{\n}');
    protected readonly previewOutputJson = signal('');
    protected readonly previewError = signal<string | undefined>(undefined);
    protected readonly previewDebug = signal<DataMapperPreviewDebug | undefined>(undefined);
    protected readonly hasLoaded = signal(false);
    protected readonly fieldMetadataLoading = signal(false);
    protected readonly editing = signal<DataMapperItem | undefined>(undefined);
    protected readonly editIndex = signal(-1);

    private readonly vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : undefined;
    private lastFieldObjectsKey = '';
    private previewInputDirty = false;

    protected readonly mapperKind = computed(() => getDataMapperKind(this.model()));
    protected readonly mapperSubtitle = computed(() => getDataMapperSubtitle(this.model(), this.mapperKind()));
    protected readonly tabs = computed(() => getTabs(this.mapperKind()));
    protected readonly extractionGroups = computed(() => createExtractGroups(this.model().items));
    protected readonly loadObjectGroups = computed(() => createLoadObjectGroups(this.model().items));
    protected readonly loading = computed(() => !this.hasLoaded() || this.fieldMetadataLoading() || this.refreshing());
    protected readonly loadingPhase = computed(() => {
        if (!this.hasLoaded()) {
            return { title: 'Loading DataMapper', message: 'Reading the DataMapper and fetching field metadata.' };
        }
        if (this.refreshing()) {
            return { title: 'Refreshing DataMapper', message: 'Refreshing the source file from the selected org.' };
        }
        return { title: 'Loading field metadata', message: 'Fetching Salesforce object fields for autocomplete.' };
    });
    protected readonly previewInputError = computed(() => validatePreviewInput(this.previewInputJson()));

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

    protected readonly sourceSuggestions = computed(() => this.mapperKind() === 'extract'
        ? extractSourceSuggestions(this.sourceFields(), this.extractionGroups(), this.formulaItems(), this.model().items)
        : uniqueSuggestions([
            ...this.sourceFields(),
            ...pathSuggestions(this.model().items.map(inputPath))
        ]));

    protected readonly objectSuggestions = computed(() => uniqueSuggestions([
        ...this.sObjectSuggestions(),
        ...pathSuggestions(this.model().items.map(item => item.InputObjectName))
    ]));

    protected readonly outputSuggestions = computed(() => uniqueSuggestions([
        ...this.outputFields(),
        ...pathSuggestions(this.model().items.map(outputPath))
    ]));

    protected readonly domainObjectSuggestions = computed(() => uniqueSuggestions([
        ...this.sObjectSuggestions(),
        ...pathSuggestions(this.loadObjectGroups().map(group => group.outputObjectName)),
        ...pathSuggestions(this.model().items.map(item => item.OutputObjectName))
    ]));

    constructor() {
        window.addEventListener('message', event => this.handleMessage(event.data as ExtensionToWebviewMessage));
        effect(() => this.requestFieldsForCurrentObjects());
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

    protected updatePreviewInput(inputJson: string) {
        this.previewInputDirty = true;
        this.previewInputJson.set(inputJson);
        this.previewError.set(undefined);
    }

    protected runPreview() {
        const inputError = this.previewInputError();
        if (inputError) {
            this.previewError.set(inputError);
            return;
        }

        let input: unknown;
        try {
            input = JSON.parse(this.previewInputJson());
        } catch (error) {
            this.previewError.set(getErrorMessage(error));
            return;
        }

        if (!this.vscode) {
            this.previewError.set('Preview is only available inside the VS Code DataMapper editor.');
            return;
        }

        this.previewRunning.set(true);
        this.previewError.set(undefined);
        this.previewDebug.set(undefined);
        this.previewOutputJson.set('');
        this.vscode.postMessage({ type: 'preview', model: this.model(), input });
    }

    protected createMapping() {
        this.editIndex.set(-1);
        this.editing.set(createMappingItem(this.mapperKind(), this.loadObjectGroups()));
    }

    protected insertMappingAfter(item: DataMapperItem, mappingItem = createMappingItem(this.mapperKind(), this.loadObjectGroups(), item)) {
        const index = this.model().items.findIndex(candidate => isSameItem(candidate, item));
        const items = [...this.model().items];
        items.splice(index >= 0 ? index + 1 : items.length, 0, mappingItem);
        this.updateModel(model => ({ ...model, items }));
    }

    protected createFormula(afterItem?: DataMapperItem) {
        const item: DataMapperItem = {
            GlobalKey: newGlobalKey(),
            FormulaExpression: '',
            FormulaResultPath: '',
            FormulaSequence: afterItem ? Number(afterItem.FormulaSequence || 0) + 0.5 : nextFormulaSequence(this.model().items),
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
        this.updateModel(model => ({ ...model, items: normalizeFormulaSequences([...model.items, item]) }));
    }

    protected createExtraction(afterGroup?: ExtractGroup) {
        const sequence = afterGroup ? afterGroup.sequence + 0.5 : nextExtractSequence(this.model().items);
        const item: DataMapperItem = {
            GlobalKey: newGlobalKey(),
            FilterGroup: 0,
            FilterOperator: '=',
            InputObjectQuerySequence: sequence,
            IsDisabled: false,
            OutputObjectName: 'json',
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransformItem'
        };
        this.updateModel(model => ({ ...model, items: normalizeExtractSequences([...model.items, item]) }));
    }

    protected createLoadObject() {
        this.createLoadObjectAtSequence(nextLoadSequence(this.model().items));
    }

    protected insertLoadObjectAfter(group: LoadObjectGroup) {
        this.createLoadObjectAtSequence(group.sequence + 0.5);
    }

    private createLoadObjectAtSequence(sequence: number) {
        const item: DataMapperItem = {
            GlobalKey: newGlobalKey(),
            OutputCreationSequence: sequence,
            OutputObjectName: '',
            IsDisabled: false,
            IsRequiredForUpsert: false,
            IsUpsertKey: false,
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransformItem'
        };
        this.updateModel(model => ({ ...model, items: normalizeLoadSequences([...model.items, item]) }));
    }

    protected updateExtractionGroup(group: ExtractGroup) {
        const items = this.model().items.filter(item => !isExtractionItem(item) || extractGroupId(item) !== group.id);
        items.push(...group.items);
        this.updateModel(model => ({ ...model, items: normalizeExtractSequences(items) }));
    }

    protected deleteExtractionGroup(group: ExtractGroup) {
        const existingKeys = new Set(group.items.map(item => item.GlobalKey).filter(Boolean));
        const items = this.model().items.filter(item => item.GlobalKey ? !existingKeys.has(item.GlobalKey) : extractGroupId(item) !== group.id);
        this.updateModel(model => ({ ...model, items: normalizeExtractSequences(items) }));
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
        this.updateModel(model => ({
            ...model,
            items: model.items.map(item => isExtractionItem(item)
                ? { ...item, InputObjectQuerySequence: sequenceByKey.get(String(item.GlobalKey ?? extractGroupId(item))) ?? item.InputObjectQuerySequence }
                : item)
        }));
    }

    protected updateLoadObjectGroup(group: LoadObjectGroup) {
        const rows = [...group.items, ...group.links];
        const items = this.model().items.filter(item => !isLoadItem(item) || loadObjectGroupId(item) !== group.id);
        items.push(...rows);
        this.updateModel(model => ({ ...model, items: normalizeLoadSequences(items) }));
    }

    protected deleteLoadObjectGroup(group: LoadObjectGroup) {
        const rows = [...group.items, ...group.links];
        const existingKeys = new Set(rows.map(item => item.GlobalKey).filter(Boolean));
        const items = this.model().items.filter(item => item.GlobalKey ? !existingKeys.has(item.GlobalKey) : loadObjectGroupId(item) !== group.id);
        this.updateModel(model => ({ ...model, items: normalizeLoadSequences(items) }));
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
        this.updateModel(model => ({
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
        this.updateModel(model => ({ ...model, items: model.items.filter(candidate => !isSameItem(candidate, item)) }));
    }

    protected updateEditing(item: DataMapperItem) {
        this.editing.set(item);
    }

    protected cancelEdit() {
        this.editing.set(undefined);
        this.editIndex.set(-1);
    }

    protected applyEdit(item: DataMapperItem) {
        if (!this.canSaveMapping(item)) {
            return;
        }
        this.upsertMappingItem(item, this.editIndex());
        this.cancelEdit();
    }

    protected applyEditAndCreateNext(item: DataMapperItem) {
        if (!this.canSaveMapping(item)) {
            return;
        }
        this.upsertMappingItem(item, this.editIndex());
        this.editIndex.set(-1);
        this.editing.set(createMappingItem(this.mapperKind(), this.loadObjectGroups(), item));
    }

    protected saveMappingRow(item: DataMapperItem) {
        this.upsertMappingItem(item, this.model().items.findIndex(candidate => isSameItem(candidate, item)));
    }

    private canSaveMapping(item: DataMapperItem) {
        return this.mapperKind() === 'load' ? !!item.OutputFieldName : !!outputPath(item);
    }

    private upsertMappingItem(item: DataMapperItem, index: number) {
        const items = [...this.model().items];
        if (index >= 0) {
            items[index] = item;
        } else {
            items.push(item);
        }
        this.updateModel(model => ({ ...model, items }));
    }

    protected updateFormula(item: DataMapperItem, updatedItem = item) {
        const formulaItem: DataMapperItem = {
            ...updatedItem,
            FormulaSequence: Number(updatedItem.FormulaSequence || nextFormulaSequence(this.model().items)),
            OutputCreationSequence: updatedItem.OutputCreationSequence ?? 0,
            OutputFieldName: 'Formula',
            OutputObjectName: 'Formula',
            VlocityDataPackType: updatedItem.VlocityDataPackType ?? 'SObject',
            VlocityRecordSObjectType: updatedItem.VlocityRecordSObjectType ?? 'OmniDataTransformItem'
        };
        this.updateModel(model => ({
            ...model,
            items: model.items.map(candidate => isSameItem(candidate, item) ? formulaItem : candidate)
        }));
    }

    protected moveFormula(item: DataMapperItem, direction: -1 | 1) {
        const formulas = this.formulaItems();
        const index = formulas.findIndex(candidate => isSameItem(candidate, item));
        const target = index + direction;
        if (index < 0 || target < 0 || target >= formulas.length) {
            return;
        }
        [formulas[index], formulas[target]] = [formulas[target], formulas[index]];
        const sequenceByKey = new Map<string, number>();
        formulas.forEach((formula, formulaIndex) => sequenceByKey.set(formulaKey(formula), formulaIndex + 1));
        this.updateModel(model => ({
            ...model,
            items: model.items.map(candidate => isFormulaItem(candidate)
                ? { ...candidate, FormulaSequence: sequenceByKey.get(formulaKey(candidate)) ?? candidate.FormulaSequence }
                : candidate)
        }));
    }

    protected deleteFormula(item: DataMapperItem) {
        this.updateModel(model => ({ ...model, items: model.items.filter(candidate => !isSameItem(candidate, item)) }));
    }

    protected insertFormulaAfter(item: DataMapperItem) {
        this.createFormula(item);
    }

    private requestFieldsForCurrentObjects() {
        if (!this.hasLoaded()) {
            return;
        }
        const objects = this.fieldObjectNamesForModel(this.model(), this.sObjectSuggestions());
        const key = objects.join('');
        if (!key) {
            this.fieldMetadataLoading.set(false);
            this.lastFieldObjectsKey = '';
            return;
        }
        if (key === this.lastFieldObjectsKey) {
            return;
        }
        this.lastFieldObjectsKey = key;
        if (!this.vscode) {
            this.fieldMetadataLoading.set(false);
            return;
        }
        this.fieldMetadataLoading.set(true);
        this.vscode.postMessage({ type: 'refreshFields', model: this.model(), objects });
    }

    private handleMessage(message: ExtensionToWebviewMessage) {
        if ((message as { target?: string }).target && (message as { target?: string }).target !== 'datamapper') {
            return;
        }
        switch (message.type) {
            case 'previewResult':
                this.previewOutputJson.set(stringifyJson(message.result.output));
                this.previewDebug.set(message.result.debug);
                this.previewError.set(undefined);
                this.previewRunning.set(false);
                return;
            case 'previewError':
                this.previewError.set(message.message);
                this.previewDebug.set(message.debug);
                this.previewRunning.set(false);
                return;
            case 'error':
                this.error.set(message.message);
                this.fieldMetadataLoading.set(false);
                this.refreshing.set(false);
                this.previewRunning.set(false);
                return;
            case 'fields':
                this.error.set(message.error);
                if (message.objectSuggestions) {
                    this.sObjectSuggestions.set(message.objectSuggestions);
                }
                this.sourceFields.set(message.sourceFields);
                this.outputFields.set(message.outputFields);
                this.fieldMetadataLoading.set(false);
                return;
            case 'load':
                this.applyLoadedState(message.state);
                return;
        }
    }

    private applyLoadedState(state: EditorState) {
        this.error.set(state.error);
        this.model.set(state.model);
        this.sObjectSuggestions.set(state.objectSuggestions);
        this.sourceFields.set(state.sourceFields);
        this.outputFields.set(state.outputFields);
        this.lastFieldObjectsKey = this.fieldObjectNamesForModel(state.model, state.objectSuggestions).join('');
        if (!this.previewInputDirty) {
            this.previewInputJson.set(initialPreviewJson(state.model));
        }
        this.previewOutputJson.set('');
        this.previewError.set(undefined);
        this.previewDebug.set(undefined);
        this.hasLoaded.set(true);
        this.fieldMetadataLoading.set(false);
        this.refreshing.set(false);
        this.previewRunning.set(false);
        const visibleTabs = getTabs(getDataMapperKind(state.model)).map(tab => tab.id);
        if (!visibleTabs.includes(this.activeTab())) {
            this.activeTab.set(firstTab(getDataMapperKind(state.model)));
        }
    }

    private setModel(model: DataMapperModel) {
        this.model.set(model);
        this.vscode?.postMessage({ type: 'change', model });
    }

    private updateModel(updater: (model: DataMapperModel) => DataMapperModel) {
        this.setModel(updater(this.model()));
    }

    private fieldObjectNamesForModel(model: DataMapperModel, objectSuggestions: FieldSuggestion[]) {
        const kind = getDataMapperKind(model);
        const targetField: keyof DataMapperItem = kind === 'load' ? 'OutputObjectName' : 'InputObjectName';
        const objectNames = new Set<string>();
        for (const item of model.items) {
            const value = item[targetField];
            if (value) {
                objectNames.add(String(value));
            }
        }
        const known = new Set(objectSuggestions.map(suggestion => suggestion.path.toLowerCase()));
        return [...objectNames]
            .filter(name => !known.size || known.has(name.toLowerCase()))
            .sort((a, b) => a.localeCompare(b));
    }
}

function isSameItem(candidate: DataMapperItem, item: DataMapperItem) {
    if (item.GlobalKey && candidate.GlobalKey) {
        return candidate.GlobalKey === item.GlobalKey;
    }
    return candidate === item;
}

function formulaKey(item: DataMapperItem) {
    return String(item.GlobalKey ?? `${item.FormulaSequence ?? ''}:${item.FormulaResultPath ?? ''}:${item.FormulaExpression ?? ''}`);
}

function initialPreviewJson(model: DataMapperModel) {
    const value = model.header.PreviewJsonData ?? model.header.ExpectedInputJson;
    if (typeof value === 'string' && value.trim()) {
        try {
            return stringifyJson(JSON.parse(value));
        } catch {
            return value;
        }
    }
    if (value && typeof value === 'object') {
        return stringifyJson(value);
    }
    return '{\n}';
}

function validatePreviewInput(inputJson: string) {
    if (!inputJson.trim()) {
        return 'Input must be valid JSON.';
    }
    try {
        JSON.parse(inputJson);
        return undefined;
    } catch (error) {
        return getErrorMessage(error);
    }
}

function stringifyJson(value: unknown) {
    return JSON.stringify(value ?? null, null, 2);
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

export function bootstrapDataMapperEditor() {
    return bootstrapApplication(AppComponent, {
        providers: [provideZonelessChangeDetection()]
    });
}

if (!(globalThis as { __VLOCODE_WEBVIEW_PREVIEW__?: boolean }).__VLOCODE_WEBVIEW_PREVIEW__) {
    bootstrapDataMapperEditor().catch(error => console.error(error));
}
