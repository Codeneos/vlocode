import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { VlocodeEditorHeaderComponent } from '../shared/components/editor-header/editor-header.component';
import { VlocodeEmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { isRecord } from '../shared/utils/object';

declare const acquireVsCodeApi: undefined | (() => VsCodeApi);

type PathSegment = string | number;
type TabId = 'details' | 'related' | 'content';
type FieldControlKind = 'checkbox' | 'date' | 'datetime' | 'number' | 'picklist' | 'textarea' | 'text';

interface VsCodeApi {
    postMessage(message: WebviewToExtensionMessage): void;
}

interface DatapackEditorModel {
    data: Record<string, unknown>;
    datapackType: string;
    fileName: string;
    sourceKey?: string;
    sobjectType?: string;
    title: string;
}

interface FieldMetadata {
    label: string;
    length?: number;
    picklistValues?: PicklistValue[];
    type?: string;
    updateable?: boolean;
    nillable?: boolean;
}

interface PicklistValue {
    active?: boolean;
    label: string;
    value: string;
}

interface SObjectMetadata {
    label: string;
    labelPlural?: string;
    fields: Record<string, FieldMetadata>;
}

interface EditorState {
    model: DatapackEditorModel;
    metadata: Record<string, SObjectMetadata>;
    error?: string;
}

interface DatapackReference {
    VlocityDataPackType: 'VlocityLookupMatchingKeyObject' | 'VlocityMatchingKeyObject';
    VlocityRecordSObjectType: string;
    VlocityLookupRecordSourceKey?: string;
    VlocityMatchingRecordSourceKey?: string;
    [key: string]: unknown;
}

interface MissingReference {
    reference: DatapackReference;
    title: string;
    message: string;
}

type ExtensionToWebviewMessage =
    | { type: 'load'; state: EditorState }
    | { type: 'error'; message: string }
    | { type: 'notFound'; reference: DatapackReference; message: string }
    | { type: 'saved' };

type WebviewToExtensionMessage =
    | { type: 'ready' }
    | { type: 'change'; model: DatapackEditorModel }
    | { type: 'save'; model: DatapackEditorModel }
    | { type: 'deploy'; model: DatapackEditorModel }
    | { type: 'refresh' }
    | { type: 'openSalesforce' }
    | { type: 'viewSource' }
    | { type: 'navigateReference'; reference: DatapackReference }
    | { type: 'exportReference'; reference: DatapackReference };

interface Breadcrumb {
    clickable: boolean;
    label: string;
    path: PathSegment[];
    pathKey: string;
}

interface DetailField {
    apiName: string;
    editable: boolean;
    kind: 'primitive' | 'reference' | 'object';
    label: string;
    metadata?: FieldMetadata;
    path: PathSegment[];
    reference?: DatapackReference;
    value: unknown;
}

interface RelatedList {
    apiName: string;
    columns: RelatedColumn[];
    label: string;
    path: PathSegment[];
    pathKey: string;
    rows: RelatedRow[];
    totalCount: number;
}

interface RelatedColumn {
    key: string;
    label: string;
}

interface RelatedCell {
    kind: 'primitive' | 'reference' | 'object';
    path: PathSegment[];
    reference?: DatapackReference;
    value: unknown;
}

interface RelatedRow {
    cells: Record<string, RelatedCell>;
    label: string;
    path: PathSegment[];
    pathKey: string;
}

const RESERVED_FIELDS = new Set([
    'VlocityDataPackType',
    'VlocityMatchingRecordSourceKey',
    'VlocityLookupRecordSourceKey',
    'VlocityRecordSourceKey',
    'VlocityRecordSObjectType'
]);

const SUMMARY_FIELD_PRIORITY = [
    'Name',
    'DeveloperName',
    'Label',
    'Title',
    'ProductCode',
    'SBQQ__Number__c',
    'SBQQ__Index__c',
    'SBQQ__Type__c',
    'SBQQ__Operator__c'
];

@Component({
    selector: 'vlocode-datapack-editor',
    standalone: true,
    imports: [CommonModule, VlocodeEditorHeaderComponent, VlocodeEmptyStateComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './app/app.component.html'
})
export class AppComponent {
    protected readonly activeTab = signal<TabId>('details');
    protected readonly error = signal<string | undefined>(undefined);
    protected readonly filter = signal('');
    protected readonly hasLoaded = signal(false);
    protected readonly loading = signal(false);
    protected readonly metadata = signal<Record<string, SObjectMetadata>>({});
    protected readonly model = signal<DatapackEditorModel | undefined>(undefined);
    protected readonly notFound = signal<MissingReference | undefined>(undefined);
    protected readonly openingSalesforce = signal(false);
    protected readonly path = signal<PathSegment[]>([]);
    protected readonly refreshing = signal(false);
    protected readonly saving = signal(false);
    protected readonly deploying = signal(false);
    protected readonly draftData = signal<Record<string, unknown> | undefined>(undefined);
    protected readonly editRootPath = signal<PathSegment[] | undefined>(undefined);

    private readonly vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : undefined;

    protected readonly data = computed(() => this.draftData() ?? this.model()?.data);
    protected readonly currentNode = computed<unknown>(() => getValueAtPath(this.data(), this.path()));
    protected readonly currentObject = computed<Record<string, unknown> | undefined>(() => {
        const node = this.currentNode();
        if (isRecord(node)) {
            return node;
        }
        if (Array.isArray(node)) {
            const owner = getValueAtPath(this.model()?.data, this.path().slice(0, -1));
            if (isRecord(owner)) {
                return owner;
            }
        }
        return this.data();
    });
    protected readonly currentSObjectType = computed(() => stringValue(this.currentObject()?.VlocityRecordSObjectType ?? this.model()?.sobjectType));

    protected readonly currentObjectLabel = computed(() => {
        const type = this.currentSObjectType();
        return type ? this.objectLabel(type) : this.model()?.datapackType ?? 'Datapack';
    });

    protected readonly currentTitle = computed(() => {
        const object = this.currentObject();
        return object ? this.recordTitle(object, this.model()?.title ?? 'Record') : this.model()?.title ?? 'Datapack';
    });

    protected readonly currentRecordPath = computed(() => {
        if (isRecord(this.currentNode())) {
            return this.path();
        }
        const ownerPath = this.path().slice(0, -1);
        return isRecord(getValueAtPath(this.data(), ownerPath)) ? ownerPath : [];
    });

    protected readonly breadcrumbs = computed(() => {
        const crumbs: Breadcrumb[] = [{ clickable: true, label: this.model()?.title ?? 'Datapack', path: [], pathKey: '' }];
        let current: unknown = this.model()?.data;
        const currentPath: PathSegment[] = [];
        for (const segment of this.path()) {
            const parent = current;
            currentPath.push(segment);
            current = isRecord(current) || Array.isArray(current) ? current[segment as keyof typeof current] : undefined;
            const isArrayStep = Array.isArray(parent) || Array.isArray(current);
            crumbs.push({
                clickable: isRecord(current) && !isArrayStep,
                label: typeof segment === 'number'
                    ? isRecord(current) ? this.recordTitle(current, `Row ${segment + 1}`) : `Row ${segment + 1}`
                    : isRecord(parent) ? this.fieldLabel(parent, segment) : humanizeFieldName(segment),
                path: [...currentPath],
                pathKey: this.pathKey(currentPath)
            });
        }
        return crumbs;
    });

    private readonly allFields = computed(() => {
        const object = this.currentObject();
        if (!object) {
            return [];
        }
        return Object.entries(object)
            .filter(([key]) => !RESERVED_FIELDS.has(key))
            .filter(([, value]) => !Array.isArray(value))
            .map(([key, value]) => this.createDetailField(key, value));
    });

    protected readonly detailFields = computed(() => this.allFields().filter(field => !this.isLongTextField(field)));

    protected readonly filteredDetailFields = computed(() => {
        const query = this.normalizedFilter();
        if (!query) {
            return this.detailFields();
        }
        return this.detailFields().filter(field => this.matchesFilter([
            field.label,
            field.apiName,
            field.kind === 'reference' && field.reference ? this.referenceLabel(field.reference) : this.displayValue(field.value, field.metadata)
        ], query));
    });

    protected readonly relatedLists = computed(() => {
        const object = this.currentObject();
        if (!object) {
            return [];
        }
        return Object.entries(object)
            .filter((entry): entry is [string, unknown[]] => Array.isArray(entry[1]) && entry[1].length > 0)
            .map(([key, value]) => this.createRelatedList(key, value));
    });

    protected readonly filteredRelatedLists = computed(() => {
        const query = this.normalizedFilter();
        if (!query) {
            return this.relatedLists();
        }
        return this.relatedLists()
            .map(list => {
                const listMatches = this.matchesFilter([list.label, list.apiName], query);
                const rows = listMatches ? list.rows : list.rows.filter(row => this.matchesFilter([
                    row.label,
                    ...Object.values(row.cells).map(cell => cell.reference ? this.referenceLabel(cell.reference) : this.displayValue(cell.value))
                ], query));
                return { ...list, rows };
            })
            .filter(list => list.rows.length > 0 || this.matchesFilter([list.label, list.apiName], query));
    });

    protected readonly contentFields = computed(() => this.allFields().filter(field => this.isLongTextField(field)));

    protected readonly filteredContentFields = computed(() => {
        const query = this.normalizedFilter();
        if (!query) {
            return this.contentFields();
        }
        return this.contentFields().filter(field => this.matchesFilter([
            field.label,
            field.apiName,
            this.displayValue(field.value, field.metadata)
        ], query));
    });

    protected readonly visibleTabs = computed<TabId[]>(() => {
        const tabs: TabId[] = ['details'];
        if (this.relatedLists().length) {
            tabs.push('related');
        }
        if (this.contentFields().length) {
            tabs.push('content');
        }
        return tabs;
    });

    protected readonly isRecordEditing = computed(() => {
        const editPath = this.editRootPath();
        return !!editPath && this.pathKeyValue(editPath) === this.pathKeyValue(this.currentRecordPath());
    });

    protected readonly dirtyFieldPaths = computed(() => {
        const editPath = this.editRootPath();
        const model = this.model();
        const draft = this.draftData();
        if (!editPath || !model || !draft) {
            return new Set<string>();
        }
        const originalRecord = getValueAtPath(model.data, editPath);
        const draftRecord = getValueAtPath(draft, editPath);
        if (!isRecord(originalRecord) || !isRecord(draftRecord)) {
            return new Set<string>();
        }
        const dirtyPaths = new Set<string>();
        const keys = new Set([...Object.keys(originalRecord), ...Object.keys(draftRecord)]);
        for (const key of keys) {
            if (RESERVED_FIELDS.has(key) || Array.isArray(draftRecord[key]) || Array.isArray(originalRecord[key])) {
                continue;
            }
            if (!jsonEqual(originalRecord[key], draftRecord[key])) {
                dirtyPaths.add(this.pathKeyValue([...editPath, key]));
            }
        }
        return dirtyPaths;
    });

    protected readonly hasChanges = computed(() => this.dirtyFieldPaths().size > 0);
    protected readonly hasEditableFields = computed(() => this.allFields().some(field => field.editable));
    protected readonly changeCountLabel = computed(() => {
        const count = this.dirtyFieldPaths().size;
        return count === 1 ? '1 change' : `${count} changes`;
    });

    protected readonly activeVisibleTab = computed(() => {
        const active = this.activeTab();
        return this.visibleTabs().includes(active) ? active : 'details';
    });

    protected readonly loadingTitle = computed(() => {
        if (!this.hasLoaded()) {
            return 'Loading datapack';
        }
        if (this.refreshing()) {
            return 'Refreshing datapack';
        }
        return 'Working';
    });

    protected readonly loadingMessage = computed(() => {
        if (!this.hasLoaded()) {
            return 'Reading the datapack and field metadata.';
        }
        if (this.refreshing()) {
            return 'Refreshing the source files from the selected org.';
        }
        return 'Applying the requested change.';
    });

    constructor() {
        window.addEventListener('message', event => this.handleMessage(event.data as ExtensionToWebviewMessage));
        if (this.vscode) {
            this.vscode.postMessage({ type: 'ready' });
        } else {
            this.hasLoaded.set(true);
            this.model.set({
                data: {},
                datapackType: 'SObject',
                fileName: '',
                title: 'Datapack'
            });
        }
    }

    protected requestReload() {
        this.loading.set(true);
        this.error.set(undefined);
        this.hasLoaded.set(false);
        this.vscode?.postMessage({ type: 'ready' });
    }

    protected refresh() {
        this.refreshing.set(true);
        this.loading.set(true);
        this.error.set(undefined);
        this.vscode?.postMessage({ type: 'refresh' });
    }

    protected save() {
        const model = this.model();
        if (!model) {
            return;
        }
        this.saving.set(true);
        this.vscode?.postMessage({ type: 'save', model });
        window.setTimeout(() => this.saving.set(false), 600);
    }

    protected deploy() {
        const model = this.model();
        if (!model) {
            return;
        }
        this.deploying.set(true);
        this.vscode?.postMessage({ type: 'deploy', model });
        window.setTimeout(() => this.deploying.set(false), 1200);
    }

    protected openSalesforce() {
        this.openingSalesforce.set(true);
        this.vscode?.postMessage({ type: 'openSalesforce' });
        window.setTimeout(() => this.openingSalesforce.set(false), 1200);
    }

    protected viewSource() {
        this.vscode?.postMessage({ type: 'viewSource' });
    }

    protected updateFilter(event: Event) {
        this.filter.set((event.target as HTMLInputElement).value);
    }

    protected navigateTo(path: PathSegment[]) {
        if (!this.confirmDiscardChanges()) {
            return;
        }
        this.path.set([...path]);
        this.activeTab.set(this.tabForPath(path));
        this.notFound.set(undefined);
        this.cancelEdit();
    }

    protected clearMissingReference() {
        this.notFound.set(undefined);
    }

    protected exportMissingReference(reference: DatapackReference) {
        this.vscode?.postMessage({ type: 'exportReference', reference });
    }

    protected openReference(reference: DatapackReference) {
        if (reference.VlocityDataPackType === 'VlocityMatchingKeyObject') {
            const sourceKey = reference.VlocityMatchingRecordSourceKey;
            const targetPath = sourceKey ? this.findSourceKeyPath(sourceKey) : undefined;
            if (targetPath) {
                this.navigateTo(targetPath);
                return;
            }
        }
        if (!this.confirmDiscardChanges()) {
            return;
        }
        this.cancelEdit();
        this.vscode?.postMessage({ type: 'navigateReference', reference });
    }

    protected startEdit(field: DetailField) {
        if (!field.editable) {
            return;
        }
        this.startRecordEdit(field.path.slice(0, -1));
    }

    protected startRecordEdit(path = this.currentRecordPath()) {
        const model = this.model();
        if (!model || !isRecord(getValueAtPath(model.data, path))) {
            return;
        }
        if (this.draftData() && !this.isEditingPath(path) && !this.confirmDiscardChanges()) {
            return;
        }
        if (!this.draftData()) {
            this.draftData.set(cloneJson(model.data));
        }
        this.editRootPath.set([...path]);
    }

    protected cancelEdit() {
        this.draftData.set(undefined);
        this.editRootPath.set(undefined);
    }

    protected saveEdit() {
        const draftData = this.draftData();
        const model = this.model();
        if (!draftData || !model) {
            return;
        }
        this.setModel({ ...model, data: draftData });
        this.draftData.set(undefined);
        this.editRootPath.set(undefined);
        this.save();
    }

    protected updateEditDraft(field: DetailField, event: Event) {
        const draftData = this.draftData();
        if (!draftData) {
            return;
        }
        const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        const draft = target instanceof HTMLInputElement && target.type === 'checkbox'
            ? target.checked
            : target instanceof HTMLSelectElement && target.multiple
                ? Array.from(target.selectedOptions).map(option => option.value).join(';')
                : target.value;
        const data = cloneJson(draftData);
        setValueAtPath(data, field.path, this.coerceDraft(field, draft));
        this.draftData.set(data);
    }

    protected isDirtyField(field: DetailField) {
        return this.dirtyFieldPaths().has(this.pathKey(field.path));
    }

    protected isDirtyCell(cell: RelatedCell) {
        return this.dirtyFieldPaths().has(this.pathKey(cell.path));
    }

    protected editText(field: DetailField) {
        const value = field.value;
        return value === null || value === undefined ? '' : String(value);
    }

    protected editChecked(field: DetailField) {
        return Boolean(field.value);
    }

    protected controlKind(field: DetailField): FieldControlKind {
        const type = this.fieldType(field);
        if (type === 'boolean' || typeof field.value === 'boolean') {
            return 'checkbox';
        }
        if (type === 'picklist' || type === 'multipicklist') {
            return 'picklist';
        }
        if (type === 'textarea') {
            return 'textarea';
        }
        if (type === 'date') {
            return 'date';
        }
        if (type === 'datetime') {
            return 'datetime';
        }
        if (isNumericFieldType(type) || typeof field.value === 'number') {
            return 'number';
        }
        if (typeof field.value === 'string' && (field.value.length > 90 || field.value.includes('\n'))) {
            return 'textarea';
        }
        return 'text';
    }

    protected isMultiPicklist(field: DetailField) {
        return this.fieldType(field) === 'multipicklist';
    }

    protected picklistOptions(field: DetailField): PicklistValue[] {
        const values = field.metadata?.picklistValues ?? [];
        const activeValues = values.filter(option => option.active !== false);
        const knownValues = new Set(activeValues.map(option => option.value));
        const selectedValues = this.picklistSelectedValues(field)
            .filter(value => value && !knownValues.has(value))
            .map(value => ({ label: value, value } satisfies PicklistValue));
        return [...activeValues, ...selectedValues];
    }

    protected isPicklistOptionSelected(field: DetailField, value: string) {
        return this.picklistSelectedValues(field).includes(value);
    }

    protected tabLabel(tab: TabId) {
        switch (tab) {
            case 'related':
                return 'Related';
            case 'content':
                return 'Content';
            default:
                return 'Details';
        }
    }

    protected displayValue(value: unknown, metadata?: FieldMetadata) {
        if (value === undefined || value === null || value === '') {
            return 'Not set';
        }
        if (typeof value === 'boolean') {
            return value ? 'True' : 'False';
        }
        if (metadata && typeof value === 'string' && (this.metadataType(metadata) === 'picklist' || this.metadataType(metadata) === 'multipicklist')) {
            return this.formatPicklistValue(value, metadata);
        }
        if (this.metadataType(metadata) === 'currency' && typeof value === 'number') {
            return new Intl.NumberFormat(undefined, { style: 'decimal', maximumFractionDigits: 2 }).format(value);
        }
        if (typeof value === 'number') {
            return new Intl.NumberFormat().format(value);
        }
        if (typeof value === 'string') {
            return value;
        }
        return this.embeddedObjectLabel(value);
    }

    protected isEmptyValue(value: unknown) {
        return value === undefined || value === null || value === '';
    }

    protected embeddedObjectLabel(value: unknown) {
        if (isReference(value)) {
            return this.referenceLabel(value);
        }
        if (isRecord(value)) {
            return this.recordTitle(value, 'Open');
        }
        return 'Open';
    }

    protected referenceLabel(reference: DatapackReference) {
        const name = stringValue(reference.Name ?? reference.DeveloperName ?? reference.Label);
        if (name) {
            return name;
        }
        const key = this.referenceKey(reference);
        if (!key) {
            return reference.VlocityRecordSObjectType;
        }
        const parts = key.split('/').filter(Boolean);
        return parts.length > 1 ? parts.slice(1).join(' / ') : key;
    }

    protected pathKey(path: PathSegment[]) {
        return this.pathKeyValue(path);
    }

    private handleMessage(message: ExtensionToWebviewMessage) {
        if ((message as { target?: string }).target && (message as { target?: string }).target !== 'datapack') {
            return;
        }
        switch (message.type) {
            case 'load':
                this.model.set(message.state.model);
                this.metadata.set(message.state.metadata);
                this.error.set(message.state.error);
                this.path.set([]);
                this.notFound.set(undefined);
                this.cancelEdit();
                this.hasLoaded.set(true);
                this.loading.set(false);
                this.refreshing.set(false);
                this.saving.set(false);
                this.deploying.set(false);
                return;
            case 'saved':
                this.saving.set(false);
                return;
            case 'notFound':
                this.cancelEdit();
                this.notFound.set({
                    reference: message.reference,
                    title: 'Datapack not found',
                    message: message.message
                });
                this.loading.set(false);
                return;
            case 'error':
                this.error.set(message.message);
                this.loading.set(false);
                this.refreshing.set(false);
                this.saving.set(false);
                this.deploying.set(false);
                return;
        }
    }

    private setModel(model: DatapackEditorModel) {
        this.model.set(model);
        this.vscode?.postMessage({ type: 'change', model });
    }

    private createDetailField(key: string, value: unknown): DetailField {
        const object = this.currentObject();
        const path = [...this.path(), key];
        const metadata = object ? this.fieldMetadata(object, key) : undefined;
        const reference = isReference(value) ? value : undefined;
        const isObject = isRecord(value);
        return {
            apiName: key,
            editable: !reference && !isObject && metadata?.updateable !== false,
            kind: reference ? 'reference' : isObject ? 'object' : 'primitive',
            label: metadata?.label ?? humanizeFieldName(key),
            metadata,
            path,
            reference,
            value
        };
    }

    private createRelatedList(key: string, values: unknown[]): RelatedList {
        const object = this.currentObject();
        const label = object ? this.fieldLabel(object, key) : humanizeFieldName(key);
        const path = [...this.path(), key];
        const rows = values.map((value, index) => this.createRelatedRow([...path, index], value, index));
        const columns = this.createRelatedColumns(rows);
        return {
            apiName: key,
            columns,
            label,
            path,
            pathKey: this.pathKeyValue(path),
            rows,
            totalCount: values.length
        };
    }

    private createRelatedRow(path: PathSegment[], value: unknown, index: number): RelatedRow {
        if (!isRecord(value)) {
            return {
                cells: {
                    Value: {
                        kind: 'primitive',
                        path,
                        value
                    }
                },
                label: `Row ${index + 1}`,
                path,
                pathKey: this.pathKeyValue(path)
            };
        }

        const cells = Object.fromEntries(
            Object.entries(value)
                .filter(([key, child]) => !RESERVED_FIELDS.has(key) && !Array.isArray(child))
                .map(([key, child]) => {
                    const childPath = [...path, key];
                    const reference = isReference(child) ? child : undefined;
                    return [key, {
                        kind: reference ? 'reference' : isRecord(child) ? 'object' : 'primitive',
                        path: childPath,
                        reference,
                        value: child
                    } satisfies RelatedCell];
                })
        );

        return {
            cells,
            label: this.recordTitle(value, `Row ${index + 1}`),
            path,
            pathKey: this.pathKeyValue(path)
        };
    }

    private createRelatedColumns(rows: RelatedRow[]): RelatedColumn[] {
        const keys = new Set<string>();
        for (const priority of SUMMARY_FIELD_PRIORITY) {
            if (rows.some(row => row.cells[priority])) {
                keys.add(priority);
            }
        }
        for (const row of rows) {
            for (const key of Object.keys(row.cells)) {
                if (keys.size >= 5) {
                    break;
                }
                keys.add(key);
            }
        }
        if (!keys.size) {
            keys.add('Value');
        }
        return [...keys].slice(0, 5).map(key => ({
            key,
            label: this.columnLabel(rows, key)
        }));
    }

    private columnLabel(rows: RelatedRow[], key: string) {
        const owner = rows.map(row => getValueAtPath(this.model()?.data, row.path)).find(isRecord);
        return owner ? this.fieldLabel(owner, key) : humanizeFieldName(key);
    }

    private recordTitle(record: Record<string, unknown>, fallback = 'Record') {
        for (const key of SUMMARY_FIELD_PRIORITY) {
            const value = stringValue(record[key]);
            if (value) {
                return value;
            }
        }
        const sourceKey = stringValue(record.VlocityRecordSourceKey ?? record.VlocityMatchingRecordSourceKey ?? record.VlocityLookupRecordSourceKey);
        if (sourceKey) {
            return sourceKey.split('/').filter(Boolean).slice(-1)[0] ?? sourceKey;
        }
        return fallback;
    }

    private fieldLabel(owner: Record<string, unknown>, key: string) {
        return this.fieldMetadata(owner, key)?.label ?? humanizeFieldName(key);
    }

    private fieldMetadata(owner: Record<string, unknown>, key: string) {
        const type = this.ownerSObjectType(owner);
        const fields = type ? this.metadata()[type]?.fields : undefined;
        return fields ? getFieldMetadata(fields, key) : undefined;
    }

    private ownerSObjectType(owner: Record<string, unknown>) {
        return stringValue(owner.VlocityRecordSObjectType)
            ?? (owner === this.model()?.data ? this.model()?.sobjectType : undefined);
    }

    private objectLabel(type: string) {
        return this.metadata()[type]?.label ?? humanizeObjectName(type);
    }

    private fieldType(field: DetailField) {
        return this.metadataType(field.metadata);
    }

    private metadataType(metadata?: FieldMetadata) {
        return metadata?.type?.toLowerCase();
    }

    private isLongTextField(field: DetailField) {
        if (field.kind !== 'primitive') {
            return false;
        }
        const type = this.fieldType(field);
        if (type !== 'textarea') {
            return false;
        }
        const length = field.metadata?.length ?? (typeof field.value === 'string' ? field.value.length : 0);
        return length > 4000;
    }

    private picklistSelectedValues(field: DetailField) {
        const value = field.value;
        if (value === undefined || value === null || value === '') {
            return [];
        }
        if (this.isMultiPicklist(field)) {
            return String(value).split(';').map(part => part.trim()).filter(Boolean);
        }
        return [String(value)];
    }

    private formatPicklistValue(value: string, metadata: FieldMetadata) {
        const options = new Map((metadata.picklistValues ?? []).map(option => [option.value, option.label || option.value]));
        const values = this.metadataType(metadata) === 'multipicklist'
            ? value.split(';').map(part => part.trim()).filter(Boolean)
            : [value];
        return values.map(entry => options.get(entry) ?? entry).join('; ') || 'Not set';
    }

    private findSourceKeyPath(sourceKey: string) {
        const data = this.model()?.data;
        if (!data) {
            return undefined;
        }
        return findPath(data, value => isRecord(value) && value.VlocityRecordSourceKey === sourceKey);
    }

    private referenceKey(reference: DatapackReference) {
        return reference.VlocityLookupRecordSourceKey ?? reference.VlocityMatchingRecordSourceKey;
    }

    private tabForPath(path: PathSegment[]): TabId {
        return Array.isArray(getValueAtPath(this.model()?.data, path)) ? 'related' : 'details';
    }

    private normalizedFilter() {
        return this.filter().trim().toLowerCase();
    }

    private matchesFilter(values: unknown[], query: string) {
        return values.some(value => String(value ?? '').toLowerCase().includes(query));
    }

    private pathKeyValue(path: PathSegment[]) {
        return path.map(segment => typeof segment === 'number' ? `[${segment}]` : segment).join('.');
    }

    private confirmDiscardChanges() {
        if (!this.hasChanges()) {
            return true;
        }
        return window.confirm('Discard unsaved datapack changes?');
    }

    private isEditingPath(path: PathSegment[]) {
        const editPath = this.editRootPath();
        return !!editPath && this.pathKeyValue(editPath) === this.pathKeyValue(path);
    }

    private coerceDraft(field: DetailField, draft: unknown) {
        const controlKind = this.controlKind(field);
        if (controlKind === 'checkbox') {
            return Boolean(draft);
        }
        if (controlKind === 'number') {
            return draft === '' || draft === null || draft === undefined ? null : Number(draft);
        }
        if ((controlKind === 'picklist' || controlKind === 'date' || controlKind === 'datetime') && draft === '' && field.metadata?.nillable) {
            return null;
        }
        return draft;
    }
}

function isReference(value: unknown): value is DatapackReference {
    return isRecord(value) &&
        (value.VlocityDataPackType === 'VlocityLookupMatchingKeyObject' || value.VlocityDataPackType === 'VlocityMatchingKeyObject') &&
        typeof value.VlocityRecordSObjectType === 'string';
}

function stringValue(value: unknown) {
    return typeof value === 'string' && value.trim() ? value : undefined;
}

function getFieldMetadata(fields: Record<string, FieldMetadata>, key: string): FieldMetadata | undefined {
    const exact = fields[key];
    if (exact) {
        return exact;
    }

    const normalizedKey = normalizeFieldName(key);
    return Object.entries(fields).find(([fieldName]) => normalizeFieldName(fieldName) === normalizedKey)?.[1];
}

function normalizeFieldName(fieldName: string) {
    return removeNamespacePrefix(fieldName).toLowerCase();
}

function removeNamespacePrefix(fieldName: string) {
    const namespaceIndex = fieldName.indexOf('__');
    if (namespaceIndex <= 0) {
        return fieldName;
    }
    const postfixIndex = fieldName.indexOf('__', namespaceIndex + 2);
    return postfixIndex > namespaceIndex ? fieldName.substring(namespaceIndex + 2) : fieldName;
}

function getValueAtPath(root: unknown, path: PathSegment[]) {
    return path.reduce<unknown>((value, segment) => {
        if (Array.isArray(value) || isRecord(value)) {
            return value[segment as keyof typeof value];
        }
        return undefined;
    }, root);
}

function setValueAtPath(root: Record<string, unknown>, path: PathSegment[], value: unknown) {
    const parent = getValueAtPath(root, path.slice(0, -1));
    const key = path[path.length - 1];
    if (Array.isArray(parent) && typeof key === 'number') {
        parent[key] = value;
    } else if (isRecord(parent) && typeof key === 'string') {
        parent[key] = value;
    }
}

function findPath(root: unknown, predicate: (value: unknown) => boolean, path: PathSegment[] = []): PathSegment[] | undefined {
    if (predicate(root)) {
        return path;
    }
    if (Array.isArray(root)) {
        for (let index = 0; index < root.length; index++) {
            const found = findPath(root[index], predicate, [...path, index]);
            if (found) {
                return found;
            }
        }
    } else if (isRecord(root)) {
        for (const [key, value] of Object.entries(root)) {
            const found = findPath(value, predicate, [...path, key]);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
}

function cloneJson<T>(value: T): T {
    return typeof structuredClone === 'function'
        ? structuredClone(value)
        : JSON.parse(JSON.stringify(value)) as T;
}

function jsonEqual(a: unknown, b: unknown) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function humanizeFieldName(name: string) {
    return name
        .replace(/^SBQQ__/, '')
        .replace(/^vlocity_cmt__/, '')
        .replace(/__c$/i, '')
        .replace(/__/g, ' ')
        .replace(/__c$/i, '')
        .replace(/^Vlocity /i, '')
        .replace(/[_:]+/g, ' ')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim() || name;
}

function humanizeObjectName(name: string) {
    return humanizeFieldName(name.replace(/^%vlocity_namespace%__/, ''));
}

function isNumericFieldType(type: string | undefined) {
    return type === 'currency' || type === 'double' || type === 'int' || type === 'percent';
}

export function bootstrapDatapackEditor() {
    return bootstrapApplication(AppComponent, {
        providers: [provideZonelessChangeDetection()]
    });
}

if (!(globalThis as { __VLOCODE_WEBVIEW_PREVIEW__?: boolean }).__VLOCODE_WEBVIEW_PREVIEW__) {
    bootstrapDatapackEditor().catch(error => console.error(error));
}
