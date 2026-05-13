import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

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
    | { type: 'save'; model: DatapackEditorModel }
    | { type: 'deploy'; model: DatapackEditorModel }
    | { type: 'refresh' }
    | { type: 'openSalesforce' }
    | { type: 'viewSource' }
    | { type: 'navigateReference'; reference: DatapackReference }
    | { type: 'exportReference'; reference: DatapackReference };

interface Breadcrumb {
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

interface EditingField {
    field: DetailField;
    draft: unknown;
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
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (!hasLoaded() && error(); as message) {
            <main class="dp-shell dp-shell--center">
                <section class="dp-empty" role="alert">
                    <span class="codicon codicon-warning dp-empty__icon" aria-hidden="true"></span>
                    <h1>Unable to open datapack</h1>
                    <p>{{ message }}</p>
                    <button type="button" class="dp-button dp-button--primary" (click)="requestReload()">
                        <span class="codicon codicon-refresh" aria-hidden="true"></span>
                        Retry
                    </button>
                </section>
            </main>
        } @else if (notFound(); as missing) {
            <main class="dp-shell">
                <ng-container [ngTemplateOutlet]="recordHeader" />
                <section class="dp-empty dp-empty--body" role="status">
                    <span class="codicon codicon-search dp-empty__icon" aria-hidden="true"></span>
                    <h1>{{ missing.title }}</h1>
                    <p>{{ missing.message }}</p>
                    <div class="dp-empty__actions">
                        <button type="button" class="dp-button" (click)="clearMissingReference()">
                            <span class="codicon codicon-arrow-left" aria-hidden="true"></span>
                            Back
                        </button>
                        <button type="button" class="dp-button dp-button--primary" (click)="exportMissingReference(missing.reference)">
                            <span class="codicon codicon-cloud-download" aria-hidden="true"></span>
                            Export
                        </button>
                    </div>
                </section>
            </main>
        } @else {
            <main class="dp-shell">
                <ng-container [ngTemplateOutlet]="recordHeader" />

                @if (error(); as message) {
                    <section class="dp-banner" role="alert">
                        <span class="codicon codicon-warning" aria-hidden="true"></span>
                        {{ message }}
                    </section>
                }

                <section class="dp-record-panel" aria-label="Datapack record">
                    <div class="dp-record-panel__tabs">
                        <nav class="dp-tabs" aria-label="Datapack sections">
                            @for (tab of visibleTabs(); track tab) {
                                <button type="button" class="dp-tabs__tab" [class.dp-tabs__tab--active]="activeVisibleTab() === tab" (click)="activeTab.set(tab)">
                                    {{ tabLabel(tab) }}
                                </button>
                            }
                        </nav>
                        <label class="dp-search">
                            <span class="codicon codicon-search" aria-hidden="true"></span>
                            <input type="search" [value]="filter()" (input)="updateFilter($event)" placeholder="Filter fields and related lists" />
                        </label>
                    </div>

                    @switch (activeVisibleTab()) {
                        @case ('details') {
                            <section class="dp-details" aria-label="Details">
                                @if (filteredDetailFields().length) {
                                    <div class="dp-field-grid">
                                        @for (field of filteredDetailFields(); track pathKey(field.path)) {
                                            <article class="dp-field" [class.dp-field--editing]="isEditing(field)" [class.dp-field--editable]="field.editable && !isEditing(field)" (dblclick)="startEdit(field)">
                                                <div class="dp-field__label">
                                                    <span>{{ field.label }}</span>
                                                    <small>{{ field.apiName }}</small>
                                                </div>
                                                <div class="dp-field__value">
                                                    @if (isEditing(field)) {
                                                        @switch (controlKind(field)) {
                                                            @case ('checkbox') {
                                                                <label class="dp-checkbox">
                                                                    <input type="checkbox" [checked]="editChecked()" (change)="updateEditDraft($event)" />
                                                                    <span>{{ editChecked() ? 'True' : 'False' }}</span>
                                                                </label>
                                                            }
                                                            @case ('number') {
                                                                <input class="dp-input" type="number" [value]="editText()" (input)="updateEditDraft($event)" (keydown.enter)="applyEdit()" />
                                                            }
                                                            @case ('date') {
                                                                <input class="dp-input" type="date" [value]="editText()" (input)="updateEditDraft($event)" (keydown.enter)="applyEdit()" />
                                                            }
                                                            @case ('datetime') {
                                                                <input class="dp-input" type="datetime-local" [value]="editText()" (input)="updateEditDraft($event)" (keydown.enter)="applyEdit()" />
                                                            }
                                                            @case ('picklist') {
                                                                <select class="dp-input" [multiple]="isMultiPicklist(field)" (change)="updateEditDraft($event)">
                                                                    @if (field.metadata?.nillable && !isMultiPicklist(field)) {
                                                                        <option value="">--None--</option>
                                                                    }
                                                                    @for (option of picklistOptions(field); track option.value) {
                                                                        <option [value]="option.value" [selected]="isPicklistOptionSelected(field, option.value)">
                                                                            {{ option.label }}
                                                                        </option>
                                                                    }
                                                                </select>
                                                            }
                                                            @case ('textarea') {
                                                                <textarea class="dp-input dp-input--textarea" [value]="editText()" (input)="updateEditDraft($event)"></textarea>
                                                            }
                                                            @default {
                                                                <input class="dp-input" type="text" [value]="editText()" (input)="updateEditDraft($event)" (keydown.enter)="applyEdit()" />
                                                            }
                                                        }
                                                    } @else if (field.kind === 'reference' && field.reference) {
                                                        <button type="button" class="dp-link-button" (click)="openReference(field.reference)">
                                                            <span class="dp-link-button__label">{{ referenceLabel(field.reference) }}</span>
                                                            @if (field.reference.VlocityDataPackType === 'VlocityMatchingKeyObject') {
                                                                <span class="codicon codicon-link-external" aria-hidden="true"></span>
                                                            }
                                                        </button>
                                                    } @else if (field.kind === 'object') {
                                                        <button type="button" class="dp-link-button" (click)="navigateTo(field.path)">
                                                            <span class="dp-link-button__label">{{ embeddedObjectLabel(field.value) }}</span>
                                                        </button>
                                                    } @else if (controlKind(field) === 'checkbox') {
                                                        <label class="dp-checkbox dp-checkbox--readonly">
                                                            <input type="checkbox" [checked]="field.value === true" disabled />
                                                            <span>{{ field.value === true ? 'True' : 'False' }}</span>
                                                        </label>
                                                    } @else {
                                                        <span [class.dp-muted]="isEmptyValue(field.value)">{{ displayValue(field.value, field.metadata) }}</span>
                                                    }
                                                </div>
                                                <div class="dp-field__action">
                                                    @if (isEditing(field)) {
                                                        <span class="dp-field__edit-actions">
                                                            <button type="button" class="dp-icon-button" title="Save field" (click)="applyEdit()">
                                                                <span class="codicon codicon-check" aria-hidden="true"></span>
                                                            </button>
                                                            <button type="button" class="dp-icon-button" title="Cancel edit" (click)="cancelEdit()">
                                                                <span class="codicon codicon-close" aria-hidden="true"></span>
                                                            </button>
                                                        </span>
                                                    } @else if (field.editable) {
                                                        <button type="button" class="dp-icon-button dp-icon-button--bare" title="Edit {{ field.label }}" (click)="startEdit(field)">
                                                            <span class="codicon codicon-edit" aria-hidden="true"></span>
                                                        </button>
                                                    }
                                                </div>
                                            </article>
                                        }
                                    </div>
                                } @else {
                                    <section class="dp-empty dp-empty--inline">
                                        <span class="codicon codicon-filter" aria-hidden="true"></span>
                                        <h2>No matching fields</h2>
                                        <p>Clear the filter to show the datapack fields.</p>
                                    </section>
                                }
                            </section>
                        }
                        @case ('related') {
                            <section class="dp-related" aria-label="Related">
                                @if (filteredRelatedLists().length) {
                                    @for (list of filteredRelatedLists(); track list.pathKey) {
                                        <article class="dp-related-card">
                                            <header class="dp-related-card__header">
                                                <span class="codicon codicon-symbol-array dp-related-card__icon" aria-hidden="true"></span>
                                                <div>
                                                    <h2>{{ list.label }} ({{ list.totalCount }})</h2>
                                                    <p>{{ list.apiName }}</p>
                                                </div>
                                            </header>
                                            @if (list.rows.length) {
                                                <div class="dp-table-wrap">
                                                    <table class="dp-table">
                                                        <thead>
                                                            <tr>
                                                                @for (column of list.columns; track column.key) {
                                                                    <th scope="col">{{ column.label }}</th>
                                                                }
                                                                <th class="dp-table__actions" scope="col"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            @for (row of list.rows; track row.pathKey) {
                                                                <tr>
                                                                    @for (column of list.columns; track column.key) {
                                                                        <td>
                                                                            @if (row.cells[column.key]; as cell) {
                                                                                @if (cell.kind === 'reference' && cell.reference) {
                                                                                    <button type="button" class="dp-link-button" (click)="openReference(cell.reference)">
                                                                                        <span class="dp-link-button__label">{{ referenceLabel(cell.reference) }}</span>
                                                                                        @if (cell.reference.VlocityDataPackType === 'VlocityMatchingKeyObject') {
                                                                                            <span class="codicon codicon-link-external" aria-hidden="true"></span>
                                                                                        }
                                                                                    </button>
                                                                                } @else if (cell.kind === 'object') {
                                                                                    <button type="button" class="dp-link-button" (click)="navigateTo(cell.path)">
                                                                                        <span class="dp-link-button__label">{{ embeddedObjectLabel(cell.value) }}</span>
                                                                                    </button>
                                                                                } @else {
                                                                                    <span class="dp-cell-text" [class.dp-muted]="isEmptyValue(cell.value)">{{ displayValue(cell.value) }}</span>
                                                                                }
                                                                            }
                                                                        </td>
                                                                    }
                                                                    <td class="dp-table__actions">
                                                                        <button type="button" class="dp-icon-button" title="Open row" (click)="navigateTo(row.path)">
                                                                            <span class="codicon codicon-chevron-right" aria-hidden="true"></span>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>
                                            } @else {
                                                <div class="dp-related-card__empty">No matching rows</div>
                                            }
                                        </article>
                                    }
                                } @else {
                                    <section class="dp-empty dp-empty--inline">
                                        <span class="codicon codicon-symbol-array" aria-hidden="true"></span>
                                        <h2>No related objects</h2>
                                        <p>This datapack section does not contain embedded object arrays.</p>
                                    </section>
                                }
                            </section>
                        }
                        @case ('content') {
                            <section class="dp-content" aria-label="Content">
                                @if (filteredContentFields().length) {
                                    @for (field of filteredContentFields(); track pathKey(field.path)) {
                                        <article class="dp-content-card" [class.dp-content-card--editing]="isEditing(field)">
                                            <header class="dp-content-card__header">
                                                <div>
                                                    <h2>{{ field.label }}</h2>
                                                    <p>{{ field.apiName }}</p>
                                                </div>
                                                @if (field.editable && !isEditing(field)) {
                                                    <button type="button" class="dp-icon-button dp-icon-button--bare" title="Edit {{ field.label }}" (click)="startEdit(field)">
                                                        <span class="codicon codicon-edit" aria-hidden="true"></span>
                                                    </button>
                                                }
                                            </header>
                                            @if (isEditing(field)) {
                                                <div class="dp-content-card__editor">
                                                    <textarea class="dp-input dp-input--content" [value]="editText()" (input)="updateEditDraft($event)"></textarea>
                                                    <span class="dp-field__edit-actions">
                                                        <button type="button" class="dp-icon-button" title="Save field" (click)="applyEdit()">
                                                            <span class="codicon codicon-check" aria-hidden="true"></span>
                                                        </button>
                                                        <button type="button" class="dp-icon-button" title="Cancel edit" (click)="cancelEdit()">
                                                            <span class="codicon codicon-close" aria-hidden="true"></span>
                                                        </button>
                                                    </span>
                                                </div>
                                            } @else {
                                                <pre class="dp-content-card__body" [class.dp-muted]="isEmptyValue(field.value)">{{ displayValue(field.value, field.metadata) }}</pre>
                                            }
                                        </article>
                                    }
                                } @else {
                                    <section class="dp-empty dp-empty--inline">
                                        <span class="codicon codicon-filter" aria-hidden="true"></span>
                                        <h2>No matching content</h2>
                                        <p>Clear the filter to show long text fields.</p>
                                    </section>
                                }
                            </section>
                        }
                    }
                </section>

                @if (loading()) {
                    <section class="dp-loading" role="status" aria-live="polite" aria-busy="true">
                        <div class="dp-loading__content">
                            <span class="dp-loading__spinner" aria-hidden="true"></span>
                            <h2>{{ loadingTitle() }}</h2>
                            <p>{{ loadingMessage() }}</p>
                        </div>
                    </section>
                }
            </main>
        }

        <ng-template #recordHeader>
            <div class="dp-topbar">
                <header class="dp-header">
                    <div class="dp-header__identity">
                        <span class="codicon codicon-symbol-object dp-header__icon" aria-hidden="true"></span>
                        <div class="dp-header__title">
                            <p>{{ currentObjectLabel() }}</p>
                            <h1>{{ currentTitle() }}</h1>
                        </div>
                    </div>
                    <div class="dp-header__actions">
                        <button type="button" class="dp-button" [disabled]="refreshing()" (click)="refresh()">
                            <span class="codicon" [class.codicon-sync]="refreshing()" [class.codicon-refresh]="!refreshing()" [class.codicon-modifier-spin]="refreshing()" aria-hidden="true"></span>
                            @if (refreshing()) { Refreshing } @else { Refresh }
                        </button>
                        <button type="button" class="dp-button" [disabled]="deploying()" (click)="deploy()">
                            <span class="codicon codicon-cloud-upload" aria-hidden="true"></span>
                            @if (deploying()) { Deploying } @else { Deploy }
                        </button>
                        <button type="button" class="dp-button" [disabled]="openingSalesforce()" (click)="openSalesforce()">
                            <span class="codicon codicon-link-external" aria-hidden="true"></span>
                            @if (openingSalesforce()) { Opening } @else { Open in Salesforce }
                        </button>
                        <button type="button" class="dp-button" (click)="viewSource()">
                            <span class="codicon codicon-code" aria-hidden="true"></span>
                            Source
                        </button>
                    </div>
                </header>
                <nav class="dp-breadcrumbs" aria-label="Datapack structure">
                    @for (crumb of breadcrumbs(); track crumb.pathKey) {
                        <button type="button" class="dp-breadcrumbs__item" [class.dp-breadcrumbs__item--active]="pathKey(crumb.path) === pathKey(path())" (click)="navigateTo(crumb.path)">
                            {{ crumb.label }}
                        </button>
                        @if (!$last) {
                            <span class="codicon codicon-chevron-right dp-breadcrumbs__sep" aria-hidden="true"></span>
                        }
                    }
                </nav>
            </div>
        </ng-template>
    `
})
export class AppComponent {
    protected readonly activeTab = signal<TabId>('details');
    protected readonly edit = signal<EditingField | undefined>(undefined);
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

    private readonly vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : undefined;

    protected readonly currentNode = computed<unknown>(() => getValueAtPath(this.model()?.data, this.path()));
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
        return this.model()?.data;
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

    protected readonly breadcrumbs = computed(() => {
        const crumbs: Breadcrumb[] = [{ label: this.model()?.title ?? 'Datapack', path: [], pathKey: '' }];
        let current: unknown = this.model()?.data;
        const currentPath: PathSegment[] = [];
        for (const segment of this.path()) {
            const parent = current;
            currentPath.push(segment);
            current = isRecord(current) || Array.isArray(current) ? current[segment as keyof typeof current] : undefined;
            crumbs.push({
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
        this.path.set([...path]);
        this.activeTab.set(this.tabForPath(path));
        this.notFound.set(undefined);
        this.edit.set(undefined);
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
        this.vscode?.postMessage({ type: 'navigateReference', reference });
    }

    protected startEdit(field: DetailField) {
        if (!field.editable) {
            return;
        }
        this.edit.set({ field, draft: field.value ?? '' });
    }

    protected cancelEdit() {
        this.edit.set(undefined);
    }

    protected applyEdit() {
        const edit = this.edit();
        const model = this.model();
        if (!edit || !model) {
            return;
        }

        const data = cloneJson(model.data);
        setValueAtPath(data, edit.field.path, this.coerceDraft(edit));
        this.model.set({ ...model, data });
        this.edit.set(undefined);
        this.save();
    }

    protected updateEditDraft(event: Event) {
        const edit = this.edit();
        if (!edit) {
            return;
        }
        const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        const draft = target instanceof HTMLInputElement && target.type === 'checkbox'
            ? target.checked
            : target instanceof HTMLSelectElement && target.multiple
                ? Array.from(target.selectedOptions).map(option => option.value).join(';')
                : target.value;
        this.edit.set({ ...edit, draft });
    }

    protected isEditing(field: DetailField) {
        const edit = this.edit();
        return edit ? this.pathKey(edit.field.path) === this.pathKey(field.path) : false;
    }

    protected editText() {
        const edit = this.edit();
        const draft = edit?.draft;
        return draft === null || draft === undefined ? '' : String(draft);
    }

    protected editChecked() {
        return Boolean(this.edit()?.draft);
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
        switch (message.type) {
            case 'load':
                this.model.set(message.state.model);
                this.metadata.set(message.state.metadata);
                this.error.set(message.state.error);
                this.path.set([]);
                this.notFound.set(undefined);
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
                this.edit.set(undefined);
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

    private createDetailField(key: string, value: unknown): DetailField {
        const object = this.currentObject();
        const path = [...this.path(), key];
        const metadata = object ? this.fieldMetadata(object, key) : undefined;
        const reference = isReference(value) ? value : undefined;
        const isObject = isRecord(value);
        return {
            apiName: key,
            editable: !reference && !isObject,
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
        const edit = this.edit();
        const value = edit && this.pathKey(edit.field.path) === this.pathKey(field.path) ? edit.draft : field.value;
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

    private coerceDraft(edit: EditingField) {
        const field = edit.field;
        const draft = edit.draft;
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

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
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
    if ((Array.isArray(parent) || isRecord(parent)) && key !== undefined) {
        (parent as any)[key] = value;
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

bootstrapApplication(AppComponent, {
    providers: [provideZonelessChangeDetection()]
}).catch(error => console.error(error));
