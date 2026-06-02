import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AutocompleteInputComponent } from '../shared/components/autocomplete-input/autocomplete-input.component';
import { VlocodeDialogComponent } from '../shared/components/dialog/dialog.component';
import { VlocodeEmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { FormulaEditorComponent } from '../shared/components/formula-editor/formula-editor.component';
import { MonacoEditorComponent, type monaco } from '../shared/components/monaco-editor/monaco-editor.component';

declare const acquireVsCodeApi: undefined | (() => VsCodeApi);

type SourceFormat = 'json' | 'xml';
type RuntimeShape = 'managed' | 'standard';
type LeftTab = 'outline' | 'add' | 'problems';
type InspectorTab = 'settings' | 'conditions' | 'io' | 'failure' | 'json';
type DropPosition = 'before' | 'after' | 'inside';

const DRAG_ELEMENT_MIME = 'application/x-vlocode-ip-element';
const DRAG_TEMPLATE_MIME = 'application/x-vlocode-ip-template';
const EMPTY_FLOW_DROP_KEY = '__empty-flow__';

interface VsCodeApi {
    postMessage(message: WebviewToExtensionMessage): void;
}

interface IntegrationProcedureHeader {
    active?: boolean;
    description?: string;
    language?: string;
    name: string;
    requiredPermission?: string;
    responseCacheType?: string;
    subType: string;
    type: string;
    versionNumber?: number | string;
}

interface IntegrationProcedureElement {
    active: boolean;
    description?: string;
    key: string;
    level: number;
    name: string;
    parentKey?: string;
    propertySet: Record<string, unknown>;
    sequenceNumber: number;
    sourceKey: string;
    type: string;
}

interface IntegrationProcedureModel {
    datapackType: string;
    elements: IntegrationProcedureElement[];
    fileName: string;
    header: IntegrationProcedureHeader;
    propertySet: Record<string, unknown>;
    runtime: RuntimeShape;
    sourceFormat: SourceFormat;
    sourceKey?: string;
    title: string;
}

interface IntegrationProcedureLayout {
    inspectorCollapsed: boolean;
    inspectorWidth: number;
    leftCollapsed: boolean;
}

interface EditorState {
    apexClasses?: string[];
    dataMappers?: string[];
    layout?: IntegrationProcedureLayout;
    model: IntegrationProcedureModel;
}

type ExtensionToWebviewMessage =
    | { type: 'load'; state: EditorState }
    | { type: 'saved' }
    | { type: 'error'; message: string };

type WebviewToExtensionMessage =
    | { type: 'ready' }
    | { type: 'change'; model: IntegrationProcedureModel }
    | { type: 'save'; model: IntegrationProcedureModel }
    | { type: 'deploy'; model: IntegrationProcedureModel }
    | { type: 'refresh' }
    | { type: 'openSalesforce' }
    | { type: 'viewSource' }
    | { type: 'layout'; layout: IntegrationProcedureLayout };

interface FlowRow {
    depth: number;
    element: IntegrationProcedureElement;
    hasChildren: boolean;
}

interface FlowNode {
    children: FlowNode[];
    depth: number;
    element: IntegrationProcedureElement;
}

interface Problem {
    elementKey?: string;
    message: string;
    severity: 'error' | 'warning';
}

interface DataRaptorInputParameter {
    element: string;
    index: number;
    inputParam: string;
}

interface ElementTemplate {
    description: string;
    family: 'Actions' | 'Data Mappers' | 'Groups';
    icon: string;
    type: string;
}

interface InsertContext {
    afterKey?: string;
    parentKey?: string;
}

interface MapEntryEditor {
    key: string;
    mapName: string;
    originalKey: string;
    title: string;
    value: string;
}

const EMPTY_MODEL: IntegrationProcedureModel = {
    datapackType: 'IntegrationProcedure',
    elements: [],
    fileName: '',
    header: {
        name: 'Integration Procedure',
        type: '',
        subType: ''
    },
    propertySet: {},
    runtime: 'standard',
    sourceFormat: 'json',
    title: 'Integration Procedure'
};

const DEFAULT_INSPECTOR_WIDTH = 520;
const MIN_INSPECTOR_WIDTH = 360;
const MAX_INSPECTOR_WIDTH = 760;
const INSPECTOR_KEYBOARD_RESIZE_STEP = 32;
const DEFAULT_LAYOUT: IntegrationProcedureLayout = {
    inspectorCollapsed: false,
    inspectorWidth: DEFAULT_INSPECTOR_WIDTH,
    leftCollapsed: false
};

const ELEMENT_TEMPLATES: ElementTemplate[] = [
    { type: 'Remote Action', family: 'Actions', icon: 'radio-tower', description: 'Call an Apex remote class and method.' },
    { type: 'HTTP Action', family: 'Actions', icon: 'globe', description: 'Call an HTTP endpoint or named credential.' },
    { type: 'Set Values', family: 'Actions', icon: 'symbol-variable', description: 'Assign values into the procedure data JSON.' },
    { type: 'Response Action', family: 'Actions', icon: 'reply', description: 'Shape the final procedure response.' },
    { type: 'Integration Procedure Action', family: 'Actions', icon: 'references', description: 'Call another Integration Procedure.' },
    { type: 'Data Mapper Extract Action', family: 'Data Mappers', icon: 'database', description: 'Fetch Salesforce data through a Data Mapper.' },
    { type: 'Data Mapper Transform Action', family: 'Data Mappers', icon: 'type-hierarchy-sub', description: 'Transform JSON through a Data Mapper.' },
    { type: 'Data Mapper Post Action', family: 'Data Mappers', icon: 'cloud-upload', description: 'Write data through a Data Mapper.' },
    { type: 'Data Mapper Turbo Action', family: 'Data Mappers', icon: 'zap', description: 'Run a fast Data Mapper extract.' },
    { type: 'Conditional Block', family: 'Groups', icon: 'git-branch', description: 'Run child steps only when its formula is true.' },
    { type: 'Loop Block', family: 'Groups', icon: 'sync', description: 'Run child steps for each item in a list.' },
    { type: 'Try-Catch Block', family: 'Groups', icon: 'shield', description: 'Group steps with explicit failure handling.' },
    { type: 'Cache Block', family: 'Groups', icon: 'archive', description: 'Cache expensive child step output.' }
];

const INSPECTOR_TABS: Array<{ id: InspectorTab; label: string }> = [
    { id: 'settings', label: 'Settings' },
    { id: 'conditions', label: 'Conditions' },
    { id: 'io', label: 'Input / Output' },
    { id: 'failure', label: 'Failure' },
    { id: 'json', label: 'JSON' }
];

const GROUP_TYPES = new Set(['Conditional Block', 'Loop Block', 'Try-Catch Block', 'Cache Block']);

const jsonEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    folding: true,
    foldingStrategy: 'auto',
    lineNumbersMinChars: 2,
    showFoldingControls: 'always'
};

@Component({
    selector: 'vlocode-integration-procedure-editor',
    standalone: true,
    imports: [AutocompleteInputComponent, CommonModule, FormulaEditorComponent, MonacoEditorComponent, VlocodeDialogComponent, VlocodeEmptyStateComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './app/app.component.html'
})
export class AppComponent {
    private readonly destroyRef = inject(DestroyRef);

    protected readonly addFilter = signal('');
    protected readonly error = signal<string | undefined>(undefined);
    protected readonly hasLoaded = signal(false);
    protected readonly inspectorTab = signal<InspectorTab>('settings');
    protected readonly insertFilter = signal('');
    protected readonly jsonDraft = signal('');
    protected readonly jsonError = signal<string | undefined>(undefined);
    protected readonly leftTab = signal<LeftTab>('outline');
    protected readonly mapEntryEditor = signal<MapEntryEditor | undefined>(undefined);
    protected readonly mapEntryEditorError = signal<string | undefined>(undefined);
    protected readonly model = signal<IntegrationProcedureModel>(EMPTY_MODEL);
    protected readonly outlineFilter = signal('');
    protected readonly pendingDeleteKey = signal<string | undefined>(undefined);
    protected readonly pendingInsert = signal<InsertContext | undefined>(undefined);
    protected readonly refreshing = signal(false);
    protected readonly saving = signal(false);
    protected readonly deploying = signal(false);
    protected readonly draggedKey = signal<string | undefined>(undefined);
    protected readonly draggedTemplateType = signal<string | undefined>(undefined);
    protected readonly dropPosition = signal<DropPosition | undefined>(undefined);
    protected readonly dropTargetKey = signal<string | undefined>(undefined);
    protected readonly openingSalesforce = signal(false);
    protected readonly selectedKey = signal<string | undefined>(undefined);
    protected readonly apexClasses = signal<string[]>([]);
    protected readonly dataMappers = signal<string[]>([]);
    protected readonly layout = signal<IntegrationProcedureLayout>({ ...DEFAULT_LAYOUT });

    protected readonly inspectorTabs = INSPECTOR_TABS;
    protected readonly elementTemplates = ELEMENT_TEMPLATES;
    protected readonly emptyFlowDropKey = EMPTY_FLOW_DROP_KEY;
    protected readonly jsonEditorOptions = jsonEditorOptions;
    protected readonly templateFamilies: ElementTemplate['family'][] = ['Actions', 'Data Mappers', 'Groups'];

    private readonly vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : undefined;
    private resizeCleanup?: () => void;

    protected readonly selectedElement = computed(() =>
        this.model().elements.find(element => element.key === this.selectedKey())
    );

    protected readonly pendingDeleteElement = computed(() =>
        this.model().elements.find(element => element.key === this.pendingDeleteKey())
    );

    protected readonly pendingDeleteChildCount = computed(() => {
        const element = this.pendingDeleteElement();
        return element ? this.descendantCount(element.key) : 0;
    });
    protected readonly pendingDeleteMessage = computed(() => {
        const childCount = this.pendingDeleteChildCount();
        return childCount
            ? `Delete this node and ${childCount} child ${childCount === 1 ? 'node' : 'nodes'}?`
            : 'Delete this node?';
    });

    protected readonly selectedTitle = computed(() => this.selectedElement()?.name ?? 'Procedure');

    protected readonly flowRows = computed(() => flattenElements(this.model().elements));
    protected readonly flowTree = computed(() => buildFlowTree(this.model().elements));

    protected readonly filteredOutline = computed(() => {
        const filter = this.outlineFilter().trim().toLowerCase();
        const rows = this.flowRows();
        if (!filter) {
            return rows;
        }
        return rows.filter(row => `${row.element.name} ${row.element.type} ${elementSummary(row.element)}`.toLowerCase().includes(filter));
    });

    protected readonly filteredTemplates = computed(() => {
        const filter = this.addFilter().trim().toLowerCase();
        if (!filter) {
            return ELEMENT_TEMPLATES;
        }
        return ELEMENT_TEMPLATES.filter(template => `${template.type} ${template.family} ${template.description}`.toLowerCase().includes(filter));
    });

    protected readonly groupedTemplates = computed(() => groupTemplates(this.filteredTemplates()));

    protected readonly filteredInsertTemplates = computed(() => {
        const filter = this.insertFilter().trim().toLowerCase();
        if (!filter) {
            return ELEMENT_TEMPLATES;
        }
        return ELEMENT_TEMPLATES.filter(template => `${template.type} ${template.family} ${template.description}`.toLowerCase().includes(filter));
    });

    protected readonly problems = computed(() => validateModel(this.model()));

    protected readonly dataMapperOptions = computed(() => {
        const current = this.propertyValue('bundle');
        return [...new Set([...this.dataMappers(), current].filter(Boolean))].sort((a, b) => a.localeCompare(b));
    });
    protected readonly apexClassOptions = computed(() => {
        const current = this.propertyValue('remoteClass');
        return [...new Set([...this.apexClasses(), current].filter(Boolean))].sort((a, b) => a.localeCompare(b));
    });

    protected readonly jsonTargetLabel = computed(() => this.selectedElement() ? 'selected element property set' : 'procedure property set');
    protected readonly inspectorCollapsed = computed(() => this.layout().inspectorCollapsed);
    protected readonly inspectorWidth = computed(() => `${this.layout().inspectorWidth}px`);
    protected readonly navigationCollapsed = computed(() => this.layout().leftCollapsed);

    constructor() {
        const handleWindowMessage = (event: MessageEvent) => this.handleMessage(event.data as ExtensionToWebviewMessage);
        window.addEventListener('message', handleWindowMessage);
        this.destroyRef.onDestroy(() => {
            window.removeEventListener('message', handleWindowMessage);
            this.stopInspectorResize();
        });
        effect(() => {
            this.jsonDraft.set(JSON.stringify(this.activePropertySet(), undefined, 4));
            this.jsonError.set(undefined);
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
        this.vscode?.postMessage({ type: 'ready' });
    }

    protected save() {
        this.saving.set(true);
        this.vscode?.postMessage({ type: 'save', model: this.model() });
        window.setTimeout(() => this.saving.set(false), 800);
    }

    protected deploy() {
        this.deploying.set(true);
        this.vscode?.postMessage({ type: 'deploy', model: this.model() });
        window.setTimeout(() => this.deploying.set(false), 1200);
    }

    protected refresh() {
        this.refreshing.set(true);
        this.vscode?.postMessage({ type: 'refresh' });
        window.setTimeout(() => this.refreshing.set(false), 1200);
    }

    protected openSalesforce() {
        this.openingSalesforce.set(true);
        this.vscode?.postMessage({ type: 'openSalesforce' });
        window.setTimeout(() => this.openingSalesforce.set(false), 1200);
    }

    protected viewSource() {
        this.vscode?.postMessage({ type: 'viewSource' });
    }

    protected toggleNavigationSidebar() {
        this.updateLayout({ leftCollapsed: !this.layout().leftCollapsed });
    }

    protected toggleInspector() {
        this.updateLayout({ inspectorCollapsed: !this.layout().inspectorCollapsed });
    }

    protected startInspectorResize(event: PointerEvent) {
        if (this.layout().inspectorCollapsed) {
            return;
        }
        event.preventDefault();
        this.stopInspectorResize();
        const startX = event.clientX;
        const startWidth = this.layout().inspectorWidth;
        const handleMove = (moveEvent: PointerEvent) => {
            this.updateLayout({
                inspectorCollapsed: false,
                inspectorWidth: startWidth + startX - moveEvent.clientX
            }, false);
        };
        const handleUp = () => {
            this.stopInspectorResize();
            this.persistLayout();
        };
        document.body.classList.add('ip-resizing');
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp, { once: true });
        this.resizeCleanup = () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
            document.body.classList.remove('ip-resizing');
        };
    }

    protected resizeInspectorWithKeyboard(event: KeyboardEvent) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            return;
        }
        event.preventDefault();
        this.updateLayout({
            inspectorCollapsed: false,
            inspectorWidth: this.layout().inspectorWidth + (event.key === 'ArrowLeft' ? INSPECTOR_KEYBOARD_RESIZE_STEP : -INSPECTOR_KEYBOARD_RESIZE_STEP)
        });
    }

    protected selectProcedure() {
        this.endDrag();
        this.selectedKey.set(undefined);
        this.inspectorTab.set('settings');
    }

    protected selectElement(key: string) {
        this.endDrag();
        this.selectedKey.set(key);
    }

    protected selectProblem(problem: Problem) {
        if (problem.elementKey) {
            this.selectElement(problem.elementKey);
        } else {
            this.selectProcedure();
        }
    }

    protected updateHeader(field: keyof IntegrationProcedureHeader, event: Event) {
        const value = inputValue(event);
        this.updateModel(model => ({
            ...model,
            header: {
                ...model.header,
                [field]: field === 'active' ? inputChecked(event) : value
            },
            title: field === 'name' ? value : model.title
        }));
    }

    protected updateProcedureProperty(field: string, event: Event) {
        this.updateProcedurePropertyValue(field, inputControlValue(event));
    }

    protected updateProcedurePropertyValue(field: string, value: unknown) {
        this.updateModel(model => ({
            ...model,
            propertySet: setObjectValue(model.propertySet, field, value)
        }));
    }

    protected updateElementField(field: keyof IntegrationProcedureElement, event: Event) {
        const selected = this.selectedElement();
        if (!selected) {
            return;
        }
        const value = field === 'active' ? inputChecked(event) : inputValue(event);
        this.updateElement(selected.key, { [field]: value } as Partial<IntegrationProcedureElement>);
    }

    protected updateElementProperty(field: string, event: Event) {
        this.updateElementPropertyValue(field, inputControlValue(event));
    }

    protected updateElementPropertyValue(field: string, value: unknown) {
        const selected = this.selectedElement();
        if (!selected) {
            return;
        }
        this.updateElement(selected.key, {
            propertySet: setObjectValue(selected.propertySet, field, value)
        });
    }

    protected updateMapEntry(mapName: string, key: string, event: Event, part: 'key' | 'value') {
        const value = inputValue(event);
        this.updateMap(mapName, current => {
            const next = { ...current };
            if (part === 'key') {
                const existingValue = next[key];
                delete next[key];
                if (value) {
                    next[value] = existingValue ?? '';
                }
            } else {
                next[key] = value;
            }
            return next;
        });
    }

    protected addMapEntry(mapName: string) {
        this.updateMap(mapName, current => {
            const next = { ...current };
            const base = 'key';
            let name = base;
            let index = 1;
            while (name in next) {
                name = `${base}${++index}`;
            }
            next[name] = '';
            return next;
        });
    }

    protected deleteMapEntry(mapName: string, key: string) {
        this.updateMap(mapName, current => {
            const next = { ...current };
            delete next[key];
            return next;
        });
    }

    protected openMapEntryEditor(mapName: string, key: string, title: string) {
        const entry = this.mapEntries(mapName).find(candidate => candidate.key === key);
        this.mapEntryEditor.set({
            key,
            mapName,
            originalKey: key,
            title,
            value: entry?.value ?? ''
        });
        this.mapEntryEditorError.set(undefined);
    }

    protected updateMapEntryEditorKey(event: Event) {
        this.patchMapEntryEditor({ key: inputValue(event) });
    }

    protected updateMapEntryEditorValue(value: string) {
        this.patchMapEntryEditor({ value });
    }

    protected cancelMapEntryEditor() {
        this.mapEntryEditor.set(undefined);
        this.mapEntryEditorError.set(undefined);
    }

    protected applyMapEntryEditor() {
        const editor = this.mapEntryEditor();
        if (!editor) {
            return;
        }
        const key = editor.key.trim();
        if (!key) {
            this.mapEntryEditorError.set('Key is required.');
            return;
        }
        const current = asRecord(this.activePropertySet()[editor.mapName]);
        if (key !== editor.originalKey && Object.prototype.hasOwnProperty.call(current, key)) {
            this.mapEntryEditorError.set(`"${key}" already exists.`);
            return;
        }
        this.updateMap(editor.mapName, map => {
            const next = { ...map };
            delete next[editor.originalKey];
            next[key] = editor.value;
            return next;
        });
        this.cancelMapEntryEditor();
    }

    protected mapEntries(mapName: string) {
        return Object.entries(asRecord(this.activePropertySet()[mapName])).map(([key, value]) => ({ key, value: stringifyValue(value) }));
    }

    protected dataRaptorInputParameters(): DataRaptorInputParameter[] {
        const value = this.activePropertySet()['dataRaptor Input Parameters'];
        return Array.isArray(value)
            ? value.map((entry, index) => ({
                index,
                inputParam: stringifyValue(isRecord(entry) ? entry.inputParam : ''),
                element: stringifyValue(isRecord(entry) ? entry.element : '')
            }))
            : [];
    }

    protected addDataRaptorInputParameter() {
        this.updateDataRaptorInputParameters(parameters => [...parameters, { inputParam: '', element: '' }]);
    }

    protected updateDataRaptorInputParameter(index: number, field: 'inputParam' | 'element', event: Event) {
        const value = inputValue(event);
        this.updateDataRaptorInputParameters(parameters => parameters.map((parameter, parameterIndex) =>
            parameterIndex === index ? { ...parameter, [field]: value } : parameter
        ));
    }

    protected deleteDataRaptorInputParameter(index: number) {
        this.updateDataRaptorInputParameters(parameters => parameters.filter((_parameter, parameterIndex) => parameterIndex !== index));
    }

    protected isDataMapperAction(type: string) {
        return isDataMapperAction(type);
    }

    protected openInsertPicker(afterKey?: string, parentKey?: string) {
        this.insertFilter.set('');
        this.pendingInsert.set({ afterKey, parentKey });
    }

    protected closeInsertPicker() {
        this.insertFilter.set('');
        this.pendingInsert.set(undefined);
    }

    protected isInsertPickerOpen(afterKey?: string, parentKey?: string) {
        const context = this.pendingInsert();
        return context?.afterKey === afterKey && context?.parentKey === parentKey;
    }

    protected addSelectedElement(type: string) {
        const context = this.pendingInsert();
        this.closeInsertPicker();
        this.addElement(type, context?.afterKey, context?.parentKey);
    }

    protected addElement(type: string, afterKey?: string, parentKey?: string, beforeKey?: string) {
        const model = this.model();
        const afterElement = afterKey ? model.elements.find(element => element.key === afterKey) : undefined;
        const beforeElement = beforeKey ? model.elements.find(element => element.key === beforeKey) : undefined;
        const resolvedParentKey = parentKey ?? afterElement?.parentKey ?? beforeElement?.parentKey;
        const name = uniqueElementName(model.elements, defaultElementName(type));
        const sourceKey = `${model.sourceKey ?? `IntegrationProcedure/${model.header.type}/${model.header.subType}`}/OmniProcessElement/${name}`;
        const element: IntegrationProcedureElement = {
            active: true,
            key: sourceKey,
            level: resolvedParentKey ? 1 : 0,
            name,
            parentKey: resolvedParentKey,
            propertySet: defaultPropertySet(type, name),
            sequenceNumber: 1,
            sourceKey,
            type
        };
        const elements = insertElementInFlow(model.elements, element, afterKey, resolvedParentKey, beforeKey);
        this.setModel({ ...model, elements: resequence(elements) });
        this.selectedKey.set(element.key);
        this.leftTab.set('outline');
    }

    protected startTemplateDrag(type: string, event: DragEvent) {
        event.stopPropagation();
        this.draggedKey.set(undefined);
        this.draggedTemplateType.set(type);
        this.dropTargetKey.set(undefined);
        this.dropPosition.set(undefined);
        event.dataTransfer?.setData(DRAG_TEMPLATE_MIME, type);
        event.dataTransfer?.setData('text/plain', type);
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'copy';
        }
    }

    protected addChildElement(parentKey: string) {
        this.openInsertPicker(undefined, parentKey);
    }

    protected duplicateElement(key: string) {
        const model = this.model();
        const original = model.elements.find(element => element.key === key);
        if (!original) {
            return;
        }
        const name = uniqueElementName(model.elements, `${original.name}Copy`);
        const sourceKey = `${model.sourceKey ?? 'IntegrationProcedure'}/OmniProcessElement/${name}`;
        const duplicate: IntegrationProcedureElement = {
            ...clone(original),
            key: sourceKey,
            sourceKey,
            name,
            propertySet: {
                ...clone(original.propertySet),
                label: name
            }
        };
        const index = model.elements.findIndex(element => element.key === key);
        const elements = [...model.elements];
        elements.splice(index + 1, 0, duplicate);
        this.setModel({ ...model, elements: resequence(elements) });
        this.selectedKey.set(duplicate.key);
    }

    protected deleteElement(key: string) {
        const model = this.model();
        const deleteKeys = new Set<string>([key]);
        let changed = true;
        while (changed) {
            changed = false;
            for (const element of model.elements) {
                if (element.parentKey && deleteKeys.has(element.parentKey) && !deleteKeys.has(element.key)) {
                    deleteKeys.add(element.key);
                    changed = true;
                }
            }
        }
        this.setModel({
            ...model,
            elements: resequence(model.elements.filter(element => !deleteKeys.has(element.key)))
        });
        if (deleteKeys.has(this.selectedKey() ?? '')) {
            this.selectedKey.set(undefined);
        }
    }

    protected startDrag(key: string, event: DragEvent) {
        event.stopPropagation();
        this.draggedKey.set(key);
        this.draggedTemplateType.set(undefined);
        this.dropTargetKey.set(undefined);
        this.dropPosition.set(undefined);
        event.dataTransfer?.setData(DRAG_ELEMENT_MIME, key);
        event.dataTransfer?.setData('text/plain', key);
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
        }
    }

    protected dragOver(targetKey: string, event: DragEvent) {
        event.stopPropagation();
        const templateType = this.getDraggedTemplateType(event);
        if (templateType) {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'copy';
            }
            const target = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
            const midpoint = target ? target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2 : 0;
            this.dropTargetKey.set(targetKey);
            this.dropPosition.set(event.clientY < midpoint ? 'before' : 'after');
            return;
        }

        const draggedKey = this.getDraggedElementKey(event);
        if (!draggedKey || !this.canDropOn(draggedKey, targetKey)) {
            return;
        }
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
        const target = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
        const midpoint = target ? target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2 : 0;
        const position = event.clientY < midpoint ? 'before' : 'after';
        const dropTarget = this.normalizeDropTarget(targetKey, position, draggedKey);
        if (!dropTarget || !this.canDropOn(draggedKey, dropTarget.targetKey)) {
            this.dropTargetKey.set(undefined);
            this.dropPosition.set(undefined);
            return;
        }
        this.dropTargetKey.set(dropTarget.targetKey);
        this.dropPosition.set(dropTarget.position);
    }

    protected dragLeave(targetKey: string) {
        const previousKey = this.previousSiblingKey(targetKey);
        if (this.dropTargetKey() === targetKey || this.dropTargetKey() === previousKey) {
            this.dropTargetKey.set(undefined);
            this.dropPosition.set(undefined);
        }
    }

    protected dragOverInsert(afterKey: string, event: DragEvent) {
        event.stopPropagation();
        const templateType = this.getDraggedTemplateType(event);
        if (templateType) {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'copy';
            }
            this.dropTargetKey.set(afterKey);
            this.dropPosition.set('after');
            return;
        }

        const draggedKey = this.getDraggedElementKey(event);
        if (!draggedKey || !this.canDropOn(draggedKey, afterKey)) {
            return;
        }
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
        this.dropTargetKey.set(afterKey);
        this.dropPosition.set('after');
    }

    protected dropOnInsert(afterKey: string, event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        const templateType = this.getDraggedTemplateType(event);
        if (templateType) {
            this.endDrag();
            this.addElement(templateType, afterKey);
            return;
        }

        const draggedKey = this.getDraggedElementKey(event);
        this.endDrag();
        if (!draggedKey || !this.canDropOn(draggedKey, afterKey)) {
            return;
        }
        this.reorderElement(draggedKey, afterKey, 'after');
    }

    protected dropOnElement(targetKey: string, event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        const templateType = this.getDraggedTemplateType(event);
        const dropTargetKey = this.dropTargetKey();
        const position = this.dropPosition();
        if (templateType) {
            this.endDrag();
            if (!dropTargetKey || !position || position === 'inside') {
                return;
            }
            this.addElementRelative(templateType, dropTargetKey, position);
            return;
        }

        const draggedKey = this.getDraggedElementKey(event);
        this.endDrag();
        if (!draggedKey || !dropTargetKey || !position || position === 'inside' || !this.canDropOn(draggedKey, dropTargetKey)) {
            return;
        }
        this.reorderElement(draggedKey, dropTargetKey, position);
    }

    protected dragOverGroup(parentKey: string, event: DragEvent) {
        event.stopPropagation();
        const templateType = this.getDraggedTemplateType(event);
        if (templateType) {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'copy';
            }
            this.dropTargetKey.set(parentKey);
            this.dropPosition.set('inside');
            return;
        }

        const draggedKey = this.getDraggedElementKey(event);
        if (!draggedKey || !this.canDropOn(draggedKey, parentKey)) {
            return;
        }
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
        this.dropTargetKey.set(parentKey);
        this.dropPosition.set('inside');
    }

    protected dropOnGroup(parentKey: string, event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        const templateType = this.getDraggedTemplateType(event);
        if (templateType) {
            this.endDrag();
            this.addElement(templateType, undefined, parentKey);
            return;
        }

        const draggedKey = this.getDraggedElementKey(event);
        this.endDrag();
        if (!draggedKey || !this.canDropOn(draggedKey, parentKey)) {
            return;
        }
        this.moveElementIntoGroup(draggedKey, parentKey);
    }

    protected endDrag() {
        this.draggedKey.set(undefined);
        this.draggedTemplateType.set(undefined);
        this.dropTargetKey.set(undefined);
        this.dropPosition.set(undefined);
    }

    protected dragOverEmptyFlow(event: DragEvent) {
        event.stopPropagation();
        const templateType = this.getDraggedTemplateType(event);
        if (!templateType) {
            return;
        }
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'copy';
        }
        this.dropTargetKey.set(EMPTY_FLOW_DROP_KEY);
        this.dropPosition.set('inside');
    }

    protected dragLeaveEmptyFlow() {
        if (this.dropTargetKey() === EMPTY_FLOW_DROP_KEY) {
            this.dropTargetKey.set(undefined);
            this.dropPosition.set(undefined);
        }
    }

    protected dropOnEmptyFlow(event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        const templateType = this.getDraggedTemplateType(event);
        this.endDrag();
        if (templateType) {
            this.addElement(templateType);
        }
    }

    protected confirmDeleteElement(key: string) {
        this.pendingDeleteKey.set(key);
    }

    protected cancelDelete() {
        this.pendingDeleteKey.set(undefined);
    }

    protected deletePendingElement() {
        const key = this.pendingDeleteKey();
        this.pendingDeleteKey.set(undefined);
        if (key) {
            this.deleteElement(key);
        }
    }

    protected setJsonDraft(event: Event) {
        this.jsonDraft.set(inputValue(event));
        this.jsonError.set(undefined);
    }

    protected setJsonDraftValue(value: string) {
        this.jsonDraft.set(value);
        this.jsonError.set(undefined);
    }

    protected applyJson() {
        try {
            const parsed = JSON.parse(this.jsonDraft());
            if (!isRecord(parsed)) {
                throw new Error('JSON must be an object.');
            }
            const selected = this.selectedElement();
            if (selected) {
                this.updateElement(selected.key, { propertySet: parsed });
            } else {
                this.updateModel(model => ({ ...model, propertySet: parsed }));
            }
            this.jsonError.set(undefined);
        } catch (error) {
            this.jsonError.set(getErrorMessage(error));
        }
    }

    protected isGroup(type: string) {
        return GROUP_TYPES.has(type);
    }

    protected activePropertySet() {
        return this.selectedElement()?.propertySet ?? this.model().propertySet;
    }

    protected propertyValue(field: string) {
        return stringifyValue(this.activePropertySet()[field]);
    }

    protected propertyChecked(field: string) {
        return this.activePropertySet()[field] === true;
    }

    protected familyTemplates(family: string) {
        return this.groupedTemplates().get(family as ElementTemplate['family']) ?? [];
    }

    protected templatesForFamily(family: ElementTemplate['family']) {
        return this.filteredInsertTemplates().filter(template => template.family === family);
    }

    protected updateInsertFilter(event: Event) {
        this.insertFilter.set(inputValue(event));
    }

    protected elementSummary(element: IntegrationProcedureElement) {
        return elementSummary(element);
    }

    protected iconForType(type: string) {
        const templateIcon = ELEMENT_TEMPLATES.find(template => template.type === type)?.icon;
        if (templateIcon) {
            return templateIcon;
        }
        if (/Transform/i.test(type) && isDataMapperAction(type)) {
            return 'type-hierarchy-sub';
        }
        if (/Post/i.test(type) && isDataMapperAction(type)) {
            return 'cloud-upload';
        }
        if (/Turbo/i.test(type) && isDataMapperAction(type)) {
            return 'zap';
        }
        if (isDataMapperAction(type)) {
            return 'database';
        }
        return 'circle-outline';
    }

    protected hasSelectedDescendant(parentKey: string) {
        const selectedKey = this.selectedKey();
        return !!selectedKey && this.isDescendantOf(selectedKey, parentKey);
    }

    protected hasOpenInsertMenu(node: FlowNode) {
        const context = this.pendingInsert();
        const targetKey = context?.parentKey ?? context?.afterKey;
        return !!targetKey && (targetKey === node.element.key || this.isDescendantOf(targetKey, node.element.key));
    }

    protected updateFilter(signalToUpdate: 'outline' | 'add', event: Event) {
        if (signalToUpdate === 'outline') {
            this.outlineFilter.set(inputValue(event));
        } else {
            this.addFilter.set(inputValue(event));
        }
    }

    private handleMessage(message: ExtensionToWebviewMessage) {
        switch (message.type) {
            case 'load':
                this.model.set(message.state.model);
                this.apexClasses.set(message.state.apexClasses ?? []);
                this.dataMappers.set(message.state.dataMappers ?? []);
                this.layout.set(normalizeLayout(message.state.layout));
                this.hasLoaded.set(true);
                this.refreshing.set(false);
                this.error.set(undefined);
                if (this.selectedKey() && !message.state.model.elements.some(element => element.key === this.selectedKey())) {
                    this.selectedKey.set(undefined);
                }
                break;
            case 'saved':
                this.saving.set(false);
                break;
            case 'error':
                this.error.set(message.message);
                this.saving.set(false);
                this.deploying.set(false);
                this.refreshing.set(false);
                break;
        }
    }

    private setModel(model: IntegrationProcedureModel) {
        this.model.set(model);
        this.vscode?.postMessage({ type: 'change', model });
    }

    private updateLayout(patch: Partial<IntegrationProcedureLayout>, persist = true) {
        const layout = normalizeLayout({ ...this.layout(), ...patch });
        this.layout.set(layout);
        if (persist) {
            this.persistLayout(layout);
        }
    }

    private persistLayout(layout = this.layout()) {
        this.vscode?.postMessage({ type: 'layout', layout });
    }

    private stopInspectorResize() {
        this.resizeCleanup?.();
        this.resizeCleanup = undefined;
    }

    private updateModel(updater: (model: IntegrationProcedureModel) => IntegrationProcedureModel) {
        this.setModel(updater(this.model()));
    }

    private patchMapEntryEditor(patch: Partial<MapEntryEditor>) {
        const editor = this.mapEntryEditor();
        if (editor) {
            this.mapEntryEditor.set({ ...editor, ...patch });
            this.mapEntryEditorError.set(undefined);
        }
    }

    private updateElement(key: string, patch: Partial<IntegrationProcedureElement>) {
        this.updateModel(model => ({
            ...model,
            elements: resequence(model.elements.map(element => element.key === key ? { ...element, ...patch } : element))
        }));
    }

    private canDropOn(draggedKey: string, targetKey: string) {
        if (draggedKey === targetKey) {
            return false;
        }
        const keys = new Set(this.model().elements.map(element => element.key));
        return keys.has(draggedKey) && keys.has(targetKey) && !this.isDescendantOf(targetKey, draggedKey);
    }

    private getDraggedElementKey(event: DragEvent) {
        const key = this.draggedKey() || event.dataTransfer?.getData(DRAG_ELEMENT_MIME) || event.dataTransfer?.getData('text/plain');
        return this.model().elements.some(element => element.key === key) ? key : undefined;
    }

    private getDraggedTemplateType(event: DragEvent) {
        const type = this.draggedTemplateType() || event.dataTransfer?.getData(DRAG_TEMPLATE_MIME) || event.dataTransfer?.getData('text/plain');
        return ELEMENT_TEMPLATES.some(template => template.type === type) ? type : undefined;
    }

    private addElementRelative(type: string, targetKey: string, position: Exclude<DropPosition, 'inside'>) {
        const target = this.model().elements.find(element => element.key === targetKey);
        if (!target) {
            return;
        }
        if (position === 'after') {
            this.addElement(type, targetKey);
            return;
        }
        this.addElement(type, undefined, target.parentKey, targetKey);
    }

    private normalizeDropTarget(targetKey: string, position: Exclude<DropPosition, 'inside'>, draggedKey: string) {
        if (position === 'after') {
            return targetKey === draggedKey ? undefined : { targetKey, position };
        }
        const previousKey = this.previousSiblingKey(targetKey);
        const normalized = previousKey ? { targetKey: previousKey, position: 'after' as const } : { targetKey, position };
        return normalized.targetKey === draggedKey ? undefined : normalized;
    }

    private previousSiblingKey(targetKey: string) {
        const target = this.model().elements.find(element => element.key === targetKey);
        if (!target) {
            return undefined;
        }
        const siblings = this.model().elements
            .filter(element => (element.parentKey ?? '') === (target.parentKey ?? ''))
            .sort((a, b) => Number(a.sequenceNumber || 0) - Number(b.sequenceNumber || 0) || a.name.localeCompare(b.name));
        const index = siblings.findIndex(element => element.key === targetKey);
        return index > 0 ? siblings[index - 1].key : undefined;
    }

    private reorderElement(draggedKey: string, targetKey: string, position: Exclude<DropPosition, 'inside'>) {
        const model = this.model();
        const dragged = model.elements.find(element => element.key === draggedKey);
        const target = model.elements.find(element => element.key === targetKey);
        if (!dragged || !target) {
            return;
        }
        const nextParentKey = target.parentKey;
        const siblings = model.elements
            .filter(element => element.key !== draggedKey && (element.parentKey ?? '') === (nextParentKey ?? ''))
            .sort((a, b) => Number(a.sequenceNumber || 0) - Number(b.sequenceNumber || 0) || a.name.localeCompare(b.name));
        const targetIndex = siblings.findIndex(element => element.key === targetKey);
        if (targetIndex < 0) {
            return;
        }
        siblings.splice(position === 'before' ? targetIndex : targetIndex + 1, 0, { ...dragged, parentKey: nextParentKey });
        const reorderedSiblings = new Map(siblings.map((element, index) => [element.key, {
            parentKey: element.parentKey,
            sequenceNumber: index + 1
        }]));
        this.setModel({
            ...model,
            elements: resequence(model.elements.map(element => {
                const position = reorderedSiblings.get(element.key);
                return position ? { ...element, ...position } : element;
            }))
        });
        this.selectedKey.set(draggedKey);
    }

    private moveElementIntoGroup(draggedKey: string, parentKey: string) {
        const model = this.model();
        const siblings = model.elements
            .filter(element => element.parentKey === parentKey && element.key !== draggedKey)
            .sort((a, b) => Number(a.sequenceNumber || 0) - Number(b.sequenceNumber || 0) || a.name.localeCompare(b.name));
        const nextPositions = new Map<string, Partial<IntegrationProcedureElement>>([
            [draggedKey, { parentKey, sequenceNumber: siblings.length + 1 }],
            ...siblings.map((element, index) => [element.key, { parentKey, sequenceNumber: index + 1 }] as const)
        ]);
        this.setModel({
            ...model,
            elements: resequence(model.elements.map(element => {
                const position = nextPositions.get(element.key);
                return position ? { ...element, ...position } : element;
            }))
        });
        this.selectedKey.set(draggedKey);
    }

    private descendantCount(parentKey: string) {
        return this.model().elements.filter(element => this.isDescendantOf(element.key, parentKey)).length;
    }

    private isDescendantOf(elementKey: string, parentKey: string) {
        const byKey = new Map(this.model().elements.map(element => [element.key, element]));
        let current = byKey.get(elementKey);
        while (current?.parentKey) {
            if (current.parentKey === parentKey) {
                return true;
            }
            current = byKey.get(current.parentKey);
        }
        return false;
    }

    private updateMap(mapName: string, updater: (current: Record<string, unknown>) => Record<string, unknown>) {
        const selected = this.selectedElement();
        if (selected) {
            this.updateElement(selected.key, {
                propertySet: {
                    ...selected.propertySet,
                    [mapName]: updater(asRecord(selected.propertySet[mapName]))
                }
            });
            return;
        }
        this.updateModel(model => ({
            ...model,
            propertySet: {
                ...model.propertySet,
                [mapName]: updater(asRecord(model.propertySet[mapName]))
            }
        }));
    }

    private updateDataRaptorInputParameters(updater: (current: Array<Record<string, string>>) => Array<Record<string, string>>) {
        const current = this.dataRaptorInputParameters().map(parameter => ({
            inputParam: parameter.inputParam,
            element: parameter.element
        }));
        const next = updater(current);
        this.updateElementPropertyValue('dataRaptor Input Parameters', next);
    }
}

function normalizeLayout(layout?: Partial<IntegrationProcedureLayout>): IntegrationProcedureLayout {
    const width = typeof layout?.inspectorWidth === 'number' && Number.isFinite(layout.inspectorWidth)
        ? layout.inspectorWidth
        : DEFAULT_INSPECTOR_WIDTH;
    return {
        inspectorCollapsed: layout?.inspectorCollapsed === true,
        inspectorWidth: Math.max(MIN_INSPECTOR_WIDTH, Math.min(MAX_INSPECTOR_WIDTH, Math.round(width))),
        leftCollapsed: layout?.leftCollapsed === true
    };
}

function flattenElements(elements: IntegrationProcedureElement[]): FlowRow[] {
    const keys = new Set(elements.map(element => element.key));
    const byParent = new Map<string, IntegrationProcedureElement[]>();
    for (const element of elements) {
        const parentKey = element.parentKey && keys.has(element.parentKey) ? element.parentKey : '';
        const siblings = byParent.get(parentKey) ?? [];
        siblings.push(element);
        byParent.set(parentKey, siblings);
    }
    for (const siblings of byParent.values()) {
        siblings.sort((a, b) => Number(a.sequenceNumber || 0) - Number(b.sequenceNumber || 0) || a.name.localeCompare(b.name));
    }
    const rows: FlowRow[] = [];
    const visit = (parentKey = '', depth = 0) => {
        for (const element of byParent.get(parentKey) ?? []) {
            rows.push({ depth, element, hasChildren: !!byParent.get(element.key)?.length });
            visit(element.key, depth + 1);
        }
    };
    visit();
    return rows;
}

function validateModel(model: IntegrationProcedureModel): Problem[] {
    const problems: Problem[] = [];
    if (!model.header.name?.trim()) {
        problems.push({ severity: 'error', message: 'Procedure name is required.' });
    }
    const names = new Map<string, string>();
    const keys = new Set(model.elements.map(element => element.key));
    for (const element of model.elements) {
        if (!element.name.trim()) {
            problems.push({ severity: 'error', elementKey: element.key, message: 'Element name is required.' });
        }
        const normalized = element.name.trim().toLowerCase();
        if (names.has(normalized)) {
            problems.push({ severity: 'error', elementKey: element.key, message: `Duplicate element name "${element.name}".` });
        }
        names.set(normalized, element.key);
        if (element.parentKey && !keys.has(element.parentKey)) {
            problems.push({ severity: 'warning', elementKey: element.key, message: `${element.name} points to a missing parent.` });
        }
        if (element.type === 'Remote Action' && (!element.propertySet.remoteClass || !element.propertySet.remoteMethod)) {
            problems.push({ severity: 'warning', elementKey: element.key, message: `${element.name} is missing a remote class or method.` });
        }
        if (isDataMapperAction(element.type) && !element.propertySet.bundle) {
            problems.push({ severity: 'warning', elementKey: element.key, message: `${element.name} is missing a Data Mapper name.` });
        }
        if (element.type === 'Set Values' && !Object.keys(asRecord(element.propertySet.elementValueMap)).length) {
            problems.push({ severity: 'warning', elementKey: element.key, message: `${element.name} does not set any values.` });
        }
    }
    return problems;
}

function groupTemplates(templates: ElementTemplate[]) {
    const groups = new Map<ElementTemplate['family'], ElementTemplate[]>();
    for (const template of templates) {
        const group = groups.get(template.family) ?? [];
        group.push(template);
        groups.set(template.family, group);
    }
    return groups;
}

function buildFlowTree(elements: IntegrationProcedureElement[]): FlowNode[] {
    const keys = new Set(elements.map(element => element.key));
    const byParent = new Map<string, IntegrationProcedureElement[]>();
    for (const element of elements) {
        const parentKey = element.parentKey && keys.has(element.parentKey) ? element.parentKey : '';
        const siblings = byParent.get(parentKey) ?? [];
        siblings.push(element);
        byParent.set(parentKey, siblings);
    }
    for (const siblings of byParent.values()) {
        siblings.sort((a, b) => Number(a.sequenceNumber || 0) - Number(b.sequenceNumber || 0) || a.name.localeCompare(b.name));
    }
    const visit = (parentKey = '', depth = 0): FlowNode[] => (byParent.get(parentKey) ?? []).map(element => ({
        element,
        depth,
        children: visit(element.key, depth + 1)
    }));
    return visit();
}

function insertElementInFlow(elements: IntegrationProcedureElement[], element: IntegrationProcedureElement, afterKey?: string, parentKey?: string, beforeKey?: string): IntegrationProcedureElement[] {
    const siblingParentKey = parentKey ?? '';
    const siblings = elements
        .filter(candidate => (candidate.parentKey ?? '') === siblingParentKey)
        .sort((a, b) => Number(a.sequenceNumber || 0) - Number(b.sequenceNumber || 0) || a.name.localeCompare(b.name));
    const insertIndex = beforeKey
        ? Math.max(0, siblings.findIndex(candidate => candidate.key === beforeKey))
        : afterKey
            ? Math.max(0, siblings.findIndex(candidate => candidate.key === afterKey) + 1)
            : siblings.length;
    const nextSiblings = [
        ...siblings.slice(0, insertIndex),
        { ...element, parentKey, sequenceNumber: insertIndex + 1 },
        ...siblings.slice(insertIndex)
    ];
    const sequenceByKey = new Map(nextSiblings.map((sibling, index) => [sibling.key, index + 1]));
    return [
        ...elements.map(candidate => sequenceByKey.has(candidate.key) ? { ...candidate, sequenceNumber: sequenceByKey.get(candidate.key)! } : candidate),
        nextSiblings[insertIndex]
    ];
}

function resequence(elements: IntegrationProcedureElement[]): IntegrationProcedureElement[] {
    const rows = flattenElements(elements);
    const byKey = new Map(rows.map((row, index) => [row.element.key, {
        depth: row.depth,
        sequence: siblingsBefore(rows, index) + 1
    }]));
    return elements.map(element => {
        const position = byKey.get(element.key);
        return position ? { ...element, level: position.depth, sequenceNumber: position.sequence } : element;
    });
}

function siblingsBefore(rows: FlowRow[], index: number) {
    const row = rows[index];
    return rows.slice(0, index).filter(candidate => candidate.depth === row.depth && (candidate.element.parentKey ?? '') === (row.element.parentKey ?? '')).length;
}

function uniqueElementName(elements: IntegrationProcedureElement[], baseName: string) {
    const existing = new Set(elements.map(element => element.name.toLowerCase()));
    let name = baseName.replace(/\s+/g, '');
    let index = 1;
    while (existing.has(name.toLowerCase())) {
        name = `${baseName.replace(/\s+/g, '')}${++index}`;
    }
    return name;
}

function defaultElementName(type: string) {
    return type.replace(/\b(Action|Block)\b/g, '').replace(/[^A-Za-z0-9]/g, '') || 'Element';
}

function defaultPropertySet(type: string, name: string): Record<string, unknown> {
    const common = {
        label: name,
        failOnStepError: false,
        show: null
    };
    if (type === 'Remote Action') {
        return { ...common, remoteClass: '', remoteMethod: '', remoteOptions: {}, sendJSONPath: '', sendJSONNode: '', responseJSONPath: '', responseJSONNode: '' };
    }
    if (isDataMapperAction(type)) {
        return { ...common, bundle: '', ignoreCache: false, 'dataRaptor Input Parameters': [], responseJSONPath: '', responseJSONNode: '' };
    }
    if (type === 'Set Values') {
        return { ...common, elementValueMap: {} };
    }
    if (type === 'Response Action') {
        return { ...common, responseFormat: 'JSON', responseHeaders: {}, returnFullDataJSON: false };
    }
    return common;
}

function elementSummary(element: IntegrationProcedureElement) {
    const propertySet = element.propertySet;
    if (element.type === 'Remote Action') {
        return [propertySet.remoteClass, propertySet.remoteMethod].filter(Boolean).join('.');
    }
    if (isDataMapperAction(element.type)) {
        return stringifyValue(propertySet.bundle || propertySet.dataRaptorBundle || propertySet.dataMapperName);
    }
    if (element.type === 'Set Values') {
        return Object.keys(asRecord(propertySet.elementValueMap)).join(', ');
    }
    if (element.type === 'Response Action') {
        return stringifyValue(propertySet.responseFormat || 'Response');
    }
    if (GROUP_TYPES.has(element.type)) {
        return stringifyValue(propertySet.executionConditionalFormula || propertySet.show || 'Group');
    }
    return stringifyValue(propertySet.label || '');
}

function setObjectValue(source: Record<string, unknown>, field: string, value: unknown) {
    const next = { ...source };
    if (value === '' || value === undefined) {
        delete next[field];
    } else {
        next[field] = value;
    }
    return next;
}

function isDataMapperAction(type: string): boolean {
    return /Data\s*Mapper|DataRaptor/i.test(type);
}

function inputValue(event: Event): string {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    return target?.value ?? '';
}

function inputChecked(event: Event): boolean {
    return (event.target as HTMLInputElement | null)?.checked ?? false;
}

function inputControlValue(event: Event): string | boolean {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
        return target.checked;
    }
    return target?.value ?? '';
}

function stringifyValue(value: unknown): string {
    if (value === undefined || value === null) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return JSON.stringify(value);
}

function asRecord(value: unknown): Record<string, unknown> {
    return isRecord(value) ? { ...value } : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export function bootstrapIntegrationProcedureEditor() {
    return bootstrapApplication(AppComponent, {
        providers: [provideZonelessChangeDetection()]
    });
}

if (!(globalThis as { __VLOCODE_WEBVIEW_PREVIEW__?: boolean }).__VLOCODE_WEBVIEW_PREVIEW__) {
    bootstrapIntegrationProcedureEditor().catch(error => console.error(error));
}
